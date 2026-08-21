import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';

export interface UploadResult {
  url: string;
  key: string;
  size: number;
}

export interface StorageAdapter {
  uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadResult>;
  deleteFile(key: string): Promise<boolean>;
}

// 1. 本地存储适配器
export class LocalStorageAdapter implements StorageAdapter {
  private baseDir: string;

  constructor() {
    this.baseDir = config.storage.uploadDir;
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, folder = 'common'): Promise<UploadResult> {
    const targetFolder = path.join(this.baseDir, folder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
    const targetPath = path.join(targetFolder, filename);

    if (file.path && fs.existsSync(file.path)) {
      fs.renameSync(file.path, targetPath);
    } else if (file.buffer) {
      fs.writeFileSync(targetPath, file.buffer);
    }

    const key = `${folder}/${filename}`;
    const url = `${config.baseUrl}/uploads/${key}`;

    return {
      url,
      key,
      size: file.size,
    };
  }

  async deleteFile(key: string): Promise<boolean> {
    const targetPath = path.join(this.baseDir, key);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      return true;
    }
    return false;
  }
}

// 2. 腾讯云 COS 存储适配器 (预留与平滑扩展)
export class CosStorageAdapter implements StorageAdapter {
  async uploadFile(file: Express.Multer.File, folder = 'common'): Promise<UploadResult> {
    // 接入 COS SDK 直传
    const key = `${folder}/${Date.now()}_${file.originalname}`;
    return {
      url: `https://dummy-cos.myqcloud.com/${key}`,
      key,
      size: file.size,
    };
  }

  async deleteFile(key: string): Promise<boolean> {
    return true;
  }
}

// 工厂函数获取当前配置的存储驱动
export const getStorageAdapter = (): StorageAdapter => {
  if (config.storage.driver === 'cos') {
    return new CosStorageAdapter();
  }
  return new LocalStorageAdapter();
};
