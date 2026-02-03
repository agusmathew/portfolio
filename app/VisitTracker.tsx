"use client";

import { useEffect } from "react";

const SESSION_KEY = "visit_session_id";

function getSessionId() {
  if (typeof window === "undefined") return null;
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export default function VisitTracker() {
  useEffect(() => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    const payload = {
      sessionId,
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages,
      platform: navigator.platform,
      deviceMemory: "deviceMemory" in navigator ? navigator.deviceMemory : null,
      hardwareConcurrency: navigator.hardwareConcurrency,
      connection:
        "connection" in navigator
          ? {
              effectiveType: navigator.connection?.effectiveType || null,
              downlink: navigator.connection?.downlink || null,
              rtt: navigator.connection?.rtt || null,
              saveData: navigator.connection?.saveData || null,
            }
          : null,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        pixelRatio: window.devicePixelRatio,
      },
      preferences: {
        colorScheme: window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
          .matches,
      },
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    fetch("/api/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Best-effort; avoid crashing the page for analytics failures.
    });
  }, []);

  return null;
}
