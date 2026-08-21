import prisma from '../utils/prisma.js';
import { ApiError } from '../utils/response.js';
import { EnrollmentStatus, OrderStatus, OrderType, PublishStatus, ShippingStatus, UnlockType } from '@prisma/client';

export class CourseService {
  // 课程列表 (小程序端与管理端通用，小程序端默认只查 PUBLISHED)
  async getCourses(params: { category?: string; status?: PublishStatus; isRecommended?: boolean }) {
    const where: any = {};
    if (params.category && params.category !== '全部') {
      where.category = params.category;
    }
    if (params.status) {
      where.status = params.status;
    }
    if (params.isRecommended !== undefined) {
      where.isRecommended = params.isRecommended;
    }

    return prisma.course.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        _count: { select: { lessons: true, enrollments: true } },
      },
    });
  }

  // 课程详情与课节解锁计算
  async getCourseDetail(courseId: string, userId?: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!course) {
      throw ApiError.notFound('课程不存在');
    }

    // 检查用户是否已报名
    let enrollment = null;
    if (userId) {
      enrollment = await prisma.courseEnrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });
    }

    const now = new Date();
    const courseStartTime = course.courseStartTime ? new Date(course.courseStartTime) : null;

    // 计算每个课节的解锁状态
    const lessonsWithUnlockState = course.lessons.map((lesson) => {
      let isUnlocked = false;

      if (!enrollment) {
        // 未报名学员只能试看立即解锁且无前置条件的课节 (第一课)
        isUnlocked = lesson.unlockType === UnlockType.IMMEDIATE && lesson.sortOrder === 0;
      } else {
        // 已报名学员根据规则解锁
        if (lesson.unlockType === UnlockType.IMMEDIATE) {
          isUnlocked = true;
        } else if (lesson.unlockType === UnlockType.FIXED_TIME) {
          isUnlocked = lesson.unlockAt ? now >= new Date(lesson.unlockAt) : true;
        } else if (lesson.unlockType === UnlockType.DAYS_AFTER_START) {
          if (!courseStartTime) {
            isUnlocked = true;
          } else {
            const daysPassed = Math.floor((now.getTime() - courseStartTime.getTime()) / (1000 * 60 * 60 * 24));
            isUnlocked = daysPassed >= (lesson.unlockDays || 0);
          }
        }
      }

      return {
        id: lesson.id,
        title: lesson.title,
        sectionName: lesson.sectionName,
        sortOrder: lesson.sortOrder,
        unlockType: lesson.unlockType,
        unlockDays: lesson.unlockDays,
        unlockAt: lesson.unlockAt,
        isUnlocked,
        // 未解锁时不返回敏感图文与课件链接
        content: isUnlocked ? lesson.content : null,
        materials: isUnlocked ? lesson.materials : null,
      };
    });

    return {
      ...course,
      isEnrolled: !!enrollment,
      enrollmentStatus: enrollment?.status || null,
      progressPercent: enrollment?.progressPercent || 0,
      lessons: lessonsWithUnlockState,
    };
  }

  // 学员报名课程 (提交问卷表单、初始化收货信息、生成订单与报名快照)
  async enrollCourse(userId: string, courseId: string, data: { formData?: any; shippingAddress?: any }) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      throw ApiError.notFound('课程不存在');
    }

    if (course.status !== PublishStatus.PUBLISHED) {
      throw ApiError.badRequest('当前课程未开放报名');
    }

    const now = new Date();
    if (course.enrollStartTime && now < new Date(course.enrollStartTime)) {
      throw ApiError.badRequest('课程报名尚未开始');
    }
    if (course.enrollEndTime && now > new Date(course.enrollEndTime)) {
      throw ApiError.badRequest('课程报名已截止');
    }

    if (course.maxStudents && course._count.enrollments >= course.maxStudents) {
      throw ApiError.badRequest('本期课程名额已满');
    }

    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (existingEnrollment) {
      throw ApiError.badRequest('您已报名该课程，无需重复报名', 40902);
    }

    // 确定是否需寄送物料
    const hasShipping = Boolean(data.shippingAddress);
    const shippingStatus = hasShipping ? ShippingStatus.PENDING : ShippingStatus.NOT_REQUIRED;

    // 格式化订单号
    const orderNo = `SO${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // 事务写入：创建订单 + 创建报名记录 + 累加报名人数
    const [order, enrollment] = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNo,
          userId,
          orderType: OrderType.COURSE,
          targetId: courseId,
          targetTitle: `课程报名 - ${course.title}`,
          amount: course.price,
          status: OrderStatus.PAID, // 演示阶段直接视为支付成功
          paidAt: new Date(),
        },
      });

      // 如果有收货地址，同时更新 User 的默认收货地址
      if (data.shippingAddress) {
        await tx.user.update({
          where: { id: userId },
          data: { shippingAddress: data.shippingAddress },
        });
      }

      const newEnrollment = await tx.courseEnrollment.create({
        data: {
          userId,
          courseId,
          orderId: newOrder.id,
          formData: data.formData || null,
          shippingStatus,
          status: EnrollmentStatus.ACTIVE,
        },
      });

      await tx.course.update({
        where: { id: courseId },
        data: { currentStudents: { increment: 1 } },
      });

      return [newOrder, newEnrollment];
    });

    return {
      enrollmentId: enrollment.id,
      orderId: order.id,
      orderNo: order.orderNo,
      courseTitle: course.title,
      status: enrollment.status,
      message: '报名成功，已进入学习区',
    };
  }

  // 学员学习区：获取我的课程 (在学 / 完结)
  async getMyStudyCourses(userId: string) {
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId },
      orderBy: { enrolledAt: 'desc' },
      include: {
        course: {
          include: {
            _count: { select: { lessons: true } },
          },
        },
      },
    });

    const activeList = enrollments
      .filter((e) => e.status === EnrollmentStatus.ACTIVE)
      .map((e) => ({
        enrollmentId: e.id,
        courseId: e.course.id,
        title: e.course.title,
        coverUrl: e.course.coverUrl,
        category: e.course.category,
        progressPercent: e.progressPercent,
        totalLessons: e.course._count.lessons,
        courseStartTime: e.course.courseStartTime,
        shippingStatus: e.shippingStatus,
        shippingTrackingNo: e.shippingTrackingNo,
      }));

    const completedList = enrollments
      .filter((e) => e.status === EnrollmentStatus.COMPLETED)
      .map((e) => ({
        enrollmentId: e.id,
        courseId: e.course.id,
        title: e.course.title,
        coverUrl: e.course.coverUrl,
        category: e.course.category,
        progressPercent: e.progressPercent,
        totalLessons: e.course._count.lessons,
      }));

    return {
      activeList,
      completedList,
      totalActive: activeList.length,
      totalCompleted: completedList.length,
    };
  }

  // 学员学习区：获取课程学习详情（阶段分组与排期资料）
  async getStudyCourseDetail(userId: string, courseId: string) {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: {
        course: {
          include: {
            lessons: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw ApiError.forbidden('您尚未报名此课程，无法进入学习区');
    }

    const { course } = enrollment;
    const now = new Date();
    const courseStartTime = course.courseStartTime ? new Date(course.courseStartTime) : null;

    // 解析课节并按阶段分组
    const sectionsMap = new Map<string, any[]>();

    course.lessons.forEach((lesson) => {
      let isUnlocked = false;
      if (lesson.unlockType === UnlockType.IMMEDIATE) {
        isUnlocked = true;
      } else if (lesson.unlockType === UnlockType.FIXED_TIME) {
        isUnlocked = lesson.unlockAt ? now >= new Date(lesson.unlockAt) : true;
      } else if (lesson.unlockType === UnlockType.DAYS_AFTER_START) {
        if (!courseStartTime) {
          isUnlocked = true;
        } else {
          const daysPassed = Math.floor((now.getTime() - courseStartTime.getTime()) / (1000 * 60 * 60 * 24));
          isUnlocked = daysPassed >= (lesson.unlockDays || 0);
        }
      }

      const section = lesson.sectionName || '默认阶段';
      if (!sectionsMap.has(section)) {
        sectionsMap.set(section, []);
      }

      sectionsMap.get(section)!.push({
        id: lesson.id,
        title: lesson.title,
        sortOrder: lesson.sortOrder,
        unlockType: lesson.unlockType,
        unlockDays: lesson.unlockDays,
        unlockAt: lesson.unlockAt,
        isUnlocked,
        content: isUnlocked ? lesson.content : null,
        materials: isUnlocked ? lesson.materials : null,
      });
    });

    const sections = Array.from(sectionsMap.entries()).map(([name, lessons]) => ({
      sectionName: name,
      lessons,
    }));

    return {
      courseId: course.id,
      title: course.title,
      coverUrl: course.coverUrl,
      category: course.category,
      courseStartTime: course.courseStartTime,
      progressPercent: enrollment.progressPercent,
      totalLessons: course.lessons.length,
      shippingStatus: enrollment.shippingStatus,
      shippingTrackingNo: enrollment.shippingTrackingNo,
      sections,
    };
  }

  // 学员完成课节（推进学习进度）
  async completeLesson(userId: string, lessonId: string) {
    const lesson = await prisma.courseLesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          include: {
            lessons: { select: { id: true } },
          },
        },
      },
    });

    if (!lesson) {
      throw ApiError.notFound('课节不存在');
    }

    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId: lesson.courseId } },
    });

    if (!enrollment) {
      throw ApiError.forbidden('未报名该课程');
    }

    const totalLessons = lesson.course.lessons.length || 1;
    // 假设完成每节按均等比例递增，最高 100%
    const currentPercent = enrollment.progressPercent;
    const increment = Math.round(100 / totalLessons);
    const progressPercent = Math.min(currentPercent + increment, 100);
    const newStatus = progressPercent >= 100 ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ACTIVE;

    const updated = await prisma.courseEnrollment.update({
      where: { id: enrollment.id },
      data: {
        progressPercent,
        status: newStatus,
      },
    });

    return {
      enrollmentId: updated.id,
      progressPercent: updated.progressPercent,
      status: updated.status,
    };
  }

  // 管理后台：获取课程报名学员名单（支持搜索、发货状态过滤）
  async getCourseEnrollments(courseId: string, params: { search?: string; shippingStatus?: ShippingStatus; page?: number; limit?: number }) {
    const page = Math.max(Number(params.page) || 1, 1);
    const limit = Math.min(Math.max(Number(params.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const where: any = { courseId };
    if (params.shippingStatus) {
      where.shippingStatus = params.shippingStatus;
    }
    if (params.search) {
      where.user = {
        OR: [
          { nickname: { contains: params.search, mode: 'insensitive' } },
          { phone: { contains: params.search } },
        ],
      };
    }

    const [total, list] = await Promise.all([
      prisma.courseEnrollment.count({ where }),
      prisma.courseEnrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { enrolledAt: 'desc' },
        include: {
          user: {
            select: { id: true, nickname: true, avatarUrl: true, phone: true, memberTier: true, shippingAddress: true },
          },
        },
      }),
    ]);

    return {
      list: list.map((e) => ({
        id: e.id,
        user: e.user,
        enrolledAt: e.enrolledAt,
        status: e.status,
        progressPercent: e.progressPercent,
        formData: e.formData,
        shippingAddress: e.user.shippingAddress,
        shippingStatus: e.shippingStatus,
        shippingTrackingNo: e.shippingTrackingNo,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 管理后台：更新物料发货单号与发货状态
  async updateEnrollmentShipping(enrollmentId: string, data: { shippingTrackingNo: string; shippingStatus?: ShippingStatus }) {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw ApiError.notFound('报名记录不存在');
    }

    const status = data.shippingStatus || ShippingStatus.SHIPPED;

    const updated = await prisma.courseEnrollment.update({
      where: { id: enrollmentId },
      data: {
        shippingTrackingNo: data.shippingTrackingNo,
        shippingStatus: status,
      },
    });

    return updated;
  }

  // ----------------------------------------------------
  // 课程与课节基础 CRUD
  // ----------------------------------------------------
  async createCourse(data: any) {
    if (!data.title || !data.category || !data.coverUrl) {
      throw ApiError.badRequest('课程标题、分类及封面图为必填项');
    }

    return prisma.course.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        category: data.category,
        coverUrl: data.coverUrl,
        price: data.price ? Number(data.price) : 0,
        originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
        maxStudents: data.maxStudents ? Number(data.maxStudents) : null,
        enrollStartTime: data.enrollStartTime ? new Date(data.enrollStartTime) : null,
        enrollEndTime: data.enrollEndTime ? new Date(data.enrollEndTime) : null,
        courseStartTime: data.courseStartTime ? new Date(data.courseStartTime) : null,
        courseEndTime: data.courseEndTime ? new Date(data.courseEndTime) : null,
        status: data.status || PublishStatus.DRAFT,
        description: data.description || '',
        formConfig: data.formConfig || null,
        sortOrder: Number(data.sortOrder) || 0,
        isRecommended: Boolean(data.isRecommended),
      },
    });
  }

  async updateCourse(id: string, data: any) {
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound('课程不存在');
    }

    return prisma.course.update({
      where: { id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        category: data.category,
        coverUrl: data.coverUrl,
        price: data.price !== undefined ? Number(data.price) : undefined,
        originalPrice: data.originalPrice !== undefined ? (data.originalPrice ? Number(data.originalPrice) : null) : undefined,
        maxStudents: data.maxStudents !== undefined ? (data.maxStudents ? Number(data.maxStudents) : null) : undefined,
        enrollStartTime: data.enrollStartTime ? new Date(data.enrollStartTime) : undefined,
        enrollEndTime: data.enrollEndTime ? new Date(data.enrollEndTime) : undefined,
        courseStartTime: data.courseStartTime ? new Date(data.courseStartTime) : undefined,
        courseEndTime: data.courseEndTime ? new Date(data.courseEndTime) : undefined,
        status: data.status,
        description: data.description,
        formConfig: data.formConfig,
        sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : undefined,
        isRecommended: data.isRecommended !== undefined ? Boolean(data.isRecommended) : undefined,
      },
    });
  }

  async deleteCourse(id: string) {
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound('课程不存在');
    }
    await prisma.course.delete({ where: { id } });
    return true;
  }

  async createLesson(courseId: string, data: any) {
    if (!data.title) {
      throw ApiError.badRequest('课节标题不能为空');
    }

    return prisma.courseLesson.create({
      data: {
        courseId,
        title: data.title,
        sectionName: data.sectionName,
        sortOrder: Number(data.sortOrder) || 0,
        unlockType: data.unlockType || UnlockType.IMMEDIATE,
        unlockDays: data.unlockDays ? Number(data.unlockDays) : null,
        unlockAt: data.unlockAt ? new Date(data.unlockAt) : null,
        content: data.content,
        materials: data.materials || null,
      },
    });
  }

  async updateLesson(lessonId: string, data: any) {
    return prisma.courseLesson.update({
      where: { id: lessonId },
      data: {
        title: data.title,
        sectionName: data.sectionName,
        sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : undefined,
        unlockType: data.unlockType,
        unlockDays: data.unlockDays !== undefined ? (data.unlockDays ? Number(data.unlockDays) : null) : undefined,
        unlockAt: data.unlockAt ? new Date(data.unlockAt) : undefined,
        content: data.content,
        materials: data.materials,
      },
    });
  }

  async deleteLesson(lessonId: string) {
    await prisma.courseLesson.delete({ where: { id: lessonId } });
    return true;
  }
}

export const courseService = new CourseService();
