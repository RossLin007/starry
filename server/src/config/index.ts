import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',

  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:starry_secret_password@localhost:5432/starry_db?schema=public',
  },

  jwt: {
    clientSecret: process.env.JWT_CLIENT_SECRET || 'starry_client_jwt_secret_dev_key_2026',
    clientExpiresIn: process.env.JWT_CLIENT_EXPIRES_IN || '7d',
    adminSecret: process.env.JWT_ADMIN_SECRET || 'starry_admin_jwt_secret_dev_key_2026',
    adminExpiresIn: process.env.JWT_ADMIN_EXPIRES_IN || '1d',
  },

  wechat: {
    appId: process.env.WECHAT_MINI_APP_ID || '',
    appSecret: process.env.WECHAT_MINI_APP_SECRET || '',
  },

  wechatPay: {
    mchId: process.env.WECHAT_PAY_MCH_ID || '',
    serialNo: process.env.WECHAT_PAY_SERIAL_NO || '',
    privateKeyPath: process.env.WECHAT_PAY_PRIVATE_KEY_PATH || '',
    apiV3Key: process.env.WECHAT_PAY_API_V3_KEY || '',
    notifyUrl: process.env.WECHAT_PAY_NOTIFY_URL || '',
  },

  storage: {
    driver: (process.env.STORAGE_DRIVER || 'local') as 'local' | 'cos' | 'oss',
    uploadDir: path.resolve(process.env.UPLOAD_DIR || './uploads'),
  },
};
