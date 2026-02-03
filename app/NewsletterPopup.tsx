"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "newsletter_popup_dismissed";

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confettiBits, setConfettiBits] = useState<
    { id: number; left: number; delay: number; color: string; rotate: number }[]
  >([]);
  const emailRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      const timer = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (open) {
      emailRef.current?.focus();
    }
  }, [open]);

  function close() {
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, "1");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        throw new Error("Subscription failed");
      }
      setSubmitted(true);
      localStorage.setItem(STORAGE_KEY, "1");
      const colors = ["#22d3ee", "#38bdf8", "#ffffff", "#0ea5e9"];
      const bits = Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotate: Math.random() * 360,
      }));
      setConfettiBits(bits);
      setTimeout(() => setConfettiBits([]), 1800);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-title"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a]/95 p-6 shadow-[0_40px_100px_rgba(3,7,18,0.7)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-[-60px] h-48 w-48 rounded-full bg-[#22d3ee]/20 blur-3xl" />
          <div className="absolute -bottom-24 left-[-40px] h-44 w-44 rounded-full bg-[#38bdf8]/20 blur-3xl" />
        </div>

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">
              Newsletter
            </div>
            <h2
              id="newsletter-title"
              className="mt-4 text-xl font-semibold text-white"
            >
              Stay in the loop
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Get occasional updates on projects, launches, and engineering
              notes.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close newsletter popup"
            className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {!submitted ? (
          <form
            onSubmit={submit}
            className="relative z-10 mt-5 flex flex-col gap-3"
          >
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Email
            </label>
            <input
              ref={emailRef}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="h-11 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-[#22d3ee] focus:ring-2 focus:ring-[#22d3ee]/40"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#22d3ee] px-6 text-sm font-semibold text-[#0b1020] shadow-[0_10px_24px_rgba(34,211,238,0.35)] transition hover:-translate-y-0.5 hover:opacity-90"
            >
              {loading ? "Saving..." : "Notify me"}
            </button>
            <p className="text-xs text-slate-400">
              No spam. Unsubscribe anytime.
            </p>
            {error && <p className="text-xs text-red-300">{error}</p>}
          </form>
        ) : (
          <div className="relative z-10 mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            Thanks! You’re on the list. I’ll keep it useful and low‑volume.
          </div>
        )}
        {confettiBits.length > 0 && (
          <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
            {confettiBits.map((bit) => (
              <span
                key={bit.id}
                className="confetti-piece"
                style={{
                  position: "absolute",
                  top: "-10%",
                  width: "10px",
                  height: "14px",
                  left: `${bit.left}%`,
                  backgroundColor: bit.color,
                  animationDelay: `${bit.delay}s`,
                  animationName: "confetti-fall",
                  animationDuration: "1.6s",
                  animationTimingFunction: "ease-in",
                  animationFillMode: "forwards",
                  transform: `rotate(${bit.rotate}deg)`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
