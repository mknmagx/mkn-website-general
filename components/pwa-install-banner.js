"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone, Monitor } from "lucide-react";

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // iOS detection
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Standalone mode detection
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      window.navigator.standalone === true;
    setIsStandalone(standalone);

    // PWA install prompt event listener
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Don't show if already dismissed or installed
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      const installed = localStorage.getItem('pwa-installed');
      
      if (!dismissed && !installed && !standalone) {
        setTimeout(() => setShowBanner(true), 3000); // Show after 3 seconds
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      localStorage.setItem('pwa-installed', 'true');
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // iOS specific logic
    if (iOS && !standalone) {
      const dismissed = localStorage.getItem('pwa-install-dismissed-ios');
      if (!dismissed) {
        setTimeout(() => setShowBanner(true), 5000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true');
      } else {
        localStorage.setItem('pwa-install-dismissed', 'true');
      }
      
      setDeferredPrompt(null);
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    const storageKey = isIOS ? 'pwa-install-dismissed-ios' : 'pwa-install-dismissed';
    localStorage.setItem(storageKey, 'true');
  };

  if (!showBanner || isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-500 md:left-auto md:right-4 md:max-w-sm">
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-white/95 p-4 shadow-2xl backdrop-blur-sm dark:bg-slate-900/95">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Banner'ı kapat"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-3 pr-8">
          {/* Icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            {isIOS ? (
              <Smartphone className="h-6 w-6 text-primary" />
            ) : (
              <Monitor className="h-6 w-6 text-primary" />
            )}
          </div>

          {/* Text content */}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground">
              {isIOS ? "Ana Ekrana Ekle" : "Uygulamayı Yükle"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isIOS 
                ? "MKN GROUP'u ana ekranınıza ekleyerek hızlı erişim sağlayın"
                : "MKN GROUP uygulamasını cihazınıza yükleyip offline erişim kazanın"
              }
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex gap-2">
          {isIOS ? (
            <div className="flex-1 text-xs text-muted-foreground">
              <p className="flex items-center gap-1">
                Safari'de <span className="font-mono">⬆️</span> butonuna basıp "Ana Ekrana Ekle"yi seçin
              </p>
            </div>
          ) : (
            <>
              <button
                onClick={handleDismiss}
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Daha Sonra
              </button>
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Download className="h-4 w-4" />
                Yükle
              </button>
            </>
          )}
        </div>

        {/* Decorative gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent" />
      </div>
    </div>
  );
}