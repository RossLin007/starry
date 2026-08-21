// pages/checkin-wall/index.ts
import { request } from '../../utils/request';

const DEFAULT_CHECKINS = [
  {
    id: 'c1',
    user: { nickname: '静怡', avatarUrl: '' },
    course: { title: '21天空间生活整理营' },
    content: '今天完成了衣橱的第一轮断舍离，舍弃了 12 件三年没穿过的衣服。衣橱留白后，呼吸都顺畅了许多。',
    images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600'],
    adminComment: '给衣橱留白，就是在给未来的生活腾出新的可能性。很棒的觉察！',
    createdAt: '2026-08-21',
  },
  {
    id: 'c2',
    user: { nickname: '心远', avatarUrl: '' },
    course: { title: '生活料理 · 第 12 期' },
    content: '晚餐为家人煮了一锅番茄杂粮饭，慢火细熬，孩子吃得干干净净。日常的修行就在这一碗米饭里。',
    images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'],
    adminComment: '烟火气中最抚人心，米饭的香气就是家的温暖。',
    createdAt: '2026-08-20',
  },
];

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
      const list = res && res.length > 0 ? res : DEFAULT_CHECKINS;

      const formatted = list.map((item: any) => ({
        ...item,
        avatarLetter: item.user?.nickname ? item.user.nickname.substring(0, 1) : '星',
        courseTitle: item.course?.title || '日常整理实践',
        userNickname: item.user?.nickname || '若星学员',
      }));

      this.setData({ checkins: formatted });
    } catch (err) {
      console.warn('Backend server not reachable, using offline checkin mock data');
      const formatted = DEFAULT_CHECKINS.map((item: any) => ({
        ...item,
        avatarLetter: item.user?.nickname ? item.user.nickname.substring(0, 1) : '星',
        courseTitle: item.course?.title || '日常整理实践',
        userNickname: item.user?.nickname || '若星学员',
      }));
      this.setData({ checkins: formatted });
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
