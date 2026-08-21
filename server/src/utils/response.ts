import { Response } from 'express';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
}

export class ApiError extends Error {
  public statusCode: number;
  public errorCode: number;

  constructor(statusCode: number, errorCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(message = '请求参数错误', errorCode = 40001) {
    return new ApiError(400, errorCode, message);
  }

  static unauthorized(message = '未登录或认证已过期', errorCode = 40101) {
    return new ApiError(401, errorCode, message);
  }

  static forbidden(message = '暂无权限访问该资源', errorCode = 40301) {
    return new ApiError(403, errorCode, message);
  }

  static notFound(message = '请求的资源不存在', errorCode = 40401) {
    return new ApiError(404, errorCode, message);
  }

  static internal(message = '系统内部繁忙，请稍后再试', errorCode = 50001) {
    return new ApiError(500, errorCode, message);
  }
}

export const sendSuccess = <T>(res: Response, data?: T, message = 'success', statusCode = 200) => {
  const responsePayload: ApiResponse<T> = {
    code: 0,
    message,
    data,
    timestamp: Date.now(),
  };
  return res.status(statusCode).json(responsePayload);
};

export const sendError = (res: Response, statusCode: number, errorCode: number, message: string) => {
  const responsePayload: ApiResponse<null> = {
    code: errorCode,
    message,
    timestamp: Date.now(),
  };
  return res.status(statusCode).json(responsePayload);
};
