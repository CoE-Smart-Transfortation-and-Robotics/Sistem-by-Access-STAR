## 📘 Panduan Lengkap Backend Node.js + Express + Sequelize

### 🧰 1. Persiapan Awal

#### 📌 Install dependencies

```bash
npm install
```

---

### 🚀 2. Menjalankan Server (Development Mode)

```bash
npm run dev
```

> Server akan jalan pakai `nodemon` (auto reload)

---

### 🏗️ 3. Database Setup

#### 🔁 Jalankan Migrasi

```bash
npx sequelize-cli db:migrate
```

#### 🔄 Migrasi Ulang dari Awal (hapus semua dulu)

```bash
npm run migrate:fresh
```

> Alias dari:

```bash
npx sequelize-cli db:migrate:undo:all && npx sequelize-cli db:migrate
```

---

### 🌱 4. Menambahkan Data Dummy (Seeder)

#### 📦 Jalankan Seeder

```bash
npx sequelize-cli db:seed:all
```

#### 🔄 Undo Seeder

```bash
npx sequelize-cli db:seed:undo:all
```

---

### 📦 5. Membuat Sesuatu (Model, Seeder, dll)

#### 📌 Generate Model + Migration

```bash
npx sequelize-cli model:generate --name User --attributes name:string,email:string,password:string
```

> Otomatis membuat `models/user.js` dan `migrations/xxxx-create-user.js`

#### 📌 Generate Seeder

```bash
npx sequelize-cli seed:generate --name demo-user
```

#### 📌 Generate Migration Saja

```bash
npx sequelize-cli migration:generate --name add-role-to-user
```