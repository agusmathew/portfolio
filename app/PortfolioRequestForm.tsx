"use client";

import { useState } from "react";

export default function PortfolioRequestForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please attach your CV (PDF/DOC/DOCX).");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setError(null);

    const form = new FormData();
    form.append("name", name);
    form.append("email", email);
    form.append("message", message);
    form.append("cv", file);

    try {
      const res = await fetch("/api/portfolio-request", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Upload failed");
      }
      setStatus("ok");
      setName("");
      setEmail("");
      setMessage("");
      setFile(null);
      setPreviewUrl(null);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-4 grid gap-3 text-sm text-slate-300"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-11 w-full rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-[#22d3ee] focus:ring-2 focus:ring-[#22d3ee]/40"
            placeholder="Your name"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Email
          </span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            className="h-11 w-full rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-[#22d3ee] focus:ring-2 focus:ring-[#22d3ee]/40"
            placeholder="you@email.com"
          />
        </label>
      </div>
      <label className="grid gap-2">
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
          CV Upload (max 5MB)
        </span>
        <input
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => {
            const next = e.target.files?.[0] || null;
            setFile(next);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            if (next && next.type === "application/pdf") {
              setPreviewUrl(URL.createObjectURL(next));
            } else {
              setPreviewUrl(null);
            }
          }}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
          required
        />
      </label>
      {file && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-white">{file.name}</div>
              <div className="text-slate-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                {file.type || "unknown"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
              }}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/10"
            >
              Remove
            </button>
          </div>
          {file && (
            <div className="mt-3 break-all text-[11px] text-slate-400 sm:text-xs">
              {file.name}
            </div>
          )}
          {previewUrl && (
            <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
              <iframe
                src={previewUrl}
                title="CV preview"
                className="h-48 w-full bg-white"
              />
            </div>
          )}
        </div>
      )}
      <label className="grid gap-2">
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Message (optional)
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-[#22d3ee] focus:ring-2 focus:ring-[#22d3ee]/40"
          placeholder="Tell me about your goals..."
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#22d3ee] px-6 text-sm font-semibold text-[#0b1020] shadow-[0_10px_24px_rgba(34,211,238,0.35)] transition hover:-translate-y-0.5 hover:opacity-90 sm:w-auto"
        >
          {loading ? "Uploading..." : "Request a portfolio"}
        </button>
        {status === "ok" && (
          <span className="text-xs text-emerald-300">
            Thanks! I’ll reach out soon.
          </span>
        )}
        {status === "error" && (
          <span className="text-xs text-red-300">{error}</span>
        )}
      </div>
    </form>
  );
}
