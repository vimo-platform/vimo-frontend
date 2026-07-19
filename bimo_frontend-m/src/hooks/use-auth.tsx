import { createContext, useContext, type ReactNode } from "react";

import type { User } from "@/types";

const mockUser: User = {
  id: "u1",
  name: "김조교",
  email: "ta@test.ac.kr",
  department: "컴퓨터공학과 사무실",
};

const AuthContext = createContext<{ user: User }>({ user: mockUser });

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={{ user: mockUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
