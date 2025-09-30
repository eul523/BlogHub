import { create } from 'zustand';
import api from '../api/api';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
      return response.data;
    } catch (err) {
      set({ error: err.response?.data?.msg || 'Login failed', isLoading: false });
      throw err;
    }
  },
  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { name, email, password });
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
      return response.data;
    } catch (err) {
      console.log(err)
      set({ error: err.response?.data?.msg || 'Registration failed', isLoading: false });
      throw err;
    }
  },
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/logout');
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.msg || 'Logout failed', isLoading: false });
      throw err;
    }
  },
  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      console.log("checkout",err)
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

export default useAuthStore;