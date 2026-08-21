<script setup lang="ts">
import { ref, onMounted } from 'vue';
import request from '../api/request';

interface Story {
  id: string;
  title: string;
  authorName: string;
  authorAvatar: string | null;
  summary: string;
  content: string;
  coverUrl: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'OFFLINE';
  isRecommended: boolean;
  createdAt: string;
}

const stories = ref<Story[]>([]);
const loading = ref(false);
const showEditModal = ref(false);
const isEditMode = ref(false);
const form = ref<Partial<Story>>({
  title: '',
  authorName: '',
  authorAvatar: '',
  summary: '',
  content: '',
  coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600',
  status: 'PUBLISHED',
  isRecommended: true,
});

const fetchStories = async () => {
  loading.value = true;
  try {
    const res = await request.get('/v1/admin/stories');
    stories.value = res.data.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const openCreateStory = () => {
  isEditMode.value = false;
  form.value = {
    title: '',
    authorName: '若星学员 · 静怡',
    authorAvatar: '',
    summary: '21 天整理营，让我学会放手与重获新生。',
    content: '在参加若星空间整理营之前，我的房间总是塞满了过去舍不得丢弃的杂物...',
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600',
    status: 'PUBLISHED',
    isRecommended: true,
  };
  showEditModal.value = true;
};

const openEditStory = (story: Story) => {
  isEditMode.value = true;
  form.value = { ...story };
  showEditModal.value = true;
};

const saveStory = async () => {
  if (!form.value.title || !form.value.authorName || !form.value.content) {
    return alert('标题、作者名称与故事正文为必填项');
  }
  try {
    if (isEditMode.value && form.value.id) {
      await request.put(`/v1/admin/stories/${form.value.id}`, form.value);
    } else {
      await request.post('/v1/admin/stories', form.value);
    }
    showEditModal.value = false;
    await fetchStories();
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  fetchStories();
});
</script>

<template>
  <div>
    <!-- 头部说明 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">学员故事管理</h1>
        <p class="text-sm text-slate-500 mt-1">采编与发布若星空间学员的真实成长、空间蜕变与生活美学故事</p>
      </div>
      <button
        @click="openCreateStory"
        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition flex items-center gap-2"
      >
        <span>✦</span> 撰写新故事
      </button>
    </div>

    <!-- 故事列表 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-if="stories.length === 0 && !loading" class="col-span-3 text-center text-slate-400 py-16 bg-white rounded-xl border">
        暂无学员故事，请点击右上角撰写新故事
      </div>

      <div
        v-for="s in stories"
        :key="s.id"
        class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition"
      >
        <img :src="s.coverUrl || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600'" class="w-full h-44 object-cover bg-slate-100" />
        <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div class="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span class="font-medium text-indigo-600">{{ s.authorName }}</span>
              <span>{{ s.createdAt.slice(0, 10) }}</span>
            </div>
            <h3 class="font-bold text-slate-900 text-base leading-snug">{{ s.title }}</h3>
            <p class="text-xs text-slate-500 line-clamp-2 mt-2">{{ s.summary }}</p>
          </div>

          <div class="flex items-center justify-between pt-3 border-t text-xs">
            <span :class="s.isRecommended ? 'text-amber-600 font-semibold' : 'text-slate-400'">
              {{ s.isRecommended ? '★ 首页推荐' : '常规展示' }}
            </span>
            <button @click="openEditStory(s)" class="text-indigo-600 hover:text-indigo-800 font-semibold">
              编辑 ➔
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 撰写/编辑故事弹窗 -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h2 class="text-lg font-bold text-slate-900">{{ isEditMode ? '编辑学员故事' : '撰写学员故事' }}</h2>
          <button @click="showEditModal = false" class="text-slate-400 text-xl font-bold">✕</button>
        </div>

        <div class="space-y-3 text-sm">
          <div>
            <label class="block font-medium text-slate-700 mb-1">故事标题</label>
            <input v-model="form.title" type="text" class="w-full p-2.5 border rounded-lg" placeholder="如：从乱糟糟的家，到内心清爽的 21 天" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-medium text-slate-700 mb-1">学员作者昵称</label>
              <input v-model="form.authorName" type="text" class="w-full p-2.5 border rounded-lg" placeholder="如：第 11 期学员 · 静怡" />
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">首页推荐</label>
              <select v-model="form.isRecommended" class="w-full p-2.5 border rounded-lg">
                <option :value="true">推荐至首页展示</option>
                <option :value="false">普通故事</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block font-medium text-slate-700 mb-1">故事摘要 (一两句话)</label>
            <input v-model="form.summary" type="text" class="w-full p-2.5 border rounded-lg" placeholder="如：舍弃了三大箱旧物后，我找回了生活的掌控感。" />
          </div>
          <div>
            <label class="block font-medium text-slate-700 mb-1">故事长图文正文</label>
            <textarea v-model="form.content" rows="6" class="w-full p-3 border rounded-xl" placeholder="输入故事详细内容..."></textarea>
          </div>
          <div>
            <label class="block font-medium text-slate-700 mb-1">封面图 URL</label>
            <input v-model="form.coverUrl" type="text" class="w-full p-2.5 border rounded-lg" />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button @click="showEditModal = false" class="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50">取消</button>
          <button @click="saveStory" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg">
            保存发布
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
