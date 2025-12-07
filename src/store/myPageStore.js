// src/store/myPageStore.js
import { create } from "zustand";

export const useMyPageStore = create((set) => ({
  // 현재 선택된 탭
  // "reservation" | "wishlist"
  activeTab: "reservation",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
