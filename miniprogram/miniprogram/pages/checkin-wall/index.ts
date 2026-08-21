// pages/checkin-wall/index.ts
import { request } from '../../utils/request';

Page({
  data: {
    checkins: [] as any[],
    loading: true,
  },

  onLoad() {
    this.fetchFeatured();
  },

  onShow() {
    this.fetchFeatured();
  },

  async fetchFeatured() {
    this.setData({ loading: true });
    try {
      const res = await request<any[]>({
        url: '/v1/client/checkins/featured',
      });
      if (res && res.length > 0) {
        this.setData({ checkins: res });
      } else {
        this.setData({
          checkins: [
            {
              id: 'c1',
              user: { nickname: '静怡', avatarUrl: '' },
              course: { title: '21天空间生活整理营' },
              content: '今天完成了衣橱的第一轮断舍离，舍弃了 12 件三年没穿过的衣服。衣橱留白后，呼吸都顺畅了许多。',
              images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600'],
              adminComment: '给衣橱留白，就是在给未来的生活腾出新的可能性。很棒的觉察！',
              createdAt: '2026-08-21',
            },
          ],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ loading: false });
    }
  },

  onTapCheckin() {
    wx.navigateTo({
      url: '/pages/checkin/index',
    });
  },
});
