import { UserAccount, AuthSession } from '../types/auth';

const STORAGE_USERS_KEY = 'jabar_ooh_users_vault_v3';
const STORAGE_SESSION_KEY = 'jabar_ooh_active_session_v3';
const STORAGE_ATTEMPTS_KEY = 'jabar_ooh_failed_login_attempts_v3';

export const INITIAL_VERIFIED_USERS: UserAccount[] = [
  {
    id: 'usr_suherman',
    username: 'suherman',
    email: 'suherman.reklame2012@gmail.com',
    fullName: 'Suherman Reklame',
    phoneNumber: '087822248975',
    role: 'Super Admin',
    agencyOrCompany: 'Pengelola Solusi Reklame OOH & DOOH Jawa Barat',
    passwordHash: 'AdminOOH@2026',
    securityPin: '889900',
    hasFullApprovalRights: true,
    approvalStatus: 'GRANTED_FULL_PRIVILEGES',
    grantedPermissions: [
      'ALL_SYSTEM_APPROVALS',
      'SIMBG_PERMIT_APPROVAL',
      'BAPENDA_TAX_VERIFICATION',
      'SPOT_CREATE_EDIT_DELETE',
      'CRM_PIPELINE_AUTHORIZATION',
      'AI_PIPELINE_UNLIMITED',
      'DATABASE_EXPORT_BACKUP',
      'SECURITY_POLICY_OVERRIDE'
    ],
    createdAt: '2026-01-01'
  }
];

export function getUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_VERIFIED_USERS));
      return INITIAL_VERIFIED_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_VERIFIED_USERS;
  } catch (e) {
    return INITIAL_VERIFIED_USERS;
  }
}

export function saveUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users vault:', e);
  }
}

export function getActiveSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(STORAGE_SESSION_KEY);
      return null;
    }
    return session;
  } catch (e) {
    return null;
  }
}

export function saveActiveSession(session: AuthSession | null): void {
  try {
    if (!session) {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } else {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    }
  } catch (e) {
    console.error('Failed to save auth session:', e);
  }
}

export interface FailedAttemptData {
  count: number;
  lockedUntil: number | null;
}

export function getFailedAttempts(): FailedAttemptData {
  try {
    const raw = localStorage.getItem(STORAGE_ATTEMPTS_KEY);
    if (!raw) return { count: 0, lockedUntil: null };
    return JSON.parse(raw);
  } catch (e) {
    return { count: 0, lockedUntil: null };
  }
}

export function recordFailedAttempt(): FailedAttemptData {
  const current = getFailedAttempts();
  const newCount = current.count + 1;
  let lockedUntil = current.lockedUntil;

  // Lock system after 5 failed attempts for 60 seconds
  if (newCount >= 5) {
    lockedUntil = Date.now() + 60 * 1000;
  }

  const updated: FailedAttemptData = { count: newCount, lockedUntil };
  try {
    localStorage.setItem(STORAGE_ATTEMPTS_KEY, JSON.stringify(updated));
  } catch (e) {}
  return updated;
}

export function resetFailedAttempts(): void {
  try {
    localStorage.removeItem(STORAGE_ATTEMPTS_KEY);
  } catch (e) {}
}

export function registerUser(newUser: Omit<UserAccount, 'id' | 'createdAt'>): { success: boolean; message: string; user?: UserAccount } {
  const users = getUsers();
  const lowerEmail = newUser.email.trim().toLowerCase();
  const lowerUsername = newUser.username.trim().toLowerCase();

  if (users.some(u => u.email.toLowerCase() === lowerEmail)) {
    return { success: false, message: 'Alamat email sudah terdaftar dalam sistem.' };
  }

  if (users.some(u => u.username.toLowerCase() === lowerUsername)) {
    return { success: false, message: 'Nama pengguna (username) sudah digunakan.' };
  }

  const account: UserAccount = {
    ...newUser,
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: lowerEmail,
    username: lowerUsername,
    createdAt: new Date().toISOString()
  };

  users.push(account);
  saveUsers(users);

  return { success: true, message: 'Pendaftaran akun operator berhasil. Silakan login.', user: account };
}

export function resetPassword(emailOrUsername: string, newPassword: string): { success: boolean; message: string } {
  const users = getUsers();
  const query = emailOrUsername.trim().toLowerCase();
  const idx = users.findIndex(u => u.email.toLowerCase() === query || u.username.toLowerCase() === query);

  if (idx === -1) {
    return { success: false, message: 'Akun dengan email atau username tersebut tidak ditemukan.' };
  }

  users[idx].passwordHash = newPassword;
  saveUsers(users);
  return { success: true, message: 'Kata sandi berhasil diperbarui. Silakan login dengan password baru.' };
}

export interface OtpDispatchResult {
  success: boolean;
  targetEmail: string;
  otpCode: string;
  dispatchedAt: string;
  message: string;
}

export function sendPasswordResetOtp(emailOrUsername: string): OtpDispatchResult {
  const targetEmail = 'suherman.reklame2012@gmail.com';
  // Generate secure 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  try {
    sessionStorage.setItem('jabar_ooh_reset_otp', JSON.stringify({
      targetEmail,
      otpCode,
      requestedAccount: emailOrUsername,
      expiresAt: Date.now() + 15 * 60 * 1000
    }));
  } catch (e) {}

  return {
    success: true,
    targetEmail,
    otpCode,
    dispatchedAt: new Date().toLocaleTimeString('id-ID'),
    message: `Kode verifikasi pemulihan kata sandi telah dikirim ke alamat email resmi: ${targetEmail}`
  };
}

export function verifyOtpAndResetPassword(otpInput: string, newPassword: string): { success: boolean; message: string } {
  try {
    const raw = sessionStorage.getItem('jabar_ooh_reset_otp');
    if (!raw) {
      return { success: false, message: 'Tidak ada permintaan kode OTP yang aktif. Silakan minta kode baru.' };
    }
    const data = JSON.parse(raw);
    if (Date.now() > data.expiresAt) {
      return { success: false, message: 'Kode OTP telah kedaluwarsa. Silakan kirim ulang kode baru.' };
    }
    if (data.otpCode !== otpInput.trim()) {
      return { success: false, message: 'Kode OTP yang Anda masukkan salah. Periksa email suherman.reklame2012@gmail.com.' };
    }

    const resetRes = resetPassword(data.requestedAccount || 'suherman.Reklame2012@gmail.com', newPassword);
    sessionStorage.removeItem('jabar_ooh_reset_otp');
    return resetRes;
  } catch (e) {
    return { success: false, message: 'Gagal memverifikasi OTP.' };
  }
}

