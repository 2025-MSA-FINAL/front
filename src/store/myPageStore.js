// src/store/myPageStore.js
import { create } from "zustand";

export const useMyPageStore = create((set) => ({
  // 탭 상태
  activeTab: "reservation", // "reservation" | "wishlist"
  setActiveTab: (tab) => set({ activeTab: tab }),

  // TODO: 백엔드 연동 전까지는 샘플 데이터 사용
  reservations: [
    {
      id: 1,
      popupName: "탕종제빵소",
      date: "2025.11.20",
      time: "18:00",
      people: 2,
      price: 15000,
      status: "RESERVED", // RESERVED | CANCELLED
    },
    {
      id: 2,
      popupName: "탕종제빵소",
      date: "2025.11.20",
      time: "18:00",
      people: 2,
      price: 15000,
      status: "CANCELLED",
    },
  ],
  wishlist: [],

  setReservations: (list) => set({ reservations: list }),
  setWishlist: (list) => set({ wishlist: list }),
}));
