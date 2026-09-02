export type LoginRequest = {
  studentId: string;
  password: string;
};

export type AuthUser = {
  id: number;
  studentId: string;
  email?: string;
  name?: string;
  role?: 'USER' | 'STUDENT' | 'ADMIN' | string;
  // 관리자 소속. /api/v1/admin/profile 의 organization. 미지정 계정은 null.
  organization?: string | null;
};

export type LoginResponse = {
  accessToken: string;
  tokenType?: 'Bearer' | string;
  expiresInMs?: number;
  refreshToken?: string;
  user?: AuthUser;
};

export type AuthStatusResponse = {
  authenticated: boolean;
  user?: AuthUser;
};
