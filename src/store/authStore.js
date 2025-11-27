// src/store/authStore.js
import { create } from "zustand";
import { loginApi, logoutApi, fetchMeApi } from "../api/authApi";

export const useAuthStore = create((set, get) => ({
  user: null,          // 현재 로그인한 유저 정보
  loading: false,
  initialized: false,  // fetchMe 한 번 했는지 여부
  error: null,

  // 🔐 일반 로그인
  login: async ({ loginId, password }) => {
    set({ loading: true, error: null });
    try {
      // 1) 로그인 -> 쿠키 세팅
      await loginApi({ loginId, password });

      // 2) 내 정보 조회
      const me = await fetchMeApi();

      set({
        user: me,
        loading: false,
        initialized: true,
      });
    } catch (err) {
      console.error("login error:", err);
      set({ loading: false, error: err });
      throw err;
    }
  },

  // 🚪 로그아웃
  logout: async () => {
    set({ loading: true, error: null });
    try {
      await logoutApi(); // 쿠키 삭제
      set({ user: null, loading: false, initialized: false });
    } catch (err) {
      console.error("logout error:", err);
      set({ loading: false, error: err });
      throw err;
    }
  },

  // ✅ 내 정보 조회 (force=true 면 initialized 상관없이 다시 호출)
  fetchMe: async (force = false) => {
    if (!force && get().initialized) return;

    set({ loading: true, error: null });
    try {
      const me = await fetchMeApi();
      set({
        user: me,
        loading: false,
        initialized: true,
      });
    } catch (err) {
      console.warn("fetchMe error or not logged in:", err?.response?.status);
      set({
        user: null,
        loading: false,
        initialized: true,
      });
    }
  },

  // 🔥 프론트에서 특정 필드만 바로 바꾸고 싶을 때 사용
  // 예: setUser({ nickname: "새닉" }), setUser({ email: "test@..." })
  setUser: (partial) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : partial,
    })),
}));
