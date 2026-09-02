import { Platform } from 'react-native';

import type { AuthUser } from '@/types/common/auth';

const SAVED_STUDENT_ID_KEY = 'vimo.savedLoginId';
const USER_ONBOARDING_COMPLETED_KEY = 'vimo.userOnboardingCompleted';
const CURRENT_USER_KEY = 'vimo.currentUser';
const ACCESS_TOKEN_KEY = 'vimo.accessToken';

let nativeSavedStudentId: string | null = null;
let nativeUserOnboardingCompleted = false;
let userAuthenticatedInCurrentSession = false;
let nativeCurrentUser: AuthUser | null = null;
let nativeAccessToken: string | null = null;

function getWebStorage() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

export async function getSavedStudentId() {
  const storage = getWebStorage();

  if (storage) {
    return storage.getItem(SAVED_STUDENT_ID_KEY);
  }

  return nativeSavedStudentId;
}

export async function setSavedStudentId(studentId: string) {
  const storage = getWebStorage();

  if (storage) {
    storage.setItem(SAVED_STUDENT_ID_KEY, studentId);
    return;
  }

  nativeSavedStudentId = studentId;
}

export async function removeSavedStudentId() {
  const storage = getWebStorage();

  if (storage) {
    storage.removeItem(SAVED_STUDENT_ID_KEY);
    return;
  }

  nativeSavedStudentId = null;
}

export async function getUserOnboardingCompleted() {
  const storage = getWebStorage();

  if (storage) {
    return storage.getItem(USER_ONBOARDING_COMPLETED_KEY) === 'true';
  }

  return nativeUserOnboardingCompleted;
}

export async function setUserOnboardingCompleted() {
  const storage = getWebStorage();

  if (storage) {
    storage.setItem(USER_ONBOARDING_COMPLETED_KEY, 'true');
    return;
  }

  nativeUserOnboardingCompleted = true;
}

export function markUserAuthenticated() {
  userAuthenticatedInCurrentSession = true;
}

export function clearUserSession() {
  userAuthenticatedInCurrentSession = false;

  const storage = getWebStorage();

  if (storage) {
    storage.removeItem(CURRENT_USER_KEY);
    storage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }

  nativeCurrentUser = null;
  nativeAccessToken = null;
}

export function isUserAuthenticatedInCurrentSession() {
  const storage = getWebStorage();

  if (storage?.getItem(ACCESS_TOKEN_KEY)) {
    return true;
  }

  return userAuthenticatedInCurrentSession || nativeAccessToken !== null;
}

export async function setCurrentUser(user: AuthUser) {
  const storage = getWebStorage();

  if (storage) {
    storage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return;
  }

  nativeCurrentUser = user;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const storage = getWebStorage();

  if (storage) {
    const storedUser = storage.getItem(CURRENT_USER_KEY);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as AuthUser;
    } catch {
      storage.removeItem(CURRENT_USER_KEY);
      return null;
    }
  }

  return nativeCurrentUser;
}

export async function setAccessToken(accessToken: string) {
  const storage = getWebStorage();

  if (storage) {
    storage.setItem(ACCESS_TOKEN_KEY, accessToken);
    return;
  }

  nativeAccessToken = accessToken;
}

export async function getAccessToken() {
  const storage = getWebStorage();

  if (storage) {
    return storage.getItem(ACCESS_TOKEN_KEY);
  }

  return nativeAccessToken;
}

export async function removeAccessToken() {
  const storage = getWebStorage();

  if (storage) {
    storage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }

  nativeAccessToken = null;
}
