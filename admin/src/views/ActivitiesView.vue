<script setup lang="ts">
import { ref, onMounted } from 'vue';
import request from '../api/request';

interface Activity {
  id: string;
  title: string;
  coverUrl: string;
  activityType: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  location: string | null;
  price: number;
  maxParticipants: number | null;
  currentParticipants: number;
  startTime: string;
  endTime: string;
  enrollDeadline: string;
  status: 'DRAFT' | 'PUBLISHED' | 'OFFLINE';
  content: string;
  _count?: {
    enrollments: number;
  };
}

interface Attendee {
  id: string;
  ticketCode: string;
  user: {
    nickname: string;
    phone: string | null;
    avatarUrl: string | null;
  };
  isCheckedIn: boolean;
  checkedInAt: string | null;
  enrolledAt: string;
  feedback: string | null;
}

const activities = ref<Activity[]>([]);
const loading = ref(false);
const currentTab = ref('全部');
const searchQuery = ref('');

// 新建/编辑弹窗
const showEditModal = ref(false);
const isEditMode = ref(false);
const currentActivity = ref<Partial<Activity>>({
  title: '',
  coverUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600',
  activityType: 'OFFLINE',
  location: '杭州市西湖区若星空间美学馆',
  price: 199,
  maxParticipants: 20,
  status: 'PUBLISHED',
  startTime: '',
  endTime: '',
  enrollDeadline: '',
  content: '',
});

// 报名学员名单与核销弹窗
const showAttendeesModal = ref(false);
const activeActivityId = ref('');
const activeActivityTitle = ref('');
const attendeesList = ref<Attendee[]>([]);
const verifyInputCode = ref('');
const verifyResult = ref<{ success: boolean; message: string; student?: any } | null>(null);

// 获取活动列表
const fetchActivities = async () => {
  loading.value = true;
  try {
    const res = await request.get('/v1/admin/activities');
    activities.value = res.data.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// 打开新建活动
const openCreateActivity = () => {
  isEditMode.value = false;
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
  const end = new Date(Date.now() + 86400000 + 7200000).toISOString().slice(0, 16);
  currentActivity.value = {
    title: '',
    coverUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600',
    activityType: 'OFFLINE',
    location: '杭州市西湖区若星空间美学馆',
    price: 199,
    maxParticipants: 20,
    status: 'PUBLISHED',
    startTime: tomorrow,
    endTime: end,
    enrollDeadline: tomorrow,
    content: '欢迎参与若星空间生活美学线下实践雅集。',
  };
  showEditModal.value = true;
};

// 打开编辑活动
const openEditActivity = (act: Activity) => {
  isEditMode.value = true;
  currentActivity.value = { ...act };
  showEditModal.value = true;
};

// 保存活动
const saveActivity = async () => {
  try {
    if (isEditMode.value && currentActivity.value.id) {
      await request.put(`/v1/admin/activities/${currentActivity.value.id}`, currentActivity.value);
    } else {
      await request.post('/v1/admin/activities', currentActivity.value);
    }
    showEditModal.value = false;
    await fetchActivities();
  } catch (err) {
    console.error(err);
  }
};

// 删除活动
const deleteActivity = async (id: string) => {
  if (!confirm('确定要删除该活动吗？')) return;
  try {
    await request.delete(`/v1/admin/activities/${id}`);
    await fetchActivities();
  } catch (err) {
    console.error(err);
  }
};

// 打开报名名单与核销
const openAttendeesModal = async (act: Activity) => {
  activeActivityId.value = act.id;
  activeActivityTitle.value = act.title;
  verifyResult.value = null;
  verifyInputCode.value = '';
  try {
    const res = await request.get(`/v1/admin/activities/${act.id}/enrollments`);
    attendeesList.value = res.data.data;
    showAttendeesModal.value = true;
  } catch (err) {
    console.error(err);
  }
};

// 现场验券核销
const handleVerifyTicket = async (ticketCodeToVerify?: string) => {
  const code = ticketCodeToVerify || verifyInputCode.value;
  if (!code) return alert('请输入或扫描电子票号');

  try {
    const res = await request.post('/v1/admin/activities/checkin/verify', {
      ticketCode: code,
    });
    verifyResult.value = res.data.data;
    verifyInputCode.value = '';
    // 重新刷新名单
    const listRes = await request.get(`/v1/admin/activities/${activeActivityId.value}/enrollments`);
    attendeesList.value = listRes.data.data;
  } catch (err: any) {
    alert(err.response?.data?.message || '核销失败，请检查票号');
  }
};

onMounted(() => {
  fetchActivities();
});
</script>

<template>
  <div>
    <!-- 头部操作栏 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">活动管理</h1>
        <p class="text-sm text-slate-500 mt-1">管理若星空间线下生活美学工作坊、线上共读雅集与现场入场核销</p>
      </div>
      <button
        @click="openCreateActivity"
        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition flex items-center gap-2"
      >
        <span>✦</span> 发布新活动
      </button>
    </div>

    <!-- 筛选工具条 -->
    <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <button
          v-for="tab in ['全部', '线下工作坊', '线上共读', '雅集沙龙']"
          :key="tab"
          @click="currentTab = tab"
          :class="[
            'px-3 py-1.5 rounded-lg text-sm font-medium transition',
            currentTab === tab ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          ]"
        >
          {{ tab }}
        </button>
      </div>
      <div class="relative w-64">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索活动主题..."
          class="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <span class="absolute left-3 top-2 text-slate-400 text-sm">🔍</span>
      </div>
    </div>

    <!-- 活动表格 -->
    <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
          <tr>
            <th class="py-3.5 px-4">活动名称</th>
            <th class="py-3.5 px-4">活动形式</th>
            <th class="py-3.5 px-4">举办时间</th>
            <th class="py-3.5 px-4">活动地点</th>
            <th class="py-3.5 px-4">报名人数</th>
            <th class="py-3.5 px-4">状态</th>
            <th class="py-3.5 px-4 text-right">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="activities.length === 0 && !loading" class="text-center text-slate-400 py-12">
            <td colspan="7" class="py-8">暂无活动数据，请点击右上角发布新活动</td>
          </tr>
          <tr v-for="act in activities" :key="act.id" class="hover:bg-slate-50/70 transition">
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-3">
                <img :src="act.coverUrl" class="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                <div>
                  <div class="font-semibold text-slate-900">{{ act.title }}</div>
                  <div class="text-xs text-amber-600 font-medium mt-0.5">{{ act.price === 0 ? '免费参加' : `¥${act.price}` }}</div>
                </div>
              </div>
            </td>
            <td class="py-3.5 px-4">
              <span
                :class="[
                  'px-2.5 py-1 rounded-md text-xs font-medium',
                  act.activityType === 'OFFLINE' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                ]"
              >
                {{ act.activityType === 'OFFLINE' ? '📍 线下活动' : '💻 线上共创' }}
              </span>
            </td>
            <td class="py-3.5 px-4 text-slate-600 text-xs">
              {{ act.startTime ? act.startTime.slice(0, 16).replace('T', ' ') : '未定' }}
            </td>
            <td class="py-3.5 px-4 text-slate-600 text-xs max-w-[180px] truncate">
              {{ act.location || '线上腾讯会议' }}
            </td>
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-2">
                <span class="font-medium text-slate-900">{{ act.currentParticipants }}</span>
                <span class="text-xs text-slate-400">/ {{ act.maxParticipants || '不限' }}</span>
              </div>
            </td>
            <td class="py-3.5 px-4">
              <span
                :class="[
                  'px-2.5 py-1 rounded-md text-xs font-medium',
                  act.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                ]"
              >
                {{ act.status === 'PUBLISHED' ? '报名中' : '草稿' }}
              </span>
            </td>
            <td class="py-3.5 px-4 text-right">
              <div class="flex items-center justify-end gap-2 text-xs">
                <button @click="openAttendeesModal(act)" class="text-indigo-600 hover:text-indigo-800 font-medium">
                  名单与核销 ({{ act.currentParticipants }})
                </button>
                <span class="text-slate-300">|</span>
                <button @click="openEditActivity(act)" class="text-slate-600 hover:text-slate-900 font-medium">
                  编辑
                </button>
                <span class="text-slate-300">|</span>
                <button @click="deleteActivity(act.id)" class="text-rose-500 hover:text-rose-700 font-medium">
                  删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 新建/编辑活动弹窗 -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold text-slate-900 mb-4">{{ isEditMode ? '编辑活动' : '发布新活动' }}</h2>
        <div class="space-y-4 text-sm">
          <div>
            <label class="block text-slate-700 font-medium mb-1">活动主题</label>
            <input v-model="currentActivity.title" type="text" class="w-full p-2 border rounded-lg" placeholder="如：若星生活雅集 · 秋日器物收纳工作坊" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-700 font-medium mb-1">活动形式</label>
              <select v-model="currentActivity.activityType" class="w-full p-2 border rounded-lg">
                <option value="OFFLINE">线下生活美学馆</option>
                <option value="ONLINE">线上腾讯会议共读</option>
                <option value="HYBRID">线上/线下混合雅集</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">报名费用 (元)</label>
              <input v-model.number="currentActivity.price" type="number" class="w-full p-2 border rounded-lg" />
            </div>
          </div>
          <div>
            <label class="block text-slate-700 font-medium mb-1">举办地点 / 会议号</label>
            <input v-model="currentActivity.location" type="text" class="w-full p-2 border rounded-lg" placeholder="如：杭州市西湖区若星空间美学馆 / 腾讯会议 123-456-789" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-700 font-medium mb-1">开始时间</label>
              <input v-model="currentActivity.startTime" type="datetime-local" class="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">结束时间</label>
              <input v-model="currentActivity.endTime" type="datetime-local" class="w-full p-2 border rounded-lg" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-700 font-medium mb-1">报名截止时间</label>
              <input v-model="currentActivity.enrollDeadline" type="datetime-local" class="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">名额上限 (人)</label>
              <input v-model.number="currentActivity.maxParticipants" type="number" class="w-full p-2 border rounded-lg" />
            </div>
          </div>
          <div>
            <label class="block text-slate-700 font-medium mb-1">封面图 URL</label>
            <input v-model="currentActivity.coverUrl" type="text" class="w-full p-2 border rounded-lg" />
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showEditModal = false" class="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50">取消</button>
          <button @click="saveActivity" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">保存发布</button>
        </div>
      </div>
    </div>

    <!-- 报名名单与现场核销弹窗 -->
    <div v-if="showAttendeesModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b pb-4 mb-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900">活动报名名单与现场核销</h2>
            <p class="text-xs text-slate-500">{{ activeActivityTitle }} (已报 {{ attendeesList.length }} 人)</p>
          </div>
          <button @click="showAttendeesModal = false" class="text-slate-400 hover:text-slate-700 text-xl font-bold">✕</button>
        </div>

        <!-- 现场快速核销框 -->
        <div class="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 mb-6">
          <div class="text-xs font-bold text-indigo-900 mb-2">⚡ 现场扫码 / 输码快速核销</div>
          <div class="flex gap-2">
            <input
              v-model="verifyInputCode"
              @keyup.enter="() => handleVerifyTicket()"
              type="text"
              placeholder="输入或扫描学员电子票号 (如 TICK-A1B2C3D4)..."
              class="flex-1 text-sm p-2.5 border rounded-lg bg-white"
            />
            <button
              @click="() => handleVerifyTicket()"
              class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm"
            >
              验证核销
            </button>
          </div>
          <div v-if="verifyResult" class="mt-2 text-xs font-medium" :class="verifyResult.success ? 'text-emerald-700' : 'text-amber-700'">
            {{ verifyResult.message }} ({{ verifyResult.student?.nickname }} · {{ verifyResult.student?.phone || '无手机号' }})
          </div>
        </div>

        <!-- 报名学员表格 -->
        <div class="space-y-3">
          <div v-if="attendeesList.length === 0" class="text-center text-slate-400 py-12">
            当前活动暂无学员报名
          </div>
          <div
            v-for="a in attendeesList"
            :key="a.id"
            class="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                {{ a.user.nickname.slice(0, 1) }}
              </div>
              <div>
                <div class="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  {{ a.user.nickname }}
                  <span class="text-xs text-slate-400 font-normal">({{ a.user.phone || '微信注册' }})</span>
                </div>
                <div class="text-xs text-slate-400 mt-0.5">
                  票号：<span class="font-mono text-indigo-600 font-semibold">{{ a.ticketCode }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span
                :class="[
                  'text-xs px-2.5 py-1 rounded-md font-medium',
                  a.isCheckedIn ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                ]"
              >
                {{ a.isCheckedIn ? `✓ 已签到 (${a.checkedInAt ? a.checkedInAt.slice(11, 16) : '已核销'})` : '未入场' }}
              </span>
              <button
                v-if="!a.isCheckedIn"
                @click="handleVerifyTicket(a.ticketCode)"
                class="text-xs px-3 py-1 bg-slate-900 hover:bg-black text-white font-medium rounded-lg"
              >
                手动核销
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
