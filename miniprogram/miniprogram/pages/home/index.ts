// pages/home/index.ts
// 100% 严格对齐 docs/Design/prototype-v3/home.html 原型规范
import { request } from '../../utils/request';

const DEFAULT_HOME_DATA = {
  brandQuote: {
    brandName: '若星空间',
    lede: [
      '在一餐一饭、',
      '一桌一椅之间，',
      '回到更健康、更清明、',
      '更有觉知的生活。',
    ],
    meta: '每一个心灵觉醒的人，都是一颗星。一颗星不耀眼，但很多星，就是黑夜里的光。',
  },
  activeStudy: {
    courseId: 'c_active',
    category: '生活料理 · 第 12 期',
    title: '把一日三餐，过成修行',
    progressPercent: 25,
    coverUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
  },
  activeActivity: {
    activityId: 'a_active',
    title: '初秋茶会',
    location: '若星莘庄空间',
    startTime: '9 月 7 日（周日）14:00',
    coverUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600',
  },
  onlineCourses: [
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
  ],
  offlineActivities: [
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
  ],
  featuredStories: [
    {
      id: 's1',
      title: '从厨房开始，一家人的改变',
      summary: '学习料理课的第三个月，阿玲家里的餐桌变了。不再点外卖的周末，孩子开始跟着她一起揉面……',
      authorName: '学员 阿玲 · 料理课第 9 期',
      coverUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600',
    },
  ],
  featuredGoods: [
    {
      id: 'g1',
      title: '纯燕麦奶 · 无糖原味',
      category: '若心拾光',
      price: 15.9,
      unit: '/ 1L',
      sourceName: '若心拾光',
      coverUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600',
      targetAppId: 'wx_mock_goods_app',
    },
    {
      id: 'g2',
      title: '武夷肉桂 · 岩茶小罐',
      category: '若心拾光',
      price: 68,
      unit: '/ 50g',
      sourceName: '若心拾光',
      coverUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600',
      targetAppId: 'wx_mock_goods_app',
    },
  ],
};

Page({
  data: {
    homeData: DEFAULT_HOME_DATA,
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
      if (res) {
        this.setData({ homeData: res });
      }
    } catch (err) {
      console.warn('Backend server not reachable, using offline prototype mock data');
      this.setData({ homeData: DEFAULT_HOME_DATA });
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
