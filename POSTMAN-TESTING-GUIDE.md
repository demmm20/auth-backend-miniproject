# 🧪 PANDUAN TESTING POSTMAN - Backend Auth NestJS

Panduan lengkap untuk testing semua endpoint menggunakan Postman.

---

## 📋 PERSIAPAN

### 1. Pastikan Aplikasi Berjalan
```bash
# Terminal 1: Jalankan MongoDB
docker-compose up -d

# Terminal 2: Jalankan aplikasi
npm run start:dev

# Pastikan muncul: "Application is running on: http://localhost:3000"
```

### 2. Setup Postman
- Download Postman: https://www.postman.com/downloads/
- Buka Postman
- Buat Collection baru: "PT SEJADI - Backend Auth"

### 3. Base URL
Semua endpoint menggunakan base URL:
```
http://localhost:3000
```

---

## 🎯 FLOW TESTING (URUTAN RECOMMENDED)

```
1. Register User Biasa ✅
2. Login User Biasa ✅
3. Get Profile (Protected) ✅
4. Register Admin ✅
5. Login Admin ✅
6. Get All Users (Admin Only) ✅
7. Refresh Token ✅
8. Logout ✅
9. Test Error Cases ⚠️
```

---

## 📝 TESTING SCENARIOS

### ✅ SCENARIO 1: Register User Biasa

**Request:**
```
Method: POST
URL: http://localhost:3000/auth/register
Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Expected Response (201 Created):**
```json
{
  "user": {
    "id": "65f8a1b2c3d4e5f6g7h8i9j0",
    "email": "user@example.com",
    "role": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**✅ Checklist:**
- [ ] Status code 201
- [ ] Response berisi user object
- [ ] Response berisi accessToken
- [ ] Response berisi refreshToken
- [ ] Role default adalah "user"
- [ ] Email dalam lowercase
- [ ] Password TIDAK muncul di response

**📝 Simpan untuk nanti:**
- Copy `accessToken` → akan dipakai di request selanjutnya
- Copy `user.id` → akan dipakai untuk refresh token

---

### ✅ SCENARIO 2: Login User Biasa

**Request:**
```
Method: POST
URL: http://localhost:3000/auth/login
Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Expected Response (200 OK):**
```json
{
  "user": {
    "id": "65f8a1b2c3d4e5f6g7h8i9j0",
    "email": "user@example.com",
    "role": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**✅ Checklist:**
- [ ] Status code 200
- [ ] Response structure sama dengan register
- [ ] Token berbeda dari token register (baru di-generate)

**📝 Simpan:**
- Copy `accessToken` (update dari sebelumnya)
- Copy `refreshToken` untuk test refresh nanti

---

### ✅ SCENARIO 3: Get Profile (Protected Route)

**Request:**
```
Method: GET
URL: http://localhost:3000/users/me
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  (ganti dengan accessToken dari login)
```

**Expected Response (200 OK):**
```json
{
  "id": "65f8a1b2c3d4e5f6g7h8i9j0",
  "email": "user@example.com",
  "role": "user",
  "createdAt": "2026-02-07T10:30:00.000Z",
  "updatedAt": "2026-02-07T10:30:00.000Z"
}
```

**✅ Checklist:**
- [ ] Status code 200
- [ ] Response berisi profile lengkap
- [ ] Ada createdAt dan updatedAt
- [ ] TIDAK ada passwordHash
- [ ] TIDAK ada refreshToken

---

### ✅ SCENARIO 4: Register Admin (Manual DB Update)

**Cara 1: Via MongoDB Compass atau Shell**
```javascript
// Connect ke MongoDB
use auth-nestjs

// Update user menjadi admin
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

**Cara 2: Register admin baru**
```
Method: POST
URL: http://localhost:3000/auth/register
Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Kemudian update via MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

---

### ✅ SCENARIO 5: Login Admin

**Request:**
```
Method: POST
URL: http://localhost:3000/auth/login
Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Expected Response (200 OK):**
```json
{
  "user": {
    "id": "65f8a1b2c3d4e5f6g7h8i9j1",
    "email": "admin@example.com",
    "role": "admin"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**✅ Checklist:**
- [ ] Role adalah "admin"

**📝 Simpan:**
- Copy `accessToken` admin untuk test endpoint admin

---

### ✅ SCENARIO 6: Get All Users (Admin Only)

**Request:**
```
Method: GET
URL: http://localhost:3000/users
Headers:
  Authorization: Bearer <ADMIN_ACCESS_TOKEN>
```

**Expected Response (200 OK):**
```json
{
  "count": 2,
  "users": [
    {
      "id": "65f8a1b2c3d4e5f6g7h8i9j0",
      "email": "user@example.com",
      "role": "user",
      "createdAt": "2026-02-07T10:30:00.000Z"
    },
    {
      "id": "65f8a1b2c3d4e5f6g7h8i9j1",
      "email": "admin@example.com",
      "role": "admin",
      "createdAt": "2026-02-07T10:35:00.000Z"
    }
  ]
}
```

**✅ Checklist:**
- [ ] Status code 200
- [ ] Response berisi array users
- [ ] Ada field count
- [ ] TIDAK ada passwordHash
- [ ] TIDAK ada refreshToken

---

### ✅ SCENARIO 7: Refresh Token

**Request:**
```
Method: POST
URL: http://localhost:3000/auth/refresh
Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "userId": "65f8a1b2c3d4e5f6g7h8i9j0",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Expected Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**✅ Checklist:**
- [ ] Status code 200
- [ ] Dapat accessToken baru
- [ ] Dapat refreshToken baru
- [ ] Token berbeda dari sebelumnya

---

### ✅ SCENARIO 8: Logout

**Request:**
```
Method: POST
URL: http://localhost:3000/auth/logout
Headers:
  Authorization: Bearer <ACCESS_TOKEN>
```

**Expected Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**✅ Checklist:**
- [ ] Status code 200
- [ ] Response berisi success message

**Verify Logout:**
Coba refresh token yang sama lagi → harus dapat 401 Unauthorized

---

## ⚠️ ERROR SCENARIOS

### 1. Register dengan Email Duplikat

**Request:**
```
Method: POST
URL: http://localhost:3000/auth/register
Body:
{
  "email": "user@example.com",
  "password": "newpassword123"
}
```

**Expected Response (409 Conflict):**
```json
{
  "statusCode": 409,
  "message": "Email already exists"
}
```

**✅ Checklist:**
- [ ] Status code 409

---

### 2. Login dengan Password Salah

**Request:**
```
Method: POST
URL: http://localhost:3000/auth/login
Body:
{
  "email": "user@example.com",
  "password": "wrongpassword"
}
```

**Expected Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

**✅ Checklist:**
- [ ] Status code 401

---

### 3. Login dengan Email Tidak Ada

**Request:**
```
Method: POST
URL: http://localhost:3000/auth/login
Body:
{
  "email": "nonexistent@example.com",
  "password": "password123"
}
```

**Expected Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

**✅ Checklist:**
- [ ] Status code 401
- [ ] Message tidak bocorkan apakah email ada atau tidak (security)

---

### 4. Access Protected Route Tanpa Token

**Request:**
```
Method: GET
URL: http://localhost:3000/users/me
(Tanpa header Authorization)
```

**Expected Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**✅ Checklist:**
- [ ] Status code 401

---

### 5. Access Protected Route dengan Token Invalid

**Request:**
```
Method: GET
URL: http://localhost:3000/users/me
Headers:
  Authorization: Bearer invalid_token_here
```

**Expected Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**✅ Checklist:**
- [ ] Status code 401

---

### 6. User Biasa Access Admin Endpoint

**Request:**
```
Method: GET
URL: http://localhost:3000/users
Headers:
  Authorization: Bearer <USER_ACCESS_TOKEN>
  (gunakan token user biasa, bukan admin)
```

**Expected Response (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

**✅ Checklist:**
- [ ] Status code 403

---

### 7. Refresh dengan Token Invalid

**Request:**
```
Method: POST
URL: http://localhost:3000/auth/refresh
Body:
{
  "userId": "65f8a1b2c3d4e5f6g7h8i9j0",
  "refreshToken": "invalid_refresh_token"
}
```

**Expected Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Access Denied"
}
```

**✅ Checklist:**
- [ ] Status code 401

---

### 8. Refresh Setelah Logout

**Steps:**
1. Login → dapat tokens
2. Logout
3. Coba refresh dengan token dari step 1

**Expected Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Access Denied"
}
```

**✅ Checklist:**
- [ ] Status code 401 (karena refresh token sudah di-revoke)

---

### 9. Rate Limiting Test

**Steps:**
```
Kirim POST /auth/login sebanyak 6 kali dalam 1 menit
```

**Expected Response ke-6 (429 Too Many Requests):**
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

**✅ Checklist:**
- [ ] Request 1-5 berhasil
- [ ] Request 6 dapat 429
- [ ] Setelah 1 menit, bisa request lagi

---

### 10. Validation Error Test

**Request:**
```
Method: POST
URL: http://localhost:3000/auth/register
Body:
{
  "email": "not-an-email",
  "password": "123"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

**✅ Checklist:**
- [ ] Status code 400
- [ ] Message berisi detail validasi error

---

## 📊 TESTING CHECKLIST SUMMARY

### Basic Functionality
- [ ] ✅ Register user baru
- [ ] ✅ Login dengan kredensial valid
- [ ] ✅ Get profile dengan token valid
- [ ] ✅ Refresh token
- [ ] ✅ Logout

### Role-based Access
- [ ] ✅ Admin dapat access GET /users
- [ ] ✅ User biasa TIDAK dapat access GET /users

### Security
- [ ] ✅ Password di-hash (tidak muncul di response)
- [ ] ✅ Refresh token di-hash di database
- [ ] ✅ Token expired setelah durasi yang ditentukan
- [ ] ✅ Refresh token invalid setelah logout

### Error Handling
- [ ] ✅ 409 untuk email duplikat
- [ ] ✅ 401 untuk kredensial salah
- [ ] ✅ 401 untuk token invalid/expired
- [ ] ✅ 403 untuk insufficient permissions
- [ ] ✅ 429 untuk rate limit exceeded
- [ ] ✅ 400 untuk validation error

### Data Integrity
- [ ] ✅ Email disimpan lowercase
- [ ] ✅ Role default adalah "user"
- [ ] ✅ Timestamps (createdAt, updatedAt) ada
- [ ] ✅ Sensitive data tidak muncul di response

---

## 🎯 POSTMAN COLLECTION EXPORT

**Langkah Export Collection:**
1. Di Postman, click Collection "PT SEJADI - Backend Auth"
2. Click titik tiga (...) → Export
3. Pilih "Collection v2.1"
4. Save sebagai `PT_SEJADI_Backend_Auth.postman_collection.json`

**Environment Variables:**
```json
{
  "id": "...",
  "name": "PT SEJADI - Local",
  "values": [
    {
      "key": "base_url",
      "value": "http://localhost:3000",
      "enabled": true
    },
    {
      "key": "access_token",
      "value": "",
      "enabled": true
    },
    {
      "key": "refresh_token",
      "value": "",
      "enabled": true
    },
    {
      "key": "user_id",
      "value": "",
      "enabled": true
    }
  ]
}
```

---

## 💡 TIPS TESTING

### 1. Gunakan Variables
Simpan token di Postman variables untuk tidak copy-paste terus:
```javascript
// Di Tests tab setelah login:
pm.environment.set("access_token", pm.response.json().accessToken);
pm.environment.set("refresh_token", pm.response.json().refreshToken);
pm.environment.set("user_id", pm.response.json().user.id);
```

### 2. Auto-refresh Token
Jika access token expired, otomatis refresh:
```javascript
// Di Pre-request Script:
if (pm.environment.get("access_token_expired")) {
    pm.sendRequest({
        url: pm.environment.get("base_url") + "/auth/refresh",
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                userId: pm.environment.get("user_id"),
                refreshToken: pm.environment.get("refresh_token")
            })
        }
    }, function (err, res) {
        pm.environment.set("access_token", res.json().accessToken);
        pm.environment.set("refresh_token", res.json().refreshToken);
    });
}
```

### 3. Test Scripts
Tambahkan di Tests tab untuk auto-verify:
```javascript
// Test untuk register/login
pm.test("Status code is 200 or 201", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

pm.test("Response has access token", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('accessToken');
});

pm.test("No password in response", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.user).to.not.have.property('password');
    pm.expect(jsonData.user).to.not.have.property('passwordHash');
});
```

---

## 🐛 TROUBLESHOOTING

### Issue 1: Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:3000
```
**Solution:**
- Pastikan aplikasi sudah running: `npm run start:dev`
- Check terminal untuk error messages

### Issue 2: MongoDB Connection Error
```
MongooseError: Connection failed
```
**Solution:**
- Pastikan MongoDB running: `docker-compose ps`
- Check MongoDB logs: `docker-compose logs mongodb`
- Restart MongoDB: `docker-compose restart mongodb`

### Issue 3: Token Expired
```
401 Unauthorized - jwt expired
```
**Solution:**
- Login ulang untuk dapat token baru
- Atau gunakan refresh token endpoint

### Issue 4: Rate Limit
```
429 Too Many Requests
```
**Solution:**
- Tunggu 1 menit
- Atau restart aplikasi untuk reset counter

---

## ✅ FINAL CHECKLIST

Sebelum submit, pastikan semua ini passing:

- [ ] Semua basic functionality works
- [ ] Semua error scenarios works
- [ ] Role-based access works
- [ ] Rate limiting works
- [ ] No sensitive data leaked
- [ ] All status codes correct
- [ ] Response structure consistent

**Jika semua ✅ → PROJECT READY TO SUBMIT! 🚀**

---

**Happy Testing! 🧪**