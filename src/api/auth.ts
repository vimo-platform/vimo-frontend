import { apiRequest } from '@/api/client';
import type { AuthStatusResponse, LoginRequest, LoginResponse } from '@/types/auth';

type BackendLoginResponse = {
  accessToken: string;
  tokenType: 'Bearer' | string;
  expiresInMs: number;
};

type UserProfileResponse = {
  studentId: string;
  name: string;
};

// 관리자 전용 프로필. 소속(organization)은 여기에만 내려온다. (ADMIN 토큰 필요)
type AdminProfileResponse = {
  adminId: string;
  name: string;
  organization: string | null;
};

type JwtPayload = {
  sub?: string;
  role?: string;
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

export function login(requestBody: LoginRequest): Promise<LoginResponse> {
  return apiRequest<BackendLoginResponse>(
    '/api/v1/login',
    {
      method: 'POST',
      body: JSON.stringify({
        studentId: requestBody.studentId,
        password: requestBody.password,
      }),
    },
    '',
  ).then(async (loginResponse) => {
    const tokenPayload = decodeJwtPayload(loginResponse.accessToken);
    const tokenRole = tokenPayload?.role;

    // 관리자 소속은 학생용 프로필이 아니라 /api/v1/admin/profile 에만 있다.
    if (tokenRole === 'ADMIN') {
      try {
        const adminProfile = await apiRequest<AdminProfileResponse>(
          '/api/v1/admin/profile',
          undefined,
          loginResponse.accessToken,
        );

        return {
          ...loginResponse,
          user: {
            id: 0,
            studentId: adminProfile.adminId,
            name: adminProfile.name,
            role: 'ADMIN',
            organization: adminProfile.organization,
          },
        };
      } catch {
        const adminId = tokenPayload?.sub ?? requestBody.studentId;

        return {
          ...loginResponse,
          user: {
            id: 0,
            studentId: adminId,
            name: adminId,
            role: 'ADMIN',
            organization: null,
          },
        };
      }
    }

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
      const studentId = tokenPayload?.sub ?? requestBody.studentId;

      return {
        ...loginResponse,
        user: {
          id: 0,
          studentId,
          name: studentId,
          role: tokenRole ?? 'USER',
        },
      };
    }
  });
}

export function getAuthStatus(): Promise<AuthStatusResponse> {
  return apiRequest<void>('/api/v1/status').then(() => ({
    authenticated: true,
  }));
}

export function logout() {
  return apiRequest<void>('/api/v1/logout', {
    method: 'POST',
  });
}
