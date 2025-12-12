import axios from 'axios';
import { API_BASE } from "../utils/env";

const axiosInstance = axios.create({
  baseURL: API_BASE ,
  withCredentials: true,   // 반드시 필요!!!
  headers: {
    'Content-Type': 'application/json',
  },
});

// 세션 기반 인증에서는 Authorization 헤더 사용 안 함
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
