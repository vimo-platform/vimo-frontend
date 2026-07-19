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
