<?php
/**
 * JabarOOH - Panel Kontrol Admin (PHP 8.4)
 */
require_once __DIR__ . '/../config/config.php';
$pdo = getDbConnection();

$stmt = $pdo->query("SELECT * FROM billboard_spots ORDER BY spot_code ASC");
$spots = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Admin Kontrol - JabarOOH</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-6">
  <div class="max-w-7xl mx-auto">
    <header class="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
      <div>
        <h1 class="text-xl font-bold text-white">Panel Kontrol Admin - JabarOOH</h1>
        <p class="text-xs text-slate-400">Total: <?= count($spots) ?> Titik Reklame Terdaftar di Basis Data</p>
      </div>
      <div class="flex gap-2">
        <a href="../setup.php" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-white">Setup Wizard</a>
        <a href="../index.php" class="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-xs font-bold rounded-lg text-white">Buka Web Portal</a>
      </div>
    </header>

    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-950 text-slate-400 border-b border-slate-800">
          <tr>
            <th class="p-3">Kode</th>
            <th class="p-3">Nama Titik Reklame</th>
            <th class="p-3">Wilayah</th>
            <th class="p-3">Tipe</th>
            <th class="p-3">Ukuran</th>
            <th class="p-3">Reach Harian</th>
            <th class="p-3">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800 text-slate-300">
          <?php foreach ($spots as $s): ?>
          <tr class="hover:bg-slate-800/50">
            <td class="p-3 font-mono font-bold text-teal-400"><?= htmlspecialchars($s['spot_code']) ?></td>
            <td class="p-3 font-medium text-white"><?= htmlspecialchars($s['name']) ?></td>
            <td class="p-3"><?= htmlspecialchars($s['regency']) ?></td>
            <td class="p-3"><?= htmlspecialchars($s['media_type']) ?></td>
            <td class="p-3"><?= $s['width_m'] ?>m x <?= $s['height_m'] ?>m</td>
            <td class="p-3 font-mono"><?= number_format($s['daily_gross_reach']) ?></td>
            <td class="p-3">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold <?= $s['occupancy_status'] === 'Tersedia' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800' ?>">
                <?= htmlspecialchars($s['occupancy_status']) ?>
              </span>
            </td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>
