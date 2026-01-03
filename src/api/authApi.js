// src/api/authApi.js
import axios from "axios";
import { API_BASE } from "../utils/env";
import { useAuthStore } from "../store/authStore";

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // httpOnly 쿠키 사용
});

/* ===============================
   ✅ refresh interceptor (여기 추가)
   =============================== */

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((p) => {
    error ? p.reject(error) : p.resolve();
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    // 네트워크 에러 등 response 없는 경우
    if (!originalRequest || !status) {
      return Promise.reject(error);
    }

    // 로그인 실패(401)는 refresh 걸면 안 됨
    const isLoginCall = originalRequest?.url?.includes("/api/auth/login");
    if (status === 401 && isLoginCall) {
      return Promise.reject(error);
    }

    // refresh 요청 자체가 401이면 무한루프 방지
    const isRefreshCall =
      originalRequest?.url?.includes("/api/auth/refresh") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (status === 401 && isRefreshCall) {
      const { logout } = useAuthStore.getState();
      try {
        await logout();
      } catch (_) {}
      return Promise.reject(error);
    }

    // access 만료로 401 + 아직 retry 안 한 요청만
    if (status === 401 && !originalRequest._retry) {
      // 이미 refresh 중이면 큐에 쌓아서 대기
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 🔄 refresh 호출 (쿠키의 refreshToken 사용)
        await apiClient.post("/api/auth/refresh");

        // refresh 성공 → 대기 중 요청들 풀기
        processQueue(null);

        // 🔥 원래 요청 재시도
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        // refresh 실패 → 로그아웃 처리
        const { logout } = useAuthStore.getState();
        try {
          await logout();
        } catch (_) {}

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/* ===============================
   기존 API 함수들 (그대로)
   =============================== */

// 일반 로그인
export async function loginApi({ loginId, password }) {
  const res = await apiClient.post(
    "/api/auth/login",
    { loginId, password },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return res;
}

// 로그아웃
export async function logoutApi() {
  return apiClient.post("/api/auth/logout");
}

// 현재 로그인 유저 조회
export async function fetchMeApi() {
  const res = await apiClient.get("/api/users/me");
  return res.data;
}
