<div class="max-w-2xl mx-auto px-4 py-8">
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <h1 class="text-lg font-black text-white mb-4">Tambah Titik Reklame Baru</h1>
        <form method="POST" action="/admin/spots/store" class="space-y-4 text-xs">
            <?= Security::csrfField() ?>
            <div>
                <label class="block text-slate-400 mb-1 font-semibold">Kode Titik Reklame (Misal: JBR-BDG-099) *</label>
                <input type="text" name="code" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
            </div>
            <div>
                <label class="block text-slate-400 mb-1 font-semibold">Nama Titik *</label>
                <input type="text" name="name" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-slate-400 mb-1 font-semibold">Wilayah Kota/Kab *</label>
                    <input type="text" name="regency" required value="Kota Bandung" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
                </div>
                <div>
                    <label class="block text-slate-400 mb-1 font-semibold">Tipe Media *</label>
                    <select name="media_type" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
                        <option value="LED Videotron">LED Videotron</option>
                        <option value="Billboard Statis">Billboard Statis</option>
                        <option value="Megatron">Megatron</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="block text-slate-400 mb-1 font-semibold">Alamat Lengkap *</label>
                <textarea name="address" required rows="2" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-slate-400 mb-1 font-semibold">Lebar (meter)</label>
                    <input type="number" name="width_m" value="12" step="0.1" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
                </div>
                <div>
                    <label class="block text-slate-400 mb-1 font-semibold">Tinggi (meter)</label>
                    <input type="number" name="height_m" value="6" step="0.1" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-slate-400 mb-1 font-semibold">Daily Reach (DGR)</label>
                    <input type="number" name="daily_gross_reach" value="60000" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
                </div>
                <div>
                    <label class="block text-slate-400 mb-1 font-semibold">Rate Sewa / Bulan (IDR)</label>
                    <input type="number" name="rate_per_month_idr" value="45000000" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
                </div>
            </div>
            <button type="submit" class="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl transition-colors">
                Simpan Titik Reklame
            </button>
        </form>
    </div>
</div>
