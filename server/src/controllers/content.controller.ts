import { Request, Response, NextFunction } from 'express';
import { contentService } from '../services/content.service.js';
import { sendSuccess } from '../utils/response.js';

export const getDailyContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const date = req.query.date as string | undefined;
    const content = await contentService.getDailyContent(date);
    return sendSuccess(res, content);
  } catch (err) {
    next(err);
  }
};

export const saveDailyContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const content = await contentService.createOrUpdateDailyContent(req.body);
    return sendSuccess(res, content, '每日星语已发布');
  } catch (err) {
    next(err);
  }
};

export const getClientStories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stories = await contentService.getStories({ status: 'PUBLISHED' });
    return sendSuccess(res, stories);
  } catch (err) {
    next(err);
  }
};

export const getStoryDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const story = await contentService.getStoryDetail(req.params.id);
    return sendSuccess(res, story);
  } catch (err) {
    next(err);
  }
};

export const getAdminStories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stories = await contentService.getStories({});
    return sendSuccess(res, stories);
  } catch (err) {
    next(err);
  }
};

export const createStory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const story = await contentService.createStory(req.body);
    return sendSuccess(res, story, '故事已创建', 201);
  } catch (err) {
    next(err);
  }
};

export const updateStory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const story = await contentService.updateStory(req.params.id, req.body);
    return sendSuccess(res, story, '故事已更新');
  } catch (err) {
    next(err);
  }
};

export const getToolForms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string | undefined;
    const forms = await contentService.getToolForms(category);
    return sendSuccess(res, forms);
  } catch (err) {
    next(err);
  }
};

export const getClientShopItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string | undefined;
    const items = await contentService.getShopItems({ category, status: 'ON_SALE' });
    return sendSuccess(res, items);
  } catch (err) {
    next(err);
  }
};

export const getAdminShopItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string | undefined;
    const items = await contentService.getShopItems({ category });
    return sendSuccess(res, items);
  } catch (err) {
    next(err);
  }
};

export const createShopItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await contentService.createShopItem(req.body);
    return sendSuccess(res, item, '商品已创建', 201);
  } catch (err) {
    next(err);
  }
};

export const updateShopItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await contentService.updateShopItem(req.params.id, req.body);
    return sendSuccess(res, item, '商品已更新');
  } catch (err) {
    next(err);
  }
};
