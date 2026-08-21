<script setup lang="ts">
import { ref, onMounted } from 'vue';
import request from '../api/request';

interface Checkin {
  id: string;
  user: {
    nickname: string;
    avatarUrl: string | null;
    phone: string | null;
  };
  course?: {
    id: string;
    title: string;
  };
  lesson?: {
    id: string;
    title: string;
  };
  content: string;
  images: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isFeatured: boolean;
  featuredAt: string | null;
  adminComment: string | null;
  createdAt: string;
}

const checkins = ref<Checkin[]>([]);
const loading = ref(false);
const currentTab = ref('全部');

// 寄语与审核弹窗
const showReviewModal = ref(false);
const activeCheckin = ref<Checkin | null>(null);
const reviewForm = ref({
  status: 'APPROVED' as 'PENDING' | 'APPROVED' | 'REJECTED',
  isFeatured: true,
  adminComment: '',
});

const fetchCheckins = async () => {
  loading.value = true;
  try {
    const res = await request.get('/v1/admin/checkins');
    checkins.value = res.data.data.list;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const openReviewModal = (item: Checkin) => {
  activeCheckin.value = item;
  reviewForm.value = {
    status: item.status,
    isFeatured: item.isFeatured,
    adminComment: item.adminComment || '看到你在整理中觉察到自己内心的秩序，很为你开心。保持这份笃定，生活会越来越温润。',
  };
  showReviewModal.value = true;
};

const submitReview = async () => {
  if (!activeCheckin.value) return;
  try {
    await request.put(`/v1/admin/checkins/${activeCheckin.value.id}/review`, reviewForm.value);
    showReviewModal.value = false;
    await fetchCheckins();
    alert('审核与寄语已保存并同步至前台');
  } catch (err) {
    console.error(err);
  }
};

const toggleFeatured = async (item: Checkin) => {
  try {
    await request.put(`/v1/admin/checkins/${item.id}/review`, {
      status: 'APPROVED',
      isFeatured: !item.isFeatured,
    });
    await fetchCheckins();
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  fetchCheckins();
});
</script>

<template>
  <div>
    <!-- 头部说明 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">实践打卡与陪伴管理</h1>
        <p class="text-sm text-slate-500 mt-1">查看学员在学打卡心得、审核精选上墙、撰写若星主理人温润陪伴寄语</p>
      </div>
    </div>

    <!-- 筛选工具条 -->
    <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <button
          v-for="tab in ['全部', '待审核', '精选上墙']"
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
      <div class="text-xs text-slate-400">
        共 {{ checkins.length }} 条打卡记录
      </div>
    </div>

    <!-- 打卡瀑布流列表 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-if="checkins.length === 0 && !loading" class="col-span-2 text-center text-slate-400 py-16 bg-white rounded-xl border">
        暂无打卡数据，学员提交打卡后将显示在此处
      </div>

      <div
        v-for="c in checkins"
        :key="c.id"
        class="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4 hover:shadow-md transition"
      >
        <!-- 学员头部 -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
              {{ c.user.nickname.slice(0, 1) }}
            </div>
            <div>
              <div class="font-bold text-slate-900 text-sm flex items-center gap-2">
                {{ c.user.nickname }}
                <span class="text-xs text-slate-400 font-normal">({{ c.createdAt.slice(0, 10) }})</span>
              </div>
              <div class="text-xs text-indigo-600 font-medium">
                {{ c.course?.title || '日常自由打卡' }} {{ c.lesson ? `· ${c.lesson.title}` : '' }}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span
              :class="[
                'text-[11px] px-2.5 py-0.5 rounded-md font-semibold',
                c.isFeatured ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
              ]"
            >
              {{ c.isFeatured ? '★ 精选上墙' : '常规打卡' }}
            </span>
          </div>
        </div>

        <!-- 打卡心得文字 -->
        <div class="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-lg border border-slate-100">
          {{ c.content }}
        </div>

        <!-- 导师寄语 (若已回评) -->
        <div v-if="c.adminComment" class="bg-amber-50/70 border border-amber-200/60 p-3 rounded-lg text-xs space-y-1">
          <div class="font-bold text-amber-900 flex items-center gap-1">
            <span>✦</span> 若星主理人温润寄语：
          </div>
          <div class="text-amber-800 leading-relaxed">{{ c.adminComment }}</div>
        </div>

        <!-- 底部操作按钮 -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <button
            @click="toggleFeatured(c)"
            class="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
          >
            <span>{{ c.isFeatured ? '★ 取消精选' : '☆ 设为精选' }}</span>
          </button>

          <button
            @click="openReviewModal(c)"
            class="px-3 py-1.5 bg-slate-900 hover:bg-black text-white font-medium rounded-lg shadow-sm"
          >
            {{ c.adminComment ? '修改寄语' : '撰写温润寄语 ➔' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 审核与撰写寄语弹窗 -->
    <div v-if="showReviewModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h2 class="text-lg font-bold text-slate-900">撰写若星主理人温润寄语</h2>
          <button @click="showReviewModal = false" class="text-slate-400 text-xl font-bold">✕</button>
        </div>

        <div class="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
          学员：<span class="font-bold text-slate-800">{{ activeCheckin?.user.nickname }}</span><br />
          心得：{{ activeCheckin?.content }}
        </div>

        <div class="space-y-3 text-sm">
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" v-model="reviewForm.isFeatured" class="rounded text-indigo-600" />
              <span class="font-medium text-slate-700">同步推荐至打卡广场精选墙</span>
            </label>
          </div>

          <div>
            <label class="block text-slate-700 font-medium mb-1">温润陪伴寄语内容</label>
            <textarea
              v-model="reviewForm.adminComment"
              rows="4"
              class="w-full p-3 border rounded-xl text-sm"
              placeholder="给学员写一句温润笃定的鼓励..."
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button @click="showReviewModal = false" class="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50">取消</button>
          <button @click="submitReview" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg">
            保存寄语并发布
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
