"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  Link2,
  LoaderCircle,
  Route,

  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export type InspectionResult = {
  originalUrl: string;
  finalUrl: string;
  cleanUrl: string;
  inspectedAt: string;
  hops: Array<{ url: string; hostname: string; status: number; durationMs: number }>;
  metadata: { title?: string; description?: string; image?: string; favicon?: string };
};

const STORAGE_KEY = "vibelink-recent-v1";

function compactUrl(value: string) {
  try {
    const url = new URL(value);
    return `${url.hostname}${url.pathname === "/" ? "" : url.pathname}`;
  } catch {
    return value;
  }
}

function CopyAction({ value, label = "Salin" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }
  return (
    <Button type="button" variant="outline" size="sm" onClick={copy} aria-label={`${label} URL`}>
      {copied ? <Check /> : <Copy />}
      {copied ? "Tersalin" : label}
    </Button>
  );
}

function ResultPanel({ result }: { result: InspectionResult }) {
  const cleaned = result.cleanUrl !== result.finalUrl;
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-7 space-y-4"
      aria-live="polite"
    >
      <Card className="overflow-hidden border-emerald-200 bg-white/90 shadow-xl shadow-stone-900/5">
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 border-b border-stone-200 bg-emerald-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-white">
                <CheckCircle2 className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-stone-950">Tujuan link ditemukan</p>
                <p className="text-sm text-stone-600">{result.hops.length} tahap diperiksa dengan aman</p>
              </div>
            </div>
            {result.finalUrl.startsWith("https://") ? (
              <Badge className="w-fit bg-emerald-100 text-emerald-800">HTTPS terverifikasi</Badge>
            ) : (
              <Badge className="w-fit bg-amber-100 text-amber-800">Tujuan menggunakan HTTP</Badge>
            )}
          </div>

          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.2fr_.8fr]">
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">URL tujuan</p>
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                  <p className="break-all font-medium text-stone-900">{result.finalUrl}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <CopyAction value={result.finalUrl} />
                    <Button variant="outline" size="sm" nativeButton={false} render={<a href={result.finalUrl} target="_blank" rel="noreferrer" />}>
                      Buka tujuan <ExternalLink />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">URL bersih</p>
                  {cleaned && <Badge variant="secondary">Tracking dibuang</Badge>}
                </div>
                <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-4">
                  <p className="break-all font-medium text-stone-900">{result.cleanUrl}</p>
                  <div className="mt-3"><CopyAction value={result.cleanUrl} label="Salin URL bersih" /></div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Preview halaman</p>
              <div className="mb-4 grid aspect-[1.9/1] place-items-center overflow-hidden rounded-xl border border-stone-200 bg-[linear-gradient(135deg,#fff7ed,#f5f5f4)]">
                <Link2 className="size-10 text-orange-500" />
              </div>
              <h2 className="line-clamp-2 font-semibold text-stone-950">{result.metadata.title || compactUrl(result.finalUrl)}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">
                {result.metadata.description || "Halaman ini tidak menyediakan deskripsi Open Graph."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-stone-200 bg-white/80">
        <CardContent className="p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <Route className="size-5 text-orange-600" />
            <h2 className="font-semibold text-stone-950">Rantai redirect</h2>
          </div>
          <ol className="space-y-3">
            {result.hops.map((hop, index) => (
              <li key={`${hop.url}-${index}`} className="relative flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-stone-200 bg-white text-xs font-bold text-stone-700">{index + 1}</span>
                <div className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="truncate font-medium text-stone-900">{hop.hostname}</p>
                    <div className="flex gap-2 text-xs text-stone-500">
                      <Badge variant="outline">HTTP {hop.status}</Badge>
                      <span className="flex items-center gap-1"><Clock3 className="size-3" />{hop.durationMs} ms</span>
                    </div>
                  </div>
                  <p className="mt-1 truncate text-xs text-stone-500">{hop.url}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </motion.section>
  );
}

export function LinkInspector() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<InspectionResult | null>(null);
  const [recent, setRecent] = useState<InspectionResult[]>([]);

  useEffect(() => {
    let stored: InspectionResult[] = [];
    try {
      stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    const frame = requestAnimationFrame(() => setRecent(stored));
    return () => cancelAnimationFrame(frame);
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setResult(null);
    if (!url.trim()) return setError("Masukkan link yang ingin diperiksa.");
    setLoading(true);
    try {
      const response = await fetch("/api/inspect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Link gagal diperiksa.");
      setResult(data);
      const next = [data, ...recent.filter((item) => item.finalUrl !== data.finalUrl)].slice(0, 8);
      setRecent(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Link gagal diperiksa.");
    } finally {
      setLoading(false);
    }
  }

  function clearRecent() {
    setRecent([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div>
      <form onSubmit={submit} className="rounded-2xl border border-stone-200 bg-white p-3 shadow-2xl shadow-stone-900/10 sm:p-4">
        <Label htmlFor="target-url" className="sr-only">Link yang ingin diperiksa</Label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Link2 className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-stone-400" />
            <Input
              id="target-url"
              type="url"
              inputMode="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="Tempel shortlink atau URL di sini..."
              className="h-13 border-0 bg-stone-50 pl-12 text-base shadow-none focus-visible:ring-orange-500/30"
              autoComplete="url"
              aria-describedby="url-help url-error"
            />
          </div>
          <Button type="submit" size="lg" disabled={loading} className="h-13 bg-orange-600 px-6 text-white hover:bg-orange-700">
            {loading ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
            {loading ? "Memeriksa..." : "Periksa link"}
            {!loading && <ArrowRight />}
          </Button>
        </div>
        <p id="url-help" className="px-2 pt-3 text-xs leading-5 text-stone-500">
          Mendukung redirect HTTP publik. CAPTCHA, login, paywall, dan jaringan privat tidak dilewati.
        </p>
      </form>

      <AnimatePresence>
        {error && (
          <motion.div id="url-error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {result && <ResultPanel result={result} />}

      {recent.length > 0 && (
        <section className="mt-8" aria-labelledby="recent-title">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="recent-title" className="text-sm font-semibold text-stone-700">Pemeriksaan terakhir</h2>
            <Button variant="ghost" size="sm" onClick={clearRecent}><Trash2 /> Hapus</Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {recent.map((item) => (
              <button key={`${item.finalUrl}-${item.inspectedAt}`} onClick={() => { setUrl(item.originalUrl); setResult(item); }} className="flex min-w-0 items-center gap-3 rounded-xl border border-stone-200 bg-white/70 p-3 text-left transition hover:border-orange-300 hover:bg-white">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-stone-100"><Link2 className="size-4 text-stone-600" /></span>
                <span className="min-w-0"><span className="block truncate text-sm font-medium text-stone-900">{item.metadata.title || compactUrl(item.finalUrl)}</span><span className="block truncate text-xs text-stone-500">{compactUrl(item.finalUrl)}</span></span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
