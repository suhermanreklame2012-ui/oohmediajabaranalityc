export type UserRole = 
  | 'Super Admin' 
  | 'Operator Lapangan' 
  | 'Pengelola Titik Reklame' 
  | 'Auditor Bapenda & Pajak';

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  agencyOrCompany: string;
  phoneNumber?: string;
  avatarUrl?: string;
  passwordHash: string; // Stored password hash/text for auth
  securityPin: string;
  hasFullApprovalRights?: boolean;
  approvalStatus?: 'GRANTED_FULL_PRIVILEGES' | 'PENDING' | 'LIMITED';
  grantedPermissions?: string[];
  createdAt: string;
  lastLogin?: string;
}

export interface AuthSession {
  user: UserAccount;
  token: string;
  expiresAt: number;
  isLocked: boolean;
}
