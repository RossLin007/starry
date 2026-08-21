// pages/courses/index.ts
// 100% 严格对齐 docs/Design/prototype-v3/courses.html 原型规范
import { request } from '../../utils/request';

Page({
  data: {
    activeMode: 'online', // 'online' | 'offline'
    categories: ['全部', '拾光读书', '空间管理', '生活料理'],
    activeCategory: '全部',
    catLede: '在一餐一饭、一桌一椅之间，回到更有觉知的生活。',
    courses: [] as any[],
    offlineActivities: [] as any[],
    loading: true,
  },

  onLoad() {
    this.fetchData();
  },

  onShow() {
    this.fetchData();
  },

  async fetchData() {
    this.setData({ loading: true });
    try {
      if (this.data.activeMode === 'online') {
        const category = this.data.activeCategory === '全部' ? '' : this.data.activeCategory;
        const res = await request<any[]>({
          url: `/v1/client/courses${category ? `?category=${encodeURIComponent(category)}` : ''}`,
        });
        const list = res && res.length > 0 ? res : [
          {
            id: 'c1',
            category: '拾光读书 · 第 3 期',
            title: '《瓦尔登湖》· 在书里遇见同频的人',
            coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
            courseStartTime: '9 月 6 日起 · 共 8 课 · 线上',
            subtitle: '每周六晚 · 腾讯会议直播',
            price: 299,
            tagText: '填写报名',
            tagClass: '',
          },
          {
            id: 'c2',
            category: '空间管理 · 第 7 期',
            title: '整理的不是物品，是心的秩序',
            coverUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600',
            courseStartTime: '9 月 10 日起 · 共 8 课 · 线上',
            subtitle: '每周三晚 · 腾讯会议直播',
            price: 399,
            tagText: '报名已截止',
            tagClass: 'disabled',
          },
          {
            id: 'c3',
            category: '生活料理 · 第 12 期',
            title: '把一日三餐，过成修行',
            coverUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
            courseStartTime: '9 月 3 日起 · 共 8 课 · 线上',
            subtitle: '每周四晚 · 腾讯会议直播',
            price: 499,
            tagText: '您已报名',
            tagClass: 'green',
          },
        ];
        this.setData({ courses: list });
      } else {
        const res = await request<any[]>({
          url: '/v1/client/activities',
        });
        const list = res && res.length > 0 ? res : [
          {
            id: 'a1',
            tag: '烘焙',
            micro: '线下 · 莘庄空间 · 为期 3 天',
            title: '食光烘焙',
            timeStr: '9 月 19 日起 · 连续 3 天',
            coverUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
          },
          {
            id: 'a2',
            tag: '茶会',
            micro: '线下 · 莘庄空间',
            title: '初秋茶会',
            timeStr: '9 月 7 日（周日）14:00',
            coverUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600',
          },
          {
            id: 'a3',
            tag: '亲子',
            micro: '线下 · 莘庄空间',
            title: '少年茶会 · 孩子的一盏茶',
            timeStr: '9 月 14 日（周日）10:00',
            coverUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600',
          },
        ];
        this.setData({ offlineActivities: list });
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ loading: false });
    }
  },

  onSwitchMode(e: any) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ activeMode: mode }, () => {
      this.fetchData();
    });
  },

  onSelectCategory(e: any) {
    const category = e.currentTarget.dataset.category;
    this.setData({ activeCategory: category }, () => {
      this.fetchData();
    });
  },

  onTapCourse(e: any) {
    const courseId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/course-detail/index?id=${courseId}`,
    });
  },

  onTapActivity(e: any) {
    const actId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activity-detail/index?id=${actId}`,
    });
  },
});
