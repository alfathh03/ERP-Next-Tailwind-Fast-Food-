# 🍔 ERP Resto - Fast Food Management System

Sistem ERP (Enterprise Resource Planning) berbasis web modern yang dirancang khusus untuk bisnis restoran cepat saji (Fast Food). Aplikasi ini mencakup manajemen stok, penjualan (POS), pembelian bahan baku, produksi dapur (Manufacturing/Resep), hingga laporan keuangan sederhana.

Dibangun dengan performa tinggi menggunakan **Next.js 15 (App Router)**, **TypeScript**, dan styling modern dengan **Tailwind CSS v4**.

## 🚀 Fitur Utama

Sistem ini terintegrasi penuh antar modul:

* **📊 Dashboard Eksekutif:** Ringkasan omzet, laba bersih, biaya operasional, dan peringatan stok menipis secara real-time.
* **🛒 Point of Sales (POS):** Antarmuka kasir yang cepat untuk input pesanan pelanggan.
* **📦 Inventory & Produk:** Manajemen menu makanan/minuman dan bahan baku dengan pelacakan stok otomatis (HPP & Harga Jual).
* **👨‍🍳 Manufacturing (Dapur):**
    * **BOM (Bill of Materials):** Atur resep makanan (Misal: 1 Burger = 1 Roti + 1 Daging + 1 Keju).
    * **Production Order:** Saat memproduksi menu, stok bahan baku otomatis berkurang dan stok barang jadi bertambah.
* **🚚 Pembelian (Purchase):**
    * Kelola Vendor/Supplier.
    * **RFQ (Request for Quotation):** Buat penawaran harga ke supplier.
    * **Purchase Order (PO):** Konversi RFQ ke PO. Stok bertambah otomatis saat status "Received".
* **🚛 Pengiriman (Delivery):** Buat surat jalan (Delivery Order) berdasarkan Sales Order. Stok berkurang saat status "Shipped".
* **💰 Keuangan (Invoicing):** Pembuatan tagihan (Invoice) dan pelacakan status pembayaran (Unpaid/Paid).

## 🛠️ Teknologi yang Digunakan

* **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Database:** MySQL (via driver `mysql2`)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Charts:** [Recharts](https://recharts.org/)

## ⚙️ Persyaratan Sistem

Sebelum menjalankan aplikasi, pastikan Anda memiliki:

1.  **Node.js** (Versi 18 atau terbaru)
2.  **MySQL Database** (Bisa menggunakan XAMPP atau Laragon)

## 📦 Cara Instalasi & Menjalankan

Ikuti langkah-langkah berikut untuk menjalankan project di lokal komputer Anda:

### 1. Clone Repository
```bash
git clone [https://github.com/username/erp-next-tailwind-fast-food.git](https://github.com/username/erp-next-tailwind-fast-food.git)
cd erp-next-tailwind-fast-food
Berikut adalah file README.md dalam format raw markdown yang bisa langsung Anda salin:

Markdown

# 🍔 ERP Resto - Fast Food Management System

Sistem ERP (Enterprise Resource Planning) berbasis web modern yang dirancang khusus untuk bisnis restoran cepat saji (Fast Food). Aplikasi ini mencakup manajemen stok, penjualan (POS), pembelian bahan baku, produksi dapur (Manufacturing/Resep), hingga laporan keuangan sederhana.

Dibangun dengan performa tinggi menggunakan **Next.js 15 (App Router)**, **TypeScript**, dan styling modern dengan **Tailwind CSS v4**.

## 🚀 Fitur Utama

Sistem ini terintegrasi penuh antar modul:

* **📊 Dashboard Eksekutif:** Ringkasan omzet, laba bersih, biaya operasional, dan peringatan stok menipis secara real-time.
* **🛒 Point of Sales (POS):** Antarmuka kasir yang cepat untuk input pesanan pelanggan.
* **📦 Inventory & Produk:** Manajemen menu makanan/minuman dan bahan baku dengan pelacakan stok otomatis (HPP & Harga Jual).
* **👨‍🍳 Manufacturing (Dapur):**
    * **BOM (Bill of Materials):** Atur resep makanan (Misal: 1 Burger = 1 Roti + 1 Daging + 1 Keju).
    * **Production Order:** Saat memproduksi menu, stok bahan baku otomatis berkurang dan stok barang jadi bertambah.
* **🚚 Pembelian (Purchase):**
    * Kelola Vendor/Supplier.
    * **RFQ (Request for Quotation):** Buat penawaran harga ke supplier.
    * **Purchase Order (PO):** Konversi RFQ ke PO. Stok bertambah otomatis saat status "Received".
* **🚛 Pengiriman (Delivery):** Buat surat jalan (Delivery Order) berdasarkan Sales Order. Stok berkurang saat status "Shipped".
* **💰 Keuangan (Invoicing):** Pembuatan tagihan (Invoice) dan pelacakan status pembayaran (Unpaid/Paid).

## 🛠️ Teknologi yang Digunakan

* **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Database:** MySQL (via driver `mysql2`)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Charts:** [Recharts](https://recharts.org/)

## ⚙️ Persyaratan Sistem

Sebelum menjalankan aplikasi, pastikan Anda memiliki:

1.  **Node.js** (Versi 18 atau terbaru)
2.  **MySQL Database** (Bisa menggunakan XAMPP atau Laragon)

## 📦 Cara Instalasi & Menjalankan

Ikuti langkah-langkah berikut untuk menjalankan project di lokal komputer Anda:

### 1. Clone Repository
```bash
git clone [https://github.com/username/erp-next-tailwind-fast-food.git](https://github.com/username/erp-next-tailwind-fast-food.git)
cd erp-next-tailwind-fast-food
2. Install Dependencies
Bash

npm install
# atau
yarn install
3. Konfigurasi Database
Buka aplikasi database manager (phpMyAdmin / HeidiSQL / DBeaver).

Buat database baru dengan nama ERP.

Jalankan query SQL di bawah ini (Lihat bagian Skema Database) untuk membuat tabel yang diperlukan.

Cek file lib/db.ts. Pastikan konfigurasi user dan password sesuai dengan database lokal Anda:

TypeScript

// lib/db.ts
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',       // Sesuaikan user database
  password: '',       // Sesuaikan password database
  database: 'ERP',    // Nama database
  // ...
});
4. Jalankan Server Development
Bash

npm run dev
Buka http://localhost:3000 di browser Anda.

🗄️ Skema Database (PENTING)
Karena aplikasi ini menggunakan query SQL manual, Anda wajib menjalankan perintah SQL berikut di database ERP agar aplikasi tidak error. Skema ini disusun berdasarkan file API project:

SQL

-- 1. Tabel Products (Menu & Bahan Baku)
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(50),
    category VARCHAR(50),
    price DECIMAL(15,2) DEFAULT 0,
    cost DECIMAL(15,2) DEFAULT 0,
    stock INT DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Vendors (Supplier)
CREATE TABLE vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Customers (Pelanggan)
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Sales Orders (Penjualan Header)
CREATE TABLE sales_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50),
    customer_id INT,
    total DECIMAL(15,2),
    status VARCHAR(50) DEFAULT 'Draft',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel Sales Order Items (Detail Penjualan)
CREATE TABLE sales_order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sales_order_id INT,
    product_id INT,
    qty INT,
    price DECIMAL(15,2)
);

-- 6. Tabel Purchases (Pembelian Header)
CREATE TABLE purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50),
    vendor_id INT,
    total DECIMAL(15,2),
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Ordered, Received
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabel Purchase Items (Detail Pembelian)
CREATE TABLE purchase_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT,
    product_id INT,
    qty INT,
    cost DECIMAL(15,2)
);

-- 8. Tabel BOM / Resep (Bill of Materials)
CREATE TABLE boms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    product_id INT, -- Produk Jadi
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Tabel BOM Items (Komposisi Bahan)
CREATE TABLE bom_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bom_id INT,
    product_id INT, -- Bahan Baku
    qty DECIMAL(10,2)
);

-- 10. Tabel Manufacturing Orders (Perintah Produksi)
CREATE TABLE manufacturing_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50),
    product_id INT,
    qty_to_produce INT,
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Done
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Tabel Invoices (Tagihan)
CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50),
    sales_order_id INT,
    total DECIMAL(15,2),
    status VARCHAR(50) DEFAULT 'Unpaid',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Tabel Deliveries (Pengiriman)
CREATE TABLE deliveries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50),
    sales_order_id INT,
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Shipped
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Tabel RFQ (Penawaran)
CREATE TABLE rfqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50),
    vendor_id INT,
    status VARCHAR(50) DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Tabel RFQ Items
CREATE TABLE rfq_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rfq_id INT,
    product_id INT,
    qty INT
);
📂 Struktur Project
├── app/
│   ├── api/             # API Routes (Backend logic)
│   │   ├── dashboard/   # Endpoint statistik
│   │   ├── sales/       # Endpoint penjualan
│   │   ├── purchase/    # Endpoint pembelian & stok
│   │   ├── bom/         # Endpoint resep
│   │   └── ...
│   ├── components/      # Komponen UI (Sidebar, Card, dll)
│   ├── sales/           # Halaman POS
│   ├── products/        # Halaman Master Produk
│   ├── manufacturing/   # Halaman Produksi
│   └── ...              # Halaman modul lainnya
├── lib/
│   └── db.ts            # Konfigurasi koneksi MySQL
├── public/              # Aset gambar/icon
└── ...
🤝 Kontribusi
Kontribusi sangat diterima! Silakan lakukan fork repository ini dan buat pull request untuk fitur baru atau perbaikan bug.

