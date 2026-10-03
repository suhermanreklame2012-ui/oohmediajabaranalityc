<!DOCTYPE html>
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
