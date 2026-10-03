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
