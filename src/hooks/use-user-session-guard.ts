import { router } from 'expo-router';
import { useEffect } from 'react';

import { isUserAuthenticatedInCurrentSession } from '@/storage/auth-storage';

export function useUserSessionGuard() {
  useEffect(() => {
    if (!isUserAuthenticatedInCurrentSession()) {
      router.replace('/');
    }
  }, []);
}
