<script setup lang="ts">
import { ref, onMounted } from 'vue';
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

const courses = ref<Course[]>([]);
const loading = ref(false);
const currentTab = ref('全部');
const searchQuery = ref('');

// 弹窗状态
const showEditModal = ref(false);
const isEditMode = ref(false);
const currentCourse = ref<Partial<Course>>({
  title: '',
  subtitle: '',
  category: '空间生活整理营',
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
    courses.value = res.data.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// 打开新建课程弹窗
const openCreateCourse = () => {
  isEditMode.value = false;
  currentCourse.value = {
    title: '',
    subtitle: '',
    category: '空间生活整理营',
    coverUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600',
    price: 980,
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
const saveCourse = async () => {
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

// 删除课程
const deleteCourse = async (id: string) => {
  if (!confirm('确定要删除该课程吗？')) return;
  try {
    await request.delete(`/v1/admin/courses/${id}`);
    await fetchCourses();
  } catch (err) {
    console.error(err);
  }
};

// 打开课节管理
const openLessonsDrawer = async (course: Course) => {
  activeCourseId.value = course.id;
  activeCourseTitle.value = course.title;
  try {
    const res = await request.get(`/v1/admin/courses/${course.id}`);
    courseLessons.value = res.data.data.lessons || [];
    showLessonsDrawer.value = true;
  } catch (err) {
    console.error(err);
  }
};

// 添加课节
const addLesson = async () => {
  if (!lessonForm.value.title) return alert('课节标题不能为空');
  try {
    await request.post(`/v1/admin/courses/${activeCourseId.value}/lessons`, lessonForm.value);
    lessonForm.value.title = '';
    lessonForm.value.content = '';
    const res = await request.get(`/v1/admin/courses/${activeCourseId.value}`);
    courseLessons.value = res.data.data.lessons || [];
  } catch (err) {
    console.error(err);
  }
};

// 删除课节
const deleteLesson = async (lessonId: string) => {
  if (!confirm('确定删除该课节吗？')) return;
  try {
    await request.delete(`/v1/admin/courses/lessons/${lessonId}`);
    const res = await request.get(`/v1/admin/courses/${activeCourseId.value}`);
    courseLessons.value = res.data.data.lessons || [];
  } catch (err) {
    console.error(err);
  }
};

// 打开报名名单
const openEnrollmentsModal = async (course: Course) => {
  activeEnrollmentCourseId.value = course.id;
  activeCourseTitle.value = course.title;
  try {
    const res = await request.get(`/v1/admin/courses/${course.id}/enrollments`);
    enrollmentsList.value = res.data.data.list;
    showEnrollmentsModal.value = true;
  } catch (err) {
    console.error(err);
  }
};

// 保存发货单号
const saveShipping = async (enrollmentId: string) => {
  if (!shippingForm.value.shippingTrackingNo) return alert('请输入快递单号');
  try {
    await request.put(`/v1/admin/courses/enrollments/${enrollmentId}/shipping`, {
      shippingTrackingNo: shippingForm.value.shippingTrackingNo,
      shippingStatus: 'SHIPPED',
    });
    shippingForm.value.shippingTrackingNo = '';
    shippingForm.value.enrollmentId = '';
    // 重新获取名单
    const res = await request.get(`/v1/admin/courses/${activeEnrollmentCourseId.value}/enrollments`);
    enrollmentsList.value = res.data.data.list;
    alert('发货单号已更新');
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
    <!-- 头部操作栏 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">课程管理</h1>
        <p class="text-sm text-slate-500 mt-1">管理若星空间全部训练营、共读会与生活美学课程大纲与排期</p>
      </div>
      <button
        @click="openCreateCourse"
        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition flex items-center gap-2"
      >
        <span>✦</span> 新建课程
      </button>
    </div>

    <!-- 筛选工具条 -->
    <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <button
          v-for="tab in ['全部', '进行中', '未开课', '已结营']"
          :key="tab"
          @click="currentTab = tab"
          :class="[
            'px-3 py-1.5 rounded-lg text-sm font-medium transition',
            currentTab === tab ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          ]"
        >
          {{ tab }}
        </button>
      </div>
      <div class="relative w-64">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索课程标题..."
          class="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <span class="absolute left-3 top-2 text-slate-400 text-sm">🔍</span>
      </div>
    </div>

    <!-- 课程表格 -->
    <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
          <tr>
            <th class="py-3.5 px-4">课程名称</th>
            <th class="py-3.5 px-4">分类</th>
            <th class="py-3.5 px-4">报名费用</th>
            <th class="py-3.5 px-4">开营时间</th>
            <th class="py-3.5 px-4">学员人数</th>
            <th class="py-3.5 px-4">状态</th>
            <th class="py-3.5 px-4 text-right">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="courses.length === 0 && !loading" class="text-center text-slate-400 py-12">
            <td colspan="7" class="py-8">暂无课程数据，请点击右上角新建课程</td>
          </tr>
          <tr v-for="c in courses" :key="c.id" class="hover:bg-slate-50/70 transition">
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-3">
                <img :src="c.coverUrl" class="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                <div>
                  <div class="font-semibold text-slate-900">{{ c.title }}</div>
                  <div class="text-xs text-slate-400 mt-0.5">{{ c.subtitle || '暂无副标题' }}</div>
                </div>
              </div>
            </td>
            <td class="py-3.5 px-4">
              <span class="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-medium">
                {{ c.category }}
              </span>
            </td>
            <td class="py-3.5 px-4 font-semibold text-slate-800">
              {{ c.price === 0 ? '免费' : `¥${c.price}` }}
            </td>
            <td class="py-3.5 px-4 text-slate-600 text-xs">
              {{ c.courseStartTime ? c.courseStartTime.slice(0, 10) : '未设置' }}
            </td>
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-2">
                <span class="font-medium text-slate-900">{{ c.currentStudents }}</span>
                <span class="text-xs text-slate-400">/ {{ c.maxStudents || '不限' }}</span>
              </div>
            </td>
            <td class="py-3.5 px-4">
              <span
                :class="[
                  'px-2.5 py-1 rounded-md text-xs font-medium',
                  c.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                ]"
              >
                {{ c.status === 'PUBLISHED' ? '已发布' : '草稿' }}
              </span>
            </td>
            <td class="py-3.5 px-4 text-right">
              <div class="flex items-center justify-end gap-2 text-xs">
                <button @click="openLessonsDrawer(c)" class="text-indigo-600 hover:text-indigo-800 font-medium">
                  课节 ({{ c._count?.lessons || 0 }})
                </button>
                <span class="text-slate-300">|</span>
                <button @click="openEnrollmentsModal(c)" class="text-indigo-600 hover:text-indigo-800 font-medium">
                  名单 ({{ c.currentStudents }})
                </button>
                <span class="text-slate-300">|</span>
                <button @click="openEditCourse(c)" class="text-slate-600 hover:text-slate-900 font-medium">
                  编辑
                </button>
                <span class="text-slate-300">|</span>
                <button @click="deleteCourse(c.id)" class="text-rose-500 hover:text-rose-700 font-medium">
                  删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 新建/编辑课程弹窗 -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold text-slate-900 mb-4">{{ isEditMode ? '编辑课程' : '新建课程' }}</h2>
        <div class="space-y-4 text-sm">
          <div>
            <label class="block text-slate-700 font-medium mb-1">课程标题</label>
            <input v-model="currentCourse.title" type="text" class="w-full p-2 border rounded-lg" placeholder="如：空间生活整理营（第 12 期）" />
          </div>
          <div>
            <label class="block text-slate-700 font-medium mb-1">副标题 / Slogan</label>
            <input v-model="currentCourse.subtitle" type="text" class="w-full p-2 border rounded-lg" placeholder="如：21 天建立温润有序的家庭空间秩序" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-700 font-medium mb-1">所属分类</label>
              <select v-model="currentCourse.category" class="w-full p-2 border rounded-lg">
                <option value="空间生活整理营">空间生活整理营</option>
                <option value="拾光共读会">拾光共读会</option>
                <option value="烘焙与厨艺工作坊">烘焙与厨艺工作坊</option>
                <option value="身心觉察课">身心觉察课</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">价格 (元)</label>
              <input v-model.number="currentCourse.price" type="number" class="w-full p-2 border rounded-lg" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-700 font-medium mb-1">名额上限 (人)</label>
              <input v-model.number="currentCourse.maxStudents" type="number" class="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label class="block text-slate-700 font-medium mb-1">发布状态</label>
              <select v-model="currentCourse.status" class="w-full p-2 border rounded-lg">
                <option value="PUBLISHED">已发布 (开放报名)</option>
                <option value="DRAFT">草稿 (隐藏)</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-slate-700 font-medium mb-1">封面图 URL</label>
            <input v-model="currentCourse.coverUrl" type="text" class="w-full p-2 border rounded-lg" />
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showEditModal = false" class="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50">取消</button>
          <button @click="saveCourse" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">保存</button>
        </div>
      </div>
    </div>

    <!-- 课节管理抽屉 -->
    <div v-if="showLessonsDrawer" class="fixed inset-0 bg-black/40 flex justify-end z-50">
      <div class="bg-white w-full max-w-2xl h-full shadow-2xl p-6 overflow-y-auto flex flex-col">
        <div class="flex items-center justify-between border-b pb-4 mb-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900">课节大纲编排</h2>
            <p class="text-xs text-slate-500">{{ activeCourseTitle }}</p>
          </div>
          <button @click="showLessonsDrawer = false" class="text-slate-400 hover:text-slate-700 text-xl font-bold">✕</button>
        </div>

        <!-- 课节列表 -->
        <div class="flex-1 space-y-3 mb-6">
          <div v-if="courseLessons.length === 0" class="text-center text-slate-400 py-8">
            暂无课节，请在下方新增课节
          </div>
          <div
            v-for="(l, idx) in courseLessons"
            :key="l.id || idx"
            class="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded">
                  {{ l.sectionName }}
                </span>
                <span class="text-xs text-slate-400">
                  {{ l.unlockType === 'IMMEDIATE' ? '立即开放' : `开课后第 ${l.unlockDays || 0} 天解锁` }}
                </span>
              </div>
              <div class="font-medium text-slate-900 mt-1">{{ l.title }}</div>
            </div>
            <button @click="l.id && deleteLesson(l.id)" class="text-rose-500 hover:text-rose-700 text-xs font-medium">
              删除
            </button>
          </div>
        </div>

        <!-- 添加课节表单 -->
        <div class="border-t pt-4 space-y-3 text-sm bg-slate-50/50 p-4 rounded-xl border">
          <div class="font-bold text-slate-800">＋ 添加新课节</div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">所属阶段</label>
              <input v-model="lessonForm.sectionName" type="text" class="w-full p-2 border rounded-lg bg-white" placeholder="如：第一阶段：心念与舍弃" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">解锁规则</label>
              <select v-model="lessonForm.unlockType" class="w-full p-2 border rounded-lg bg-white">
                <option value="IMMEDIATE">开营立即解锁</option>
                <option value="DAYS_AFTER_START">开课后按天数解锁</option>
                <option value="FIXED_TIME">指定具体时间解锁</option>
              </select>
            </div>
          </div>
          <div v-if="lessonForm.unlockType === 'DAYS_AFTER_START'">
            <label class="block text-xs font-medium text-slate-600 mb-1">开营后第几天解锁 (天)</label>
            <input v-model.number="lessonForm.unlockDays" type="number" class="w-full p-2 border rounded-lg bg-white" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">课节名称</label>
            <input v-model="lessonForm.title" type="text" class="w-full p-2 border rounded-lg bg-white" placeholder="如：第 1 课：理清执念与生活的留白" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">图文内容 / 课件说明</label>
            <textarea v-model="lessonForm.content" rows="3" class="w-full p-2 border rounded-lg bg-white" placeholder="输入课节正文或物料提示..."></textarea>
          </div>
          <button @click="addLesson" class="w-full py-2 bg-slate-900 hover:bg-black text-white rounded-lg font-medium text-sm">
            确认添加课节
          </button>
        </div>
      </div>
    </div>

    <!-- 报名名单与物料发货弹窗 -->
    <div v-if="showEnrollmentsModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b pb-4 mb-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900">学员报名名单与物料发货</h2>
            <p class="text-xs text-slate-500">{{ activeCourseTitle }} (共 {{ enrollmentsList.length }} 人)</p>
          </div>
          <button @click="showEnrollmentsModal = false" class="text-slate-400 hover:text-slate-700 text-xl font-bold">✕</button>
        </div>

        <div class="space-y-4">
          <div v-if="enrollmentsList.length === 0" class="text-center text-slate-400 py-12">
            当前课程暂无学员报名
          </div>
          <div
            v-for="e in enrollmentsList"
            :key="e.id"
            class="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {{ e.user.nickname.slice(0, 1) }}
                </div>
                <div>
                  <div class="font-semibold text-slate-900 text-sm">{{ e.user.nickname }}</div>
                  <div class="text-xs text-slate-400">报名时间：{{ e.enrolledAt.slice(0, 16).replace('T', ' ') }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-xs font-semibold text-indigo-600">学习进度 {{ e.progressPercent }}%</div>
                <span
                  :class="[
                    'text-[10px] px-2 py-0.5 rounded-full font-medium',
                    e.shippingStatus === 'SHIPPED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  ]"
                >
                  {{ e.shippingStatus === 'SHIPPED' ? `已发货 (${e.shippingTrackingNo})` : '待发货物料' }}
                </span>
              </div>
            </div>

            <!-- 收货地址 -->
            <div v-if="e.shippingAddress" class="text-xs bg-white p-2.5 rounded-lg border border-slate-200 text-slate-600">
              <span class="font-semibold text-slate-800">📦 收货地址：</span>
              {{ e.shippingAddress.name }} {{ e.shippingAddress.phone }} · {{ e.shippingAddress.province }}{{ e.shippingAddress.city }}{{ e.shippingAddress.district }}{{ e.shippingAddress.address }}
            </div>

            <!-- 回填快递单号 -->
            <div class="flex items-center gap-2 pt-1">
              <input
                v-model="shippingForm.shippingTrackingNo"
                type="text"
                placeholder="输入顺丰/圆通快递单号..."
                class="flex-1 text-xs p-2 border rounded-lg bg-white"
              />
              <button
                @click="saveShipping(e.id)"
                class="px-3 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-medium"
              >
                保存发货
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
