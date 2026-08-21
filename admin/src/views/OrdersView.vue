<script setup lang="ts">
import { ref, onMounted } from 'vue';
import request from '../api/request';

interface Order {
  id: string;
  orderNo: string;
  user: {
    nickname: string;
    phone: string | null;
    avatarUrl: string | null;
  };
  orderType: 'COURSE' | 'ACTIVITY' | 'MEMBER';
  targetTitle: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'REFUNDED' | 'CLOSED';
  paidAt: string | null;
  createdAt: string;
  payment?: {
    paymentNo: string;
    transactionId: string;
    status: string;
    paidAt: string;
  };
}

const orders = ref<Order[]>([]);
const loading = ref(false);
const currentTab = ref('全部');
const searchQuery = ref('');

const fetchOrders = async () => {
  loading.value = true;
  try {
    const res = await request.get('/v1/admin/orders');
    orders.value = res.data.data.list;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const getTypeName = (type: string) => {
  switch (type) {
    case 'COURSE': return '课程报名';
    case 'ACTIVITY': return '活动报名';
    case 'MEMBER': return '星愿会员';
    default: return type;
  }
};

onMounted(() => {
  fetchOrders();
});
</script>

<template>
  <div>
    <!-- 头部说明 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">订单与收款中台</h1>
        <p class="text-sm text-slate-500 mt-1">管理若星空间课程报名、线下雅集门票与星愿年度会员微信支付订单</p>
      </div>
    </div>

    <!-- 筛选工具条 -->
    <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <button
          v-for="tab in ['全部', '已支付', '待支付', '已关闭']"
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
          placeholder="搜索订单号 / 学员昵称..."
          class="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <span class="absolute left-3 top-2 text-slate-400 text-sm">🔍</span>
      </div>
    </div>

    <!-- 订单列表表格 -->
    <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
          <tr>
            <th class="py-3.5 px-4">订单号</th>
            <th class="py-3.5 px-4">下单学员</th>
            <th class="py-3.5 px-4">项目类型</th>
            <th class="py-3.5 px-4">订单内容</th>
            <th class="py-3.5 px-4">实付金额</th>
            <th class="py-3.5 px-4">订单状态</th>
            <th class="py-3.5 px-4">支付流水 / 时间</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="orders.length === 0 && !loading" class="text-center text-slate-400 py-12">
            <td colspan="7" class="py-8">暂无订单数据</td>
          </tr>
          <tr v-for="o in orders" :key="o.id" class="hover:bg-slate-50/70 transition">
            <td class="py-3.5 px-4 font-mono text-xs text-slate-700 font-semibold">
              {{ o.orderNo }}
            </td>
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                  {{ o.user.nickname.slice(0, 1) }}
                </div>
                <div>
                  <div class="font-semibold text-slate-900 text-xs">{{ o.user.nickname }}</div>
                  <div class="text-[10px] text-slate-400">{{ o.user.phone || '微信注册' }}</div>
                </div>
              </div>
            </td>
            <td class="py-3.5 px-4">
              <span
                :class="[
                  'px-2 py-0.5 rounded text-[11px] font-medium',
                  o.orderType === 'MEMBER' ? 'bg-amber-100 text-amber-800 font-bold' : (o.orderType === 'COURSE' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700')
                ]"
              >
                {{ getTypeName(o.orderType) }}
              </span>
            </td>
            <td class="py-3.5 px-4 text-slate-800 text-xs font-medium max-w-[200px] truncate">
              {{ o.targetTitle }}
            </td>
            <td class="py-3.5 px-4 font-bold text-slate-900">
              ¥{{ o.amount }}
            </td>
            <td class="py-3.5 px-4">
              <span
                :class="[
                  'px-2.5 py-1 rounded-md text-xs font-semibold',
                  o.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : (o.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500')
                ]"
              >
                {{ o.status === 'PAID' ? '✓ 支付成功' : (o.status === 'PENDING' ? '待支付' : '已关闭') }}
              </span>
            </td>
            <td class="py-3.5 px-4 text-xs">
              <div v-if="o.payment?.transactionId" class="text-indigo-600 font-mono font-medium">
                WX: {{ o.payment.transactionId.slice(-8) }}
              </div>
              <div class="text-slate-400 text-[11px] mt-0.5">
                {{ (o.paidAt || o.createdAt).slice(0, 16).replace('T', ' ') }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
