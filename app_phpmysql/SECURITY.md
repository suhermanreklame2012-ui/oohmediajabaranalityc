# Arsitektur & Checklist Keamanan

- [x] **PDO Prepared Statements**: Semua query database menggunakan prepared statements.
- [x] **Password Hashing**: Kata sandi di-hash menggunakan algoritma BCRYPT resmi.
- [x] **CSRF Protection**: Token sesi random diverifikasi pada setiap request POST/PUT/DELETE.
- [x] **XSS Protection**: Semua output di-escape secara aman melalui `Security::e()`.
- [x] **Session Security**: Session cookies berstatus HTTPOnly, SameSite=Lax, dan Session ID diregenerasi setelah proses login.
- [x] **Server-Side RBAC**: Validasi otorisasi dilakukan secara ketat di sisi server melalui `RoleMiddleware`. Halaman seperti `/admin/users` langsung mengembalikan HTTP 403 Forbidden bila diakses pengguna non-Super Admin.
- [x] **Directory Protection**: Direktori sensitif seperti `config/`, `database/`, dan `storage/logs/` diblokir langsung oleh Apache `.htaccess`.
- [x] **Uploads Security**: Folder `public/uploads/` dilengkapi aturan pencegahan eksekusi berkas skrip PHP.
