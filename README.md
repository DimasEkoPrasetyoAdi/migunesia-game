# 🎮 Tangkap Objek! — Game Tracking Kamera (Migunesia)

Sebuah aplikasi game interaktif berbasis web yang menggunakan **webcam motion tracking** (sensor gerakan tangan/badan) untuk menangkap objek di layar. Game ini dikembangkan khusus untuk tes teknikal **Migunesia** dengan desain mobile-first beresolusi tinggi (2160 x 3840 px) yang dilengkapi sistem penskalaan dinamis (auto-scaler container).

---

##  Fitur Utama

1. **Resolution Scaler Container (2160 x 3840 px)**
   * Seluruh tampilan dikunci pada aspek rasio portrait resolusi tinggi.
   * Dilengkapi fitur auto-scaling (`transform: scale()`) dinamis agar game muat di semua ukuran layar browser tanpa memotong UI atau merusak posisi elemen.
2. **Webcam Motion Tracking**
   * Menggunakan input kamera aktif untuk melacak gerakan tubuh/tangan pemain secara real-time langsung melalui HTML5 Canvas.
   * Pemain dapat menggerakkan badan ke kiri dan kanan untuk mengendalikan sensor penangkap objek.
3. **Dynamic Object Spawner**
   * Menangkap objek **Dafoxa** untuk menambah poin (`+1`).
   * Menangkap objek **Halal** untuk mengurangi poin (`-1`).
   * Splash indicator animasi saat poin bertambah atau berkurang.
4. **Admin Dashboard & Configurable Form**
   * Admin dapat mengatur tingkat kesulitan game (`Easy`, `Medium`, `Hard`).
   * Admin dapat mematikan/menyalakan form registrasi secara dinamis (misalnya menampilkan/menyembunyikan kolom **No HP** atau **Email**).
5. **CSV Logger Backend**
   * Backend Node.js/Express yang menyimpan data pendaftaran dan skor akhir pemain ke dalam file `participants.csv` secara otomatis secara append-only.

---

##  Tech Stack

* **Frontend:** React.js, Vite, Vanilla CSS (Custom styling dengan font Oswald & Lilita One).
* **Backend:** Node.js, Express.js, CORS, File System (CSV logging).

---

##  Panduan Instalasi & Menjalankan Project

### 1. Kloning Repositori
```bash
git clone https://github.com/DimasEkoPrasetyoAdi/migunesia-game.git
cd migunesia-game
```

---

### 2. Konfigurasi & Jalankan Backend (Server)

1. Masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Instal dependensi backend:
   ```bash
   npm install
   ```
3. Jalankan server backend:
   ```bash
   npm run dev
   ```
   *Server backend akan berjalan di `http://localhost:5000`.*

---

### 3. Konfigurasi & Jalankan Frontend (Client)

1. Masuk ke folder frontend:
   ```bash
   cd ../frontend
   ```
2. Instal dependensi frontend:
   ```bash
   npm install
   ```
3. Buat file `.env` di folder `frontend/` (opsional jika belum ada) dan isi dengan URL API Backend:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Jalankan server frontend development:
   ```bash
   npm run dev
   ```
   *Aplikasi frontend akan berjalan di `http://localhost:5173`.*

---

##  Struktur Folder Utama

```text
migunesia-game/
├── backend/
│   ├── config.json          # Menyimpan konfigurasi toggle field admin
│   ├── participants.csv     # Database log pendaftar & skor akhir game
│   ├── server.js            # Entry point backend API Express
│   └── package.json
│
├── frontend/
│   ├── public/              # Aset statis public
│   ├── src/
│   │   ├── assets/          # Background, objek game, dan logo migunesia
│   │   ├── components/      # Komponen Halaman (Home, Register, Game, Score, Admin)
│   │   ├── App.jsx          # Logika resolusi scaler & routing state
│   │   ├── index.css        # Import Google Fonts & style dasar
│   │   └── main.jsx
│   ├── index.html           # Integrasi custom favicon & Google Fonts
│   └── package.json
└── README.md
```

---

##  Cara Bermain

1. Buka halaman utama game di browser (`http://localhost:5173`).
2. Klik tombol **START** untuk menuju halaman pendaftaran.
3. Masukkan data diri (Nama, No HP, Email) sesuai form yang aktif. Kamu juga bisa memilih tingkat kesulitan di bawah form.
4. Klik **REGISTER & PLAY**. Izinkan akses kamera/webcam pada browser kamu.
5. Tunggu countdown `3, 2, 1` selesai.
6. Gerakkan tangan/tubuhmu di depan kamera ke kiri dan kanan untuk menggeser sensor penangkap objek di bagian bawah.
7. Tangkap objek **Dafoxa** sebanyak-bungkin dan hindari/jangan tangkap objek **Halal**!
8. Setelah waktu habis, skormu akan tersimpan otomatis dan masuk ke halaman ringkasan skor. Klik **FINISH** untuk kembali ke halaman utama.

---

##  Halaman Pengaturan Admin

Untuk masuk ke halaman konfigurasi Admin:
1. Di halaman **HOME** (halaman awal sebelum klik Start), klik tombol **Gear** berwarna biru di pojok kanan atas.
2. Di panel Admin, kamu bisa mengatur:
   * **Difficulty:** Mengatur kecepatan jatuhnya objek.
   * **Form Config:** Menampilkan/menyembunyikan input **No HP** dan **Email** pada halaman pendaftaran secara dinamis.
3. Klik **Save Config** untuk menyimpan pengaturan secara permanen di backend.