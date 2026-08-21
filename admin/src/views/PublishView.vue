<script setup lang="ts">
import { ref, onMounted } from 'vue';
import request from '../api/request';

const today = new Date().toISOString().slice(0, 10);
const form = ref({
  date: today,
  quote: '生活不在别处，当下即是全部。整理外在的物，是在安顿内在的心。',
  author: '若星',
  audioUrl: '',
  content: '早安，若星的朋友。在今天开始之前，不妨给自己留出三分钟的安静时间。',
});

const saving = ref(false);
const saveSuccess = ref(false);

const fetchTodayDaily = async () => {
  try {
    const res = await request.get(`/v1/client/contents/daily?date=${form.value.date}`);
    if (res.data.data && res.data.data.quote) {
      form.value.quote = res.data.data.quote;
      form.value.author = res.data.data.author || '若星';
      form.value.audioUrl = res.data.data.audioUrl || '';
      form.value.content = res.data.data.content || '';
    }
  } catch (err) {
    console.error(err);
  }
};

const handleSave = async () => {
  if (!form.value.quote) return alert('金句内容不能为空');
  saving.value = true;
  saveSuccess.value = false;
  try {
    await request.post('/v1/admin/contents/daily', form.value);
    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  } catch (err) {
    console.error(err);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  fetchTodayDaily();
});
</script>

<template>
  <div>
    <!-- 头部说明 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">每日星语与内容发布</h1>
        <p class="text-sm text-slate-500 mt-1">发布小程序首页每日金句、伴读音频与生活沉思录</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 发布表单 -->
      <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div class="flex items-center justify-between border-b pb-4">
          <h2 class="font-bold text-slate-900 text-base">✦ 每日星语编排</h2>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500 font-medium">发布日期：</span>
            <input
              v-model="form.date"
              @change="fetchTodayDaily"
              type="date"
              class="p-1.5 border rounded-lg text-xs font-semibold bg-slate-50"
            />
          </div>
        </div>

        <div class="space-y-4 text-sm">
          <div>
            <label class="block font-medium text-slate-700 mb-1">今日金句 (首页引言卡片展示)</label>
            <textarea
              v-model="form.quote"
              rows="3"
              class="w-full p-3 border rounded-xl bg-slate-50/50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              placeholder="输入今日温润金句..."
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-medium text-slate-700 mb-1">引言作者 / 出处</label>
              <input
                v-model="form.author"
                type="text"
                class="w-full p-2.5 border rounded-lg bg-slate-50/50"
                placeholder="如：若星 / 梭罗《瓦尔登湖》"
              />
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">伴读音频链接 (选填)</label>
              <input
                v-model="form.audioUrl"
                type="text"
                class="w-full p-2.5 border rounded-lg bg-slate-50/50"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label class="block font-medium text-slate-700 mb-1">伴读思考导言 (点开日签详情时展示)</label>
            <textarea
              v-model="form.content"
              rows="4"
              class="w-full p-3 border rounded-xl bg-slate-50/50 text-slate-800"
              placeholder="输入今日思考短文..."
            ></textarea>
          </div>
        </div>

        <div class="flex items-center justify-between pt-4 border-t">
          <div v-if="saveSuccess" class="text-xs font-semibold text-emerald-600 flex items-center gap-1">
            ✓ 每日星语已成功发布，小程序已实时生效
          </div>
          <div v-else></div>

          <button
            @click="handleSave"
            :disabled="saving"
            class="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-xl shadow-sm transition"
          >
            {{ saving ? '发布中...' : '确认发布每日星语' }}
          </button>
        </div>
      </div>

      <!-- 实时预览卡片 -->
      <div class="space-y-4">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">小程序首页效果预览</h3>
        <div class="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-lg space-y-4">
          <div class="flex items-center justify-between text-xs text-amber-300">
            <span>✦ 每日星语 · {{ form.date }}</span>
            <span>若星空间</span>
          </div>
          <div class="text-lg font-serif italic leading-relaxed text-slate-100">
            “{{ form.quote }}”
          </div>
          <div class="text-right text-xs text-slate-400 font-medium">
            —— {{ form.author || '若星' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
