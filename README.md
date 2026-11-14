# HDR BOOTH — GitHub Draft
Proyek independen aplikasi photo booth Windows berbasis Electron + SQLite, tema navy/gold.

## Termasuk
- Dashboard dan workspace lokal
- CRUD event dasar serta pencatatan sesi
- Indeks galeri foto lokal
- Data layout/frame dan voucher
- Pengaturan studio dan pemilih folder foto
- Deteksi perangkat Canon dari Windows Plug-and-Play
- Workflow GitHub Actions untuk membangun installer Windows x64 NSIS

## Status penting
Ini adalah draft fondasi aplikasi, bukan produk komersial selesai dan bukan salinan Fotobu. UI printer, cloud sync, payment gateway, visual layout editor tingkat lanjut dan tethering DSLR masih memerlukan integrasi produksi. Canon EOS 3000D adalah target uji pertama. Deteksi perangkat saat ini hanya memeriksa inventaris Windows; shutter, transfer foto, pengaturan kamera, dan Live View belum diimplementasikan. Canon SDK tidak disertakan.

## Build lokal Windows
Pasang Node.js 20 LTS, lalu:
```powershell
npm install
npm run check
npm start
npm run dist
```
Installer akan muncul di folder `dist/`.

## Build via GitHub
1. Buat repository GitHub baru.
2. Upload semua isi folder ini ke root repository.
3. Buka Actions → Build HDR BOOTH for Windows → Run workflow.
4. Download artifact `HDR-BOOTH-Windows-Installer` setelah workflow selesai.
5. Alternatif: push tag `v0.1.0` untuk memicu build.

## Penyimpanan
Database SQLite disimpan di folder userData Electron. Cloud sync belum aktif. Jangan masukkan kredensial pembayaran atau data sensitif ke draft ini.
