import { create } from "zustand";
import { getMyChatRooms } from "../../api/chatApi";
import { useChatPopupStore } from "./chatPopupStore";
import { useChatMessageStore } from "./chatMessageStore";

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
    const { activeChatRoom } = useChatStore.getState();
    const { clearRoomState } = useChatMessageStore.getState();

    // 🔥 이전 방 roomState 정리
    if (activeChatRoom) {
      clearRoomState({
        roomType: activeChatRoom.roomType,
        roomId:
          activeChatRoom.roomType === "GROUP"
            ? activeChatRoom.gcrId
            : activeChatRoom.roomId,
      });
    }

    closeCreateForm();
    set({ activeChatRoom: room });
  },
  

  exitRoom: () => {
    const { activeChatRoom } = useChatStore.getState();
    if (activeChatRoom) {
      useChatMessageStore.getState().clearRoomState({
        roomType: activeChatRoom.roomType,
        roomId:
          activeChatRoom.roomType === "GROUP"
            ? activeChatRoom.gcrId
            : activeChatRoom.roomId,
      });
    }
    set({ activeChatRoom: null });
  },

  removeRoom: (roomType, roomId) =>
    set((state) => ({
      rooms: state.rooms.filter(
        (r) => !(r.roomType === roomType && r.roomId === roomId)
      ),
    })),

  updateRoomOrder: (roomType, roomId) =>
    set((state) => {
      const idx = state.rooms.findIndex(
        (r) => r.roomType === roomType && r.roomId === roomId
      );
      if (idx === -1) return state;

      const updated = [...state.rooms];
      const [target] = updated.splice(idx, 1);
      updated.unshift(target);

      return { rooms: updated };
    }),

    resetChatStore: () =>
    set({
      rooms: [],
      activeChatRoom: null,
      loading: false,
    }),

    addOrSelectPrivateRoom: (room) =>
    set((state) => {
      const exists = state.rooms.find(
        (r) => r.roomType === "PRIVATE" && r.roomId === room.roomId
      );

      if (exists) {
        // 이미 있으면 active 상태만 업데이트
        return { activeChatRoom: room };
      }

      // 없으면 rooms 배열 앞쪽에 추가
      return {
        rooms: [{ 
          roomName: room.roomName,
          roomId: room.roomId,
          roomType: "PRIVATE",
          otherUserNickname: room.otherUserNickname,
          otherUserProfileImage: room.otherUserProfileImage
        }, ...state.rooms],
        activeChatRoom: room,
      };
    }),
    updateRoomMeta: ({ roomType, roomId, patch }) =>
  set((state) => ({
    rooms: state.rooms.map((r) =>
      r.roomType === roomType && r.roomId === roomId
        ? { ...r, ...patch }
        : r
    ),
  })),
}));

