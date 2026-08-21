// pages/orders/index.ts
import { request } from '../../utils/request';

Page({
  data: {
    tabs: [
      { key: '', label: '全部' },
      { key: 'PENDING', label: '待支付' },
      { key: 'PAID', label: '已支付' },
      { key: 'CLOSED', label: '已关闭' },
    ],
    activeTab: '',
    orders: [] as any[],
    loading: true,
  },

  onLoad() {
    this.fetchOrders();
  },

  onShow() {
    this.fetchOrders();
  },

  async fetchOrders() {
    this.setData({ loading: true });
    try {
      const status = this.data.activeTab;
      const res = await request<any[]>({
        url: `/v1/client/orders${status ? `?status=${status}` : ''}`,
      });
      this.setData({ orders: res || [] });
    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ loading: false });
    }
  },

  onSelectTab(e: any) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab }, () => {
      this.fetchOrders();
    });
  },

  async onPayOrder(e: any) {
    const orderId = e.currentTarget.dataset.id;
    try {
      const payRes = await request<any>({
        url: `/v1/client/orders/${orderId}/pay`,
        method: 'POST',
      });

      const { payParams } = payRes;
      wx.requestPayment({
        timeStamp: payParams.timeStamp,
        nonceStr: payParams.nonceStr,
        package: payParams.package,
        signType: payParams.signType as any,
        paySign: payParams.paySign,
        success: () => {
          wx.showToast({ title: '支付成功！', icon: 'success' });
          this.fetchOrders();
        },
        fail: () => {
          wx.showToast({ title: '支付已取消', icon: 'none' });
        },
      });
    } catch (err: any) {
      wx.showToast({ title: err.message || '发起支付失败', icon: 'none' });
    }
  },

  async onCancelOrder(e: any) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '取消订单',
      content: '确定要取消该订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await request({
              url: `/v1/client/orders/${orderId}/cancel`,
              method: 'POST',
            });
            wx.showToast({ title: '订单已取消', icon: 'success' });
            this.fetchOrders();
          } catch (err: any) {
            wx.showToast({ title: err.message || '取消失败', icon: 'none' });
          }
        }
      },
    });
  },
});
