// pages/learn/index.ts
// 100% 严格对齐 docs/Design/prototype-v3/study.html 原型规范
import { request } from '../../utils/request';

const DEFAULT_COURSE_DETAIL = {
  courseId: 'c1',
  title: '生活料理 · 第 12 期',
  subtitle: '把一日三餐，过成修行',
  category: '生活料理',
  progressPercent: 25,
  lessons: [
    {
      id: 'l1',
      title: '第 1 课：厨房的心念与秩序',
      dayNumber: 1,
      isUnlocked: true,
      isCompleted: true,
      content: '整理厨房的第一步，是看见自己与食物的关系。从今天开始，试着在做饭前深呼吸三次。',
    },
    {
      id: 'l2',
      title: '第 2 课：一碗好米饭的温度',
      dayNumber: 2,
      isUnlocked: true,
      isCompleted: false,
      content: '淘米时的专注，水与米的比例，火候的守候。把日常最平凡的一餐，当成对自己的款待。',
    },
    {
      id: 'l3',
      title: '第 3 课：刀工与心绪的安顿',
      dayNumber: 3,
      isUnlocked: false,
      isCompleted: false,
      content: '切菜的节律，是指尖与食材的对话。',
    },
    {
      id: 'l4',
      title: '第 4 课：留白与装盘美学',
      dayNumber: 4,
      isUnlocked: false,
      isCompleted: false,
      content: '器皿的选择与盘中的呼吸感。',
    },
  ],
};

Page({
  data: {
    activeCourses: [] as any[],
    completedCourses: [] as any[],
    currentCourse: null as any,
    courseDetail: null as any,
    currentTab: 'active', // active | completed
    loading: true,
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
          activeCourses: [
            {
              courseId: 'c1',
              title: '生活料理 · 第 12 期',
              progressPercent: 25,
            },
          ],
          completedCourses: [],
          currentCourse: {
            courseId: 'c1',
            title: '生活料理 · 第 12 期',
            progressPercent: 25,
          },
          courseDetail: DEFAULT_COURSE_DETAIL,
        });
      }
    } catch (err) {
      console.warn('Backend server not reachable, using offline study mock data');
      this.setData({
        activeCourses: [
          {
            courseId: 'c1',
            title: '生活料理 · 第 12 期',
            progressPercent: 25,
          },
        ],
        completedCourses: [],
        currentCourse: {
          courseId: 'c1',
          title: '生活料理 · 第 12 期',
          progressPercent: 25,
        },
        courseDetail: DEFAULT_COURSE_DETAIL,
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async fetchCourseDetail(courseId: string) {
    try {
      const res = await request<any>({
        url: `/v1/client/study/courses/${courseId}`,
      });
      if (res) {
        this.setData({ courseDetail: res });
      }
    } catch (err) {
      console.error(err);
      this.setData({ courseDetail: DEFAULT_COURSE_DETAIL });
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
      this.fetchStudyCourses();
    } catch (err) {
      wx.showToast({
        title: '打卡完成！(离线体验)',
        icon: 'success',
      });
      this.setData({ showLessonModal: false });
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
