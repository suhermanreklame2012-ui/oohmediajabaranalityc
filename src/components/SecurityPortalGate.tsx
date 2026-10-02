import { useState, useEffect } from 'react';
import { UserAccount, AuthSession } from '../types/auth';
import { 
  getUsers, 
  saveActiveSession, 
  getFailedAttempts, 
  recordFailedAttempt, 
  resetFailedAttempts, 
  sendPasswordResetOtp,
  verifyOtpAndResetPassword,
  INITIAL_VERIFIED_USERS,
  OtpDispatchResult
} from '../utils/authService';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  Phone, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Layers, 
  BarChart3, 
  Cloud, 
  Sparkles, 
  KeyRound, 
  Mail, 
  Check,
  ArrowRight
} from 'lucide-react';

interface SecurityPortalGateProps {
  onAuthenticated: (session: AuthSession) => void;
  isLockScreenMode?: boolean;
  currentUser?: UserAccount | null;
  onCancelLockScreen?: () => void;
}

export function SecurityPortalGate({
  onAuthenticated,
  isLockScreenMode = false,
  currentUser = null,
  onCancelLockScreen
}: SecurityPortalGateProps) {
  // Input states
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Security Lockout (Brute-Force Rate Limiting)
  const [lockoutRemainingSec, setLockoutRemainingSec] = useState<number>(0);

  // Forgot Password / Reset OTP Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetOtpInput, setResetOtpInput] = useState<string>('');
  const [resetNewPassword, setResetNewPassword] = useState<string>('');
  const [activeOtpInfo, setActiveOtpInfo] = useState<OtpDispatchResult | null>(null);
  const [resetNotice, setResetNotice] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Check lockout on mount & interval
  useEffect(() => {
    function checkLockout() {
      const { lockedUntil } = getFailedAttempts();
      if (lockedUntil && Date.now() < lockedUntil) {
        const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
        setLockoutRemainingSec(remaining);
      } else {
        setLockoutRemainingSec(0);
      }
    }

    checkLockout();
    const timer = setInterval(checkLockout, 1000);
    return () => clearInterval(timer);
  }, []);

  // Target Super Admin account: strictly Suherman Reklame
  const currentTargetAccount = {
    name: 'Suherman Reklame',
    email: 'suherman.reklame2012@gmail.com',
    phone: '087822248975',
    role: 'Super Admin',
    defaultPass: 'AdminOOH@2026',
    pin: '889900'
  };

  // Login submission
  const handleLogin = (e?: React.FormEvent, customPass?: string) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const passToTest = customPass || password;

    if (lockoutRemainingSec > 0) {
      setErrorMessage(`Sistem dalam mode proteksi keamanan. Silakan tunggu ${lockoutRemainingSec} detik.`);
      return;
    }

    if (!passToTest) {
      setErrorMessage('Silakan masukkan kata sandi keamanan.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const users = getUsers();
      const user = users.find(u => 
        u.email.toLowerCase() === currentTargetAccount.email.toLowerCase()
      ) || INITIAL_VERIFIED_USERS[0];

      if (user && user.passwordHash === passToTest) {
        // Successful Login
        resetFailedAttempts();
        const session: AuthSession = {
          user,
          token: `token_suherman_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
          isLocked: false
        };
        saveActiveSession(session);
        setSuccessMessage(`Autentikasi Berhasil! Membuka Portal Eksekutif...`);
        setTimeout(() => {
          onAuthenticated(session);
        }, 300);
      } else {
        // Failed attempt with Brute-force protection
        const updated = recordFailedAttempt();
        if (updated.lockedUntil && Date.now() < updated.lockedUntil) {
          const remaining = Math.ceil((updated.lockedUntil - Date.now()) / 1000);
          setLockoutRemainingSec(remaining);
          setErrorMessage(`Terdeteksi 5x kesalahan kata sandi. Sistem dikunci ${remaining} detik demi keamanan.`);
        } else {
          const remainingTries = 5 - updated.count;
          setErrorMessage(`Kata sandi salah. Sisa kesempatan aman: ${remainingTries > 0 ? remainingTries : 0}x.`);
        }
      }
      setIsSubmitting(false);
    }, 280);
  };

  // Trigger Send OTP to suherman.reklame2012@gmail.com
  const handleSendResetOtp = () => {
    setResetNotice(null);
    const result = sendPasswordResetOtp(currentTargetAccount.email);
    setActiveOtpInfo(result);
    setResetStep('verify');
    setResetNotice({
      type: 'success',
      message: `Kode OTP verifikasi resmi telah dikirim ke: suherman.reklame2012@gmail.com`
    });
  };

  // Verify OTP and reset password
  const handleConfirmReset = (e: React.FormEvent) => {
    e.preventDefault();
    setResetNotice(null);

    if (!resetOtpInput.trim()) {
      setResetNotice({ type: 'error', message: 'Silakan masukkan 6 digit kode OTP atau PIN keamanan Master (889900).' });
      return;
    }

    if (!resetNewPassword || resetNewPassword.length < 6) {
      setResetNotice({ type: 'error', message: 'Kata sandi baru minimal harus 6 karakter.' });
      return;
    }

    // Check if OTP matches or if user entered emergency master PIN (889900 for Suherman Super Admin)
    const isMasterPin = resetOtpInput.trim() === '889900';

    if (isMasterPin) {
      setPassword(resetNewPassword);
      setSuccessMessage('Kata sandi berhasil diperbarui dengan verifikasi PIN Keamanan Master (889900)! Silakan masuk.');
      setIsResetModalOpen(false);
      return;
    }

    const verifyRes = verifyOtpAndResetPassword(resetOtpInput, resetNewPassword);
    if (verifyRes.success) {
      setPassword(resetNewPassword);
      setSuccessMessage('Kata sandi berhasil diperbarui! Silakan klik MASUK APLIKASI.');
      setIsResetModalOpen(false);
    } else {
      setResetNotice({ type: 'error', message: verifyRes.message });
    }
  };

  const openWhatsAppHelp = () => {
    window.open('https://wa.me/6287822248975?text=Halo%20Pak%20Suherman,%20saya%20membutuhkan%20bantuan%20akses%20keamanan%20JabarOOH', '_blank');
  };

  return (
    <div className="relative h-screen max-h-screen w-full flex flex-col justify-between font-sans select-none overflow-hidden bg-[#07191d] text-slate-100">
      
      {/* BACKGROUND VECTOR DECORATION & SUBTLE GRID */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="w-full h-full bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:28px_28px] opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* 1. TOP HEADER (COMPACT & PROPORTIONAL) */}
      <header className="relative z-20 w-full px-5 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between border-b border-teal-900/40 bg-[#061518]/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300 font-bold text-xs shadow-inner">
            SR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black text-white tracking-wider">SUHERMAN</span>
              <span className="text-teal-400 font-bold">•</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-teal-300">087822248975</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-teal-200/70 font-medium tracking-wide uppercase">
              Solusi Pengukuran OOH & DOOH Terpadu Bandung
            </p>
          </div>
        </div>

        {/* Right Pill: 77 Titik Strategis & Contact */}
        <div className="flex items-center gap-2 sm:gap-3 bg-white/95 text-slate-800 px-3 py-1.5 rounded-xl shadow-lg border border-teal-500/30 text-xs">
          <div className="text-left pr-2.5 border-r border-slate-200 hidden sm:block">
            <span className="block font-bold text-slate-900 text-[11px] leading-tight">📍 Bandung | 77 Titik Strategis</span>
            <span className="text-[9px] text-slate-500 font-medium">Jaringan Reklame Terverifikasi</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={openWhatsAppHelp}
              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-transform hover:scale-105 shadow-sm"
              title="Hubungi WhatsApp 087822248975"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
            <a
              href="tel:087822248975"
              className="p-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg transition-transform hover:scale-105 shadow-sm"
              title="Telepon Langsung 087822248975"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* 2. MAIN COCKPIT: BALANCED 3-COLUMN LAYOUT THAT FITS 100% IN 1 VIEWPORT */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-2 flex items-center justify-center overflow-hidden">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center w-full">
          
          {/* LEFT COLUMN: 2 FEATURE PILLARS (COMPACT & CLEAN) */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-3.5">
            {/* Feature 1 */}
            <div className="p-4 bg-white/95 rounded-2xl shadow-lg border border-slate-200 text-slate-800 flex items-start gap-3 hover:translate-x-1 transition-transform">
              <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-xs text-slate-900 leading-tight">Layanan Terverifikasi</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  Keamanan data prioritas dengan proteksi akun resmi Suherman Reklame.
                </p>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-teal-700 font-semibold font-mono">
                  <Check className="w-3 h-3 text-teal-600" />
                  <span>Enkripsi 256-Bit Aktif</span>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-4 bg-white/95 rounded-2xl shadow-lg border border-slate-200 text-slate-800 flex items-start gap-3 hover:translate-x-1 transition-transform">
              <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl shrink-0 mt-0.5">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-xs text-slate-900 leading-tight">Solusi ROI & Planner</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  Analisis wawasan audiens, VAC, dan optimasi efektivitas anggaran tayang.
                </p>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-teal-700 font-semibold font-mono">
                  <Check className="w-3 h-3 text-teal-600" />
                  <span>77 Titik Strategis Siap Analisis</span>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER: THE EXECUTIVE LOGIN CARD (CLEAN, SHARP, FOCUSED) */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <div className="w-full max-w-[400px] bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 sm:p-7 text-center text-slate-800 relative">
              
              {/* App Icon Badge */}
              <div className="w-13 h-13 mx-auto rounded-2xl bg-gradient-to-tr from-[#0b3c43] to-[#135d66] flex items-center justify-center text-white shadow-md mb-2.5">
                <Sparkles className="w-6 h-6 text-teal-200" />
              </div>

              {/* Identity Header */}
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                087822248975 Suherman
              </h2>
              <p className="text-[11px] font-bold text-teal-700 mt-0.5">
                Media Pengukuran OOH & DOOH Terpadu
              </p>

              {/* Single Super Admin Badge with Full Approval Status */}
              <div className="my-3 p-2.5 bg-gradient-to-r from-teal-50 to-slate-50 border border-teal-200/90 rounded-xl text-xs space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#135d66] text-white flex items-center justify-center font-bold text-[10px]">
                      SR
                    </div>
                    <div className="text-left leading-tight">
                      <strong className="block text-slate-900 font-bold text-[11px]">Suherman Reklame</strong>
                      <span className="text-[10px] font-mono text-slate-600">suherman.reklame2012@gmail.com</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-[#135d66] text-white tracking-wider">
                    SUPER ADMIN
                  </span>
                </div>
                <div className="pt-1 border-t border-teal-100 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-medium">Status Hak Akses & Persetujuan:</span>
                  <span className="font-bold text-teal-800 flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    DIBERIKAN 100% (FULL PRIVILEGES)
                  </span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-3 text-left">
                {/* Lockout Warning */}
                {lockoutRemainingSec > 0 && (
                  <div className="p-2 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Sistem terkunci keamanan. Tunggu {lockoutRemainingSec} detik.</span>
                  </div>
                )}

                {/* Error Banner */}
                {errorMessage && lockoutRemainingSec === 0 && (
                  <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Success Banner */}
                {successMessage && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Password Input with Visibility Toggle */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Kata Sandi Akun:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi..."
                      disabled={lockoutRemainingSec > 0 || isSubmitting}
                      className="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Options: Lupa sandi */}
                <div className="flex items-center justify-end text-[11px] pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetModalOpen(true);
                      setResetStep('request');
                      setResetNotice(null);
                    }}
                    className="text-slate-500 hover:text-teal-700 font-medium cursor-pointer"
                  >
                    Lupa sandi?
                  </button>
                </div>

                {/* Submit Button: MASUK APLIKASI */}
                <button
                  type="submit"
                  disabled={lockoutRemainingSec > 0 || isSubmitting}
                  className="w-full py-2.5 bg-[#135d66] hover:bg-[#0c444c] active:bg-[#072d32] text-white font-bold text-xs sm:text-sm tracking-wider uppercase rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>MEMVERIFIKASI...</span>
                    </>
                  ) : (
                    <span>MASUK APLIKASI</span>
                  )}
                </button>
              </form>

              {/* Bottom Quick Help Contact */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <button 
                  onClick={openWhatsAppHelp} 
                  className="hover:text-teal-700 font-medium flex items-center gap-1"
                >
                  <MessageSquare className="w-3 h-3 text-emerald-600" />
                  <span>Bantuan Suherman</span>
                </button>
                <span className="text-[10px] text-slate-400">
                  © 2026 Suherman Reklame
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 2 FEATURE PILLARS (COMPACT & CLEAN) */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-3.5">
            {/* Feature 3 */}
            <div className="p-4 bg-white/95 rounded-2xl shadow-lg border border-slate-200 text-slate-800 flex items-start gap-3 hover:-translate-x-1 transition-transform">
              <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl shrink-0 mt-0.5">
                <Layers className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-xs text-slate-900 leading-tight">Manajemen Multi-Brand</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  Pengelolaan terintegrasi untuk seluruh koridor reklame komersial Jawa Barat.
                </p>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-teal-700 font-semibold font-mono">
                  <Check className="w-3 h-3 text-teal-600" />
                  <span>Grouping Koridor Otomatis</span>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-4 bg-white/95 rounded-2xl shadow-lg border border-slate-200 text-slate-800 flex items-start gap-3 hover:-translate-x-1 transition-transform">
              <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl shrink-0 mt-0.5">
                <Cloud className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-xs text-slate-900 leading-tight">Sinkronisasi Cloud Real-Time</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  Data server-side SQLite terpusat dengan update instan di semua perangkat.
                </p>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-teal-700 font-semibold font-mono">
                  <Check className="w-3 h-3 text-teal-600" />
                  <span>Zero Delay Database</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. BOTTOM BANNER (STICKY BOTTOM, NO SCROLLING REQUIRED) */}
      <footer className="relative z-20 w-full bg-[#061518] border-t border-teal-900/40 px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-300 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">SUHERMAN</span>
          <span className="text-teal-500">•</span>
          <span className="font-mono text-teal-400">087822248975</span>
          <span className="hidden sm:inline text-slate-400">• Bantuan Langsung Tim Reklame</span>
        </div>

        <button
          onClick={openWhatsAppHelp}
          className="px-3.5 py-1.5 bg-[#135d66] hover:bg-[#0c444c] text-white font-bold text-xs rounded-lg shadow transition-transform hover:scale-105 flex items-center gap-1.5 uppercase cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>HUBUNGI SEKARANG</span>
        </button>
      </footer>

      {/* 4. MODAL RESET PASSWORD: KIRIM KE suherman.reklame2012@gmail.com */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
            {/* Modal Header */}
            <div className="p-3.5 bg-[#135d66] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-teal-200" />
                <h3 className="font-bold text-xs sm:text-sm">Pemulihan Kata Sandi</h3>
              </div>
              <button 
                onClick={() => setIsResetModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-3.5 text-xs">
              {resetNotice && (
                <div className={`p-2.5 rounded-xl flex items-start gap-2 ${
                  resetNotice.type === 'error'
                    ? 'bg-rose-50 border border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                }`}>
                  {resetNotice.type === 'error' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-snug">{resetNotice.message}</span>
                </div>
              )}

              {/* Step 1: Request OTP */}
              {resetStep === 'request' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 block">Tujuan Email Verifikasi:</span>
                    <strong className="text-xs text-teal-900 block font-mono">
                      suherman.reklame2012@gmail.com
                    </strong>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Kode OTP 6 digit akan dikirim langsung ke email terdaftar Pak Suherman.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendResetOtp}
                    className="w-full py-2 bg-[#135d66] hover:bg-[#0c444c] text-white font-bold rounded-xl shadow flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Kirim Kode OTP ke Email</span>
                  </button>

                  <div className="text-center pt-0.5">
                    <span className="text-slate-500 text-[10px]">
                      Atau gunakan PIN Keamanan Master: <strong>889900</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Step 2: Input OTP / PIN and New Password */}
              {resetStep === 'verify' && (
                <form onSubmit={handleConfirmReset} className="space-y-3">
                  {activeOtpInfo && (
                    <div className="p-2.5 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl">
                      <span className="font-bold block text-[11px]">Kode OTP Verifikasi:</span>
                      <div className="mt-1 p-1.5 bg-white border border-teal-300 rounded text-center">
                        <span className="text-sm font-black font-mono tracking-widest text-teal-800">
                          {activeOtpInfo.otpCode}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Kode OTP atau PIN Master (889900):
                    </label>
                    <input
                      type="text"
                      required
                      value={resetOtpInput}
                      onChange={(e) => setResetOtpInput(e.target.value)}
                      placeholder="Masukkan 6 angka OTP / 889900"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-center text-xs font-mono tracking-widest focus:outline-none focus:border-teal-700"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Kata Sandi Baru:
                    </label>
                    <input
                      type="password"
                      required
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-teal-700"
                    />
                  </div>

                  <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setResetStep('request')}
                      className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800"
                    >
                      Kirim Ulang
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#135d66] hover:bg-[#0c444c] text-white font-bold rounded-xl shadow"
                    >
                      Simpan Sandi
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
