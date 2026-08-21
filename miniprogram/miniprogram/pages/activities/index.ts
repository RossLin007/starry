// pages/activities/index.ts
import { request } from '../../utils/request';

const DEFAULT_ACTIVITIES = [
  {
    id: 'act1',
    title: '若星生活雅集 · 秋日器物收纳工作坊',
    activityType: 'OFFLINE',
    location: '杭州市西湖区若星空间美学馆',
    price: 199,
    coverUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600',
    startTime: '2026-09-12 14:00',
    maxParticipants: 16,
    currentParticipants: 12,
  },
  {
    id: 'act2',
    title: '《整理的艺术》线上深度共读与心念研讨',
    activityType: 'ONLINE',
    location: '腾讯会议',
    price: 0,
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600',
    startTime: '2026-09-18 19:30',
    maxParticipants: 50,
    currentParticipants: 38,
  },
];

Page({
  data: {
    types: [
      { key: '', label: '全部' },
      { key: 'OFFLINE', label: '线下工作坊' },
      { key: 'ONLINE', label: '线上共创' },
    ],
    activeType: '',
    activities: [] as any[],
    loading: true,
  },

  onLoad() {
    this.fetchActivities();
  },

  onShow() {
    this.fetchActivities();
  },

  async fetchActivities() {
    this.setData({ loading: true });
    try {
      const type = this.data.activeType;
      const res = await request<any[]>({
        url: `/v1/client/activities${type ? `?type=${type}` : ''}`,
      });

      if (res && res.length > 0) {
        this.setData({ activities: res });
      } else {
        this.setData({ activities: DEFAULT_ACTIVITIES });
      }
    } catch (err) {
      console.warn('Backend server not reachable, using offline activities mock data');
      this.setData({ activities: DEFAULT_ACTIVITIES });
    } finally {
      this.setData({ loading: false });
    }
  },

  onSelectType(e: any) {
    const type = e.currentTarget.dataset.type;
    this.setData({ activeType: type }, () => {
      this.fetchActivities();
    });
  },

  onTapActivity(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activity-detail/index?id=${id}`,
    });
  },
});
