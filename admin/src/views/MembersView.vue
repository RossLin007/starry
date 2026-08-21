<script setup lang="ts">
import { ref, onMounted } from 'vue';
import request from '../api/request';

interface Member {
  id: string;
  nickname: string;
  avatarUrl: string | null;
  phone: string | null;
  memberTier: 'FREE' | 'STAR_MEMBER';
  memberExpireAt: string | null;
  points: number;
  status: string;
  createdAt: string;
}

const members = ref<Member[]>([]);
const loading = ref(false);
const currentTab = ref('全部');

const fetchMembers = async () => {
  loading.value = true;
  try {
    const res = await request.get('/v1/admin/members');
    members.value = res.data.data.list;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchMembers();
});
</script>

<template>
  <div>
    <!-- 头部说明 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">会员体系管理</h1>
        <p class="text-sm text-slate-500 mt-1">管理若星星愿年度会员尊享权益、有效期监控与学员积分沉淀</p>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
          ✦
        </div>
        <div>
          <div class="text-xs font-semibold text-slate-400">星愿年度会员</div>
          <div class="text-2xl font-extrabold text-slate-900 mt-1">
            {{ members.filter(m => m.memberTier === 'STAR_MEMBER').length }} <span class="text-xs font-normal text-slate-400">人</span>
          </div>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
          👥
        </div>
        <div>
          <div class="text-xs font-semibold text-slate-400">注册学员总数</div>
          <div class="text-2xl font-extrabold text-slate-900 mt-1">
            {{ members.length }} <span class="text-xs font-normal text-slate-400">人</span>
          </div>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
          ⭐
        </div>
        <div>
          <div class="text-xs font-semibold text-slate-400">星图积分流通总量</div>
          <div class="text-2xl font-extrabold text-slate-900 mt-1">
            {{ members.reduce((acc, m) => acc + (m.points || 0), 0) }} <span class="text-xs font-normal text-slate-400">pts</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
          <tr>
            <th class="py-3.5 px-4">学员昵称</th>
            <th class="py-3.5 px-4">联系手机</th>
            <th class="py-3.5 px-4">会员等级</th>
            <th class="py-3.5 px-4">会员有效期至</th>
            <th class="py-3.5 px-4">星图积分</th>
            <th class="py-3.5 px-4">加入时间</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="members.length === 0 && !loading" class="text-center text-slate-400 py-12">
            <td colspan="6" class="py-8">暂无会员数据</td>
          </tr>
          <tr v-for="m in members" :key="m.id" class="hover:bg-slate-50/70 transition">
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                  {{ m.nickname.slice(0, 1) }}
                </div>
                <div class="font-semibold text-slate-900 text-xs">{{ m.nickname }}</div>
              </div>
            </td>
            <td class="py-3.5 px-4 text-xs text-slate-600 font-mono">
              {{ m.phone || '微信授权' }}
            </td>
            <td class="py-3.5 px-4">
              <span
                :class="[
                  'px-2.5 py-1 rounded-md text-xs font-bold',
                  m.memberTier === 'STAR_MEMBER' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                ]"
              >
                {{ m.memberTier === 'STAR_MEMBER' ? '✦ 星愿年度会员' : '普通学员' }}
              </span>
            </td>
            <td class="py-3.5 px-4 text-xs">
              <span v-if="m.memberExpireAt" class="text-amber-700 font-medium">
                {{ m.memberExpireAt.slice(0, 10) }}
              </span>
              <span v-else class="text-slate-400">未开通</span>
            </td>
            <td class="py-3.5 px-4 font-bold text-indigo-600 text-xs">
              {{ m.points }} pts
            </td>
            <td class="py-3.5 px-4 text-slate-400 text-xs">
              {{ m.createdAt.slice(0, 10) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
