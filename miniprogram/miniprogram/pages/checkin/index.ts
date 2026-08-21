// pages/checkin/index.ts
import { request } from '../../utils/request';

Page({
  data: {
    courseId: '',
    lessonId: '',
    courseTitle: '',
    content: '',
    images: [] as string[],
    submitting: false,
  },

  onLoad(options: any) {
    if (options.courseId) this.setData({ courseId: options.courseId });
    if (options.lessonId) this.setData({ lessonId: options.lessonId });
    if (options.courseTitle) this.setData({ courseTitle: decodeURIComponent(options.courseTitle) });
  },

  onInputContent(e: any) {
    this.setData({ content: e.detail.value });
  },

  onChooseImage() {
    // 模拟选择整理前后的实践照片
    const mockImgs = [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600',
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600',
    ];
    const newImg = mockImgs[this.data.images.length % mockImgs.length];
    this.setData({
      images: [...this.data.images, newImg],
    });
  },

  async onSubmit() {
    if (!this.data.content.trim()) {
      wx.showToast({ title: '请输入打卡心得', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    try {
      await request<any>({
        url: '/v1/client/checkins',
        method: 'POST',
        data: {
          courseId: this.data.courseId || undefined,
          lessonId: this.data.lessonId || undefined,
          content: this.data.content,
          images: this.data.images,
        },
      });

      wx.showToast({
        title: '打卡成功 +10积分',
        icon: 'success',
      });

      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/checkin-wall/index',
        });
      }, 1200);
    } catch (err: any) {
      wx.showToast({
        title: err.message || '打卡提交失败',
        icon: 'none',
      });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
