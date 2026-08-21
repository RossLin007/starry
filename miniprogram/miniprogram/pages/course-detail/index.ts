// pages/course-detail/index.ts
import { request } from '../../utils/request';

Page({
  data: {
    courseId: '',
    course: null as any,
    loading: true,
  },

  onLoad(options: any) {
    const courseId = options.id || '';
    this.setData({ courseId });
    this.fetchCourseDetail(courseId);
  },

  async fetchCourseDetail(id: string) {
    this.setData({ loading: true });
    try {
      const res = await request<any>({
        url: `/v1/client/courses/${id}`,
      });
      this.setData({ course: res });
    } catch (err) {
      console.error('Fetch course detail failed', err);
    } finally {
      this.setData({ loading: false });
    }
  },

  onTapEnroll() {
    if (!this.data.courseId) return;
    wx.navigateTo({
      url: `/pages/enroll/index?id=${this.data.courseId}`,
    });
  },

  onTapEnterStudy() {
    wx.switchTab({
      url: '/pages/learn/index',
    });
  },
});
