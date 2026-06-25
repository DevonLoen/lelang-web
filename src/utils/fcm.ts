import { AuthService } from "@/features/auth/services/auth.service";
import { initializeApp } from "firebase/app";
import {
  deleteToken,
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const firebaseApp = initializeApp(firebaseConfig);
let foregroundListenerRegistered = false;
const FCM_TOKEN_STORAGE_KEY = "fcm_token";

interface FcmNotificationDetail {
  title: string;
  body: string;
  targetPath: string | null;
}

const requiredFirebaseConfig = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.messagingSenderId,
  firebaseConfig.appId,
  vapidKey,
];

function hasFirebaseConfig(): boolean {
  return requiredFirebaseConfig.every(Boolean);
}

async function getSupportedMessaging(): Promise<Messaging | null> {
  if (!hasFirebaseConfig()) {
    console.warn("Firebase messaging env is incomplete.");
    return null;
  }

  if (!(await isSupported())) {
    console.warn("Firebase messaging is not supported in this browser.");
    return null;
  }

  return getMessaging(firebaseApp);
}

async function registerMessagingServiceWorker(): Promise<ServiceWorkerRegistration> {
  const params = new URLSearchParams(
    Object.entries(firebaseConfig).filter(([, value]) => Boolean(value)),
  );

  return navigator.serviceWorker.register(
    `/firebase-messaging-sw.js?${params.toString()}`,
    { scope: "/" },
  );
}

function normalizeInternalPath(value?: string): string | null {
  if (!value) return null;

  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return value.startsWith("/") ? value : null;
  }
}

function resolveAuctionTarget(data?: Record<string, string>): string | null {
  const directPath = normalizeInternalPath(data?.path || data?.url || data?.link || data?.click_action);
  if (directPath) return directPath;

  const auctionId = data?.auction_id || data?.auctionId || data?.auctionID;
  return auctionId ? `/auctions/${auctionId}` : null;
}

function registerForegroundListener(messaging: Messaging): void {
  if (foregroundListenerRegistered) return;

  foregroundListenerRegistered = true;
  onMessage(messaging, (payload) => {
    const title = payload.notification?.title ?? "Bidify";
    const body = payload.notification?.body ?? "You have a new notification.";
    const detail: FcmNotificationDetail = {
      title,
      body,
      targetPath: resolveAuctionTarget(payload.data),
    };

    window.dispatchEvent(new CustomEvent<FcmNotificationDetail>("fcm-message", { detail }));
  });
}

export async function initFCM(): Promise<string | null> {
  try {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      console.warn("Notifications or service workers are not supported.");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.info("Notification permission was not granted.");
      return null;
    }

    const messaging = await getSupportedMessaging();
    if (!messaging) return null;

    const serviceWorkerRegistration = await registerMessagingServiceWorker();
    const savedToken = localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
    if (savedToken) {
      await new AuthService().saveFcmToken({ fcm_token: savedToken });
      registerForegroundListener(messaging);
      return savedToken;
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration,
    });

    if (!token) {
      console.warn("Firebase did not return an FCM token.");
      return null;
    }

    localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
    await new AuthService().saveFcmToken({ fcm_token: token });
    registerForegroundListener(messaging);

    return token;
  } catch (err) {
    console.error("Failed to initialize FCM:", err);
    return null;
  }
}

export async function deleteFCMToken(): Promise<void> {
  try {
    const messaging = await getSupportedMessaging();
    if (messaging) {
      await deleteToken(messaging);
    }
  } catch (err) {
    console.error("Failed to delete FCM token:", err);
  } finally {
    localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
  }
}
