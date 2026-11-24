# 📱 KeuanganKu - Aplikasi Mobile Manajemen Keuangan Pribadi Modern

Aplikasi mobile manajemen keuangan pribadi ultra-modern, canggih, dan elegan yang dirancang khusus untuk memantau arus kas, mencapai target tabungan, mengontrol anggaran, dan memberikan analisis kesehatan finansial cerdas (Smart AI Financial Advisor).

Dilengkapi dengan **Database Lokal IndexedDB** permanen (data tidak akan hilang meskipun aplikasi ditutup/browser di-refresh), sistem **Pop-up / Bottom Sheet interaktif**, serta animasi mutakhir.

---

## ✨ Fitur-Fitur Utama

### 1. 💳 Dashboard & Rekening Multi-Akun (ATM Cards Carousel)
- **Tampilan Kartu ATM Modern**: Slider horizontal rekening bank (BCA, Mandiri, dll.), dompet tunai (Cash), dan dompet digital (GoPay, OVO, Dana).
- **Format EMV Gold Chip & Gradien Elegan**: Setiap kartu memiliki warna gradien dan nomor akun unik.
- **Toggle Sembunyikan Saldo**: Ikon mata untuk menyembunyikan saldo di tempat umum demi privasi.
- **Transfer Antar Rekening**: Pop-up transfer saldo instan antar dompet/bank dengan pencatatan otomatis.

### 2. 📝 Pencatatan Transaksi Cepat & Interaktif (Pop-up Modal)
- **Tombol Tambah Melayang (Floating Action Button +)** di bagian tengah bawah.
- **Pilihan Kategori Lengkap & Berwarna**: Makanan & Minuman, Transportasi, Belanja, Tagihan, Hiburan, Kesehatan, Edukasi, Gaji, Bonus, Dividen Investasi, dll.
- **Preset Nominal Cepat**: Tombol pintas +10rb, +25rb, +50rb, +100rb, +500rb.
- **Riwayat Lengkap & Pencarian**: Filter berdasarkan jenis (Masuk/Keluar/Transfer), dompet, kategori, serta pencarian teks.
- **Pop-up Detail Transaksi**: Menampilkan tanggal, waktu WIB, catatan, dan tombol edit/hapus.

### 3. 🎯 Target Tabungan & Perayaan Target Tercapai (Confetti Burst)
- **Visualisasi Progres Tabungan**: Menampilkan persentase terkumpul, sisa dana menuju target, dan hitung mundur sisa hari (countdown).
- **Pop-up Setor / Tarik Tabungan**: Menyetor atau menarik dana secara fleksibel dari dompet pilihan.
- **Animasi Kembang Api Confetti (`canvas-confetti`)**: Pop-up perayaan meriah otomatis muncul saat target tabungan tercapai 100%!

### 4. 📊 Anggaran Bulanan (Budgeting) dengan Alert Visual
- Menetapkan batas pengeluaran per kategori setiap bulannya.
- Indikator warna dinamis:
  - 🟢 **Hijau (< 70%)**: Anggaran aman.
  - 🟡 **Kuning (70% - 90%)**: Waspada mendekati batas.
  - 🔴 **Merah (> 90% / Overbudget)**: Peringatan melebihi batas anggaran!

### 5. 🧠 Smart AI Financial Health Advisor & Laporan Visual
- **Skor Kesehatan Finansial (0 - 100)**: Dihitung secara cerdas dari rasio tabungan, kepatuhan anggaran, dan ketahanan dana darurat.
- **Rekomendasi Cerdas Otomatis**: Memberikan saran keuangan personal (misalnya peringatan kategori belanja yang melonjak, saran metode *Pay Yourself First*).
- **Distribusi Pengeluaran Kategori**: Visualisasi grafik distribusi pengeluaran.
- **Filter Periode**: Bulan ini, 7 hari terakhir, atau semua waktu.

### 6. 💾 Database IndexedDB & Cadangan Data
- **Penyimpanan Lokal Permanen**: Menggunakan IndexedDB browser/ponsel dengan fallback otomatis ke LocalStorage. Data tersimpan di perangkat Anda tanpa perlu koneksi internet.
- **Cadangkan Data (JSON)**: Unduh seluruh database dalam 1 klik.
- **Pulihkan Data (JSON)**: Pulihkan data dari file cadangan kapan saja.
- **Ekspor Riwayat ke Excel / CSV**: Mudah diolah untuk laporan keuangan lanjutan di spreadsheet.
- **Reset ke Data Demo**: Opsi memuat data contoh realistis untuk uji coba.

### 7. 🔐 Keamanan PIN Lock Screen
- Pop-up proteksi 4-digit PIN dengan animasi numeric keypad dan keamanan finansial.

### 8. 📱 Mode Tampilan Smartphone & PWA Standalone
- **Frame Smartphone Modern**: Dilengkapi Dynamic Island, Status Bar (jam, sinyal, baterai), dan Home Bar.
- **Mode Layar Penuh**: Dapat diubah ke mode layar penuh hanya dengan satu klik tombol di header.
- **Dukungan PWA (Progressive Web App)**: Bisa dipasang langsung (*Add to Home Screen*) di Android / iOS sebagai aplikasi mandiri.

---

## 🚀 Cara Menjalankan Aplikasi

Pastikan Node.js sudah terpasang di komputer Anda.

1. Buka terminal / PowerShell di folder proyek:
   ```bash
   npm run dev
   ```
2. Buka tautan di browser:
   ```
   http://localhost:5173
   ```

---

## 📦 Mengubah ke File APK Android (via Capacitor)

Jika ingin membungkus aplikasi ini menjadi file APK murni untuk Android:

1. Pasang Capacitor:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init "KeuanganKu" "com.keuanganku.app" --web-dir dist
   ```
2. Build proyek web terlebih dahulu:
   ```bash
   npm run build
   ```
3. Tambahkan platform Android:
   ```bash
   npx cap add android
   npx cap copy
   ```
4. Buka di Android Studio untuk generate file APK:
   ```bash
   npx cap open android
   ```
   *(Pilih menu **Build > Build Bundle(s) / APK(s) > Build APK(s)** di Android Studio).*
