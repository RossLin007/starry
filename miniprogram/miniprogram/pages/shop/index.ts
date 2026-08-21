// pages/shop/index.ts
// 100% 严格对齐 docs/Design/prototype-v3/shop.html 原型规范
import { request } from '../../utils/request';

Page({
  data: {
    shopIntro: '认真挑选的素食好物，由合作店铺直供。下单将前往第三方小程序完成。',
    categories: ['全部', '礼品订制', '豆制品', '谷物杂粮', '菌菇干货', '植物奶', '茶饮', '零食'],
    activeCategory: '全部',
    goods: [] as any[],
    loading: true,
    showGoodsModal: false,
    selectedGoods: null as any,
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
              title: '老豆腐 · 盐卤点浆',
              desc: '清晨现做，豆香扎实，口感紧实有回甘',
              category: '豆制品',
              price: 8.8,
              unit: '/ 400g',
              sourceName: '若心拾光',
              coverUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
              thirdPartyAppId: 'wx_mock_shop_appid',
            },
            {
              id: 'g2',
              title: '有机糙米 · 五常产地',
              desc: '带胚芽的糙米，慢慢咀嚼有淡淡麦香',
              category: '谷物杂粮',
              price: 19.9,
              unit: '/ 1kg',
              sourceName: '若心拾光',
              coverUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',
              thirdPartyAppId: 'wx_mock_shop_appid',
            },
            {
              id: 'g3',
              title: '香菇 · 古田厚肉菇',
              desc: '菇伞厚实，煲汤提鲜，半斤一袋',
              category: '菌菇干货',
              price: 29.9,
              unit: '/ 250g',
              sourceName: '若心拾光',
              coverUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
              thirdPartyAppId: 'wx_mock_shop_appid',
            },
            {
              id: 'g4',
              title: '纯燕麦奶 · 无糖原味',
              desc: '只用水和燕麦，淡淡的谷物甜',
              category: '植物奶',
              price: 15.9,
              unit: '/ 1L',
              sourceName: '若心拾光',
              coverUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600',
              thirdPartyAppId: 'wx_mock_shop_appid',
            },
            {
              id: 'g5',
              title: '武夷肉桂 · 岩茶小罐',
              desc: '桂皮香显，茶汤橙黄，一罐约十泡',
              category: '茶饮',
              price: 68,
              unit: '/ 50g',
              sourceName: '若心拾光',
              coverUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600',
              thirdPartyAppId: 'wx_mock_shop_appid',
            },
            {
              id: 'g6',
              title: '黑芝麻丸 · 九蒸九晒',
              desc: '黑芝麻与枣泥的紧实小丸，一天一颗',
              category: '零食',
              price: 39.9,
              unit: '/ 15 颗',
              sourceName: '若心拾光',
              coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
              thirdPartyAppId: 'wx_mock_shop_appid',
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
    if (goods?.thirdPartyAppId) {
      wx.navigateToMiniProgram({
        appId: goods.thirdPartyAppId,
        path: goods.thirdPartyPath || '',
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

  onTapGiftContact() {
    wx.showModal({
      title: '伴手礼定制咨询',
      content: '若星空间将为你一对一沟通定制方案，请点击确定联系客服。',
      confirmText: '确定联系',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '正在唤起官方客服…',
            icon: 'none',
          });
        }
      },
    });
  },
});
