// pages/member/index.ts
import { request } from '../../utils/request';

Page({
  data: {
    benefits: null as any,
    loading: true,
    paying: false,
  },

  onLoad() {
    this.fetchBenefits();
  },

  async fetchBenefits() {
    this.setData({ loading: true });
    try {
      const res = await request<any>({
        url: '/v1/client/members/benefits',
      });
      this.setData({ benefits: res });
    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ loading: false });
    }
  },

  async onTapPurchase() {
    this.setData({ paying: true });
    try {
      // 1. 创建星愿年度会员订单
      const orderRes = await request<any>({
        url: '/v1/client/members/orders',
        method: 'POST',
      });

      const orderId = orderRes.orderId;

      // 2. 发起微信支付获取调起参数
      const payRes = await request<any>({
        url: `/v1/client/orders/${orderId}/pay`,
        method: 'POST',
      });

      const { payParams } = payRes;

      // 3. 唤起微信小程序原生支付
      wx.requestPayment({
        timeStamp: payParams.timeStamp,
        nonceStr: payParams.nonceStr,
        package: payParams.package,
        signType: payParams.signType as any,
        paySign: payParams.paySign,
        success: () => {
          wx.showToast({
            title: '恭喜成为星愿会员！',
            icon: 'success',
          });
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/me/index',
            });
          }, 1500);
        },
        fail: () => {
          // 模拟环境或取消支付
          wx.showToast({
            title: '订单已生成，可前往待支付',
            icon: 'none',
          });
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/orders/index',
            });
          }, 1200);
        },
      });
    } catch (err: any) {
      wx.showToast({
        title: err.message || '下单失败',
        icon: 'none',
      });
    } finally {
      this.setData({ paying: false });
    }
  },
});
