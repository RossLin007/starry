import { defineStore } from 'pinia';
import request from '../api/request.js';

export interface AdminUser {
  id: string;
  username: string;
  realName: string;
  avatarUrl?: string;
  role: 'SUPER_ADMIN' | 'OPERATOR';
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('starry_admin_token') || '',
    user: JSON.parse(localStorage.getItem('starry_admin_user') || 'null') as AdminUser | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isSuperAdmin: (state) => state.user?.role === 'SUPER_ADMIN',
  },
  actions: {
    async login(form: { username: string; password: string }) {
      const res: any = await request.post('/v1/admin/auth/login', form);
      this.token = res.token;
      this.user = res.admin;
      localStorage.setItem('starry_admin_token', res.token);
      localStorage.setItem('starry_admin_user', JSON.stringify(res.admin));
    },
    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('starry_admin_token');
      localStorage.removeItem('starry_admin_user');
      window.location.href = '/login';
    },
  },
});
