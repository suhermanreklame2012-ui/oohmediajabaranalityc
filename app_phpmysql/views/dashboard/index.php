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
