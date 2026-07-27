import { apiRequest } from '@/api/client';
import type { AuthStatusResponse, LoginRequest, LoginResponse } from '@/types/auth';

const USE_MOCK_AUTH = process.env.EXPO_PUBLIC_USE_MOCK_AUTH === 'true';
const MOCK_USER_LOGIN_ID = '1111';
const MOCK_USER_PASSWORD = '1111';
const MOCK_ADMIN_LOGIN_ID = '9999';
const MOCK_ADMIN_PASSWORD = '9999';

type BackendLoginResponse = {
  accessToken: string;
  tokenType: 'Bearer' | string;
  expiresInMs: number;
};

type UserProfileResponse = {
  studentId: string;
  name: string;
};

type JwtPayload = {
  sub?: string;
  role?: string;
};

const FALLBACK_USER_NAMES: Record<string, string> = {
  '20231234': '홍길동',
  admin01: '관리자',
};

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.');

    if (!payload || typeof globalThis.atob !== 'function') {
      return null;
    }

    const paddedPayload = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(
      Math.ceil(payload.length / 4) * 4,
      '=',
    );

    return JSON.parse(globalThis.atob(paddedPayload)) as JwtPayload;
  } catch {
    return null;
  }
}

function getFallbackUserName(studentId: string) {
  return FALLBACK_USER_NAMES[studentId];
}

export function login(requestBody: LoginRequest) {
  if (USE_MOCK_AUTH) {
    if (
      requestBody.studentId === MOCK_ADMIN_LOGIN_ID &&
      requestBody.password === MOCK_ADMIN_PASSWORD
    ) {
      return Promise.resolve<LoginResponse>({
        accessToken: 'mock-admin-access-token',
        refreshToken: 'mock-admin-refresh-token',
        user: {
          id: 9999,
          studentId: requestBody.studentId,
          name: '관리자',
          role: 'ADMIN',
        },
      });
    }

    if (
      requestBody.studentId !== MOCK_USER_LOGIN_ID ||
      requestBody.password !== MOCK_USER_PASSWORD
    ) {
      throw new Error('입력하신 계정 정보가 일치하지 않습니다.');
    }

    return Promise.resolve<LoginResponse>({
      accessToken: 'mock-user-access-token',
      refreshToken: 'mock-user-refresh-token',
      user: {
        id: 1,
        studentId: requestBody.studentId,
        name: '김강남',
        role: 'USER',
      },
    });
  }

  return apiRequest<BackendLoginResponse>('/api/v1/login', {
    method: 'POST',
    body: JSON.stringify({
      studentId: requestBody.studentId,
      password: requestBody.password,
    }),
  }, '').then(async (loginResponse) => {
    const tokenPayload = decodeJwtPayload(loginResponse.accessToken);
    const tokenRole = tokenPayload?.role;

    try {
      const profile = await apiRequest<UserProfileResponse>(
        '/api/v1/users/me/profile',
        undefined,
        loginResponse.accessToken,
      );

      return {
        ...loginResponse,
        user: {
          id: 0,
          studentId: profile.studentId,
          name: profile.name,
          role: tokenRole ?? 'STUDENT',
        },
      };
    } catch {
      return {
        ...loginResponse,
        user: {
          id: 0,
          studentId: tokenPayload?.sub ?? requestBody.studentId,
          name: getFallbackUserName(tokenPayload?.sub ?? requestBody.studentId),
          role: tokenRole ?? 'USER',
        },
      };
    }
  });
}

export function getAuthStatus() {
  if (USE_MOCK_AUTH) {
    return Promise.resolve<AuthStatusResponse>({
      authenticated: true,
      user: {
        id: 1,
        studentId: MOCK_USER_LOGIN_ID,
        name: '김강남',
        role: 'USER',
      },
    });
  }

  return apiRequest<void>('/api/v1/status').then(() => ({
    authenticated: true,
  }));
}

export function logout() {
  if (USE_MOCK_AUTH) {
    return Promise.resolve();
  }

  return apiRequest<void>('/api/v1/logout', {
    method: 'POST',
  });
}
