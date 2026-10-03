# JabarOOH Media Network - PHP Native 8.4 + MySQL 8.0 / MariaDB

Sistem Analisis Performa dan Inventaris Media Luar Ruang (OOH/DOOH) Jawa Barat berbasis **PHP Native 8.4 murni** tanpa framework, dirancang aman untuk production hosting.

## Fitur Utama
1. **Interactive GIS Map & KPI Summary**: Peta interaktif Leaflet.js dengan sebaran 32 titik reklame Jawa Barat beserta kartu ringkasan KPI *Global Performance* (Total Impresi DGR & VAC, Revenue Forecast, Occupancy Rate).
2. **SEO-Friendly Permalinks**: URL ramah mesin pencari, misalnya `/titik-reklame/jbr-bdg-001-simpang-lima-asia-afrika`.
3. **Server-Side RBAC (Role-Based Access Control)**:
   - **Super Admin**: Akses penuh, manajemen user & hak akses, manajemen titik reklame.
   - **Operator Lapangan**: Tambah/kelola titik reklame & prospek CRM.
   - **Auditor Bapenda**: Audit data & laporan eksekutif.
4. **Security Hardening**:
   - PDO Prepared Statements (Bebas SQL Injection).
   - Validasi CSRF Token di seluruh form POST/PUT/DELETE.
   - Escaping XSS kontekstual via `Security::e()`.
   - Proteksi sesi aman (HTTPOnly, SameSite, Session Regeneration).
   - Direktori upload terlindungi dari eksekusi file PHP.

## Kredensial Login Bawaan
- **Super Admin**: `suherman` / Kata Sandi: `AdminOOH@2026`
- **Operator Lapangan**: `operator_jabar` / Kata Sandi: `AdminOOH@2026`
- **Auditor**: `auditor_bapenda` / Kata Sandi: `AdminOOH@2026`
