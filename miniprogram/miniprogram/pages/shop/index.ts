// pages/shop/index.ts
import { request } from '../../utils/request';

Page({
  data: {
    categories: ['全部', '生活器物', '收纳工具', '推荐好书', '若星周边'],
    activeCategory: '全部',
    goods: [] as any[],
    loading: true,
  },

  onLoad() {
    this.fetchGoods();
  },

  onShow() {
    this.fetchGoods();
  },

  async fetchGoods() {
    this.setData({ loading: true });
    try {
      const res = await request<any[]>({
        url: '/v1/client/shop/goods',
      });

      if (res && res.length > 0) {
        this.setData({ goods: res });
      } else {
        this.setData({
          goods: [
            {
              id: 'g1',
              title: '若星定制 · 天然亚麻衣物收纳盒（三件套）',
              category: '收纳工具',
              price: 128,
              originalPrice: 158,
              coverUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600',
              thirdPartyAppId: 'wx_mock_shop_appid',
              thirdPartyPath: 'pages/goods/detail?id=1',
            },
            {
              id: 'g2',
              title: '《整理的艺术与心念》主理人亲笔签名版',
              category: '推荐好书',
              price: 68,
              originalPrice: 88,
              coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600',
              thirdPartyAppId: 'wx_mock_shop_appid',
              thirdPartyPath: 'pages/goods/detail?id=2',
            },
            {
              id: 'g3',
              title: '若星雅集 · 粗陶素烧品茗杯',
              category: '生活器物',
              price: 89,
              originalPrice: 119,
              coverUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600',
              thirdPartyAppId: 'wx_mock_shop_appid',
              thirdPartyPath: 'pages/goods/detail?id=3',
            },
          ],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ loading: false });
    }
  },

  onSelectCategory(e: any) {
    const cat = e.currentTarget.dataset.cat;
    this.setData({ activeCategory: cat });
  },

  onTapGoods(e: any) {
    const item = e.currentTarget.dataset.item;
    wx.showModal({
      title: '甄选好物跳转',
      content: `若星空间不做电商闭环交易。即将跳转至第三方合作小程序【${item.title}】选购。`,
      confirmText: '前往选购',
      cancelText: '再看看',
      success: (res) => {
        if (res.confirm) {
          if (item.thirdPartyAppId) {
            wx.navigateToMiniProgram({
              appId: item.thirdPartyAppId,
              path: item.thirdPartyPath || 'pages/index',
              fail: () => {
                wx.showToast({ title: '已模拟跳转第三方选购', icon: 'none' });
              },
            });
          } else {
            wx.showToast({ title: '已模拟跳转第三方选购', icon: 'none' });
          }
        }
      },
    });
  },
});
