import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

const request: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// 请求拦截器：注入 JWT
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('starry_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：统一 Envelope 解包与错误处理
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    if (res.code !== 0) {
      // 业务错误
      alert(res.message || '请求失败');
      if (res.code === 40101) {
        localStorage.removeItem('starry_admin_token');
        window.location.href = '/login';
      }
      return Promise.reject(new Error(res.message || 'Error'));
    }
    return res.data as any;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('starry_admin_token');
      window.location.href = '/login';
    }
    alert(error.response?.data?.message || error.message || '网络连接异常');
    return Promise.reject(error);
  }
);

export default request;
