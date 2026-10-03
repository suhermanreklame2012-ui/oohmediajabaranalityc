<div class="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
    <div class="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400 flex items-center justify-center text-2xl font-black mb-4">403</div>
    <h1 class="text-2xl font-black text-white mb-2"><?= Security::e($title ?? 'Akses Ditolak (403 Forbidden)') ?></h1>
    <p class="text-xs text-slate-400 max-w-md mb-6"><?= Security::e($message ?? 'Anda tidak memiliki hak akses yang cukup untuk melihat konten ini. Sistem keamanan kami memvalidasi otorisasi secara ketat.') ?></p>
    <a href="/dashboard" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors">
        ← Kembali ke Dashboard
    </a>
</div>
