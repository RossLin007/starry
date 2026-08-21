// pages/activity-detail/index.ts
import { request } from '../../utils/request';

Page({
  data: {
    activityId: '',
    activity: null as any,
    loading: true,
    submitting: false,
  },

  onLoad(options: any) {
    const activityId = options.id || '';
    this.setData({ activityId });
    this.fetchDetail(activityId);
  },

  async fetchDetail(id: string) {
    this.setData({ loading: true });
    try {
      const res = await request<any>({
        url: `/v1/client/activities/${id}`,
      });
      this.setData({ activity: res });
    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ loading: false });
    }
  },

  async onTapEnroll() {
    this.setData({ submitting: true });
    try {
      const res = await request<any>({
        url: `/v1/client/activities/${this.data.activityId}/enroll`,
        method: 'POST',
      });

      wx.showToast({
        title: '报名成功！',
        icon: 'success',
      });

      setTimeout(() => {
        wx.navigateTo({
          url: `/pages/activity-ticket/index?id=${res.enrollmentId}`,
        });
      }, 1200);
    } catch (err: any) {
      wx.showToast({
        title: err.message || '报名失败',
        icon: 'none',
      });
    } finally {
      this.setData({ submitting: false });
    }
  },

  onTapViewTicket() {
    if (!this.data.activity?.enrollment?.enrollmentId) return;
    wx.navigateTo({
      url: `/pages/activity-ticket/index?id=${this.data.activity.enrollment.enrollmentId}`,
    });
  },
});
