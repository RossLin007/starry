import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import AdminLayout from '../layouts/AdminLayout.vue';
import DashboardView from '../views/DashboardView.vue';
import LoginView from '../views/LoginView.vue';
import CoursesView from '../views/CoursesView.vue';
import ActivitiesView from '../views/ActivitiesView.vue';
import CheckinsView from '../views/CheckinsView.vue';
import PublishView from '../views/PublishView.vue';
import StoriesView from '../views/StoriesView.vue';
import StudentsView from '../views/StudentsView.vue';
import MembersView from '../views/MembersView.vue';
import GoodsView from '../views/GoodsView.vue';
import OrdersView from '../views/OrdersView.vue';
import TagsView from '../views/TagsView.vue';
import ConfigsView from '../views/ConfigsView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false, title: '登录管理中台' },
  },
  {
    path: '/',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: DashboardView,
        meta: { title: '工作台看板' },
      },
      {
        path: 'courses',
        name: 'Courses',
        component: CoursesView,
        meta: { title: '课程管理' },
      },
      {
        path: 'activities',
        name: 'Activities',
        component: ActivitiesView,
        meta: { title: '活动管理' },
      },
      {
        path: 'checkins',
        name: 'Checkins',
        component: CheckinsView,
        meta: { title: '打卡审核' },
      },
      {
        path: 'publish',
        name: 'Publish',
        component: PublishView,
        meta: { title: '内容发布' },
      },
      {
        path: 'stories',
        name: 'Stories',
        component: StoriesView,
        meta: { title: '学员故事' },
      },
      {
        path: 'students',
        name: 'Students',
        component: StudentsView,
        meta: { title: '学员档案' },
      },
      {
        path: 'members',
        name: 'Members',
        component: MembersView,
        meta: { title: '会员管理' },
      },
      {
        path: 'goods',
        name: 'Goods',
        component: GoodsView,
        meta: { title: '商品好物' },
      },
      {
        path: 'orders',
        name: 'Orders',
        component: OrdersView,
        meta: { title: '订单中心' },
      },
      {
        path: 'tags',
        name: 'Tags',
        component: TagsView,
        meta: { title: '标签集管理' },
      },
      {
        path: 'configs',
        name: 'Configs',
        component: ConfigsView,
        meta: { title: '页面配置' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 全局路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('starry_admin_token');
  const title = (to.meta.title as string) || '若星空间管理中台';
  document.title = `${title} - 若星空间`;

  if (to.meta.requiresAuth !== false && !token) {
    next('/login');
  } else if (to.path === '/login' && token) {
    next('/');
  } else {
    next();
  }
});

export default router;
