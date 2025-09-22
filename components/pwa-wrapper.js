"use client";

import { usePWA } from "@/hooks/use-pwa";

export default function PWAWrapper({ children }) {
  usePWA();
  
  return children;
}