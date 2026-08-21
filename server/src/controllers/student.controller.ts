import { Request, Response, NextFunction } from 'express';
import { studentService } from '../services/student.service.js';
import { sendSuccess } from '../utils/response.js';

export const getStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await studentService.getStudents(req.query);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const getStudentDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await studentService.getStudentDetail(req.params.id);
    return sendSuccess(res, student);
  } catch (err) {
    next(err);
  }
};

export const updateStudentTags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tagIds } = req.body;
    const student = await studentService.updateStudentTags(req.params.id, tagIds || []);
    return sendSuccess(res, student, '标签已更新');
  } catch (err) {
    next(err);
  }
};
