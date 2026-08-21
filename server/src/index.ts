import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/index.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

// 基础中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态资源访问 (本地上传的媒体文件)
app.use('/uploads', express.static(path.resolve(config.storage.uploadDir)));

// API 路由挂载
app.use('/api', routes);

// 全局统一错误处理中间件
app.use(errorHandler);

// 启动服务 (非 test 环境)
if (config.env !== 'test') {
  app.listen(config.port, () => {
    console.log(`
    ✨ ======================================================== ✨
       若星空间 (Starry Space) API 服务已启动
       环境: ${config.env}
       端口: ${config.port}
       健康检查: http://localhost:${config.port}/api/health
    ✨ ======================================================== ✨
    `);
  });
}

export default app;
