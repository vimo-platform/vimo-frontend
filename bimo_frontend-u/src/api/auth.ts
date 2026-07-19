import { apiRequest } from '@/api/client';
import type { AuthStatusResponse, LoginRequest, LoginResponse } from '@/types/auth';

const USE_MOCK_AUTH = process.env.EXPO_PUBLIC_USE_MOCK_AUTH === 'true';
const MOCK_LOGIN_ID = '1111';
const MOCK_PASSWORD = '1111';

type BackendLoginResponse = {
  accessToken: string;
  tokenType: 'Bearer' | string;
  expiresInMs: number;
};

type UserProfileResponse = {
  studentId: string;
  name: string;
};

export function login(requestBody: LoginRequest) {
  if (USE_MOCK_AUTH) {
    if (requestBody.studentId !== MOCK_LOGIN_ID || requestBody.password !== MOCK_PASSWORD) {
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
  }).then(async (loginResponse) => {
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
          role: 'STUDENT',
        },
      };
    } catch {
      return {
        ...loginResponse,
        user: {
          id: 0,
          studentId: requestBody.studentId,
          role: 'ADMIN',
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
        studentId: MOCK_LOGIN_ID,
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
