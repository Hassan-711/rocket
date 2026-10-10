"use client";

import { useState, useEffect } from "react";

export function useNetwork() {
  const [isOnline, setIsOnline] = useState(true);
  const [isLowResource, setIsLowResource] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const updateNetworkStatus = () => {
      setIsOnline(navigator.onLine);
      
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        // Check if user is on 2g/3g or has save-data enabled
        if (conn.effectiveType === '2g' || conn.effectiveType === '3g' || conn.saveData) {
          setIsLowResource(true);
        } else {
          setIsLowResource(false);
        }
      }
    };

    updateNetworkStatus();

    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);

    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener("change", updateNetworkStatus);
    }

    return () => {
      window.removeEventListener("online", updateNetworkStatus);
      window.removeEventListener("offline", updateNetworkStatus);
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener("change", updateNetworkStatus);
      }
    };
  }, []);

  return { isOnline, isLowResource };
}
