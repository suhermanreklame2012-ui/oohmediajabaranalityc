<div class="max-w-7xl mx-auto px-4 sm:px-6 py-6">
    <h1 class="text-xl font-black text-white mb-1">Manajemen Hak Akses & Pengguna (RBAC)</h1>
    <p class="text-xs text-slate-400 mb-6">Menu ini dilindungi secara ketat oleh Server-Side Role Middleware (Khusus Super Admin)</p>

    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
        <table class="w-full text-left text-xs">
            <thead class="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
                <tr>
                    <th class="p-3">Username</th>
                    <th class="p-3">Nama Lengkap</th>
                    <th class="p-3">Email</th>
                    <th class="p-3">Role Akses</th>
                    <th class="p-3">Instansi / Agensi</th>
                    <th class="p-3">Terakhir Login</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-800 text-slate-300">
                <?php foreach ($users as $u): ?>
                <tr class="hover:bg-slate-800/50">
                    <td class="p-3 font-mono font-bold text-amber-400"><?= Security::e($u['username']) ?></td>
                    <td class="p-3 font-medium text-white"><?= Security::e($u['full_name']) ?></td>
                    <td class="p-3 font-mono"><?= Security::e($u['email']) ?></td>
                    <td class="p-3">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                            <?= Security::e($u['role']) ?>
                        </span>
                    </td>
                    <td class="p-3 text-slate-400"><?= Security::e($u['agency_or_company']) ?></td>
                    <td class="p-3 font-mono text-slate-500"><?= $u['last_login_at'] ? date('d M Y H:i', strtotime($u['last_login_at'])) : '-' ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>
