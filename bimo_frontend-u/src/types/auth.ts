export type LoginRequest = {
  loginId: string;
  password: string;
};

export type AuthUser = {
  id: number;
  loginId: string;
  name?: string;
  role?: 'USER' | 'ADMIN' | string;
};

export type LoginResponse = {
  accessToken?: string;
  refreshToken?: string;
  user?: AuthUser;
};

export type AuthStatusResponse = {
  authenticated: boolean;
  user?: AuthUser;
};
