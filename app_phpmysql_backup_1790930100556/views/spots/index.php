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
