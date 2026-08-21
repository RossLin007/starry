import { Request, Response, NextFunction } from 'express';
import { courseService } from '../services/course.service.js';
import { sendSuccess, ApiError } from '../utils/response.js';

// ----------------------------------------------------
// 小程序端控制器
// ----------------------------------------------------
export const getClientCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string | undefined;
    const courses = await courseService.getCourses({ category, status: 'PUBLISHED' });
    return sendSuccess(res, courses);
  } catch (err) {
    next(err);
  }
};

export const getClientCourseDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.clientUser?.userId;
    const course = await courseService.getCourseDetail(req.params.id, userId);
    return sendSuccess(res, course);
  } catch (err) {
    next(err);
  }
};

export const enrollCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.clientUser?.userId;
    if (!userId) throw ApiError.unauthorized();
    const result = await courseService.enrollCourse(userId, req.params.id, req.body);
    return sendSuccess(res, result, '报名成功，已进入学习区', 201);
  } catch (err) {
    next(err);
  }
};

export const getMyStudyCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.clientUser?.userId;
    if (!userId) throw ApiError.unauthorized();
    const result = await courseService.getMyStudyCourses(userId);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const getStudyCourseDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.clientUser?.userId;
    if (!userId) throw ApiError.unauthorized();
    const result = await courseService.getStudyCourseDetail(userId, req.params.id);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const completeLesson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.clientUser?.userId;
    if (!userId) throw ApiError.unauthorized();
    const result = await courseService.completeLesson(userId, req.params.lessonId);
    return sendSuccess(res, result, '课节已标记完成');
  } catch (err) {
    next(err);
  }
};

// ----------------------------------------------------
// 管理后台控制器
// ----------------------------------------------------
export const getAdminCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string | undefined;
    const courses = await courseService.getCourses({ category });
    return sendSuccess(res, courses);
  } catch (err) {
    next(err);
  }
};

export const getAdminCourseDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await courseService.getCourseDetail(req.params.id);
    return sendSuccess(res, course);
  } catch (err) {
    next(err);
  }
};

export const createCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await courseService.createCourse(req.body);
    return sendSuccess(res, course, '课程创建成功', 201);
  } catch (err) {
    next(err);
  }
};

export const updateCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await courseService.updateCourse(req.params.id, req.body);
    return sendSuccess(res, course, '课程已更新');
  } catch (err) {
    next(err);
  }
};

export const deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await courseService.deleteCourse(req.params.id);
    return sendSuccess(res, null, '课程已删除');
  } catch (err) {
    next(err);
  }
};

export const createLesson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lesson = await courseService.createLesson(req.params.id, req.body);
    return sendSuccess(res, lesson, '课节创建成功', 201);
  } catch (err) {
    next(err);
  }
};

export const updateLesson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lesson = await courseService.updateLesson(req.params.lessonId, req.body);
    return sendSuccess(res, lesson, '课节已更新');
  } catch (err) {
    next(err);
  }
};

export const deleteLesson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await courseService.deleteLesson(req.params.lessonId);
    return sendSuccess(res, null, '课节已删除');
  } catch (err) {
    next(err);
  }
};

export const getCourseEnrollments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await courseService.getCourseEnrollments(req.params.id, req.query);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const updateEnrollmentShipping = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await courseService.updateEnrollmentShipping(req.params.enrollmentId, req.body);
    return sendSuccess(res, result, '发货单号已更新');
  } catch (err) {
    next(err);
  }
};
