# Backend Auth NestJS - Mini Project PT SEJADI

Backend authentication system menggunakan NestJS, MongoDB, dan JWT dengan fitur lengkap: register, login, refresh token, logout, dan role-based access control.

---

## Author

**Demas Zhafran Zharif**  
NPM: 23082010085  
Program Studi Sistem Informasi  
UPN "Veteran" Jawa Timur  

**Contact:**
- Email: zhafrandemas@gmail.com
- LinkedIn: [linkedin.com/in/demaszhafran](https://linkedin.com/in/demaszhafran)
- GitHub: [github.com/demmm20](https://github.com/demmm20)

---

## License

This project is part of internship application for PT SEJADI (Sinergi Jaya Digital).

---

## Acknowledgments

Mini Project ini dibuat sebagai bagian dari proses seleksi internship Fullstack JavaScript di PT SEJADI. Terima kasih kepada:
- PT SEJADI atas kesempatan ini
- Dicoding & Accenture atas pembelajaran selama Independent Study
- Tim Capstone QuizMate atas kolaborasi yang luar biasa
- UPN "Veteran" Jawa Timur atas dukungan akademik

---

## Cara Menjalankan

### Dengan Docker (Recommended)
```bash
# 1. Clone repository
git clone <your-repo-url>
cd backend-auth-nestjs

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env sesuai kebutuhan (atau gunakan default)

# 4. Jalankan MongoDB via Docker
docker-compose up -d

# 5. Jalankan seeder (Opsional untuk test admin role account)
npm run seed
# Output:
# ✅ Admin user created
#    📧 Email: admin@example.com
#    🔑 Password: Admin123
# ✅ Demo user created
#    📧 Email: user@example.com
#    🔑 Password: User123

# 6. Jalankan aplikasi
npm run start:dev

# Aplikasi berjalan di: http://localhost:3000
```

### Tanpa Docker (Local MongoDB)
```bash
# 1. Pastikan MongoDB berjalan di localhost:27017

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env

# 4. Jalankan aplikasi
npm run start:dev
```

---

## Environment Variables

File `.env` berisi konfigurasi berikut:

| Variable | Deskripsi | Default |
|----------|-----------|---------|
| `MONGODB_URI` | Connection string MongoDB | `mongodb://localhost:27017/auth-nestjs` |
| `JWT_ACCESS_SECRET` | Secret key untuk access token | (required) |
| `JWT_REFRESH_SECRET` | Secret key untuk refresh token | (required) |
| `JWT_ACCESS_EXPIRY` | Durasi access token | `15m` |
| `JWT_REFRESH_EXPIRY` | Durasi refresh token | `7d` |
| `PORT` | Port aplikasi | `3000` |
| `NODE_ENV` | Environment mode | `development` |

---

## API Endpoints

### Authentication
- `POST /auth/register` - Register user baru
- `POST /auth/login` - Login dan dapatkan JWT tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout dan revoke refresh token (Protected)

### Users
- `GET /users/me` - Get profile user sendiri (Protected)
- `GET /users` - Get semua user (Admin only)

---

## Keputusan Desain

### Token Lifecycle Strategy
Refresh token disimpan di database untuk validasi tambahan dan keamanan. Saat user logout, refresh token dihapus dari database (revoke). Setiap refresh menghasilkan pasangan access + refresh token baru untuk meningkatkan keamanan. Strategy ini memberikan balance antara security (dapat revoke token) dan simplicity (tidak perlu Redis untuk scale kecil-menengah).

### Role-based Access Control
Dua role tersedia: `user` (default) dan `admin`. User dapat melihat profile sendiri via `/users/me`. Admin memiliki akses tambahan untuk melihat semua user via `/users`. Implementasi menggunakan custom RolesGuard dan Roles decorator untuk flexibility dan reusability.

### Security Features
Password di-hash menggunakan bcrypt dengan salt rounds 10 untuk balance antara security dan performance. JWT memiliki expiry time yang configurable (access token short-lived 15m, refresh token long-lived 7d). Protected routes menggunakan JWT Guard via Passport strategy. Data sensitif (password hash, refresh token) tidak pernah dikembalikan di response API. Email disimpan dalam lowercase dengan unique constraint di database level.

---

## Tech Stack

- **Framework**: NestJS 11.0.1
- **Database**: MongoDB + Mongoose 9.1.6
- **Authentication**: JWT (@nestjs/jwt, passport-jwt)
- **Validation**: class-validator + class-transformer
- **Security**: bcrypt 6.0.0, @nestjs/throttler 6.5.0
- **Language**: TypeScript 5.7.3
- **DevOps**: Docker, Docker Compose

---

## Project Structure

```
src/
├── auth/                   # Authentication module
│   ├── dto/               # Data Transfer Objects (Login, Register, Refresh)
│   ├── guards/            # JWT Auth Guard & Roles Guard
│   ├── strategies/        # Passport JWT Strategy
│   ├── decorators/        # Roles Decorator
│   ├── auth.controller.ts # Auth endpoints
│   ├── auth.service.ts    # Auth business logic
│   └── auth.module.ts     # Auth module config
├── users/                 # Users module
│   ├── schemas/           # Mongoose User Schema
│   ├── users.controller.ts # Users endpoints
│   ├── users.service.ts   # Users business logic
│   └── users.module.ts    # Users module config
├── common/                # Shared utilities
│   └── dto/              # Common DTOs
├── app.module.ts          # Root module
└── main.ts               # Application entry point
```

---

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

Testing manual dengan Postman/Insomnia tersedia di `POSTMAN-TESTING-GUIDE.md`

---

## Security Checklist

- Password hashing dengan bcrypt (salt rounds: 10)
- JWT dengan expiry time (access: 15m, refresh: 7d)
- Refresh token validation di database
- Protected routes dengan JWT Guard
- Role-based access control
- Email unique constraint
- Input validation dengan class-validator
- No sensitive data in response (password, refresh token)
- Environment variables untuk secrets

---

## Features Implemented

### Required Features 
1. Register - `POST /auth/register` dengan email & password hashing
2. Login - `POST /auth/login` dengan JWT access token
3. Protected Route - `GET /users/me` dengan JWT validation
4. Token Lifecycle - Access token expiry + refresh mechanism
5. Role-based Access - Admin dapat lihat semua user, user hanya diri sendiri

### Bonus Features 
1. Refresh Token + Revoke - `POST /auth/refresh` dan `POST /auth/logout`
2. Admin Listing - `GET /users` untuk admin only
3. Docker Support - `docker-compose.yml` untuk MongoDB

---

## Expected Behavior

### Success Cases
- Register dengan email baru → `201 Created` dengan user data + tokens
- Login dengan kredensial valid → `200 OK` dengan user data + tokens
- Access `/users/me` dengan token valid → `200 OK` dengan user profile
- Refresh token dengan token valid → `200 OK` dengan tokens baru
- Logout dengan token valid → `200 OK` dengan success message

### Error Cases
- Register dengan email duplikat → `409 Conflict`
- Login dengan kredensial salah → `401 Unauthorized`
- Access protected route tanpa token → `401 Unauthorized`
- Access protected route dengan token invalid/expired → `401 Unauthorized`
- Access admin route sebagai user → `403 Forbidden`

---

**Built using NestJS & TypeScript**