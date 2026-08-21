<script setup lang="ts">
import { ref, onMounted } from 'vue';
import request from '../api/request';

const form = ref({
  brandName: '若星空间',
  mainSlogan: '整理空间，整理心念',
  subSlogan: '克制、温润、陪伴的生活整理美学',
  contactPhone: '188-8888-8888',
  wechatQrUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600',
  annualMemberFee: 999,
  aboutUs: '若星空间由主理人若星创立，致力于通过空间整理、心念梳理与日常实践陪伴，帮助每一位学员找回生活原本的从容与秩序。',
});

const saving = ref(false);
const saveSuccess = ref(false);

const fetchSettings = async () => {
  try {
    const res = await request.get('/v1/admin/configs');
    const configs = res.data.data;
    const homeConfig = configs.find((c: any) => c.key === 'home_quote');
    if (homeConfig && homeConfig.value) {
      if (homeConfig.value.brandName) form.value.brandName = homeConfig.value.brandName;
      if (homeConfig.value.mainSlogan) form.value.mainSlogan = Array.isArray(homeConfig.value.mainSlogan) ? homeConfig.value.mainSlogan.join('，') : homeConfig.value.mainSlogan;
    }
  } catch (err) {
    console.error(err);
  }
};

const saveSettings = async () => {
  saving.value = true;
  saveSuccess.value = false;
  try {
    await request.put('/v1/admin/configs', {
      key: 'home_quote',
      value: {
        brandName: form.value.brandName,
        mainSlogan: form.value.mainSlogan.split(/[,，]/).map(s => s.trim()),
        subSlogan: form.value.subSlogan,
        contactPhone: form.value.contactPhone,
        wechatQrUrl: form.value.wechatQrUrl,
        annualMemberFee: form.value.annualMemberFee,
        aboutUs: form.value.aboutUs,
      },
      description: '全站品牌与系统配置',
    });
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
  fetchSettings();
});
</script>

<template>
  <div>
    <!-- 头部说明 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">系统与品牌设置</h1>
        <p class="text-sm text-slate-500 mt-1">维护若星空间品牌主张、客服联系方式、星愿会员定价与全站参数</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-3xl space-y-6">
      <!-- 品牌基本信息 -->
      <div class="space-y-4">
        <h2 class="text-base font-bold text-slate-900 border-b pb-3">✦ 品牌核心主张</h2>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label class="block font-medium text-slate-700 mb-1">品牌名称</label>
            <input v-model="form.brandName" type="text" class="w-full p-2.5 border rounded-lg bg-slate-50/50" />
          </div>
          <div>
            <label class="block font-medium text-slate-700 mb-1">星愿年度会员费 (元/年)</label>
            <input v-model.number="form.annualMemberFee" type="number" class="w-full p-2.5 border rounded-lg bg-slate-50/50" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label class="block font-medium text-slate-700 mb-1">主 Slogan (用逗号分隔分行)</label>
            <input v-model="form.mainSlogan" type="text" class="w-full p-2.5 border rounded-lg bg-slate-50/50" />
          </div>
          <div>
            <label class="block font-medium text-slate-700 mb-1">副标题</label>
            <input v-model="form.subSlogan" type="text" class="w-full p-2.5 border rounded-lg bg-slate-50/50" />
          </div>
        </div>
      </div>

      <!-- 客服与联系 -->
      <div class="space-y-4 pt-2">
        <h2 class="text-base font-bold text-slate-900 border-b pb-3">💬 客服与联系支持</h2>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label class="block font-medium text-slate-700 mb-1">客服联系电话</label>
            <input v-model="form.contactPhone" type="text" class="w-full p-2.5 border rounded-lg bg-slate-50/50" />
          </div>
          <div>
            <label class="block font-medium text-slate-700 mb-1">微信客服二维码 URL</label>
            <input v-model="form.wechatQrUrl" type="text" class="w-full p-2.5 border rounded-lg bg-slate-50/50" />
          </div>
        </div>
        <div class="text-sm">
          <label class="block font-medium text-slate-700 mb-1">关于我们介绍</label>
          <textarea v-model="form.aboutUs" rows="3" class="w-full p-3 border rounded-xl bg-slate-50/50"></textarea>
        </div>
      </div>

      <!-- 提交保存 -->
      <div class="flex items-center justify-between pt-4 border-t">
        <div v-if="saveSuccess" class="text-xs font-semibold text-emerald-600">
          ✓ 系统与品牌设置已保存，小程序端已实时同步生效
        </div>
        <div v-else></div>

        <button
          @click="saveSettings"
          :disabled="saving"
          class="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-xl shadow-sm transition"
        >
          {{ saving ? '保存中...' : '保存系统设置' }}
        </button>
      </div>
    </div>
  </div>
</template>
