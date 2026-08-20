import { ArrowRight, Code2, Eye, Link2, Route, ShieldCheck, Sparkles } from "lucide-react";
import { LinkInspector } from "@/components/link-inspector";

const features = [
  { icon: Route, title: "Jejak redirect transparan", text: "Lihat setiap perpindahan domain, status HTTP, dan tujuan akhirnya." },
  { icon: Sparkles, title: "URL lebih bersih", text: "Parameter iklan dan tracking umum dibuang tanpa merusak parameter penting." },
  { icon: ShieldCheck, title: "Diperiksa dengan aman", text: "Alamat lokal, jaringan privat, kredensial URL, dan port berisiko diblokir." },
];

const faqs = [
  ["Apakah VibeLink membypass semua shortlink?", "VibeLink mengikuti redirect HTTP publik. CAPTCHA, login, paywall, timer iklan, dan proteksi akses tidak dilewati."],
  ["Apakah link saya disimpan?", "Hasil terbaru hanya disimpan di localStorage perangkatmu. MVP ini tidak memiliki akun atau database riwayat publik."],
  ["Tracker apa yang dibersihkan?", "Termasuk utm_*, fbclid, gclid, igshid, mc_cid, mc_eid, dan beberapa parameter marketing umum lainnya."],
];

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="page-grid pointer-events-none absolute inset-0 -z-20" />
      <div className="pointer-events-none absolute left-1/2 top-[-18rem] -z-10 size-[42rem] -translate-x-1/2 rounded-full bg-orange-200/50 blur-3xl" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2.5 font-bold tracking-tight text-stone-950">
          <span className="grid size-9 place-items-center rounded-xl bg-stone-950 text-white shadow-lg"><Link2 className="size-5" /></span>
          <span>VibeLink</span>
        </a>
        <nav className="flex items-center gap-1" aria-label="Navigasi utama">
          <a href="#cara-kerja" className="hidden rounded-lg px-3 py-2 text-sm text-stone-600 transition hover:bg-white hover:text-stone-950 sm:block">Cara kerja</a>
          <a href="#faq" className="hidden rounded-lg px-3 py-2 text-sm text-stone-600 transition hover:bg-white hover:text-stone-950 sm:block">FAQ</a>
          <a href="https://github.com/PromptLabStudio/vibelink-tools" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-800 shadow-sm transition hover:border-stone-300"><Code2 className="size-4" /> GitHub</a>
        </nav>
      </header>

      <section id="top" className="mx-auto max-w-4xl px-5 pb-16 pt-16 text-center sm:px-8 sm:pt-24">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-800">
          <Eye className="size-3.5" /> Link transparency tool
        </div>
        <h1 className="text-balance text-4xl font-bold tracking-[-0.045em] text-stone-950 sm:text-6xl lg:text-7xl">
          Lihat tujuan link<br className="hidden sm:block" /> <span className="text-orange-600">sebelum kamu klik.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-stone-600 sm:text-lg">
          Buka redirect biasa, bersihkan parameter tracking, dan periksa tujuan akhirnya—tanpa menebak-nebak ke mana link akan membawamu.
        </p>
        <div className="mx-auto mt-9 max-w-3xl text-left"><LinkInspector /></div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-stone-500">
          <span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-emerald-600" /> Proteksi jaringan privat</span>
          <span className="flex items-center gap-1.5"><Route className="size-4 text-orange-600" /> Maksimal 8 redirect</span>
          <span className="flex items-center gap-1.5"><Link2 className="size-4 text-stone-600" /> Tanpa akun</span>
        </div>
      </section>

      <section id="cara-kerja" className="border-y border-stone-200/80 bg-white/60 py-20 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-orange-700">Bukan kotak hitam</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">Tahu apa yang terjadi di balik link.</h2>
            <p className="mt-4 leading-7 text-stone-600">VibeLink tidak menjanjikan bypass ajaib. Ia menunjukkan proses redirect secara jujur dan memberi URL yang lebih nyaman dibagikan.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, title, text }, index) => (
              <article key={title} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="mb-7 flex items-center justify-between"><span className="grid size-11 place-items-center rounded-xl bg-orange-50 text-orange-700"><Icon className="size-5" /></span><span className="text-xs font-bold text-stone-300">0{index + 1}</span></div>
                <h3 className="font-semibold text-stone-950">{title}</h3><p className="mt-2 text-sm leading-6 text-stone-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[.7fr_1.3fr]">
        <div><p className="text-sm font-semibold text-orange-700">Pertanyaan umum</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-950">Jelas batasnya,<br />jelas manfaatnya.</h2></div>
        <div className="divide-y divide-stone-200 border-y border-stone-200">
          {faqs.map(([question, answer]) => <details key={question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-stone-900">{question}<ArrowRight className="size-4 transition group-open:rotate-90" /></summary><p className="max-w-2xl pt-3 text-sm leading-6 text-stone-600">{answer}</p></details>)}
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-stone-950 text-stone-300">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div><p className="font-semibold text-white">VibeLink</p><p className="mt-1 text-xs text-stone-500">Dibuat untuk transparansi link, bukan melewati kontrol akses.</p></div>
          <p className="text-xs text-stone-500">Eksperimen vibe coding oleh PromptLab Studio.</p>
        </div>
      </footer>
    </main>
  );
}
