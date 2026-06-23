importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js");

const firebaseConfig = Object.fromEntries(
  new URL(self.location.href).searchParams.entries(),
);

if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId) {
  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || "Lelang";
    const options = {
      body: payload.notification?.body || "Ada notifikasi baru.",
      icon: payload.notification?.icon || "/logo.jpg",
      data: payload.data || {},
    };

    self.registration.showNotification(title, options);
  });
} else {
  console.warn("Firebase service worker config is missing.");
}