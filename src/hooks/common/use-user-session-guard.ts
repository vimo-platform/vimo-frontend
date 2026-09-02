import { router } from 'expo-router';
import { useEffect } from 'react';

import { isUserAuthenticatedInCurrentSession } from '@/services/common/auth-storage';

export function useUserSessionGuard() {
  useEffect(() => {
    if (!isUserAuthenticatedInCurrentSession()) {
      router.replace('/');
    }
  }, []);
}
