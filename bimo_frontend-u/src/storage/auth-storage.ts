import { Platform } from 'react-native';

import type { AuthUser } from '@/types/auth';

const SAVED_LOGIN_ID_KEY = 'vimo.savedLoginId';
const USER_ONBOARDING_COMPLETED_KEY = 'vimo.userOnboardingCompleted';
const CURRENT_USER_KEY = 'vimo.currentUser';

let nativeSavedLoginId: string | null = null;
let nativeUserOnboardingCompleted = false;
let userAuthenticatedInCurrentSession = false;
let nativeCurrentUser: AuthUser | null = null;

function getWebStorage() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

export async function getSavedLoginId() {
  const storage = getWebStorage();

  if (storage) {
    return storage.getItem(SAVED_LOGIN_ID_KEY);
  }

  return nativeSavedLoginId;
}

export async function setSavedLoginId(loginId: string) {
  const storage = getWebStorage();

  if (storage) {
    storage.setItem(SAVED_LOGIN_ID_KEY, loginId);
    return;
  }

  nativeSavedLoginId = loginId;
}

export async function removeSavedLoginId() {
  const storage = getWebStorage();

  if (storage) {
    storage.removeItem(SAVED_LOGIN_ID_KEY);
    return;
  }

  nativeSavedLoginId = null;
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

export function isUserAuthenticatedInCurrentSession() {
  return userAuthenticatedInCurrentSession;
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
