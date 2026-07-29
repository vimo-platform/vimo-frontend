import { getAccessToken, removeAccessToken } from '@/storage/auth-storage';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  'https://api2.hwangs.site';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function isAuthError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

export async function readErrorMessage(response: Response) {
  const message = await response.text();

  if (message.trim().length > 0) {
    return message;
  }

  return '요청 처리 중 문제가 발생했습니다.';
}

export async function apiRequest<TResponse>(
  path: string,
  init?: RequestInit,
  accessToken?: string,
): Promise<TResponse> {
  const storedAccessToken = accessToken ?? (await getAccessToken());
  const isFormDataBody =
    typeof FormData !== 'undefined' && init?.body instanceof FormData;
  const headers = {
    ...(isFormDataBody ? {} : { 'Content-Type': 'application/json' }),
    ...(storedAccessToken ? { Authorization: `Bearer ${storedAccessToken}` } : {}),
    ...init?.headers,
  };
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      await removeAccessToken();
    }

    throw new ApiError(response.status, await readErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const text = await response.text();

  if (text.trim().length === 0) {
    return undefined as TResponse;
  }

  return JSON.parse(text) as TResponse;
}
