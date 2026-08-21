<template>
  <div class="admin">
    <!-- 侧边栏 (严格对齐 prototype-v3/admin/index.html) -->
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-name"><span class="brand-star">✦</span>若 星</div>
        <div class="brand-sub">团队工作台</div>
      </div>

      <nav class="side-nav" aria-label="后台导航">
        <router-link to="/" :class="{ active: isExactActive('/') }">
          工作台<span class="nav-star">✦</span>
        </router-link>

        <div class="nav-group">课程与活动</div>
        <router-link to="/courses" :class="{ active: isActive('/courses') }">
          课程管理<span class="nav-star">✦</span>
        </router-link>
        <router-link to="/activities" :class="{ active: isActive('/activities') }">
          活动管理<span class="nav-star">✦</span>
        </router-link>
        <router-link to="/publish" :class="{ active: isActive('/publish') }">
          内容发布<span class="nav-star">✦</span>
        </router-link>
        <router-link to="/stories" :class="{ active: isActive('/stories') }">
          故事管理<span class="nav-star">✦</span>
        </router-link>
        <router-link to="/checkins" :class="{ active: isActive('/checkins') }">
          打卡管理<span class="nav-star">✦</span>
        </router-link>
        <router-link to="/tags" :class="{ active: isActive('/tags') }">
          标签管理<span class="nav-star">✦</span>
        </router-link>
        <router-link to="/orders" :class="{ active: isActive('/orders') }">
          订单管理<span class="nav-star">✦</span>
        </router-link>
        <router-link to="/goods" :class="{ active: isActive('/goods') }">
          商品管理<span class="nav-star">✦</span>
        </router-link>

        <div class="nav-group">页面配置</div>
        <router-link to="/configs" :class="{ active: isActive('/configs') }">
          首页配置<span class="nav-star">✦</span>
        </router-link>

        <div class="nav-group">人与关系</div>
        <router-link to="/students" :class="{ active: isActive('/students') }">
          学员管理<span class="nav-star">✦</span>
        </router-link>
        <router-link to="/members" :class="{ active: isActive('/members') }">
          会员管理<span class="nav-star">✦</span>
        </router-link>
      </nav>

      <div class="side-foot">
        {{ userName }}，下午好。<br>
        今天也是安静做事的一天。
        <div style="margin-top: 10px;">
          <button @click="handleLogout" class="btn-text" style="font-size: 11px; color: var(--ash);">
            退出登录
          </button>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const route = useRoute();
const authStore = useAuthStore();

const isExactActive = (path: string) => {
  return route.path === path;
};

const isActive = (path: string) => {
  return route.path.startsWith(path);
};

const userName = computed(() => {
  return authStore.user?.realName || authStore.user?.username || '小蔡';
});

const handleLogout = () => {
  if (confirm('确认退出管理后台？')) {
    authStore.logout();
  }
};
</script>
