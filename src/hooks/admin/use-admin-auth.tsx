 import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import type { User } from '@/types/admin';
import { getCurrentUser } from '@/services/common/auth-storage';

const fallbackUser: User = {
  id: 'admin',
  name: '관리자',
  email: '',
  organization: null,
};

const AuthContext = createContext<{ user: User }>({ user: fallbackUser });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(fallbackUser);

  useEffect(() => {
    let mounted = true;

    getCurrentUser().then((currentUser) => {
      if (!mounted || !currentUser) {
        return;
      }

      setUser({
        id: String(currentUser.id),
        name: currentUser.name?.trim() || currentUser.studentId || '관리자',
        email: currentUser.email ?? '',
        organization: currentUser.organization ?? null,
      });
    });

    return () => {
      mounted = false;
    };
  }, []);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
