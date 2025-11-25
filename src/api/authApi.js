// src/api/authApi.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // httpOnly 쿠키 사용
});

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

// 현재 로그인 유저 조회 (백엔드에서 /api/users/me 구현 필요)
export async function fetchMeApi() {
  const res = await apiClient.get("/api/users/me");
  return res.data; // { userId, nickname, profileImage, ... }
}
