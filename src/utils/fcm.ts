import { AuthService } from "@/features/auth/services/auth.service";
import { initializeApp } from "firebase/app";
import {
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

function registerForegroundListener(messaging: Messaging): void {
  if (foregroundListenerRegistered) return;

  foregroundListenerRegistered = true;
  onMessage(messaging, (payload) => {
    const title = payload.notification?.title ?? "Lelang";
    const body = payload.notification?.body ?? "Ada notifikasi baru.";

    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/logo.jpg",
      });
    }
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
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration,
    });

    if (!token) {
      console.warn("Firebase did not return an FCM token.");
      return null;
    }

    await new AuthService().saveFcmToken({ fcm_token: token });
    registerForegroundListener(messaging);

    return token;
  } catch (err) {
    console.error("Failed to initialize FCM:", err);
    return null;
  }
}