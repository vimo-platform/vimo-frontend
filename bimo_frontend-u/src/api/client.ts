import { getAccessToken, removeAccessToken } from '@/storage/auth-storage';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  'http://localhost:8080';

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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(storedAccessToken ? { Authorization: `Bearer ${storedAccessToken}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      await removeAccessToken();
    }

    throw new Error(await readErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}
