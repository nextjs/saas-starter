import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '../store';
import { updateIsLoggedIn } from '../store/reducers/userSlice';

// 定义接口响应数据的类型
interface ResponseData<T = any> {
  code: number;
  data: T;
  message: string;
}

// 创建请求类
class HttpRequest {
  private instance: AxiosInstance;
  
  constructor(config: AxiosRequestConfig) {
    // 创建 axios 实例
    this.instance = axios.create(config);
    
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 在发送请求之前做些什么
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        // 对响应数据做点什么
        const { data } = response;
        // if (data.code !== 200) {
        //   return Promise.reject(new Error(data.message || 'Request failed'));
        // }
        if (data.code === 401) {
          localStorage.removeItem('token');
          store.dispatch(updateIsLoggedIn(false));
          return Promise.reject(new Error(data.message || 'Request failed'));
        }
        return data;
      },
      (error) => {
        // 对响应错误做点什么
        // if (error.response) {
        //   switch (error.response.status) {
        //     case 401:
        //       // 未授权，跳转到登录页
        //       // 可以在这里添加跳转逻辑
        //       break;
        //     case 403:
        //       // 权限不足
        //       break;
        //     case 404:
        //       // 请求不存在
        //       break;
        //     default:
        //     }
        //   }
        console.error('Request Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // GET 请求
  public get<T = any>(url: string, params?: any): Promise<ResponseData<T>> {
    return this.instance.get(url, { params });
  }

  // POST 请求
  public post<T = any>(url: string, data?: any, config?: any): Promise<ResponseData<T>> {
    return this.instance.post(url, data, config);
  }

  // PUT 请求
  public put<T = any>(url: string, data?: any): Promise<ResponseData<T>> {
    return this.instance.put(url, data);
  }

  // DELETE 请求
  public delete<T = any>(url: string, params?: any): Promise<ResponseData<T>> {
    return this.instance.delete(url, { params });
  }
}

// 创建请求实例
const request = new HttpRequest({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // 设置基础URL
  // timeout: 10000, // 设置超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

export default request;
