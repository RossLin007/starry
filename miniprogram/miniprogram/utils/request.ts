export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

/**
 * 环境切换配置
 * - 'local': 本地开发环境 (http://localhost:3000/api)
 * - 'remote': 远程测试/云服务器 (http://<REMOTE_IP>:3000/api 或 https://api.yourdomain.com/api)
 * - 'prod': 正式生产环境 (https://api.yourdomain.com/api)
 */
const CURRENT_ENV: 'local' | 'remote' | 'prod' = 'local';

const BASE_URL_MAP: Record<string, string> = {
  local: 'http://localhost:3000/api',
  remote: 'http://127.0.0.1:3000/api', // 👈 替换为你的远程服务器 IP:端口 或域名
  prod: 'https://api.yourdomain.com/api',
};

const BASE_URL = BASE_URL_MAP[CURRENT_ENV];

export const request = <T = any>(options: {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: Record<string, string>;
}): Promise<T> => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('starry_client_token');
    const header: Record<string, string> = {
      'content-type': 'application/json',
      ...(options.header || {}),
    };

    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    wx.request({
      url: `${BASE_URL}${options.url.startsWith('/') ? options.url : `/${options.url}`}`,
      method: options.method || 'GET',
      data: options.data,
      header,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const apiRes = res.data as ApiResponse<T>;
          if (apiRes.code === 0) {
            resolve(apiRes.data);
          } else {
            wx.showToast({
              title: apiRes.message || '请求失败',
              icon: 'none',
            });
            reject(new Error(apiRes.message));
          }
        } else if (res.statusCode === 401) {
          wx.removeStorageSync('starry_client_token');
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none',
          });
          reject(new Error('Unauthorized'));
        } else {
          wx.showToast({
            title: '网络连接异常',
            icon: 'none',
          });
          reject(new Error('Network error'));
        }
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};
