import type { AuthStatusResponse, LoginRequest, LoginResponse } from '@/types/auth';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
const USE_MOCK_AUTH =
  process.env.EXPO_PUBLIC_USE_MOCK_AUTH === 'true' || API_BASE_URL.length === 0;
const MOCK_LOGIN_ID = '1111';
const MOCK_PASSWORD = '1111';

async function request<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    credentials: 'include',
    ...init,
  });

  if (!response.ok) {
    throw new Error('요청 처리 중 문제가 발생했습니다.');
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export function login(requestBody: LoginRequest) {
  if (USE_MOCK_AUTH) {
    if (requestBody.loginId !== MOCK_LOGIN_ID || requestBody.password !== MOCK_PASSWORD) {
      throw new Error('임시 로그인 계정 정보가 일치하지 않습니다.');
    }

    return Promise.resolve<LoginResponse>({
      accessToken: 'mock-user-access-token',
      refreshToken: 'mock-user-refresh-token',
      user: {
        id: 1,
        loginId: requestBody.loginId,
        name: '비모 유저',
        role: 'USER',
      },
    });
  }

  return request<LoginResponse>('/api/v1/login', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
}

export function getAuthStatus() {
  if (USE_MOCK_AUTH) {
    return Promise.resolve<AuthStatusResponse>({
      authenticated: true,
      user: {
        id: 1,
        loginId: MOCK_LOGIN_ID,
        name: '비모 유저',
        role: 'USER',
      },
    });
  }

  return request<AuthStatusResponse>('/api/v1/status');
}

export function logout() {
  if (USE_MOCK_AUTH) {
    return Promise.resolve();
  }

  return request<void>('/api/v1/logout', {
    method: 'POST',
  });
}
