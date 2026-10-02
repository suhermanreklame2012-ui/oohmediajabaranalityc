<?php
/**
 * JabarOOH - Web Setup Wizard (Inisialisasi Database 1-Klik)
 */
require_once __DIR__ . '/config/config.php';

$message = null;
$messageType = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'seed') {
        try {
            $pdo = getDbConnection();
            $sqlFile = __DIR__ . '/database.sql';
            if (file_exists($sqlFile)) {
                $sql = file_get_contents($sqlFile);
                $pdo->exec($sql);
                $message = "Berhasil! Basis data telah diinisialisasi dan diisi 77 titik reklame Jawa Barat.";
                $messageType = "success";
            } else {
                $message = "File database.sql tidak ditemukan.";
                $messageType = "error";
            }
        } catch (Exception $e) {
            $message = "Terjadi kesalahan: " . $e->getMessage();
            $messageType = "error";
        }
    }
}

// Cek status database
$dbStatus = 'UNKNOWN';
$spotCount = 0;
try {
    $pdo = getDbConnection();
    $stmt = $pdo->query("SELECT COUNT(*) FROM billboard_spots");
    $spotCount = $stmt->fetchColumn();
    $dbStatus = 'CONNECTED (' . $spotCount . ' Titik Terdaftar)';
} catch (Exception $e) {
    $dbStatus = 'BELUM DIINISIALISASI';
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Setup Wizard - JabarOOH Reklame Portal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4">
  <div class="max-w-lg w-full bg-slate-900 border border-teal-500/30 rounded-3xl p-8 shadow-2xl">
    <div class="flex items-center gap-3 mb-4">
      <div class="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-xl font-bold">SR</div>
      <div>
        <h1 class="text-xl font-black text-white">Setup Wizard JabarOOH</h1>
        <p class="text-xs text-teal-400">Inisialisasi Database PHP 8.4 & SQLite / MySQL</p>
      </div>
    </div>

    <?php if ($message): ?>
      <div class="p-3 mb-4 rounded-xl text-xs font-semibold <?= $messageType === 'success' ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300' : 'bg-rose-950/80 border border-rose-500/50 text-rose-300' ?>">
        <?= htmlspecialchars($message) ?>
      </div>
    <?php endif; ?>

    <div class="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs mb-6">
      <div class="flex justify-between">
        <span class="text-slate-400">Status Database:</span>
        <strong class="text-teal-300"><?= $dbStatus ?></strong>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">Driver Aktif:</span>
        <strong class="text-white uppercase"><?= htmlspecialchars(DB_DRIVER) ?></strong>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">Super Administrator:</span>
        <strong class="text-white"><?= htmlspecialchars(ADMIN_EMAIL) ?></strong>
      </div>
    </div>

    <form method="POST" class="space-y-3">
      <button type="submit" name="action" value="seed" class="w-full py-3 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105 text-sm uppercase">
        🚀 Seed / Inisialisasi Database 77 Titik Reklame
      </button>
    </form>

    <div class="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
      <a href="index.php" class="text-teal-400 hover:underline">← Buka Dashboard Aplikasi</a>
      <a href="admin/" class="text-slate-400 hover:text-white">Panel Kontrol Admin →</a>
    </div>
  </div>
</body>
</html>
