// pages/home/index.ts
import { request } from '../../utils/request';

Page({
  data: {
    homeData: null as any,
    loading: true,
    showGoodsModal: false,
    selectedGoods: null as any,
  },

  onLoad() {
    this.fetchHomeData();
  },

  onShow() {
    this.fetchHomeData();
  },

  async fetchHomeData() {
    try {
      const res = await request<any>({
        url: '/v1/client/home',
      });
      this.setData({ homeData: res });
    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ loading: false });
    }
  },

  onTapEnterStudy() {
    wx.switchTab({
      url: '/pages/learn/index',
    });
  },

  onTapCourse(e: any) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      wx.navigateTo({
        url: `/pages/course-detail/index?id=${id}`,
      });
    }
  },

  onTapAllCourses() {
    wx.switchTab({
      url: '/pages/courses/index',
    });
  },

  onTapActivity(e: any) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      wx.navigateTo({
        url: `/pages/activity-detail/index?id=${id}`,
      });
    }
  },

  onTapAllActivities() {
    wx.navigateTo({
      url: '/pages/activities/index',
    });
  },

  onTapStory(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: '正在呈现学员温润故事',
      icon: 'none',
    });
  },

  onTapGoods(e: any) {
    const item = e.currentTarget.dataset.item;
    this.setData({
      selectedGoods: item,
      showGoodsModal: true,
    });
  },

  onCloseGoodsModal() {
    this.setData({
      showGoodsModal: false,
      selectedGoods: null,
    });
  },

  onConfirmOpenMini() {
    const goods = this.data.selectedGoods;
    this.onCloseGoodsModal();
    if (goods?.targetAppId) {
      wx.navigateToMiniProgram({
        appId: goods.targetAppId,
        path: goods.targetPath || '',
        fail: () => {
          wx.showToast({
            title: `即将打开「${goods.sourceName || '第三方'}」小程序`,
            icon: 'none',
          });
        },
      });
    } else {
      wx.showToast({
        title: `即将打开「${goods?.sourceName || '第三方'}」小程序`,
        icon: 'none',
      });
    }
  },

  onTapAllShop() {
    wx.switchTab({
      url: '/pages/shop/index',
    });
  },

  onTapMember() {
    wx.navigateTo({
      url: '/pages/member/index',
    });
  },
});
