#!/usr/bin/env bash
# ======================================================================
#    JABAROOH ENTERPRISE - DASHBOARD PERFORMA REKLAME JAWA BARAT
#    Pengelola: Suherman Reklame (087822248975)
# ======================================================================

echo "======================================================================"
echo "   JABAROOH ENTERPRISE - LOCALHOST SERVER LAUNCHER"
echo "======================================================================"
echo ""

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js belum terpasang di komputer ini."
    echo "Silakan install Node.js versi 18+ dari https://nodejs.org/"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "Memasang dependensi proyek (npm install)..."
    npm install
fi

echo "Memulai server di http://localhost:3000 ..."
echo "Kredensial Login Super Admin:"
echo "Email: suherman.reklame2012@gmail.com"
echo "Sandi: AdminOOH@2026"
echo "PIN  : 889900"
echo ""
echo "Tekan CTRL+C untuk berhenti."
npm run dev
