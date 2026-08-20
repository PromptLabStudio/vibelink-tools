# VibeLink

**Lihat tujuan link sebelum kamu klik.**

VibeLink adalah utilitas transparansi URL berbahasa Indonesia. Ia mengikuti redirect HTTP publik, membersihkan parameter tracking umum, menampilkan tujuan akhir, metadata halaman, serta setiap hop redirect.

## Fitur MVP

- Redirect chain maksimal 8 hop
- Pembersihan `utm_*`, `fbclid`, `gclid`, `igshid`, dan tracker umum
- Preview title dan description Open Graph
- Copy URL akhir dan URL bersih
- Riwayat lokal di browser tanpa akun/database
- SSRF protection: protokol/port dibatasi, private IP ditolak, DNS diperiksa pada setiap hop, dan koneksi dipatok ke IP publik hasil resolusi
- Timeout, response-size cap, rate limit ringan, security headers
- Metadata SEO, Open Graph 1200×630, sitemap, robots, dan manifest

## Batas Penggunaan

VibeLink tidak melewati CAPTCHA, login, paywall, timer iklan, Cloudflare challenge, signed URL, atau kontrol akses lain. Proyek ini tidak menyediakan direct-stream extraction maupun bypass konten berhak cipta.

## Menjalankan Lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Quality Gates

```bash
npm run lint
npm test
npm run build
npx playwright test
```

- Unit test: URL cleaner, network safety, metadata parser, redirect inspector
- E2E: desktop dan mobile, URL publik dan private-IP rejection

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui Base UI, Motion, Vitest, Playwright, dan Vercel.

## Privasi

Riwayat disimpan di `localStorage` perangkat. URL tetap dikirim ke fungsi server VibeLink untuk diperiksa dan ke server tujuan untuk mengikuti redirect/mengambil metadata. Jangan masukkan link privat atau bertoken.

## Lisensi

MIT
