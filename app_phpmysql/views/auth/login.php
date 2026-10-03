<div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
    <div class="flex items-center gap-3 mb-6">
        <span class="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-md">OOH</span>
        <div>
            <h1 class="text-lg font-black text-white">Login Operator & Admin</h1>
            <p class="text-xs text-slate-400">JabarOOH Media Network</p>
        </div>
    </div>

    <?php if ($msg = Session::flash('error')): ?>
        <div class="p-3 mb-4 rounded-xl text-xs font-semibold bg-rose-950 border border-rose-500/40 text-rose-300">
            <?= Security::e($msg) ?>
        </div>
    <?php endif; ?>

    <form method="POST" action="/login" class="space-y-4 text-xs">
        <?= Security::csrfField() ?>
        <div>
            <label class="block text-slate-400 mb-1 font-semibold">Email atau Username</label>
            <input type="text" name="identifier" required value="suherman" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white">
        </div>
        <div>
            <label class="block text-slate-400 mb-1 font-semibold">Kata Sandi</label>
            <input type="password" name="password" required value="AdminOOH@2026" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white">
        </div>
        <button type="submit" class="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-lg transition-colors">
            Masuk ke Portal
        </button>
    </form>

    <div class="mt-6 pt-4 border-t border-slate-800 text-center">
        <a href="/" class="text-xs text-amber-400 hover:underline">← Kembali ke Peta Publik</a>
    </div>
</div>
