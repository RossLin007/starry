import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { getHealthStatus } from '../controllers/health.controller.js';
import { adminLogin, getAdminProfile } from '../controllers/auth.controller.js';
import {
  wechatLogin,
  getMyProfile,
  updateMyProfile,
  getMyAddress,
  updateMyAddress,
} from '../controllers/user.controller.js';
import { getStudents, getStudentDetail, updateStudentTags } from '../controllers/student.controller.js';
import { getTags, createTag, updateTag, deleteTag } from '../controllers/tag.controller.js';
import { getClientHomeData, getConfigs, updateConfig } from '../controllers/config.controller.js';
import {
  getClientCourses,
  getClientCourseDetail,
  enrollCourse,
  getMyStudyCourses,
  getStudyCourseDetail,
  completeLesson,
  getAdminCourses,
  getAdminCourseDetail,
  createCourse,
  updateCourse,
  deleteCourse,
  createLesson,
  updateLesson,
  deleteLesson,
  getCourseEnrollments,
  updateEnrollmentShipping,
} from '../controllers/course.controller.js';
import {
  getClientActivities,
  getClientActivityDetail,
  enrollActivity,
  getMyActivityTickets,
  getActivityTicketDetail,
  getAdminActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityEnrollments,
  verifyTicketCheckin,
} from '../controllers/activity.controller.js';
import {
  createCheckin,
  getMyCheckins,
  getMyGrowthMap,
  getFeaturedCheckins,
  getAdminCheckins,
  reviewCheckin,
} from '../controllers/checkin.controller.js';
import {
  getDailyContent,
  saveDailyContent,
  getClientStories,
  getStoryDetail,
  getAdminStories,
  createStory,
  updateStory,
  getToolForms,
  getClientShopItems,
  getAdminShopItems,
  createShopItem,
  updateShopItem,
} from '../controllers/content.controller.js';
import {
  getMyOrders,
  getOrderDetail,
  cancelOrder,
  getAdminOrders,
} from '../controllers/order.controller.js';
import {
  getMemberBenefits,
  createMemberOrder,
  getAdminMembers,
} from '../controllers/member.controller.js';
import {
  initiatePayment,
  handleWechatNotify,
} from '../controllers/payment.controller.js';
import { requireAdminAuth, requireClientAuth } from '../middlewares/auth.middleware.js';
import { verifyClientToken } from '../utils/jwt.js';
import { getStorageAdapter } from '../adapters/storage.adapter.js';
import { sendSuccess, ApiError } from '../utils/response.js';

const router = Router();
const upload = multer({ limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB

// 可选客户端鉴权中间件 (用于首页或课程/活动详情尝试解析登录用户)
const optionalClientAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      req.clientUser = verifyClientToken(token);
    } catch (e) {
      // 忽略过期或非法 token，作为访客继续
    }
  }
  next();
};

// ----------------------------------------------------
// 1. 公共健康检查与支付回调
// ----------------------------------------------------
router.get('/health', getHealthStatus);
router.post('/v1/payments/wechat/notify', handleWechatNotify);

// ----------------------------------------------------
// 2. 小程序客户端接口 (/api/v1/client/*)
// ----------------------------------------------------
const clientRouter = Router();

// 用户与个人中心
clientRouter.post('/auth/wechat-login', wechatLogin);
clientRouter.get('/auth/profile', requireClientAuth, getMyProfile);
clientRouter.put('/auth/profile', requireClientAuth, updateMyProfile);
clientRouter.get('/auth/address', requireClientAuth, getMyAddress);
clientRouter.put('/auth/address', requireClientAuth, updateMyAddress);

// 首页聚合
clientRouter.get('/home', optionalClientAuth, getClientHomeData);

// 课程与学习区业务闭环
clientRouter.get('/courses', getClientCourses);
clientRouter.get('/courses/:id', optionalClientAuth, getClientCourseDetail);
clientRouter.post('/courses/:id/enroll', requireClientAuth, enrollCourse);
clientRouter.get('/study/courses', requireClientAuth, getMyStudyCourses);
clientRouter.get('/study/courses/:id', requireClientAuth, getStudyCourseDetail);
clientRouter.post('/study/lessons/:lessonId/complete', requireClientAuth, completeLesson);

// 活动与电子票核销闭环
clientRouter.get('/activities', getClientActivities);
clientRouter.get('/activities/:id', optionalClientAuth, getClientActivityDetail);
clientRouter.post('/activities/:id/enroll', requireClientAuth, enrollActivity);
clientRouter.get('/activities/my/tickets', requireClientAuth, getMyActivityTickets);
clientRouter.get('/activities/tickets/:ticketCode', requireClientAuth, getActivityTicketDetail);

// 打卡实践与成长星图
clientRouter.post('/checkins', requireClientAuth, createCheckin);
clientRouter.get('/checkins/my', requireClientAuth, getMyCheckins);
clientRouter.get('/checkins/growth', requireClientAuth, getMyGrowthMap);
clientRouter.get('/checkins/featured', getFeaturedCheckins);

// 星愿年度会员体系
clientRouter.get('/members/benefits', getMemberBenefits);
clientRouter.post('/members/orders', requireClientAuth, createMemberOrder);

// 订单中心与微信支付
clientRouter.get('/orders', requireClientAuth, getMyOrders);
clientRouter.get('/orders/:id', requireClientAuth, getOrderDetail);
clientRouter.post('/orders/:id/cancel', requireClientAuth, cancelOrder);
clientRouter.post('/orders/:orderId/pay', requireClientAuth, initiatePayment);

// 内容与生态
clientRouter.get('/contents/daily', getDailyContent);
clientRouter.get('/stories', getClientStories);
clientRouter.get('/stories/:id', getStoryDetail);
clientRouter.get('/tool-forms', getToolForms);
clientRouter.get('/shop/goods', getClientShopItems);

router.use('/v1/client', clientRouter);

// ----------------------------------------------------
// 3. 管理后台中台接口 (/api/v1/admin/*)
// ----------------------------------------------------
const adminRouter = Router();

// 管理员认证
adminRouter.post('/auth/login', adminLogin);
adminRouter.get('/auth/profile', requireAdminAuth, getAdminProfile);

// 文件上传
adminRouter.post('/upload', requireAdminAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) throw ApiError.badRequest('请选择需要上传的文件');
    const folder = (req.query.folder as string) || 'common';
    const adapter = getStorageAdapter();
    const result = await adapter.uploadFile(req.file, folder);
    return sendSuccess(res, result, '上传成功');
  } catch (err) {
    next(err);
  }
});

// 学员档案管理
adminRouter.get('/students', requireAdminAuth, getStudents);
adminRouter.get('/students/:id', requireAdminAuth, getStudentDetail);
adminRouter.post('/students/:id/tags', requireAdminAuth, updateStudentTags);

// 标签管理
adminRouter.get('/tags', requireAdminAuth, getTags);
adminRouter.post('/tags', requireAdminAuth, createTag);
adminRouter.put('/tags/:id', requireAdminAuth, updateTag);
adminRouter.delete('/tags/:id', requireAdminAuth, deleteTag);

// 页面配置
adminRouter.get('/configs', requireAdminAuth, getConfigs);
adminRouter.put('/configs', requireAdminAuth, updateConfig);

// 课程管理
adminRouter.get('/courses', requireAdminAuth, getAdminCourses);
adminRouter.get('/courses/:id', requireAdminAuth, getAdminCourseDetail);
adminRouter.post('/courses', requireAdminAuth, createCourse);
adminRouter.put('/courses/:id', requireAdminAuth, updateCourse);
adminRouter.delete('/courses/:id', requireAdminAuth, deleteCourse);
adminRouter.post('/courses/:id/lessons', requireAdminAuth, createLesson);
adminRouter.put('/courses/lessons/:lessonId', requireAdminAuth, updateLesson);
adminRouter.delete('/courses/lessons/:lessonId', requireAdminAuth, deleteLesson);
adminRouter.get('/courses/:id/enrollments', requireAdminAuth, getCourseEnrollments);
adminRouter.put('/courses/enrollments/:enrollmentId/shipping', requireAdminAuth, updateEnrollmentShipping);

// 活动与现场核销管理
adminRouter.get('/activities', requireAdminAuth, getAdminActivities);
adminRouter.post('/activities', requireAdminAuth, createActivity);
adminRouter.put('/activities/:id', requireAdminAuth, updateActivity);
adminRouter.delete('/activities/:id', requireAdminAuth, deleteActivity);
adminRouter.get('/activities/:id/enrollments', requireAdminAuth, getActivityEnrollments);
adminRouter.post('/activities/checkin/verify', requireAdminAuth, verifyTicketCheckin);

// 打卡审核与陪伴寄语
adminRouter.get('/checkins', requireAdminAuth, getAdminCheckins);
adminRouter.put('/checkins/:id/review', requireAdminAuth, reviewCheckin);

// 订单中心与会员管理
adminRouter.get('/orders', requireAdminAuth, getAdminOrders);
adminRouter.get('/members', requireAdminAuth, getAdminMembers);

// 内容与商品
adminRouter.post('/contents/daily', requireAdminAuth, saveDailyContent);
adminRouter.get('/stories', requireAdminAuth, getAdminStories);
adminRouter.post('/stories', requireAdminAuth, createStory);
adminRouter.put('/stories/:id', requireAdminAuth, updateStory);
adminRouter.get('/goods', requireAdminAuth, getAdminShopItems);
adminRouter.post('/goods', requireAdminAuth, createShopItem);
adminRouter.put('/goods/:id', requireAdminAuth, updateShopItem);

router.use('/v1/admin', adminRouter);

export default router;
