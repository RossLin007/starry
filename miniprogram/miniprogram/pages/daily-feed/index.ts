// pages/daily-feed/index.ts
import { request } from '../../utils/request';

Page({
  data: {
    daily: null as any,
    loading: true,
    isPlayingAudio: false,
  },

  onLoad() {
    this.fetchDaily();
  },

  async fetchDaily() {
    this.setData({ loading: true });
    try {
      const res = await request<any>({
        url: '/v1/client/contents/daily',
      });
      this.setData({ daily: res });
    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ loading: false });
    }
  },

  onToggleAudio() {
    this.setData({ isPlayingAudio: !this.data.isPlayingAudio });
    wx.showToast({
      title: this.data.isPlayingAudio ? '正在播放伴读音频' : '已暂停音频',
      icon: 'none',
    });
  },

  onSaveQuote() {
    wx.showToast({
      title: '已生成日签，可截屏保存',
      icon: 'success',
    });
  },
});
