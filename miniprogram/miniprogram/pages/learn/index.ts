// pages/learn/index.ts
import { request } from '../../utils/request';

Page({
  data: {
    activeCourses: [] as any[],
    completedCourses: [] as any[],
    currentCourse: null as any,
    courseDetail: null as any,
    currentTab: 'active', // active | completed
    loading: true,
    // 课节阅读弹窗
    showLessonModal: false,
    activeLesson: null as any,
    completing: false,
  },

  onShow() {
    this.fetchStudyCourses();
  },

  async fetchStudyCourses() {
    this.setData({ loading: true });
    try {
      const res = await request<any>({
        url: '/v1/client/study/courses',
      });

      if (res && res.activeList && res.activeList.length > 0) {
        this.setData({
          activeCourses: res.activeList,
          completedCourses: res.completedList || [],
          currentCourse: res.activeList[0],
        });
        this.fetchCourseDetail(res.activeList[0].courseId);
      } else {
        this.setData({
          activeCourses: [],
          completedCourses: res?.completedList || [],
          currentCourse: null,
          courseDetail: null,
        });
      }
    } catch (err) {
      console.error('Fetch study courses failed', err);
    } finally {
      this.setData({ loading: false });
    }
  },

  async fetchCourseDetail(courseId: string) {
    try {
      const res = await request<any>({
        url: `/v1/client/study/courses/${courseId}`,
      });
      this.setData({ courseDetail: res });
    } catch (err) {
      console.error(err);
    }
  },

  onSelectCourse(e: any) {
    const course = e.currentTarget.dataset.course;
    this.setData({ currentCourse: course });
    this.fetchCourseDetail(course.courseId);
  },

  onTapLesson(e: any) {
    const lesson = e.currentTarget.dataset.lesson;
    if (!lesson.isUnlocked) {
      return wx.showToast({
        title: '该课节暂未开放解锁',
        icon: 'none',
      });
    }

    this.setData({
      activeLesson: lesson,
      showLessonModal: true,
    });
  },

  onCloseModal() {
    this.setData({ showLessonModal: false });
  },

  async onCompleteLesson() {
    if (!this.data.activeLesson?.id) return;
    this.setData({ completing: true });
    try {
      await request({
        url: `/v1/client/study/lessons/${this.data.activeLesson.id}/complete`,
        method: 'POST',
      });

      wx.showToast({
        title: '打卡完成！',
        icon: 'success',
      });

      this.setData({ showLessonModal: false });
      // 重新拉取最新学习进度
      this.fetchStudyCourses();
    } catch (err) {
      console.error(err);
    } finally {
      this.setData({ completing: false });
    }
  },

  onTapExploreCourses() {
    wx.switchTab({
      url: '/pages/courses/index',
    });
  },
});
