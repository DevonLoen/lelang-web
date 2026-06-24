importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js");

const firebaseConfig = Object.fromEntries(
  new URL(self.location.href).searchParams.entries(),
);

function normalizeInternalUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value, self.location.origin);
    if (url.origin !== self.location.origin) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return value.startsWith("/") ? value : null;
  }
}

function resolveAuctionUrl(data = {}) {
  const directUrl = normalizeInternalUrl(data.path || data.url || data.link || data.click_action);
  if (directUrl) return directUrl;

  const auctionId = data.auction_id || data.auctionId || data.auctionID;
  return auctionId ? `/auctions/${auctionId}` : "/";
}

if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId) {
  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || "Lelang";
    const options = {
      body: payload.notification?.body || "Ada notifikasi baru.",
      icon: payload.notification?.icon || "/logo.jpg",
      data: {
        ...(payload.data || {}),
        targetUrl: resolveAuctionUrl(payload.data || {}),
      },
    };

    self.registration.showNotification(title, options);
  });
} else {
  console.warn("Firebase service worker config is missing.");
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.targetUrl || resolveAuctionUrl(event.notification.data || {});

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          const clientUrl = new URL(client.url);
          if (clientUrl.origin === self.location.origin && "focus" in client) {
            if ("navigate" in client) {
              return client.navigate(targetUrl).then(() => client.focus());
            }
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }

        return undefined;
      }),
  );
});
