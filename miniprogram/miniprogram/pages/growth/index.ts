// pages/growth/index.ts
import { request } from '../../utils/request';

Page({
  data: {
    growth: null as any,
    loading: true,
    calendarDays: [] as any[],
  },

  onLoad() {
    this.fetchGrowth();
  },

  onShow() {
    this.fetchGrowth();
  },

  async fetchGrowth() {
    this.setData({ loading: true });
    try {
      const res = await request<any>({
        url: '/v1/client/checkins/growth',
      });
      this.setData({ growth: res });
      this.generateCalendar(res.checkinDates || []);
    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ loading: false });
    }
  },

  generateCalendar(checkinDates: string[]) {
    const set = new Set(checkinDates);
    const days = [];
    const today = new Date();
    // 生成过去 30 天的打卡热力点
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      days.push({
        date: dateStr,
        dayNum: d.getDate(),
        isChecked: set.has(dateStr),
      });
    }
    this.setData({ calendarDays: days });
  },

  onTapCheckin() {
    wx.navigateTo({
      url: '/pages/checkin/index',
    });
  },
});
