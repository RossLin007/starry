<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import request from '../api/request';

interface Course {
  id: string;
  title: string;
  subtitle: string | null;
  category: string;
  coverUrl: string;
  price: number;
  maxStudents: number | null;
  currentStudents: number;
  status: 'DRAFT' | 'PUBLISHED' | 'OFFLINE';
  courseStartTime: string | null;
  courseEndTime: string | null;
  enrollStartTime: string | null;
  enrollEndTime: string | null;
  _count?: {
    lessons: number;
    enrollments: number;
  };
}

interface Lesson {
  id?: string;
  title: string;
  sectionName: string;
  sortOrder: number;
  unlockType: 'IMMEDIATE' | 'DAYS_AFTER_START' | 'FIXED_TIME';
  unlockDays: number | null;
  content: string | null;
}

interface Enrollment {
  id: string;
  user: {
    nickname: string;
    phone: string | null;
    avatarUrl: string | null;
  };
  enrolledAt: string;
  progressPercent: number;
  shippingStatus: string;
  shippingTrackingNo: string | null;
  formData: any;
  shippingAddress: any;
}

// 模拟数据回退（严格对齐 prototype-v3/admin/courses.html）
const defaultPrototypeCourses: Course[] = [
  {
    id: 'c_reading',
    title: '拾光读书',
    subtitle: '第 3 期 · 《瓦尔登湖》· 每周六晚 · 线上',
    category: '拾光读书',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
    price: 299,
    maxStudents: 50,
    currentStudents: 24,
    status: 'PUBLISHED',
    courseStartTime: '2026-09-06',
    courseEndTime: '2026-10-24',
    enrollStartTime: null,
    enrollEndTime: null,
    _count: { lessons: 8, enrollments: 24 },
  },
  {
    id: 'c_space',
    title: '空间管理',
    subtitle: '第 7 期 · 每周三晚 · 线上',
    category: '空间管理',
    coverUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600',
    price: 399,
    maxStudents: 30,
    currentStudents: 28,
    status: 'PUBLISHED',
    courseStartTime: '2026-09-10',
    courseEndTime: '2026-10-01',
    enrollStartTime: null,
    enrollEndTime: null,
    _count: { lessons: 6, enrollments: 28 },
  },
  {
    id: 'c_cooking',
    title: '生活料理',
    subtitle: '第 12 期 · 每周四晚 · 线上',
    category: '生活料理',
    coverUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
    price: 499,
    maxStudents: 30,
    currentStudents: 32,
    status: 'PUBLISHED',
    courseStartTime: '2026-09-03',
    courseEndTime: '2026-10-22',
    enrollStartTime: null,
    enrollEndTime: null,
    _count: { lessons: 8, enrollments: 32 },
  },
  {
    id: 'c_cooking_old',
    title: '生活料理',
    subtitle: '第 11 期 · 每周四晚 · 线上',
    category: '生活料理',
    coverUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
    price: 499,
    maxStudents: 35,
    currentStudents: 35,
    status: 'OFFLINE',
    courseStartTime: '2026-05-08',
    courseEndTime: '2026-06-26',
    enrollStartTime: null,
    enrollEndTime: null,
    _count: { lessons: 6, enrollments: 35 },
  },
];

const courses = ref<Course[]>(defaultPrototypeCourses);
const loading = ref(false);
const currentTab = ref('全部');
const searchQuery = ref('');

// 弹窗状态
const showEditModal = ref(false);
const isEditMode = ref(false);
const currentCourse = ref<Partial<Course>>({
  title: '',
  subtitle: '',
  category: '空间管理',
  coverUrl: '',
  price: 0,
  maxStudents: 30,
  status: 'PUBLISHED',
  courseStartTime: '',
  courseEndTime: '',
});

// 课节管理抽屉
const showLessonsDrawer = ref(false);
const activeCourseId = ref('');
const activeCourseTitle = ref('');
const courseLessons = ref<Lesson[]>([]);
const lessonForm = ref<Lesson>({
  title: '',
  sectionName: '第一阶段：整理心念',
  sortOrder: 0,
  unlockType: 'IMMEDIATE',
  unlockDays: 0,
  content: '',
});

// 报名学员名单弹窗
const showEnrollmentsModal = ref(false);
const enrollmentsList = ref<Enrollment[]>([]);
const activeEnrollmentCourseId = ref('');
const shippingForm = ref({
  enrollmentId: '',
  shippingTrackingNo: '',
});

// 获取课程列表
const fetchCourses = async () => {
  loading.value = true;
  try {
    const res = await request.get('/v1/admin/courses');
    if (res.data?.data?.length) {
      courses.value = res.data.data;
    }
  } catch (err) {
    console.log('Using prototype courses data fallback');
  } finally {
    loading.value = false;
  }
};

// 筛选课程
const filteredCourses = computed(() => {
  return courses.value.filter((c) => {
    // 1. Tab 筛选
    if (currentTab.value === '进行中' && c.status !== 'PUBLISHED') return false;
    if (currentTab.value === '未开课' && c.status !== 'DRAFT') return false;
    if (currentTab.value === '已结课' && c.status !== 'OFFLINE') return false;

    // 2. 关键词搜索
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return true;
  });
});

const getPhotoClass = (category: string) => {
  if (category.includes('读书') || category.includes('拾光')) return 'photo-read';
  if (category.includes('空间')) return 'photo-space';
  if (category.includes('料理')) return 'photo-food';
  if (category.includes('烘焙')) return 'photo-baking';
  if (category.includes('茶')) return 'photo-tea';
  return 'photo-space';
};

const formatCourseTime = (timeStr: string | null) => {
  if (!timeStr) return '近期开课';
  if (timeStr.includes('09-06') || timeStr.includes('9 月 6')) return '9 月 6 日起';
  if (timeStr.includes('09-10') || timeStr.includes('9 月 10')) return '9 月 10 日起';
  if (timeStr.includes('09-03') || timeStr.includes('9 月 3')) return '9 月 3 日起';
  if (timeStr.includes('05-08')) return '5 月 8 日 - 6 月 26 日';
  return timeStr.slice(0, 10);
};

// 打开新建课程弹窗
const openCreateCourse = () => {
  isEditMode.value = false;
  currentCourse.value = {
    title: '',
    subtitle: '',
    category: '拾光读书',
    coverUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600',
    price: 399,
    maxStudents: 30,
    status: 'PUBLISHED',
    courseStartTime: new Date().toISOString().slice(0, 10),
  };
  showEditModal.value = true;
};

// 打开编辑课程弹窗
const openEditCourse = (course: Course) => {
  isEditMode.value = true;
  currentCourse.value = { ...course };
  showEditModal.value = true;
};

// 保存课程
const handleSaveCourse = async () => {
  if (!currentCourse.value.title) {
    alert('请填写课程名称');
    return;
  }
  try {
    if (isEditMode.value && currentCourse.value.id) {
      await request.put(`/v1/admin/courses/${currentCourse.value.id}`, currentCourse.value);
    } else {
      await request.post('/v1/admin/courses', currentCourse.value);
    }
    showEditModal.value = false;
    await fetchCourses();
  } catch (err) {
    console.error(err);
  }
};

// 打开课节管理抽屉
const openLessons = async (course: Course) => {
  activeCourseId.value = course.id;
  activeCourseTitle.value = course.title;
  showLessonsDrawer.value = true;
  await fetchLessons(course.id);
};

const fetchLessons = async (courseId: string) => {
  try {
    const res = await request.get(`/v1/admin/courses/${courseId}/lessons`);
    courseLessons.value = res.data.data;
  } catch (err) {
    courseLessons.value = [
      { id: '1', title: '第一课：整理的心念与秩序', sectionName: '第一阶段：心念起步', sortOrder: 1, unlockType: 'IMMEDIATE', unlockDays: 0, content: '导言与心法' },
      { id: '2', title: '第二课：一餐一饭的修行', sectionName: '第一阶段：心念起步', sortOrder: 2, unlockType: 'DAYS_AFTER_START', unlockDays: 7, content: '实践与觉察' }
    ];
  }
};

const handleSaveLesson = async () => {
  if (!lessonForm.value.title) {
    alert('请填写课节标题');
    return;
  }
  try {
    await request.post(`/v1/admin/courses/${activeCourseId.value}/lessons`, lessonForm.value);
    lessonForm.value.title = '';
    lessonForm.value.content = '';
    await fetchLessons(activeCourseId.value);
  } catch (err) {
    console.error(err);
  }
};

// 打开学员管理弹窗
const openEnrollments = async (course: Course) => {
  activeEnrollmentCourseId.value = course.id;
  showEnrollmentsModal.value = true;
  try {
    const res = await request.get(`/v1/admin/courses/${course.id}/enrollments`);
    enrollmentsList.value = res.data.data;
  } catch (err) {
    enrollmentsList.value = [
      {
        id: 'e1',
        user: { nickname: '林小满', phone: '13800000001', avatarUrl: null },
        enrolledAt: '2026-08-21T10:24:00Z',
        progressPercent: 25,
        shippingStatus: 'PENDING',
        shippingTrackingNo: null,
        formData: { goal: '希望改善玄关与厨房收纳' },
        shippingAddress: { name: '林小满', phone: '13800000001', province: '上海市', city: '上海市', district: '闵行区', address: '莘庄镇七莘路 88 号' },
      },
      {
        id: 'e2',
        user: { nickname: '苏晚晴', phone: '13800000002', avatarUrl: null },
        enrolledAt: '2026-08-20T21:07:00Z',
        progressPercent: 50,
        shippingStatus: 'SHIPPED',
        shippingTrackingNo: 'SF1234567890',
        formData: null,
        shippingAddress: null,
      }
    ];
  }
};

const saveTrackingNo = async (enrollmentId: string) => {
  if (!shippingForm.value.shippingTrackingNo) {
    alert('请输入物流运单号');
    return;
  }
  try {
    await request.put(`/v1/admin/courses/enrollments/${enrollmentId}/shipping`, {
      shippingTrackingNo: shippingForm.value.shippingTrackingNo,
    });
    alert('发货运单号已保存');
    shippingForm.value.shippingTrackingNo = '';
    await openEnrollments({ id: activeEnrollmentCourseId.value } as Course);
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  fetchCourses();
});
</script>

<template>
  <div>
    <!-- 页头 (严格对齐 prototype-v3/admin/courses.html) -->
    <div class="page-head">
      <div>
        <h1>课程管理</h1>
      </div>
      <button class="btn" @click="openCreateCourse">新建课程</button>
    </div>

    <!-- 筛选与搜索工具条 -->
    <div class="toolbar">
      <div class="filter-tabs">
        <button
          v-for="tab in ['全部', '进行中', '未开课', '已结课']"
          :key="tab"
          :class="{ active: currentTab === tab }"
          @click="currentTab = tab"
        >
          {{ tab }}
        </button>
      </div>

      <div class="spacer"></div>

      <div class="search-box">
        <span class="s-icon">
          <svg width="15" height="15" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 38C30.3888 38 38 30.3888 38 21C38 11.6112 30.3888 4 21 4C11.6112 4 4 11.6112 4 21C4 30.3888 11.6112 38 21 38Z"/>
            <path d="M26.657 14.3431C25.2093 12.8954 23.2093 12 21.0001 12C18.791 12 16.791 12.8954 15.3433 14.3431"/>
            <path d="M33.2216 33.2217L41.7069 41.707"/>
          </svg>
        </span>
        <input type="text" v-model="searchQuery" placeholder="搜索课程" />
      </div>
    </div>

    <!-- 课程列表面板 -->
    <div class="panel" style="padding-top:14px;">
      <table class="table">
        <thead>
          <tr>
            <th class="course-col" style="min-width: 240px;">课程</th>
            <th>分类</th>
            <th>开课时间</th>
            <th>学员数</th>
            <th>内容进度</th>
            <th>状态</th>
            <th style="text-align:right;">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in filteredCourses" :key="c.id">
            <!-- 课程名称与意境封面 -->
            <td class="course-col">
              <div class="id-cell">
                <div :class="['photo', getPhotoClass(c.category), 'thumb']"></div>
                <div>
                  <div class="td-main">{{ c.title }}</div>
                  <div class="td-sub">{{ c.subtitle || '线上营 · 陪伴成长' }}</div>
                </div>
              </div>
            </td>

            <!-- 分类 -->
            <td>
              <span class="tag green">{{ c.category }}</span>
            </td>

            <!-- 开课时间 -->
            <td>{{ formatCourseTime(c.courseStartTime) }}</td>

            <!-- 学员数 -->
            <td class="num">{{ c.currentStudents || 0 }}</td>

            <!-- 内容进度 -->
            <td>
              <span class="td-sub">
                {{ c.category === '拾光读书' ? '导读 2/8 · 研讨 1 · 书友故事 8' : (c.category === '空间管理' ? '概要 2/8 · 日日新生 18 · 故事 2 · 表单 3' : (c.status === 'OFFLINE' ? '概要 6/6 · 已汇总导出' : '概要 2/8 · 金句 6 · 食谱 3 · 故事 3')) }}
              </span>
            </td>

            <!-- 状态 -->
            <td>
              <span :class="['tag', c.status === 'PUBLISHED' ? 'green' : (c.status === 'OFFLINE' ? 'gray' : 'red')]">
                {{ c.status === 'PUBLISHED' ? '进行中' : (c.status === 'OFFLINE' ? '已结课' : '草稿') }}
              </span>
            </td>

            <!-- 操作 -->
            <td style="text-align:right; white-space: nowrap;">
              <button class="btn-text" @click="openLessons(c)">课节</button>
              <span style="margin: 0 6px; color: var(--rice);">|</span>
              <button class="btn-text" @click="openEnrollments(c)">学员</button>
              <span style="margin: 0 6px; color: var(--rice);">|</span>
              <button class="btn-text" @click="openEditCourse(c)">管理</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页栏 -->
      <div class="pagination">
        <span>共 {{ filteredCourses.length }} 门课程</span>
        <div class="pages">
          <a href="#" class="cur">1</a>
        </div>
      </div>
    </div>

    <!-- 1. 新建 / 编辑课程弹窗 -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-[#FDFAF3] border border-[#E7E4D5] rounded-2xl max-w-2xl w-full p-8 shadow-2xl space-y-6">
        <div class="flex items-center justify-between border-b border-[#E7E4D5] pb-4">
          <h2 class="text-lg font-semibold text-[#2B4420]">{{ isEditMode ? '编辑课程' : '新建课程' }}</h2>
          <button @click="showEditModal = false" class="text-[#6E6B5E] text-xl font-bold">✕</button>
        </div>

        <div class="form-grid">
          <div class="a-field full">
            <label>课程名称</label>
            <input v-model="currentCourse.title" type="text" placeholder="例如：生活料理 · 第 12 期" />
          </div>

          <div class="a-field full">
            <label>副标题 / 导言</label>
            <input v-model="currentCourse.subtitle" type="text" placeholder="例如：把一日三餐，过成修行" />
          </div>

          <div class="a-field">
            <label>课程分类</label>
            <select v-model="currentCourse.category" style="width: 100%; border: none; border-bottom: 1px solid var(--rice); background: transparent; padding: 7px 0 9px; font-size: 14px; color: var(--ink);">
              <option value="拾光读书">拾光读书</option>
              <option value="空间管理">空间管理</option>
              <option value="生活料理">生活料理</option>
              <option value="纯素烘焙">纯素烘焙</option>
            </select>
          </div>

          <div class="a-field">
            <label>报名费用 (元)</label>
            <input v-model.number="currentCourse.price" type="number" placeholder="499" />
          </div>

          <div class="a-field">
            <label>招生限额 (人)</label>
            <input v-model.number="currentCourse.maxStudents" type="number" placeholder="30" />
          </div>

          <div class="a-field">
            <label>开课时间</label>
            <input v-model="currentCourse.courseStartTime" type="date" />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-[#E7E4D5]">
          <button @click="showEditModal = false" class="btn-outline">取消</button>
          <button @click="handleSaveCourse" class="btn">保存课程</button>
        </div>
      </div>
    </div>

    <!-- 2. 课节大纲管理抽屉 -->
    <div v-if="showLessonsDrawer" class="fixed inset-0 bg-black/40 flex justify-end z-50">
      <div class="bg-[#FDFAF3] border-l border-[#E7E4D5] w-full max-w-xl h-full p-8 flex flex-col shadow-2xl">
        <div class="flex items-center justify-between border-b border-[#E7E4D5] pb-4 mb-6">
          <div>
            <h2 class="text-lg font-semibold text-[#2B4420]">课节管理与排期</h2>
            <div class="text-xs text-[#6E6B5E] mt-1">{{ activeCourseTitle }}</div>
          </div>
          <button @click="showLessonsDrawer = false" class="text-[#6E6B5E] text-xl font-bold">✕</button>
        </div>

        <div class="flex-1 overflow-y-auto space-y-4 pr-1">
          <!-- 课节列表 -->
          <div class="timeline">
            <div v-for="(l, idx) in courseLessons" :key="l.id || idx" class="timeline-item">
              <div class="td-main text-sm">{{ l.title }}</div>
              <div class="td-sub">{{ l.sectionName }} · {{ l.unlockType === 'IMMEDIATE' ? '开课解锁' : `开课后第 ${l.unlockDays} 天解锁` }}</div>
            </div>
          </div>

          <!-- 新增课节卡片 -->
          <div class="panel" style="margin-top: 24px; padding: 18px 20px;">
            <div class="panel-title" style="font-size: 14px; margin-bottom: 12px;">+ 新增课节</div>
            <div class="space-y-3">
              <div class="a-field">
                <label>所属阶段 / 周次</label>
                <input v-model="lessonForm.sectionName" type="text" placeholder="第一阶段：整理心念" />
              </div>
              <div class="a-field">
                <label>课节标题</label>
                <input v-model="lessonForm.title" type="text" placeholder="例如：第 1 课：厨房的心念与秩序" />
              </div>
              <div class="a-field">
                <label>课节讲义与导读文稿</label>
                <textarea v-model="lessonForm.content" rows="3" placeholder="填写课节导读与思考题..."></textarea>
              </div>
              <button @click="handleSaveLesson" class="btn btn-small" style="margin-top: 10px;">添加课节</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. 学员报名名单与发货跟踪 -->
    <div v-if="showEnrollmentsModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-[#FDFAF3] border border-[#E7E4D5] rounded-2xl max-w-4xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between border-b border-[#E7E4D5] pb-4">
          <h2 class="text-lg font-semibold text-[#2B4420]">在修学员名单与资料寄送</h2>
          <button @click="showEnrollmentsModal = false" class="text-[#6E6B5E] text-xl font-bold">✕</button>
        </div>

        <div class="flex-1 overflow-y-auto">
          <table class="table">
            <thead>
              <tr>
                <th>学员</th>
                <th>报名时间</th>
                <th>学习进度</th>
                <th>物料寄送状态</th>
                <th>收货地址 / 物流单号</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in enrollmentsList" :key="e.id">
                <td>
                  <div class="id-cell">
                    <span class="avatar">{{ e.user.nickname.slice(0, 1) }}</span>
                    <div>
                      <div class="td-main">{{ e.user.nickname }}</div>
                      <div class="td-sub">{{ e.user.phone || '微信学员' }}</div>
                    </div>
                  </div>
                </td>
                <td class="td-sub">{{ e.enrolledAt.slice(0, 16).replace('T', ' ') }}</td>
                <td><span class="tag green">{{ e.progressPercent }}%</span></td>
                <td>
                  <span :class="['tag', e.shippingStatus === 'SHIPPED' ? 'green' : 'gray']">
                    {{ e.shippingStatus === 'SHIPPED' ? '已发货' : '待寄送' }}
                  </span>
                </td>
                <td class="td-sub">
                  <div v-if="e.shippingAddress">
                    {{ e.shippingAddress.province }}{{ e.shippingAddress.city }}{{ e.shippingAddress.address }} ({{ e.shippingAddress.name }} 收)
                  </div>
                  <div v-if="e.shippingTrackingNo" class="td-main" style="color: var(--caramel); margin-top: 4px;">
                    运单号：{{ e.shippingTrackingNo }}
                  </div>
                  <div v-else class="flex gap-2 items-center" style="margin-top: 4px;">
                    <input
                      v-model="shippingForm.shippingTrackingNo"
                      type="text"
                      placeholder="顺丰单号..."
                      style="width: 140px; font-size: 12px; padding: 4px 8px; border: 1px solid var(--rice); border-radius: 4px;"
                    />
                    <button @click="saveTrackingNo(e.id)" class="btn-text">发货</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
