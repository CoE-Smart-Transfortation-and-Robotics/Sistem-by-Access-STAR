# 🚀 Frontend STAR System - React + Vite

Aplikasi frontend untuk sistem STAR (Sistem by Access STAR) menggunakan React dan Vite dengan implementasi authentication dan role-based access control.

## 📋 Daftar Isi

- [Persiapan Awal](#persiapan-awal)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Struktur Folder](#struktur-folder)
- [Fitur yang Tersedia](#fitur-yang-tersedia)
- [API Requirements](#api-requirements)
- [Komponen Utama](#komponen-utama)
- [Routing](#routing)
- [Authentication Flow](#authentication-flow)

## 🧰 Persiapan Awal

### Prerequisites
- Node.js (versi 16 atau lebih baru)
- npm atau yarn
- Backend STAR System sudah berjalan

### 📦 Instalasi

```bash
# Clone repository (jika belum ada)
git clone <repository-url>
cd Frontend

# Install dependencies
npm install

# Install dependencies tambahan yang diperlukan
npm install react-router-dom
```

## ⚙️ Konfigurasi

### Environment Variables

Buat file `.env` di root folder Frontend:

```env
# API Backend URL
VITE_API_URL=http://localhost:9000/api
```

### 🔧 Konfigurasi Backend Integration

Pastikan backend sudah berjalan di `http://localhost:9000` dan endpoint berikut tersedia:

## 🚀 Menjalankan Aplikasi

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

Aplikasi akan berjalan di `http://localhost:5173`

## 📁 Struktur Folder

```
Frontend/
├── src/
│   ├── components/
│   │   ├── auth/                 # Komponen authentication
│   │   │   ├── LoginForm.jsx     # Form login
│   │   │   └── RegisterForm.jsx  # Form register
│   │   ├── admin/                # Komponen khusus admin
│   │   │   ├── AdminStats.jsx    # Statistik admin
│   │   │   ├── UserManagement.jsx # Management user
│   │   │   └── UserTable.jsx     # Tabel user
│   │   ├── user/                 # Komponen khusus user
│   │   │   ├── UserDashboard.jsx # Dashboard user
│   │   │   ├── ProfileForm.jsx   # Form profile
│   │   │   └── BookingCard.jsx   # Card booking
│   │   └── common/               # Komponen umum
│   │       ├── Layout.jsx        # Layout utama
│   │       ├── ProtectedRoute.jsx # Route protection
│   │       └── LoadingSpinner.jsx # Loading component
│   ├── hooks/
│   │   └── useAuth.jsx           # Custom hook untuk auth
│   ├── pages/
│   │   ├── auth/                 # Halaman authentication
│   │   ├── admin/                # Halaman admin
│   │   └── user/                 # Halaman user
│   ├── services/
│   │   └── api.js                # API service layer
│   ├── App.jsx                   # Main App component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── package.json
├── vite.config.js
└── README.md
```

## ✨ Fitur yang Tersedia

### 🔐 Authentication
- [x] Login Form dengan validation
- [x] Register Form dengan validation
- [x] JWT Token management
- [x] Auto-redirect berdasarkan role
- [x] Protected Routes

### 👤 User Management
- [x] User Profile management
- [x] Role-based dashboard (Admin, User, Visitor)
- [x] User data update
- [x] Admin user management (CRUD)

### 🎯 Role-Based Features

#### Admin Features
- [x] Admin Dashboard dengan statistik
- [x] User Management (view, edit, delete users)
- [x] System statistics

#### User Features  
- [x] User Dashboard
- [x] Profile management
- [x] Booking cards (placeholder for future booking features)

#### Visitor Features
- [x] Limited dashboard access
- [x] Profile view only

## 🚨 API Requirements

### ⚠️ Endpoint yang Masih Diperlukan di Backend

Backend Anda masih membutuhkan endpoint berikut untuk implementasi login dan register:

#### 1. Login Endpoint
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@email.com",
  "password": "password123"
}

Response:
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@email.com",
    "role": "user",
    "phone": "081234567890",
    "nik": "1234567890123456",
    "address": "User Address"
  }
}
```

#### 2. Register Endpoint
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@email.com",
  "password": "password123",
  "phone": "081234567890",
  "nik": "1234567890123456",
  "address": "User Address"
}

Response:
{
  "message": "User registered successfully",
  "user": {
    "id": 2,
    "name": "New User",
    "email": "newuser@email.com",
    "role": "user"
  }
}
```

### ✅ Endpoint Backend yang Sudah Tersedia

Berdasarkan [`userRoutes.js`](Backend/routes/userRoutes.js):

- `GET /api/users/profile/me` - Get own profile ✅
- `GET /api/users` - Get all users (admin only) ✅  
- `GET /api/users/:id` - Get user by ID (admin only) ✅
- `PUT /api/users/:id` - Update user ✅
- `DELETE /api/users/:id` - Delete user (admin only) ✅

## 🧩 Komponen Utama

### Authentication Context ([`useAuth.jsx`](src/hooks/useAuth.jsx))
Mengelola state authentication global:
- User login/logout
- Token management
- Profile updates
- Auto-redirect pada route protection

### API Service ([`api.js`](src/services/api.js))
Centralized API calls dengan:
- Automatic JWT token injection
- Error handling
- Base URL configuration

### Protected Routes ([`ProtectedRoute.jsx`](src/components/common/ProtectedRoute.jsx))
Route protection berdasarkan:
- Authentication status
- User roles
- Auto-redirect ke dashboard yang sesuai

### Layout Component ([`Layout.jsx`](src/components/common/Layout.jsx))
Header navigation dengan:
- Role-based menu items
- User info display
- Logout functionality

## 🛣️ Routing

### Public Routes
- `/login` - Login page
- `/register` - Register page

### Protected Routes
- `/` - Auto-redirect berdasarkan role
- `/admin/dashboard` - Admin dashboard (admin only)
- `/admin/users` - User management (admin only)
- `/user/dashboard` - User dashboard (user, visitor, admin)
- `/user/profile` - Profile page (user, visitor, admin)

## 🔄 Authentication Flow

1. **Login Process:**
   - User submit credentials di [`LoginForm.jsx`](src/components/auth/LoginForm.jsx)
   - API call ke `/api/auth/login` (⚠️ perlu dibuat di backend)
   - Token disimpan di localStorage
   - User data disimpan di AuthContext
   - Auto-redirect ke dashboard sesuai role

2. **Protected Route Access:**
   - [`ProtectedRoute.jsx`](src/components/common/ProtectedRoute.jsx) cek authentication
   - Jika tidak login → redirect ke `/login`
   - Jika role tidak sesuai → redirect ke dashboard yang tepat

3. **Auto-login on Refresh:**
   - [`useAuth.jsx`](src/hooks/useAuth.jsx) cek token di localStorage
   - Call `/api/users/profile/me` untuk validasi token
   - Set user data jika token valid

## 🔧 Development Tips

### Testing dengan Dummy Users
Gunakan seeder yang sudah ada di backend ([`demo-users.js`](Backend/seeders/20250625160952-demo-users.js)):

```javascript
// Login credentials dari seeder:
// Admin: admin@email.com / 123456
// User: user@email.com / 123456  
// Visitor: visitor@email.com / 123456
```

### Environment Setup
```bash
# Pastikan backend berjalan
cd Backend
npm run dev

# Di terminal terpisah, jalankan frontend
cd Frontend
npm run dev
```

## 📝 Todo List

### Backend Requirements
- [ ] Buat endpoint `POST /api/auth/login`
- [ ] Buat endpoint `POST /api/auth/register`
- [ ] Buat authController untuk handle login/register
- [ ] Tambahkan CORS configuration untuk frontend

### Frontend Enhancements
- [ ] Tambahkan form validation yang lebih robust
- [ ] Implementasi booking features
- [ ] Tambahkan loading states
- [ ] Implementasi error handling yang lebih baik
- [ ] Tambahkan responsive design
- [ ] Implementasi logout confirmation

### Styling
- [ ] Tambahkan CSS framework (Tailwind/Bootstrap)
- [ ] Buat design system yang konsisten
- [ ] Implementasi dark/light theme

## 🐛 Troubleshooting

### CORS Error
Pastikan backend sudah setup CORS dengan benar untuk `http://localhost:5173`

### API Connection Failed
1. Cek apakah backend berjalan di port 9000
2. Cek environment variable `VITE_API_URL`
3. Cek network tab di browser dev tools

### Authentication Issues
1. Cek apakah JWT_SECRET sama di backend
2. Cek token expiration
3. Clear localStorage: `localStorage.clear()`

## 📞 Support

Jika ada masalah atau pertanyaan, silakan buat issue di repository atau contact tim development.