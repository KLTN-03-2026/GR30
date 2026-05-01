import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Profile sub-object trả về từ BE sau khi login
 */
export interface UserProfile {
  id: number;
  name: string;
  phone: string | null;
  gender: string | null;
  image: string | null;
}

/**
 * User interface - khớp với response login thật từ BE
 */
export interface AuthUser {
  id: string;
  email: string;
  status: string;
  roles: string[];
  role: string;
  profile: UserProfile | null;
  vehicles?: unknown[];
}

/**
 * Auth Store State
 */
interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Auth Store Actions
 */
interface AuthActions {
  login: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<AuthUser>) => void;
}

/**
 * Auth Store - Manages authentication state
 * Persisted to localStorage for session persistence
 */
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: "auth-storage", // Key in localStorage
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
