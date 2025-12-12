// src/api/chatApi.js
import { apiClient } from "./authApi";


/* -------------------------------------------
    1) 내가 참여한 채팅방 목록 조회
       GET /api/chat/my-rooms
------------------------------------------- */
export async function getMyChatRooms() {
  const res = await apiClient.get("/api/chat/my-rooms");
  return res.data; // List<ChatRoomSummaryResponse>
}

/* -------------------------------------------
    1-2) 팝업 리스트 조회
       GET /api/chat/popup/list
------------------------------------------- */
export async function getAllPopups(keyword = "") {
  const res = await apiClient.get("/api/chat/popup/list", {
    params: keyword ? { keyword } : {}
  });
  return res.data;
}

/* -------------------------------------------
    2) 그룹 채팅
------------------------------------------- */

// 그룹 채팅방 생성
export async function createGroupChatRoom(payload) {
  const res = await apiClient.post("/api/chat/group/create", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data; // new roomId
}

// 특정 팝업의 그룹채팅방 목록
export async function getGroupChatRoomList(popId) {
  const res = await apiClient.get("/api/chat/group/list", {
    params: { popId },
  });
  return res.data;
}

// 그룹 채팅 참여
export async function joinGroupChatRoom(payload) {
  const res = await apiClient.post("/api/chat/group/join", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// 그룹 채팅 상세 조회
export async function getGroupChatRoomDetail(gcrId) {
  const res = await apiClient.get(`/api/chat/group/${gcrId}`);
  return res.data;
}

// 그룹 채팅 참여자 조회
export async function getGroupChatParticipants(gcrId) {
  const res = await apiClient.get(`/api/chat/group/${gcrId}/participants`);
  return res.data;
}

// 그룹 채팅 수정
export async function updateGroupChatRoom(gcrId, payload) {
  const res = await apiClient.patch(
    `/api/chat/group/update/${gcrId}`,
    payload,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return res.data;
}

// 그룹 채팅 삭제
export async function deleteGroupChatRoom(gcrId) {
  const res = await apiClient.delete(`/api/chat/group/delete/${gcrId}`);
  return res.data;
}

// 그룹 채팅방 나가기
export async function leaveGroupChatRoom(gcrId) {
  const res = await apiClient.delete(`/api/chat/group/leave/${gcrId}`);
  return res.data;
}

/* -------------------------------------------
    3) 1:1(Private) 채팅
------------------------------------------- */

export async function startPrivateChat(payload) {
  const res = await apiClient.post("/api/chat/private/start", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

export async function deletePrivateChatRoom(pcrId) {
  const res = await apiClient.post(`/api/chat/private/delete`, null, {
    params: { pcrId },
  });
  return res.data;
}

/* -------------------------------------------
    4) 숨김/숨김 해제
------------------------------------------- */

export async function hideChatRoom(crhType, crhRoomId) {
  const res = await apiClient.post("/chat/hidden/hide", null, {
    params: { crhType, crhRoomId },
  });
  return res.data;
}

export async function unhideChatRoom(crhType, crhRoomId) {
  const res = await apiClient.post("/chat/hidden/unhide", null, {
    params: { crhType, crhRoomId },
  });
  return res.data;
}

/* -------------------------------------------
    5) 유저 프로필 조회
------------------------------------------- */
export async function getMiniUserProfile(userId) {
  const res = await apiClient.get(`/api/chat/users/${userId}`);
  return res.data; 
}

/* -------------------------------------------
    6) AI 채팅 시작
------------------------------------------- */
export async function startAiChat() {
  const res = await apiClient.post("/api/chat/private/start-ai", null, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data; // roomId
}

/* -------------------------------------------
    기본 export
------------------------------------------- */
export default {
  getMyChatRooms,
  getAllPopups,  
  createGroupChatRoom,
  getGroupChatRoomList,
  joinGroupChatRoom,
  getGroupChatRoomDetail,
  getGroupChatParticipants,
  updateGroupChatRoom,
  deleteGroupChatRoom,
  leaveGroupChatRoom,

  startPrivateChat,
  deletePrivateChatRoom,

  hideChatRoom,
  unhideChatRoom,
  getMiniUserProfile,
  startAiChat,
};
