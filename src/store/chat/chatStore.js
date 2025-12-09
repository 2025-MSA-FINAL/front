import { create } from "zustand";
import { getMyChatRooms } from "../../api/chatApi";
import { useChatPopupStore } from "./chatPopupStore";

export const useChatStore = create((set) => ({
  rooms: [],
  activeChatRoom: null,
  loading: false,

  fetchRooms: async () => {
    try {
      set({ loading: true });
      const data = await getMyChatRooms();
      set({ rooms: data, loading: false });
    } catch (e) {
      console.error("채팅방 목록 로딩 실패:", e);
      set({ loading: false });
    }
  },

  setActiveChatRoom: (room) => set({ activeChatRoom: room }),

  selectRoom: (room) => {
    const { closeCreateForm } = useChatPopupStore.getState();
    closeCreateForm();
    set({ activeChatRoom: room });
  },

  exitRoom: () => set({ activeChatRoom: null }),

  removeRoom: (roomType, roomId) =>
    set((state) => ({
      rooms: state.rooms.filter(
        (r) => !(r.roomType === roomType && r.roomId === roomId)
      ),
    })),
}));
