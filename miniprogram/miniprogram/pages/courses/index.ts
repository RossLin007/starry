// pages/courses/index.ts
import { request } from '../../utils/request';

Page({
  data: {
    categories: ['全部', '空间生活整理营', '拾光共读会', '烘焙与厨艺', '身心觉察'],
    activeCategory: '全部',
    courses: [] as any[],
    loading: true,
  },

  onLoad() {
    this.fetchCourses();
  },

  onShow() {
    this.fetchCourses();
  },

  async fetchCourses() {
    this.setData({ loading: true });
    try {
      const category = this.data.activeCategory === '全部' ? '' : this.data.activeCategory;
      const res = await request<any[]>({
        url: `/v1/client/courses${category ? `?category=${encodeURIComponent(category)}` : ''}`,
      });
      if (res && res.length > 0) {
        this.setData({ courses: res });
      } else {
        // 默认保底展示
        this.setData({
          courses: [
            {
              id: 'c1',
              title: '21天空间生活整理营 · 第 12 期',
              subtitle: '整理空间，整理心念，建立持久清爽的家居秩序',
              category: '空间生活整理营',
              coverUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600',
              price: 980,
              currentStudents: 24,
              maxStudents: 30,
              courseStartTime: '2026-09-01',
            },
            {
              id: 'c2',
              title: '拾光共读会 · 第 8 期《瓦尔登湖》',
              subtitle: '在嘈杂的世界里，找回内心的宁静与笃定',
              category: '拾光共读会',
              price: 299,
              currentStudents: 42,
              maxStudents: 50,
              courseStartTime: '2026-09-10',
            },
          ],
        });
      }
    } catch (err) {
      console.error('Fetch courses error', err);
    } finally {
      this.setData({ loading: false });
    }
  },

  onSelectCategory(e: any) {
    const category = e.currentTarget.dataset.category;
    this.setData({ activeCategory: category }, () => {
      this.fetchCourses();
    });
  },

  onTapCourse(e: any) {
    const courseId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/course-detail/index?id=${courseId}`,
    });
  },
});
