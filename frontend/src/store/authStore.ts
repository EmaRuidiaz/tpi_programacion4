import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoginCredentials, UserPublic } from '../features/auth/types';
import { axiosInstance } from '../shared/api/axiosInstance';

interface AuthState {
  usuario: UserPublic | null;
  cargando: boolean;
  login: (credentials: LoginCredentials) => Promise<UserPublic>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (credentials: LoginCredentials) => {
        const formData = new URLSearchParams();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        await axiosInstance.post('/auth/token', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const { data } = await axiosInstance.get<UserPublic>('/auth/me');
        set({ usuario: data, cargando: false });
        return data;
      },

      logout: async () => {
        try {
          await axiosInstance.post('/auth/logout');
        } finally {
          set({ usuario: null, cargando: false });
        }
      },

      checkSession: async () => {
        set({ cargando: true });
        try {
          const { data } = await axiosInstance.get<UserPublic>('/auth/me');
          set({ usuario: data, cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },

      clearSession: () => {
        set({ usuario: null, cargando: false });
      },
    }),
    {
      name: 'foodstore-auth',
      partialize: (state) => ({ usuario: state.usuario }),
    }
  )
);
