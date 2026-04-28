// src/stores/useAuthStore.js
import { create } from 'zustand';
import storage from '../lib/storage';
import { authService } from '../services/auth.service';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  // Called on app start to restore session
  init: async () => {
    const token = await storage.get('token');
    const user = await storage.get('user');
    if (token && user) {
      set({ token, user, isAuthenticated: true, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  setAuth: (user, token) => {
    set({ user, token, isAuthenticated: true });
  },

  updateUser: (data) => {
    const updated = { ...get().user, ...data };
    set({ user: updated });
    storage.set('user', updated);
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

// Export a way to logout from non-component files
export const forceLogout = () => {
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  storage.delete('token');
  storage.delete('user');
};