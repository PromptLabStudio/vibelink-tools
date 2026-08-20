# PRD — VibeLink MVP

## Tujuan
Membantu pengguna Indonesia mengetahui tujuan akhir shortlink/redirect publik sebelum membuka link, sekaligus menyediakan URL tanpa parameter tracking umum.

## Pengguna
- Anggota komunitas teknologi dan vibe coding
- Admin komunitas yang menerima link dari anggota
- Kreator yang ingin membagikan URL lebih bersih

## Alur Utama
1. Pengguna menempel URL.
2. Server memvalidasi protokol, port, hostname, dan IP publik.
3. Server mengikuti maksimal delapan redirect dengan validasi ulang di setiap hop.
4. Server mengambil metadata HTML terbatas.
5. UI menampilkan tujuan akhir, URL bersih, preview, dan rantai redirect.
6. Hasil terbaru disimpan lokal di browser.

## Acceptance Criteria
- URL HTTP(S) publik dapat diperiksa.
- Private/local/special networks ditolak.
- Redirect loop, timeout, dan payload buruk menghasilkan pesan jelas.
- Tracking umum dibuang tanpa menghapus parameter fungsional.
- Desktop dan mobile lulus E2E.
- Production build lulus dan deployment Vercel berstatus Ready.

## Non-goals
Tidak membypass CAPTCHA, autentikasi, paywall, ad-gate interaktif, proteksi file host, maupun kontrol akses. Tidak ada akun, database, atau short-link hosting pada MVP.
