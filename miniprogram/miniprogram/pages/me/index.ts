// pages/me/index.ts
import { request } from '../../utils/request';

Page({
  data: {
    user: null as any,
    loading: true,
    avatarLetter: '星',
    isVip: false,
    vipExpireText: '',
    showAddressModal: false,
    showContactModal: false,
    addressForm: {
      name: '',
      phone: '',
      province: '浙江省',
      city: '杭州市',
      district: '西湖区',
      address: '',
    },
  },

  onShow() {
    this.fetchProfile();
  },

  async fetchProfile() {
    this.setData({ loading: true });
    try {
      const res = await request<any>({
        url: '/v1/client/auth/profile',
      });
      const isVip = res && (res.memberTier === 'DEEP' || res.memberTier === 'STAR_MEMBER');
      const avatarLetter = res?.nickname ? res.nickname.substring(0, 1) : '星';
      const expireDate = res?.memberExpireAt ? res.memberExpireAt.substring(0, 10) : '';
      const vipExpireText = isVip
        ? (expireDate ? `有效期至：${expireDate}` : '长期尊享')
        : '开通享全场课程 8.8 折与雅集礼盒';

      this.setData({
        user: res,
        isVip,
        avatarLetter,
        vipExpireText,
      });

      if (res?.shippingAddress) {
        this.setData({ addressForm: res.shippingAddress });
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ loading: false });
    }
  },

  onNavTo(e: any) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  },

  onOpenAddress() {
    this.setData({ showAddressModal: true });
  },

  onCloseAddress() {
    this.setData({ showAddressModal: false });
  },

  onInputAddress(e: any) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`addressForm.${field}`]: e.detail.value,
    });
  },

  async onSaveAddress() {
    if (!this.data.addressForm.name || !this.data.addressForm.phone || !this.data.addressForm.address) {
      wx.showToast({ title: '请填写完整收货信息', icon: 'none' });
      return;
    }
    try {
      await request({
        url: '/v1/client/auth/address',
        method: 'PUT',
        data: this.data.addressForm,
      });
      wx.showToast({ title: '收货地址已保存', icon: 'success' });
      this.setData({ showAddressModal: false });
      this.fetchProfile();
    } catch (err: any) {
      wx.showToast({ title: err.message || '保存失败', icon: 'none' });
    }
  },

  onOpenContact() {
    this.setData({ showContactModal: true });
  },

  onCloseContact() {
    this.setData({ showContactModal: false });
  },
});
