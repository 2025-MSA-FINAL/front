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
export async function joinGroupChatRoom(gcrId) {
  const res = await apiClient.post(`/api/chat/group/${gcrId}/join`);
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
export async function pureLlmReply(payload) {
  const res = await apiClient.post(
    "/api/chat/messages/pure-llm",
    payload,
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
}
/* -------------------------------------------
    7) 채팅 이미지 전송
------------------------------------------- */
export async function uploadChatImages({
  roomType,
  roomId,
  files,
  clientMessageKey,
}) {
  const formData = new FormData();
  formData.append("roomType", roomType);
  formData.append("roomId", roomId);
  formData.append("clientMessageKey", clientMessageKey);

  files.forEach((file) => {
    formData.append("images", file); // ⭐ 여러 개
  });

  const res = await apiClient.post(
    "/api/chat/messages/images",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return res.data; // ChatMessageResponse
}
/* -------------------------------------------
    8) 신고 생성
------------------------------------------- */
export async function createChatReport(payload) {
  const res = await apiClient.post(
    "/api/chat/reports",
    payload,
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
}

/* -------------------------------------------
   9) 신고 이미지 업로드
------------------------------------------- */
export async function uploadReportImages(files) {
  if (!files || files.length === 0) return [];

  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const res = await apiClient.post(
    "/api/chat/reports/upload",   // ✅ 백엔드와 일치
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return res.data; // List<String>
}

/* -------------------------------------------
    10) 예약 메시지 (Schedule Message)
------------------------------------------- */

/**
 * 예약 메시지 생성
 * POST /api/chat/schedule
 */
export async function createScheduledMessage(payload) {
  const res = await apiClient.post(
    "/api/chat/schedule",
    payload,
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
}

/**
 * 내 예약 메시지 목록 조회
 * GET /api/chat/schedule?status=PENDING
 */
export async function getMyScheduledMessages(status = "PENDING") {
  const res = await apiClient.get("/api/chat/schedule", {
    params: { status },
  });
  return res.data; // List<ScheduledMessageResponse>
}

/**
 * 예약 메시지 수정
 * PUT /api/chat/schedule/{csmId}
 */
export async function updateScheduledMessage(csmId, payload) {
  const res = await apiClient.put(
    `/api/chat/schedule/${csmId}`,
    payload,
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
}

/**
 * 예약 메시지 취소
 * DELETE /api/chat/schedule/{csmId}
 */
export async function cancelScheduledMessage(csmId) {
  const res = await apiClient.delete(
    `/api/chat/schedule/${csmId}`
  );
  return res.data;
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
  pureLlmReply,

  uploadChatImages,
  createChatReport,
  uploadReportImages,

  createScheduledMessage,
  getMyScheduledMessages,
  updateScheduledMessage,
  cancelScheduledMessage,
};
