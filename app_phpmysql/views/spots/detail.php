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
