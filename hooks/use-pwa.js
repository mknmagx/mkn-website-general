"use client";

import { useEffect } from "react";

export function usePWA() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.workbox !== undefined
    ) {
      // Register service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // Service Worker registered successfully

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed") {
                  if (navigator.serviceWorker.controller) {
                    // New content available, notify user
                    // console.log('New content is available; please refresh.');

                    // You can show a toast or banner here
                    if (
                      confirm(
                        "Yeni içerik mevcut. Sayfayı yenilemek ister misiniz?"
                      )
                    ) {
                      window.location.reload();
                    }
                  } else {
                    // Content is cached for offline use
                    // console.log('Content is cached for offline use.');
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          // Service Worker registration failed - keep console.error for debugging
          console.error("Service Worker registration failed:", error);
        });

      // Handle service worker updates
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    }
  }, []);

  return null;
}

export default usePWA;
