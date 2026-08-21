<template>
  <div class="min-h-screen flex items-center justify-center bg-[#F7F3EA] px-4">
    <div class="max-w-md w-full bg-[#FDFAF3] rounded-2xl shadow-sm p-10 space-y-8 border border-[#E7E4D5]">
      <div class="text-center space-y-2">
        <div class="brand-name text-2xl font-semibold tracking-widest text-[#2B4420] flex items-center justify-center gap-2">
          <span class="text-xs text-[#5A5F52]">✦</span>若 星
        </div>
        <div class="text-xs text-[#6E6B5E] tracking-widest">团队工作台</div>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="a-field">
          <label>用户名</label>
          <input
            v-model="form.username"
            type="text"
            required
            placeholder="admin"
          />
        </div>

        <div class="a-field">
          <label>登录密码</label>
          <input
            v-model="form.password"
            type="password"
            required
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="btn w-full"
          style="height: 44px; border-radius: 22px; font-size: 14px;"
        >
          {{ loading ? '正在进入...' : '进入工作台' }}
        </button>
      </form>

      <div class="text-center text-xs text-[#6E6B5E]">
        测试账号：<code class="text-[#2B4420] font-semibold font-mono">admin</code> / <code class="text-[#2B4420] font-semibold font-mono">admin123456</code>
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
    // 错误处理
  } finally {
    loading.value = false;
  }
};
</script>
