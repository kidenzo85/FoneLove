import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: any;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

// --------------------------------------------------------------------------
// NOTIFICATIONS PUSH EN ARRIÈRE-PLAN (Background Push Notifications)
// --------------------------------------------------------------------------

self.addEventListener("push", (event: any) => {
  if (event.data) {
    let data;
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "Nouvelle notification", body: event.data.text() };
    }

    const options = {
      body: data.body,
      // On utilise l'icône de la PWA pour la notification
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      image: data.image,
      vibrate: [200, 100, 200], // Vibration basique pour attirer l'attention
      data: {
        url: data.url || "/",
        type: data.type,
      },
    };

    // `waitUntil` garantit que le Service Worker ne se mettra pas en veille
    // avant que la notification ne soit effectivement affichée.
    event.waitUntil(
      (self as any).registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener("notificationclick", (event: any) => {
  // On ferme la notification immédiatement pour une bonne UX
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  // On demande au Service Worker d'ouvrir la bonne page
  event.waitUntil(
    (self as any).clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients: any[]) => {
        // Si une fenêtre est déjà ouverte sur cette URL, on lui donne le focus
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // Sinon, on ouvre une nouvelle fenêtre/onglet (PWA)
        if ((self as any).clients.openWindow) {
          return (self as any).clients.openWindow(urlToOpen);
        }
      })
  );
});
