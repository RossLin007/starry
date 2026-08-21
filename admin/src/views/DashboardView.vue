<template>
  <div class="space-y-8">
    <!-- 顶部欢迎卡片 (星夜世界微光氛围) -->
    <div class="bg-gradient-to-r from-starry-night via-[#1A263D] to-starry-night rounded-2xl p-8 text-white shadow-xl flex items-center justify-between border border-slate-700/50">
      <div class="space-y-2">
        <h2 class="text-2xl font-bold tracking-tight flex items-center gap-2">
          下午好，{{ authStore.user?.realName || '若星团队' }} <span class="text-starry-star">✦</span>
        </h2>
        <p class="text-slate-300 text-sm max-w-xl">
          欢迎回到若星空间管理中台。今天有 <span class="text-starry-star font-semibold">12</span> 条学员打卡待审核，<span class="text-starry-star font-semibold">3</span> 个课程班级正在进行中。
        </p>
      </div>
      <div class="flex gap-3">
        <router-link to="/checkins" class="px-4 py-2.5 bg-starry-green hover:bg-[#018A42] text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-starry-green/30">
          去审核打卡
        </router-link>
        <router-link to="/courses" class="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors backdrop-blur">
          发布新课程
        </router-link>
      </div>
    </div>

    <!-- 4 大核心指标卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div class="flex items-center justify-between text-starry-tea text-sm font-medium">
          <span>总在学学员</span>
          <span class="p-2 rounded-xl bg-starry-bud text-starry-green">👥</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-bold text-starry-ink">1,280</span>
          <span class="text-xs font-semibold text-starry-green">+12% 同比</span>
        </div>
      </div>

      <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div class="flex items-center justify-between text-starry-tea text-sm font-medium">
          <span>累计打卡数</span>
          <span class="p-2 rounded-xl bg-amber-50 text-amber-600">📝</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-bold text-starry-ink">8,542</span>
          <span class="text-xs font-semibold text-starry-green">+28 篇今日</span>
        </div>
      </div>

      <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div class="flex items-center justify-between text-starry-tea text-sm font-medium">
          <span>深度会员总数</span>
          <span class="p-2 rounded-xl bg-rose-50 text-rose-600">👑</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-bold text-starry-ink">326</span>
          <span class="text-xs font-semibold text-starry-ash">活跃率 89%</span>
        </div>
      </div>

      <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div class="flex items-center justify-between text-starry-tea text-sm font-medium">
          <span>本月交易总额</span>
          <span class="p-2 rounded-xl bg-starry-bud text-starry-green">💳</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-bold text-starry-green">¥48,600</span>
          <span class="text-xs font-semibold text-starry-green">+18% 环比</span>
        </div>
      </div>
    </div>

    <!-- 快捷操作与待办区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- 待办审核清单 -->
      <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-starry-ink text-base">待办事项</h3>
          <span class="text-xs text-starry-green font-medium">查看全部</span>
        </div>
        <div class="divide-y divide-slate-100">
          <div class="py-3.5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              <span class="text-sm font-medium text-starry-ink">学员实践打卡待审核 (12 篇)</span>
            </div>
            <router-link to="/checkins" class="text-xs font-medium text-starry-green hover:text-[#018A42]">处理 ➔</router-link>
          </div>
          <div class="py-3.5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-starry-green"></span>
              <span class="text-sm font-medium text-starry-ink">空间整理营第三期：明日需定时开放课节资料</span>
            </div>
            <router-link to="/courses" class="text-xs font-medium text-starry-green hover:text-[#018A42]">查看 ➔</router-link>
          </div>
          <div class="py-3.5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-starry-olive"></span>
              <span class="text-sm font-medium text-starry-ink">线下沙龙活动报名已满员 (30/30 人)</span>
            </div>
            <router-link to="/activities" class="text-xs font-medium text-starry-green hover:text-[#018A42]">名单 ➔</router-link>
          </div>
        </div>
      </div>

      <!-- 系统状态与快捷入口 -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        <h3 class="font-bold text-starry-ink text-base">快捷入口</h3>
        <div class="grid grid-cols-2 gap-3">
          <router-link to="/publish" class="p-4 rounded-xl bg-slate-50 hover:bg-starry-bud text-starry-tea hover:text-starry-green transition-colors flex flex-col items-center gap-2 text-center">
            <span class="text-2xl">✍️</span>
            <span class="text-xs font-medium">发布每日星语</span>
          </router-link>
          <router-link to="/stories" class="p-4 rounded-xl bg-slate-50 hover:bg-starry-bud text-starry-tea hover:text-starry-green transition-colors flex flex-col items-center gap-2 text-center">
            <span class="text-2xl">📖</span>
            <span class="text-xs font-medium">会员故事审核</span>
          </router-link>
          <router-link to="/students" class="p-4 rounded-xl bg-slate-50 hover:bg-starry-bud text-starry-tea hover:text-starry-green transition-colors flex flex-col items-center gap-2 text-center">
            <span class="text-2xl">👥</span>
            <span class="text-xs font-medium">学员标签维护</span>
          </router-link>
          <router-link to="/configs" class="p-4 rounded-xl bg-slate-50 hover:bg-starry-bud text-starry-tea hover:text-starry-green transition-colors flex flex-col items-center gap-2 text-center">
            <span class="text-2xl">⚙️</span>
            <span class="text-xs font-medium">首页模块配置</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth.js';

const authStore = useAuthStore();
</script>
