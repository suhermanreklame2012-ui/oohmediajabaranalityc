<?php
/**
 * JabarOOH - Web Setup Wizard & System Diagnostics (PHP 8.4)
 */
require_once __DIR__ . '/config/config.php';

$message = null;
$messageType = null;
$hasIndexHtml = file_exists(__DIR__ . '/index.html');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'rename_index_html') {
        $oldFile = __DIR__ . '/index.html';
        if (file_exists($oldFile)) {
            rename($oldFile, __DIR__ . '/index.html.bak');
            $message = "Berhasil! File index.html telah di-rename menjadi index.html.bak. Halaman utama kini otomatis memuat index.php.";
            $messageType = "success";
            $hasIndexHtml = false;
        }
    }

    if ($action === 'seed') {
        try {
            $pdo = getDbConnection();
            $sqlFile = __DIR__ . '/database.sql';
            if (file_exists($sqlFile)) {
                $sql = file_get_contents($sqlFile);
                $pdo->exec($sql);
                $message = "Berhasil! Basis data telah diinisialisasi dan diisi 32 titik reklame Jawa Barat.";
                $messageType = "success";
            } else {
                $message = "File database.sql tidak ditemukan.";
                $messageType = "error";
            }
        } catch (Exception $e) {
            $message = "Koneksi/Seed Database Gagal: " . $e->getMessage();
            $messageType = "error";
        }
    }
}

// Cek status database
$dbStatus = 'UNKNOWN';
$spotCount = 0;
$dbError = null;
try {
    $pdo = getDbConnection();
    $stmt = $pdo->query("SELECT COUNT(*) FROM billboard_spots");
    $spotCount = $stmt->fetchColumn();
    $dbStatus = 'CONNECTED (' . $spotCount . ' Titik Reklame Terdaftar)';
} catch (Exception $e) {
    $dbError = $e->getMessage();
    $dbStatus = 'GAGAL KONEKSI / BELUM DIINISIALISASI';
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Setup Wizard & Diagnostik - JabarOOH</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4 font-sans">
  <div class="max-w-xl w-full bg-slate-900 border border-teal-500/30 rounded-3xl p-8 shadow-2xl space-y-4">
    <div class="flex items-center gap-3 pb-3 border-b border-slate-800">
      <div class="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg">SR</div>
      <div>
        <h1 class="text-xl font-black text-white">Setup Wizard & Diagnostik JabarOOH</h1>
        <p class="text-xs text-teal-400">Verifikasi Hosting cPanel oohmediabandung.com (PHP 8.4)</p>
      </div>
    </div>

    <?php if ($hasIndexHtml): ?>
      <div class="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/60 text-xs text-amber-200 space-y-2">
        <div class="font-bold flex items-center gap-2 text-amber-300">
          <span>⚠️</span> File index.html Lama Terdeteksi!
        </div>
        <p class="text-[11px] leading-relaxed">
          Apache di hosting secara bawaan mengutamakan file <code>index.html</code> daripada <code>index.php</code>. Ini menyebabkan website membuka halaman lama/kosong bukannya aplikasi dashboard.
        </p>
        <form method="POST">
          <button type="submit" name="action" value="rename_index_html" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors">
            ⚡ Matikan index.html (Ubah ke .bak) Otomatis
          </button>
        </form>
      </div>
    <?php endif; ?>

    <?php if ($message): ?>
      <div class="p-3 rounded-xl text-xs font-semibold <?= $messageType === 'success' ? 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-300' : 'bg-rose-950/90 border border-rose-500/50 text-rose-300' ?>">
        <?= htmlspecialchars($message) ?>
      </div>
    <?php endif; ?>

    <div class="space-y-2.5 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs font-mono">
      <div class="flex justify-between">
        <span class="text-slate-400">Status Database:</span>
        <strong class="<?= $spotCount > 0 ? 'text-emerald-400' : 'text-amber-400' ?>"><?= $dbStatus ?></strong>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">Driver MySQL:</span>
        <strong class="text-white"><?= htmlspecialchars(MYSQL_USER) ?>@<?= htmlspecialchars(MYSQL_HOST) ?>/<?= htmlspecialchars(MYSQL_DATABASE) ?></strong>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">Ekstensi PHP:</span>
        <strong class="text-white">PDO: <?= extension_loaded('pdo_mysql') ? 'MySQL ✅' : 'MySQL ❌' ?> | <?= extension_loaded('pdo_sqlite') ? 'SQLite ✅' : 'SQLite ❌' ?></strong>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">Versi PHP Server:</span>
        <strong class="text-teal-300"><?= phpversion() ?></strong>
      </div>
      <?php if ($dbError): ?>
        <div class="pt-2 border-t border-slate-800 text-[10px] text-rose-400">
          <strong>Pesan Error PDO:</strong> <?= htmlspecialchars($dbError) ?>
        </div>
      <?php endif; ?>
    </div>

    <form method="POST" class="space-y-3">
      <button type="submit" name="action" value="seed" class="w-full py-3 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02] text-xs uppercase tracking-wider">
        🚀 Inisialisasi / Seed Ulang Database 32 Titik Reklame
      </button>
    </form>

    <div class="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
      <a href="index.php" class="text-teal-400 hover:underline">← Buka Dashboard Aplikasi</a>
      <a href="admin/" class="text-slate-400 hover:text-white">Panel Kontrol Admin →</a>
    </div>
  </div>
</body>
</html>
