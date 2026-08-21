import { Request, Response, NextFunction } from 'express';
import { tagService } from '../services/tag.service.js';
import { sendSuccess } from '../utils/response.js';

export const getTags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const group = req.query.group as string | undefined;
    const tags = await tagService.getTags(group);
    return sendSuccess(res, tags);
  } catch (err) {
    next(err);
  }
};

export const createTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tag = await tagService.createTag(req.body);
    return sendSuccess(res, tag, '标签创建成功', 201);
  } catch (err) {
    next(err);
  }
};

export const updateTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tag = await tagService.updateTag(req.params.id, req.body);
    return sendSuccess(res, tag, '标签已更新');
  } catch (err) {
    next(err);
  }
};

export const deleteTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await tagService.deleteTag(req.params.id);
    return sendSuccess(res, null, '标签已删除');
  } catch (err) {
    next(err);
  }
};
