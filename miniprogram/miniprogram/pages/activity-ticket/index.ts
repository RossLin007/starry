// pages/activity-ticket/index.ts
import { request } from '../../utils/request';

Page({
  data: {
    ticketId: '',
    ticket: null as any,
    loading: true,
  },

  onLoad(options: any) {
    const ticketId = options.id || options.code || '';
    this.setData({ ticketId });
    this.fetchTicket(ticketId);
  },

  async fetchTicket(id: string) {
    this.setData({ loading: true });
    try {
      const res = await request<any>({
        url: `/v1/client/activities/tickets/${id}`,
      });
      this.setData({ ticket: res });
    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ loading: false });
    }
  },

  onSaveTicket() {
    wx.showToast({
      title: '已生成凭证，可截屏保存',
      icon: 'success',
    });
  },

  onBackHome() {
    wx.switchTab({
      url: '/pages/home/index',
    });
  },
});
