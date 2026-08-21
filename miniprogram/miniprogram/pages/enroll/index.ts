// pages/enroll/index.ts
import { request } from '../../utils/request';

Page({
  data: {
    courseId: '',
    course: null as any,
    formData: {
      goal: '希望建立清爽的厨房与衣橱秩序',
      experience: '整理新手',
    },
    shippingAddress: {
      name: '若星学员',
      phone: '13800138000',
      province: '浙江省',
      city: '杭州市',
      district: '西湖区',
      address: '文三路若星空间 101 室',
    },
    submitting: false,
  },

  onLoad(options: any) {
    const courseId = options.id || '';
    this.setData({ courseId });
    this.fetchCourse(courseId);
    this.fetchUserAddress();
  },

  async fetchCourse(id: string) {
    try {
      const res = await request<any>({
        url: `/v1/client/courses/${id}`,
      });
      this.setData({ course: res });
    } catch (err) {
      console.error(err);
    }
  },

  async fetchUserAddress() {
    try {
      const res = await request<any>({
        url: '/v1/client/auth/address',
      });
      if (res && res.name) {
        this.setData({ shippingAddress: res });
      }
    } catch (e) {
      // 忽略未设置
    }
  },

  onInputGoal(e: any) {
    this.setData({
      'formData.goal': e.detail.value,
    });
  },

  onInputAddress(e: any) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`shippingAddress.${field}`]: e.detail.value,
    });
  },

  async onSubmitEnroll() {
    if (!this.data.shippingAddress.name || !this.data.shippingAddress.phone || !this.data.shippingAddress.address) {
      return wx.showToast({ title: '请完整填写物料收货信息', icon: 'none' });
    }

    this.setData({ submitting: true });
    try {
      await request({
        url: `/v1/client/courses/${this.data.courseId}/enroll`,
        method: 'POST',
        data: {
          formData: this.data.formData,
          shippingAddress: this.data.shippingAddress,
        },
      });

      wx.showToast({
        title: '报名成功！',
        icon: 'success',
        duration: 1500,
      });

      setTimeout(() => {
        wx.switchTab({
          url: '/pages/learn/index',
        });
      }, 1500);
    } catch (err: any) {
      wx.showToast({
        title: err.message || '报名失败，请稍后重试',
        icon: 'none',
      });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
