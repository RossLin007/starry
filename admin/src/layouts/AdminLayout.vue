<template>
  <div class="min-h-screen flex bg-slate-50">
    <!-- 侧边栏导航 -->
    <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0">
      <!-- 品牌 Logo -->
      <div class="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20">
          ✨
        </div>
        <div>
          <div class="font-semibold text-white tracking-wide text-sm">若星空间</div>
          <div class="text-xs text-slate-400">团队管理中台</div>
        </div>
      </div>

      <!-- 菜单列表 -->
      <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">业务管理</div>

        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :class="isActive(item.path) ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'"
        >
          <span class="text-base">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- 底部管理员信息与退出 -->
      <div class="p-4 border-t border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium text-sm">
            {{ userInitial }}
          </div>
          <div>
            <div class="text-sm font-medium text-white">{{ authStore.user?.realName || authStore.user?.username || '管理员' }}</div>
            <div class="text-xs text-indigo-400 font-mono">{{ authStore.user?.role === 'SUPER_ADMIN' ? '超级管理员' : '运营人员' }}</div>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="text-slate-400 hover:text-rose-400 text-xs px-2 py-1 rounded transition-colors"
          title="退出登录"
        >
          退出
        </button>
      </div>
    </aside>

    <!-- 右侧主体内容区 -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- 顶部状态栏 -->
      <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
        <div class="flex items-center gap-4">
          <h1 class="text-lg font-semibold text-slate-800">{{ currentTitle }}</h1>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium border border-emerald-200/50">
            服务正常
          </span>
        </div>
        <div class="flex items-center gap-4 text-sm text-slate-500">
          <span>{{ todayFormatted }}</span>
        </div>
      </header>

      <!-- 页面视图出口 -->
      <main class="flex-1 overflow-y-auto p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const menuItems = [
  { path: '/', label: '工作台看板', icon: '📊' },
  { path: '/courses', label: '课程管理', icon: '📚' },
  { path: '/activities', label: '活动管理', icon: '🎈' },
  { path: '/checkins', label: '打卡审核', icon: '📝' },
  { path: '/publish', label: '内容发布', icon: '✍️' },
  { path: '/stories', label: '学员故事', icon: '📖' },
  { path: '/students', label: '学员档案', icon: '👥' },
  { path: '/members', label: '会员管理', icon: '👑' },
  { path: '/goods', label: '商品好物', icon: '🎁' },
  { path: '/orders', label: '订单中心', icon: '💳' },
  { path: '/tags', label: '标签集管理', icon: '🏷️' },
  { path: '/configs', label: '页面配置', icon: '⚙️' },
];

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
};

const currentTitle = computed(() => {
  const current = menuItems.find((item) => isActive(item.path));
  return current ? current.label : (route.meta.title as string) || '管理后台';
});

const userInitial = computed(() => {
  const name = authStore.user?.realName || authStore.user?.username || 'A';
  return name.charAt(0).toUpperCase();
});

const todayFormatted = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
});

const handleLogout = () => {
  if (confirm('确认退出管理后台？')) {
    authStore.logout();
  }
};
</script>
