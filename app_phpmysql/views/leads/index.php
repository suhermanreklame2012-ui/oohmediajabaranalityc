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
