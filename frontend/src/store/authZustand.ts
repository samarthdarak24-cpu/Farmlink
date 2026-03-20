import { create } from 'zustand';

export type UserRole = 'farmer' | 'buyer';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  location?: string;
  phone?: string;
  createdAt?: string;
};

export type AuthState = {
  hydrated: boolean;
  token: string | null;
  user: AuthUser | null;
  login: (payload: { token: string; user: AuthUser }) => void;
  logout: () => void;
  hydrateFromStorage: () => void;
};

const AUTH_TOKEN_KEY = 'token';
const AUTH_USER_KEY = 'authUser';

export const useAuthZustand = create<AuthState>((set, get) => ({
  hydrated: false,
  token: typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null,
  user: typeof window !== 'undefined' ? safeReadUser(AUTH_USER_KEY) : null,

  login: ({ token, user }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
    set({ token, user, hydrated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    }
    set({ token: null, user: null, hydrated: true });
  },

  hydrateFromStorage: () => {
    if (get().hydrated) return;
    if (typeof window === 'undefined') {
      set({ hydrated: true });
      return;
    }

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const user = safeReadUser(AUTH_USER_KEY);
    set({ token, user, hydrated: true });
  },
}));

function safeReadUser(key: string): AuthUser | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

