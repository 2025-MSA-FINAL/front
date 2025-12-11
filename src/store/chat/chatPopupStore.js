import { create } from "zustand";
import { 
  getAllPopups, 
  getGroupChatRoomList,
  joinGroupChatRoom,
  getGroupChatRoomDetail
} from "../../api/chatApi";

import { useChatStore } from "./chatStore";  

export const useChatPopupStore = create((set) => ({
  popups: [],
  selectedPopup: null,
  popupRooms: [],
  selectedGroupRoom: null,
  loading: false,
  createMode: false,
  error: null,

  // 팝업 불러오기
fetchPopups: async (keyword = "") => {
  try {
    set({ loading: true });
    const data = await getAllPopups(keyword);

    set({
      popups: data.popups ?? [],
      loading: false,
    });

  } catch (err) {
    console.error("팝업 목록 조회 실패:", err);
    set({ loading: false, error: err });
  }
},


  // 팝업 선택
  selectPopup: (popup) => set({ selectedPopup: popup }),

  // 그룹채팅방 선택
  selectGroupRoom: (room) => set({ selectedGroupRoom: room }),

  // 특정 팝업의 그룹채팅방 목록 가져오기
  fetchPopupRooms: async (popId) => {
    try {
      set({ loading: true });
      const data = await getGroupChatRoomList(popId);
      set({ popupRooms: data ?? [], loading: false });
    } catch (err) {
      set({ loading: false, error: err });
    }
  },

  // 그룹방 상세 조회
fetchRoomDetail: async (gcrId) => {
  try {
    const detail = await getGroupChatRoomDetail(gcrId);
    set({ selectedGroupRoom: detail, createMode: false });
    return detail;  
  } catch (e) {
    console.error("그룹방 상세 조회 실패", e);
  }
},

  // ⭐ 그룹방 참여 → 메시지창 전환
joinRoom: async (gcrId) => {
  try {
    await joinGroupChatRoom({ gcrId });

    const detail = await getGroupChatRoomDetail(gcrId);

    const { selectRoom } = useChatStore.getState();
    selectRoom(detail);

    const { fetchRooms } = useChatStore.getState();
    fetchRooms();

    const { selectedPopup, fetchPopupRooms } = useChatPopupStore.getState();
    if (selectedPopup) {
      fetchPopupRooms(selectedPopup.popId);
    }

    set({
      selectedGroupRoom: null,
      createMode: false,
    });

  } catch (err) {
    console.error("채팅방 참여 실패:", err);
    throw err;
  }
},


  // 초기화
  resetPopup: () => {
    set({
      selectedPopup: null,
      popupRooms: [],
      selectedGroupRoom: null,
      createMode: false,
    });
  },

  // 생성 모드
  openCreateForm: () => set({ createMode: true }),
  closeCreateForm: () => set({ createMode: false }),
}));
