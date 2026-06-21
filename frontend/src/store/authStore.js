import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        // Optional: clear cache or redirect
      },
      updateUser: (user) => set((state) => ({ user: state.user ? { ...state.user, ...user } : null })),
    }),
    {
      name: 'property-platform-auth', // unique key in localStorage
    }
  )
);
