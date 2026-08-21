<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900 px-4">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 space-y-8">
      <div class="text-center space-y-2">
        <div class="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-lg shadow-indigo-600/30">
          ✨
        </div>
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">若星空间 · 管理中台</h2>
        <p class="text-sm text-slate-500">请输入管理员账号登录系统</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">用户名</label>
          <input
            v-model="form.username"
            type="text"
            required
            placeholder="admin"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
          />
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">登录密码</label>
          <input
            v-model="form.password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
        >
          {{ loading ? '正在登录中...' : '立即登录' }}
        </button>
      </form>

      <div class="text-center text-xs text-slate-400">
        默认测试超管账号：<code class="text-indigo-600 font-semibold font-mono">admin</code> / <code class="text-indigo-600 font-semibold font-mono">admin123456</code>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  username: '',
  password: '',
});

const loading = ref(false);

const handleLogin = async () => {
  try {
    loading.value = true;
    await authStore.login(form);
    router.push('/');
  } catch (err: any) {
    // 错误在 request 拦截器中统一 alert
  } finally {
    loading.value = false;
  }
};
</script>
