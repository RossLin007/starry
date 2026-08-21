<script setup lang="ts">
import { ref, onMounted } from 'vue';
import request from '../api/request';

interface ShopItem {
  id: string;
  title: string;
  category: string;
  coverUrl: string;
  price: number;
  originalPrice: number | null;
  thirdPartyAppId: string | null;
  thirdPartyPath: string | null;
  thirdPartyUrl: string | null;
  status: 'ON_SALE' | 'OFF_SALE';
  sortOrder: number;
}

const goods = ref<ShopItem[]>([]);
const loading = ref(false);
const showEditModal = ref(false);
const isEditMode = ref(false);
const form = ref<Partial<ShopItem>>({
  title: '',
  category: '生活器物',
  coverUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600',
  price: 128,
  originalPrice: 158,
  thirdPartyAppId: 'wx1234567890abcdef',
  thirdPartyPath: 'pages/goods/detail?id=1001',
  status: 'ON_SALE',
  sortOrder: 0,
});

const fetchGoods = async () => {
  loading.value = true;
  try {
    const res = await request.get('/v1/admin/goods');
    goods.value = res.data.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const openCreateGood = () => {
  isEditMode.value = false;
  form.value = {
    title: '',
    category: '生活器物',
    coverUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600',
    price: 128,
    originalPrice: 158,
    thirdPartyAppId: 'wx1234567890abcdef',
    thirdPartyPath: 'pages/goods/detail?id=1001',
    status: 'ON_SALE',
    sortOrder: 0,
  };
  showEditModal.value = true;
};

const openEditGood = (item: ShopItem) => {
  isEditMode.value = true;
  form.value = { ...item };
  showEditModal.value = true;
};

const saveGood = async () => {
  if (!form.value.title || form.value.price === undefined || !form.value.coverUrl) {
    return alert('商品标题、价格与封面图为必填项');
  }
  try {
    if (isEditMode.value && form.value.id) {
      await request.put(`/v1/admin/goods/${form.value.id}`, form.value);
    } else {
      await request.post('/v1/admin/goods', form.value);
    }
    showEditModal.value = false;
    await fetchGoods();
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  fetchGoods();
});
</script>

<template>
  <div>
    <!-- 头部说明 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">好物推荐与第三方商品</h1>
        <p class="text-sm text-slate-500 mt-1">若星甄选生活器物、收纳工具与推荐书籍（小程序端原则上跳转第三方小程序或外链选购）</p>
      </div>
      <button
        @click="openCreateGood"
        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition flex items-center gap-2"
      >
        <span>✦</span> 添加好物
      </button>
    </div>

    <!-- 商品列表表格 -->
    <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
          <tr>
            <th class="py-3.5 px-4">好物名称</th>
            <th class="py-3.5 px-4">分类</th>
            <th class="py-3.5 px-4">价格</th>
            <th class="py-3.5 px-4">跳转第三方小程序 AppID</th>
            <th class="py-3.5 px-4">跳转路径</th>
            <th class="py-3.5 px-4">状态</th>
            <th class="py-3.5 px-4 text-right">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="goods.length === 0 && !loading" class="text-center text-slate-400 py-12">
            <td colspan="7" class="py-8">暂无好物商品，请点击右上角添加</td>
          </tr>
          <tr v-for="g in goods" :key="g.id" class="hover:bg-slate-50/70 transition">
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-3">
                <img :src="g.coverUrl" class="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                <div class="font-semibold text-slate-900">{{ g.title }}</div>
              </div>
            </td>
            <td class="py-3.5 px-4">
              <span class="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-medium">
                {{ g.category }}
              </span>
            </td>
            <td class="py-3.5 px-4 font-bold text-slate-800">
              ¥{{ g.price }}
            </td>
            <td class="py-3.5 px-4 text-xs font-mono text-slate-600">
              {{ g.thirdPartyAppId || '默认合作小程序' }}
            </td>
            <td class="py-3.5 px-4 text-xs font-mono text-slate-500 max-w-[160px] truncate">
              {{ g.thirdPartyPath || 'pages/index' }}
            </td>
            <td class="py-3.5 px-4">
              <span
                :class="[
                  'px-2.5 py-1 rounded-md text-xs font-medium',
                  g.status === 'ON_SALE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                ]"
              >
                {{ g.status === 'ON_SALE' ? '推荐中' : '已下架' }}
              </span>
            </td>
            <td class="py-3.5 px-4 text-right">
              <button @click="openEditGood(g)" class="text-indigo-600 hover:text-indigo-800 font-semibold text-xs">
                编辑
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 添加/编辑好物弹窗 -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h2 class="text-lg font-bold text-slate-900">{{ isEditMode ? '编辑好物' : '添加好物' }}</h2>
          <button @click="showEditModal = false" class="text-slate-400 text-xl font-bold">✕</button>
        </div>

        <div class="space-y-3 text-sm">
          <div>
            <label class="block font-medium text-slate-700 mb-1">商品标题</label>
            <input v-model="form.title" type="text" class="w-full p-2.5 border rounded-lg" placeholder="如：若星定制 · 亚麻收纳盒组合" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-medium text-slate-700 mb-1">所属分类</label>
              <select v-model="form.category" class="w-full p-2.5 border rounded-lg">
                <option value="生活器物">生活器物</option>
                <option value="收纳工具">收纳工具</option>
                <option value="推荐好书">推荐好书</option>
                <option value="若星周边">若星周边</option>
              </select>
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">推荐价格 (元)</label>
              <input v-model.number="form.price" type="number" class="w-full p-2.5 border rounded-lg" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-medium text-slate-700 mb-1">跳转第三方 AppID</label>
              <input v-model="form.thirdPartyAppId" type="text" class="w-full p-2.5 border rounded-lg" placeholder="如：wx1234567890abcdef" />
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">跳转页面路径</label>
              <input v-model="form.thirdPartyPath" type="text" class="w-full p-2.5 border rounded-lg" placeholder="如：pages/goods/detail?id=123" />
            </div>
          </div>
          <div>
            <label class="block font-medium text-slate-700 mb-1">封面图 URL</label>
            <input v-model="form.coverUrl" type="text" class="w-full p-2.5 border rounded-lg" />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button @click="showEditModal = false" class="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50">取消</button>
          <button @click="saveGood" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg">
            保存商品
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
