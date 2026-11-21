"use client";

import { useEffect } from "react";

export function DisablePinchZoom() {
  useEffect(() => {
    // 1. Bloqueia gesto de pinça no iOS Safari (gesturestart / gesturechange / gestureend)
    const preventGesture = (e: Event) => {
      e.preventDefault();
    };

    // 2. Bloqueia toque com 2 ou mais dedos em touchmove (pinça)
    const preventMultiTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // 3. Bloqueia duplo toque para zoom rápido no iOS
    let lastTouchEnd = 0;
    const preventDoubleTap = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // 4. Bloqueia atalhos de zoom com Ctrl + Scroll ou Ctrl + +/-
    const preventKeyZoom = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "+" || e.key === "-" || e.key === "=" || e.key === "0")) {
        e.preventDefault();
      }
    };

    const preventWheelZoom = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    // Registra listeners com { passive: false }
    document.addEventListener("gesturestart", preventGesture, { passive: false });
    document.addEventListener("gesturechange", preventGesture, { passive: false });
    document.addEventListener("gestureend", preventGesture, { passive: false });
    document.addEventListener("touchmove", preventMultiTouchMove, { passive: false });
    document.addEventListener("touchend", preventDoubleTap, { passive: false });
    window.addEventListener("keydown", preventKeyZoom);
    window.addEventListener("wheel", preventWheelZoom, { passive: false });

    return () => {
      document.removeEventListener("gesturestart", preventGesture);
      document.removeEventListener("gesturechange", preventGesture);
      document.removeEventListener("gestureend", preventGesture);
      document.removeEventListener("touchmove", preventMultiTouchMove);
      document.removeEventListener("touchend", preventDoubleTap);
      window.removeEventListener("keydown", preventKeyZoom);
      window.removeEventListener("wheel", preventWheelZoom);
    };
  }, []);

  return null;
}
