import fs from 'fs';
import path from 'path';

export function generateViews(targetDir: string) {
  const writeFile = (rel: string, content: string) => {
    const full = path.join(targetDir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content.trimStart(), 'utf8');
  };

  // Layout: main.php
  writeFile('views/layouts/main.php', `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= Security::e($title ?? 'JabarOOH - Performa Reklame') ?></title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Leaflet CSS & JS for Interactive Map -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">

    <!-- Navbar -->
    <header class="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div class="flex items-center gap-6">
                <a href="/" class="flex items-center gap-2 font-black text-base text-white tracking-tight">
                    <span class="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-md">OOH</span>
                    <span class="font-extrabold tracking-tight">Jabar<span class="text-amber-400">Media</span></span>
                </a>

                <nav class="hidden md:flex items-center gap-1 text-xs font-semibold">
                    <a href="/" class="px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors <?= ($_SERVER['REQUEST_URI'] === '/' || $_SERVER['REQUEST_URI'] === '/dashboard') ? 'bg-slate-800 text-amber-400' : 'text-slate-300' ?>">Peta GIS & KPI</a>
                    <a href="/titik-reklame" class="px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors <?= str_starts_with($_SERVER['REQUEST_URI'], '/titik-reklame') ? 'bg-slate-800 text-amber-400' : 'text-slate-300' ?>">Inventaris Titik</a>
                    <?php if (Session::has('user_id')): ?>
                        <a href="/leads" class="px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors <?= str_starts_with($_SERVER['REQUEST_URI'], '/leads') ? 'bg-slate-800 text-amber-400' : 'text-slate-300' ?>">Pipeline CRM</a>
                        <?php if (Session::get('user_role') === 'Super Admin'): ?>
                            <a href="/admin/users" class="px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors <?= str_starts_with($_SERVER['REQUEST_URI'], '/admin/users') ? 'bg-slate-800 text-amber-400' : 'text-slate-300' ?>">Hak Akses (RBAC)</a>
                        <?php endif; ?>
                    <?php endif; ?>
                    <a href="/laporan" class="px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors <?= str_starts_with($_SERVER['REQUEST_URI'], '/laporan') ? 'bg-slate-800 text-amber-400' : 'text-slate-300' ?>">Laporan Eksekutif</a>
                </nav>
            </div>

            <div class="flex items-center gap-3">
                <?php if (Session::has('user_id')): ?>
                    <div class="hidden sm:flex items-center gap-2 text-xs">
                        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span class="text-slate-300 font-medium"><?= Security::e(Session::get('user_name')) ?></span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20"><?= Security::e(Session::get('user_role')) ?></span>
                    </div>
                    <a href="/logout" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors">Keluar</a>
                <?php else: ?>
                    <a href="/login" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md font-bold transition-colors">Masuk Operator</a>
                <?php endif; ?>
            </div>
        </div>
    </header>

    <!-- Flash Notifications -->
    <?php if ($msg = Session::flash('success')): ?>
        <div class="bg-emerald-950 border-b border-emerald-500/40 text-emerald-300 px-4 py-2.5 text-xs text-center font-medium">
            <?= Security::e($msg) ?>
        </div>
    <?php endif; ?>
    <?php if ($msg = Session::flash('error')): ?>
        <div class="bg-rose-950 border-b border-rose-500/40 text-rose-300 px-4 py-2.5 text-xs text-center font-medium">
            <?= Security::e($msg) ?>
        </div>
    <?php endif; ?>

    <!-- Main Content -->
    <main class="flex-1 w-full">
        <?= $content ?>
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-900 bg-slate-950 px-4 py-4 text-xs text-slate-500">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
                © 2026 JabarOOH Media Network. Pengelola Resmi: Suherman Reklame (suherman.reklame2012@gmail.com / 087822248975)
            </div>
            <div class="flex items-center gap-4 text-[11px]">
                <a href="/api/spots" target="_blank" class="hover:text-amber-400">REST API Spots</a>
                <span>·</span>
                <a href="/api/database/export/mysql" class="text-amber-400 hover:underline">Unduh Database MySQL (.sql)</a>
            </div>
        </div>
    </footer>

</body>
</html>
`);

  // Layout: auth.php
  writeFile('views/layouts/auth.php', `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= Security::e($title ?? 'Autentikasi - JabarOOH') ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4">
    <?= $content ?>
</body>
</html>
`);

  // Dashboard Index
  writeFile('views/dashboard/index.php', `
<div class="w-full">
    <!-- 1. Global Performance Summary KPI Card -->
    <section class="w-full bg-slate-950 border-b border-slate-800/80 px-4 sm:px-6 py-4">
        <div class="max-w-7xl mx-auto">
            <div class="flex items-center justify-between mb-3 text-xs">
                <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                    <h2 class="font-black text-white uppercase tracking-wider text-xs">Global Performance Summary</h2>
                    <span class="text-slate-500">|</span>
                    <span class="text-slate-400 font-medium">Portofolio Titik Reklame Jawa Barat (32 Titik Strategis)</span>
                </div>
                <div class="text-[11px] font-mono text-slate-400">Status: <strong class="text-emerald-400">Online MySQL 8.0</strong></div>
            </div>

            <!-- 4 KPI Cards Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <!-- Card 1: Total Impressions -->
                <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
                    <div class="flex justify-between items-center text-xs text-slate-400 mb-1">
                        <span class="font-semibold text-slate-300">Total Impresi Harian</span>
                        <span class="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">DGR Daily</span>
                    </div>
                    <div class="flex items-baseline gap-1.5">
                        <span class="text-2xl font-black font-mono text-white"><?= number_format(($kpi['total_dgr'] ?? 0) / 1000000, 2) ?>M</span>
                        <span class="text-xs text-slate-400">kontak/hari</span>
                    </div>
                    <div class="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono flex justify-between">
                        <span>VAC: <strong class="text-emerald-400"><?= number_format(($kpi['total_vac'] ?? 0) / 1000000, 2) ?>M</strong></span>
                        <span>Bulan: <strong class="text-slate-300"><?= number_format((($kpi['total_dgr'] ?? 0) * 30) / 1000000, 1) ?>M</strong></span>
                    </div>
                </div>

                <!-- Card 2: Revenue Forecast -->
                <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
                    <div class="flex justify-between items-center text-xs text-slate-400 mb-1">
                        <span class="font-semibold text-slate-300">Revenue Forecast</span>
                        <span class="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">Monthly</span>
                    </div>
                    <div class="flex items-baseline gap-1.5">
                        <span class="text-2xl font-black font-mono text-amber-400">Rp <?= number_format(($kpi['monthly_revenue'] ?? 0) / 1000000000, 2) ?>M</span>
                        <span class="text-xs text-slate-400">/bln</span>
                    </div>
                    <div class="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono flex justify-between">
                        <span>ARR: <strong class="text-white">Rp <?= number_format((($kpi['monthly_revenue'] ?? 0) * 12) / 1000000000, 2) ?>M</strong></span>
                        <span>Avg CPM: <strong class="text-amber-300">Rp <?= number_format($kpi['avg_cpm'] ?? 0) ?></strong></span>
                    </div>
                </div>

                <!-- Card 3: Occupancy Rate -->
                <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
                    <div class="flex justify-between items-center text-xs text-slate-400 mb-1">
                        <span class="font-semibold text-slate-300">Occupancy Rate</span>
                        <span class="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40"><?= (int)($kpi['occupied_count'] ?? 0) ?> / <?= (int)($kpi['total_spots'] ?? 0) ?> Terisi</span>
                    </div>
                    <div class="flex items-baseline gap-2">
                        <span class="text-2xl font-black font-mono text-emerald-400"><?= $kpi['occupancy_rate_pct'] ?>%</span>
                        <span class="text-xs text-slate-400">terisi aktif</span>
                    </div>
                    <div class="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden flex">
                        <div class="bg-emerald-400 h-full" style="width: <?= $kpi['occupancy_rate_pct'] ?>%"></div>
                    </div>
                    <div class="mt-2 pt-1.5 border-t border-slate-800 text-[11px] font-mono flex justify-between text-slate-400">
                        <span><strong class="text-emerald-400"><?= (int)($kpi['occupied_count'] ?? 0) ?></strong> Terisi</span>
                        <span>·</span>
                        <span><strong class="text-slate-200"><?= (int)($kpi['available_count'] ?? 0) ?></strong> Tersedia</span>
                    </div>
                </div>

                <!-- Card 4: Effectiveness -->
                <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
                    <div class="flex justify-between items-center text-xs text-slate-400 mb-1">
                        <span class="font-semibold text-slate-300">Indeks Efektivitas</span>
                        <span class="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">Score / 100</span>
                    </div>
                    <div class="flex items-baseline gap-1.5">
                        <span class="text-2xl font-black font-mono text-purple-300"><?= round($kpi['avg_effectiveness'] ?? 0, 1) ?></span>
                        <span class="text-xs text-slate-400">kualitas titik</span>
                    </div>
                    <div class="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono flex justify-between">
                        <span>Cakupan: <strong class="text-white">Jawa Barat</strong></span>
                        <a href="/titik-reklame" class="text-amber-400 hover:underline">Lihat Semua →</a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 2. Interactive GIS Map Container & Quick Spot List -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Interactive Leaflet Map -->
        <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[520px]">
            <div class="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                <span class="text-xs font-bold text-slate-300">Peta Interaktif Lokasi Titik Reklame (Jawa Barat)</span>
                <span class="text-[11px] font-mono text-amber-400"><?= count($spots) ?> Titik Terverifikasi</span>
            </div>
            <div id="map-jabar" class="flex-1 w-full bg-slate-950"></div>
        </div>

        <!-- Right: Top 5 Highest Reach Spots -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[520px] overflow-hidden">
            <h3 class="text-xs font-black uppercase text-amber-400 tracking-wider mb-3">Top 5 Titik Impresi Tertinggi</h3>
            <div class="flex-1 overflow-y-auto space-y-2.5 pr-1">
                <?php 
                $topSpots = $spots;
                usort($topSpots, fn($a, $b) => $b['daily_gross_reach'] <=> $a['daily_gross_reach']);
                $top5 = array_slice($topSpots, 0, 5);
                foreach ($top5 as $idx => $ts): 
                ?>
                <a href="/titik-reklame/<?= Security::e($ts['slug']) ?>" class="block p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-amber-400/50 transition-all">
                    <div class="flex items-center justify-between text-xs mb-1">
                        <span class="font-bold text-white truncate"><?= ($idx + 1) ?>. <?= Security::e($ts['name']) ?></span>
                        <span class="text-[10px] font-mono text-amber-400"><?= Security::e($ts['code']) ?></span>
                    </div>
                    <div class="text-[11px] text-slate-400 truncate"><?= Security::e($ts['road_name']) ?> (<?= Security::e($ts['regency']) ?>)</div>
                    <div class="mt-2 flex items-center justify-between text-[11px] font-mono">
                        <span class="text-cyan-400"><?= number_format($ts['daily_gross_reach']) ?> DGR</span>
                        <span class="px-1.5 py-0.5 rounded text-[10px] <?= $ts['occupancy_status'] === 'Available' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-300' ?>">
                            <?= Security::e($ts['occupancy_status']) ?>
                        </span>
                    </div>
                </a>
                <?php endforeach; ?>
            </div>
            <a href="/titik-reklame" class="mt-3 block text-center py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl transition-colors">
                Buka Katalog Lengkap (32 Titik) →
            </a>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map-jabar').setView([-6.9175, 107.6191], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    var spots = <?= json_encode($spots) ?>;
    spots.forEach(function(s) {
        if (s.latitude && s.longitude) {
            var marker = L.marker([parseFloat(s.latitude), parseFloat(s.longitude)]).addTo(map);
            marker.bindPopup(
                '<div style="color:#0f172a; font-family:sans-serif; min-width:180px;">' +
                '<strong style="font-size:12px;">' + s.name + '</strong><br>' +
                '<small style="color:#64748b;">' + s.code + ' · ' + s.regency + '</small><br>' +
                '<div style="margin-top:6px; font-size:11px;">Reach: <b>' + parseInt(s.daily_gross_reach).toLocaleString('id-ID') + ' DGR</b></div>' +
                '<a href="/titik-reklame/' + s.slug + '" style="display:inline-block; margin-top:6px; font-size:11px; color:#2563eb; font-weight:bold; text-decoration:none;">Buka Detail Titik &rarr;</a>' +
                '</div>'
            );
        }
    });
});
</script>
`);

  // Spot Index & Detail Views
  writeFile('views/spots/index.php', `
<div class="max-w-7xl mx-auto px-4 sm:px-6 py-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
            <h1 class="text-xl font-black text-white">Inventaris Titik Reklame OOH & DOOH</h1>
            <p class="text-xs text-slate-400">Total <?= count($spots) ?> titik reklame strategis terdaftar di Jawa Barat</p>
        </div>

        <?php if (Session::has('user_id') && in_array(Session::get('user_role'), ['Super Admin', 'Operator Lapangan'])): ?>
            <a href="/admin/spots/create" class="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-colors">
                + Tambah Titik Baru
            </a>
        <?php endif; ?>
    </div>

    <!-- Filter Form -->
    <form method="GET" action="/titik-reklame" class="bg-slate-900 border border-slate-800 rounded-2xl p-3 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
            <label class="block text-slate-400 mb-1 font-semibold">Cari Titik / Jalan</label>
            <input type="text" name="q" value="<?= Security::e($filters['q'] ?? '') ?>" placeholder="Nama jalan, titik, kode..." class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white">
        </div>
        <div>
            <label class="block text-slate-400 mb-1 font-semibold">Wilayah Kota/Kab</label>
            <input type="text" name="regency" value="<?= Security::e($filters['regency'] ?? '') ?>" placeholder="Kota Bandung, Bekasi..." class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white">
        </div>
        <div>
            <label class="block text-slate-400 mb-1 font-semibold">Status Ketersediaan</label>
            <select name="status" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white">
                <option value="">Semua Status</option>
                <option value="Available" <?= ($filters['status'] ?? '') === 'Available' ? 'selected' : '' ?>>Tersedia (Available)</option>
                <option value="Occupied" <?= ($filters['status'] ?? '') === 'Occupied' ? 'selected' : '' ?>>Terisi (Occupied)</option>
            </select>
        </div>
        <div class="flex items-end gap-2">
            <button type="submit" class="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors">Filter</button>
            <a href="/titik-reklame" class="px-3 py-1.5 bg-slate-950 text-slate-400 rounded-lg border border-slate-800 hover:text-white">Reset</a>
        </div>
    </form>

    <!-- Spot Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <?php foreach ($spots as $s): ?>
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div>
                <div class="flex justify-between items-center text-xs mb-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20"><?= Security::e($s['code']) ?></span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold <?= $s['occupancy_status'] === 'Available' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400' ?>">
                        <?= Security::e($s['occupancy_status']) ?>
                    </span>
                </div>
                <h3 class="text-sm font-bold text-white mb-1"><?= Security::e($s['name']) ?></h3>
                <p class="text-xs text-slate-400 mb-3"><?= Security::e($s['address']) ?></p>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                    <div class="text-[10px] text-slate-500 font-mono">DGR HARIAN</div>
                    <div class="font-mono font-bold text-cyan-400"><?= number_format($s['daily_gross_reach']) ?></div>
                </div>
                <a href="/titik-reklame/<?= Security::e($s['slug']) ?>" class="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs transition-colors">
                    Detail Titik →
                </a>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</div>
`);

  writeFile('views/spots/detail.php', `
<div class="max-w-5xl mx-auto px-4 sm:px-6 py-6">
    <div class="mb-4">
        <a href="/titik-reklame" class="text-xs text-amber-400 hover:underline">← Kembali ke Inventaris</a>
    </div>

    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
            <div>
                <div class="flex items-center gap-2 mb-1">
                    <span class="px-2.5 py-0.5 rounded font-mono font-bold text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20"><?= Security::e($spot['code']) ?></span>
                    <span class="text-xs text-slate-400 font-medium"><?= Security::e($spot['regency']) ?></span>
                </div>
                <h1 class="text-2xl font-black text-white"><?= Security::e($spot['name']) ?></h1>
                <p class="text-xs text-slate-400 mt-1"><?= Security::e($spot['address']) ?></p>
            </div>
            <div class="text-right">
                <div class="text-xs text-slate-400">Rate Sewa / Bulan</div>
                <div class="text-xl font-black font-mono text-amber-400">Rp <?= number_format($spot['rate_per_month_idr']) ?></div>
            </div>
        </div>

        <!-- Specifications Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-800 text-xs font-mono">
            <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span class="text-slate-500 block text-[10px]">TIPE MEDIA</span>
                <strong class="text-white"><?= Security::e($spot['media_type']) ?></strong>
            </div>
            <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span class="text-slate-500 block text-[10px]">DIMENSI</span>
                <strong class="text-white"><?= $spot['width_m'] ?>m x <?= $spot['height_m'] ?>m (<?= $spot['area_m2'] ?> m²)</strong>
            </div>
            <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span class="text-slate-500 block text-[10px]">DAILY REACH (DGR)</span>
                <strong class="text-cyan-400"><?= number_format($spot['daily_gross_reach']) ?> kontak</strong>
            </div>
            <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span class="text-slate-500 block text-[10px]">VAC (TERTARGET)</span>
                <strong class="text-emerald-400"><?= number_format($spot['vac_daily']) ?> kontak</strong>
            </div>
        </div>

        <!-- Booking Inquiry Form -->
        <div class="pt-6">
            <h3 class="text-sm font-bold text-white mb-3">Reservasi / Booking Titik Ini</h3>
            <form method="POST" action="/leads/submit" class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <?= Security::csrfField() ?>
                <input type="hidden" name="spot_id" value="<?= Security::e($spot['id']) ?>">
                <input type="text" name="client_name" required placeholder="Nama Anda / Perusahaan *" class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
                <input type="email" name="email" required placeholder="Email Kontak *" class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
                <input type="text" name="phone" required placeholder="Nomor Telepon / WhatsApp *" class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
                <button type="submit" class="sm:col-span-3 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-lg transition-colors">
                    Kirim Permintaan Booking Titik
                </button>
            </form>
        </div>
    </div>
</div>
`);

  // Spot Create Form
  writeFile('views/spots/create.php', `
<div class="max-w-2xl mx-auto px-4 py-8">
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <h1 class="text-lg font-black text-white mb-4">Tambah Titik Reklame Baru</h1>
        <form method="POST" action="/admin/spots/store" class="space-y-4 text-xs">
            <?= Security::csrfField() ?>
            <div>
                <label class="block text-slate-400 mb-1 font-semibold">Kode Titik Reklame (Misal: JBR-BDG-099) *</label>
                <input type="text" name="code" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
            </div>
            <div>
                <label class="block text-slate-400 mb-1 font-semibold">Nama Titik *</label>
                <input type="text" name="name" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-slate-400 mb-1 font-semibold">Wilayah Kota/Kab *</label>
                    <input type="text" name="regency" required value="Kota Bandung" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
                </div>
                <div>
                    <label class="block text-slate-400 mb-1 font-semibold">Tipe Media *</label>
                    <select name="media_type" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
                        <option value="LED Videotron">LED Videotron</option>
                        <option value="Billboard Statis">Billboard Statis</option>
                        <option value="Megatron">Megatron</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="block text-slate-400 mb-1 font-semibold">Alamat Lengkap *</label>
                <textarea name="address" required rows="2" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-slate-400 mb-1 font-semibold">Lebar (meter)</label>
                    <input type="number" name="width_m" value="12" step="0.1" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
                </div>
                <div>
                    <label class="block text-slate-400 mb-1 font-semibold">Tinggi (meter)</label>
                    <input type="number" name="height_m" value="6" step="0.1" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-slate-400 mb-1 font-semibold">Daily Reach (DGR)</label>
                    <input type="number" name="daily_gross_reach" value="60000" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
                </div>
                <div>
                    <label class="block text-slate-400 mb-1 font-semibold">Rate Sewa / Bulan (IDR)</label>
                    <input type="number" name="rate_per_month_idr" value="45000000" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
                </div>
            </div>
            <button type="submit" class="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl transition-colors">
                Simpan Titik Reklame
            </button>
        </form>
    </div>
</div>
`);

  // Leads View
  writeFile('views/leads/index.php', `
<div class="max-w-7xl mx-auto px-4 sm:px-6 py-6">
    <h1 class="text-xl font-black text-white mb-1">Pipeline Prospek & Permintaan Booking (CRM)</h1>
    <p class="text-xs text-slate-400 mb-6">Kelola prospek pengiklan dari reservasi titik reklame</p>

    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
        <table class="w-full text-left text-xs">
            <thead class="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
                <tr>
                    <th class="p-3">Tanggal</th>
                    <th class="p-3">Klien</th>
                    <th class="p-3">Kontak</th>
                    <th class="p-3">Titik Diminati</th>
                    <th class="p-3">Durasi</th>
                    <th class="p-3">Status</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-800 text-slate-300">
                <?php if (empty($leads)): ?>
                    <tr><td colspan="6" class="p-4 text-center text-slate-500">Belum ada data prospek.</td></tr>
                <?php else: ?>
                    <?php foreach ($leads as $l): ?>
                    <tr class="hover:bg-slate-800/50">
                        <td class="p-3 font-mono text-slate-400"><?= date('d M Y', strtotime($l['created_at'])) ?></td>
                        <td class="p-3 font-bold text-white"><?= Security::e($l['client_name']) ?></td>
                        <td class="p-3 font-mono"><?= Security::e($l['phone'] ?? $l['email']) ?></td>
                        <td class="p-3 text-amber-400"><?= Security::e($l['spot_name'] ?? '-') ?></td>
                        <td class="p-3 font-mono"><?= $l['campaign_duration_months'] ?> Bulan</td>
                        <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold"><?= Security::e($l['status']) ?></span></td>
                    </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
`);

  // Reports View
  writeFile('views/reports/index.php', `
<div class="max-w-7xl mx-auto px-4 sm:px-6 py-6">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-xl font-black text-white">Laporan Kinerja Eksekutif OOH Jawa Barat</h1>
            <p class="text-xs text-slate-400">Ringkasan analitik lalu lintas dan proyeksi pendapatan</p>
        </div>
        <button onclick="window.print()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs print:hidden">
            Cetak / Ekspor PDF 🖨️
        </button>
    </div>

    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div class="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span class="text-slate-500 block">TOTAL TITIK REKLAME</span>
                <strong class="text-white text-base"><?= (int)($kpi['total_spots'] ?? 0) ?> Titik</strong>
            </div>
            <div class="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span class="text-slate-500 block">TOTAL IMPRESI HARIAN</span>
                <strong class="text-cyan-400 text-base"><?= number_format($kpi['total_dgr'] ?? 0) ?> DGR</strong>
            </div>
            <div class="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span class="text-slate-500 block">OCCUPANCY RATE</span>
                <strong class="text-emerald-400 text-base"><?= $kpi['occupancy_rate_pct'] ?>%</strong>
            </div>
            <div class="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span class="text-slate-500 block">PROYEKSI BULANAN</span>
                <strong class="text-amber-400 text-base">Rp <?= number_format($kpi['monthly_revenue'] ?? 0) ?></strong>
            </div>
        </div>
    </div>
</div>
`);

  // RBAC User Management View (Super Admin)
  writeFile('views/users/index.php', `
<div class="max-w-7xl mx-auto px-4 sm:px-6 py-6">
    <h1 class="text-xl font-black text-white mb-1">Manajemen Hak Akses & Pengguna (RBAC)</h1>
    <p class="text-xs text-slate-400 mb-6">Menu ini dilindungi secara ketat oleh Server-Side Role Middleware (Khusus Super Admin)</p>

    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
        <table class="w-full text-left text-xs">
            <thead class="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
                <tr>
                    <th class="p-3">Username</th>
                    <th class="p-3">Nama Lengkap</th>
                    <th class="p-3">Email</th>
                    <th class="p-3">Role Akses</th>
                    <th class="p-3">Instansi / Agensi</th>
                    <th class="p-3">Terakhir Login</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-800 text-slate-300">
                <?php foreach ($users as $u): ?>
                <tr class="hover:bg-slate-800/50">
                    <td class="p-3 font-mono font-bold text-amber-400"><?= Security::e($u['username']) ?></td>
                    <td class="p-3 font-medium text-white"><?= Security::e($u['full_name']) ?></td>
                    <td class="p-3 font-mono"><?= Security::e($u['email']) ?></td>
                    <td class="p-3">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                            <?= Security::e($u['role']) ?>
                        </span>
                    </td>
                    <td class="p-3 text-slate-400"><?= Security::e($u['agency_or_company']) ?></td>
                    <td class="p-3 font-mono text-slate-500"><?= $u['last_login_at'] ? date('d M Y H:i', strtotime($u['last_login_at'])) : '-' ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>
`);

  // Login View
  writeFile('views/auth/login.php', `
<div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
    <div class="flex items-center gap-3 mb-6">
        <span class="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-md">OOH</span>
        <div>
            <h1 class="text-lg font-black text-white">Login Operator & Admin</h1>
            <p class="text-xs text-slate-400">JabarOOH Media Network</p>
        </div>
    </div>

    <?php if ($msg = Session::flash('error')): ?>
        <div class="p-3 mb-4 rounded-xl text-xs font-semibold bg-rose-950 border border-rose-500/40 text-rose-300">
            <?= Security::e($msg) ?>
        </div>
    <?php endif; ?>

    <form method="POST" action="/login" class="space-y-4 text-xs">
        <?= Security::csrfField() ?>
        <div>
            <label class="block text-slate-400 mb-1 font-semibold">Email atau Username</label>
            <input type="text" name="identifier" required value="suherman" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white">
        </div>
        <div>
            <label class="block text-slate-400 mb-1 font-semibold">Kata Sandi</label>
            <input type="password" name="password" required value="AdminOOH@2026" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white">
        </div>
        <button type="submit" class="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-lg transition-colors">
            Masuk ke Portal
        </button>
    </form>

    <div class="mt-6 pt-4 border-t border-slate-800 text-center">
        <a href="/" class="text-xs text-amber-400 hover:underline">← Kembali ke Peta Publik</a>
    </div>
</div>
`);

  // Error Views: 403, 404, 500
  writeFile('views/errors/403.php', `
<div class="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
    <div class="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400 flex items-center justify-center text-2xl font-black mb-4">403</div>
    <h1 class="text-2xl font-black text-white mb-2"><?= Security::e($title ?? 'Akses Ditolak (403 Forbidden)') ?></h1>
    <p class="text-xs text-slate-400 max-w-md mb-6"><?= Security::e($message ?? 'Anda tidak memiliki hak akses yang cukup untuk melihat konten ini. Sistem keamanan kami memvalidasi otorisasi secara ketat.') ?></p>
    <a href="/dashboard" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors">
        ← Kembali ke Dashboard
    </a>
</div>
`);

  writeFile('views/errors/404.php', `
<div class="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
    <div class="w-16 h-16 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 flex items-center justify-center text-2xl font-black mb-4">404</div>
    <h1 class="text-2xl font-black text-white mb-2">Halaman Tidak Ditemukan</h1>
    <p class="text-xs text-slate-400 max-w-md mb-6">Tautan yang Anda tuju mungkin telah dipindahkan atau URL tidak sesuai dengan direktori kami.</p>
    <a href="/" class="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-colors">
        ← Kembali ke Beranda
    </a>
</div>
`);

  writeFile('views/errors/500.php', `
<div class="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center font-sans text-slate-100 bg-slate-950">
    <div class="w-16 h-16 rounded-2xl bg-rose-950 text-rose-400 flex items-center justify-center text-2xl font-black mb-4">500</div>
    <h1 class="text-2xl font-black text-white mb-2">Terjadi Kesalahan Server Internal</h1>
    <p class="text-xs text-slate-400 max-w-md mb-6">Koneksi database atau sistem mengalami gangguan sementara. Silakan periksa konfigurasi pada config/config.php.</p>
    <a href="/" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs">
        ← Kembali
    </a>
</div>
`);
}
