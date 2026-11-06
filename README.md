# Stack Trace Analyzer

Analisis stack trace error PHP/Laravel secara lokal di browser. Trace tidak disimpan atau diunggah ke server.

## Fitur

- Parser trace native PHP dan log/JSON Laravel dengan field exception; mendukung path Windows/Unix.
- Exception, pesan, file/baris, urutan frame, highlight lokasi yang dilaporkan, dan pencarian frame.
- Impor trace, salin ringkasan, export Markdown, serta penandaan frame yang tidak dikenali.
- Tidak menentukan penyebab pasti; hanya menampilkan bukti trace dan langkah pemeriksaan lanjutan.

## Teknologi

Laravel 13, Blade, Tailwind CSS, TypeScript, Vite, Vitest, PHPUnit.

## Cara menjalankan

Memerlukan PHP 8.4+, Composer, dan Node.js 22.12+. Arahkan document root Laragon ke folder `public`.

```sh
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm ci
npm run build
php artisan serve
```

Buka http://127.0.0.1:8000. Jalankan `php artisan test` untuk pengujian backend.

Jalankan `npm test` untuk menguji parser format yang didukung. Analisis tidak memerlukan akun dan tidak menyimpan trace ke database.
