// src/api/myPageApi.js
import { apiClient } from "./authApi";

// 닉네임 변경
export async function updateNicknameApi(payload) {
  // { nickname }
  return apiClient.put("/api/users/me/nickname", payload);
}

// 이메일 변경
export async function updateEmailApi(payload) {
  // { email }
  return apiClient.put("/api/users/me/email", payload);
}

// 휴대폰 변경
export async function updatePhoneApi(payload) {
  // { phone }
  return apiClient.put("/api/users/me/phone", payload);
}

// 비밀번호 변경
export async function changePasswordApi(payload) {
  // { currentPassword, newPassword }
  return apiClient.put("/api/users/me/password", payload);
}

// 회원탈퇴
export async function deleteMeApi() {
  return apiClient.delete("/api/auth/withdraw");
}

// 프로필 이미지 업로드
export async function uploadProfileImageApi(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiClient.post("/api/files/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data; // { url, key }
}

// 프로필 정보 업데이트 (url, key)
export async function updateProfileApi(dto) {
  // dto: { url, key }
  const res = await apiClient.patch("/api/users/me/profile", dto);
  return res.data;
}

// ✅ 자기소개 변경 (전용 API)
export async function updateIntroductionApi(dto) {
  // dto: { introduction }
  return apiClient.patch("/api/users/me/introduction", dto);
}

// 현재 비밀번호 검증
export async function checkPasswordApi(payload) {
  // payload = { password: "현재비번" }
  const res = await apiClient.post("/api/users/me/password/check", payload);
  return res.data; // true / false
}

// ✅ 찜 토글 (마이페이지/상세 공용)
export async function toggleWishlistApi(popupId) {
  const res = await apiClient.post(`/api/popup/${popupId}/wishlist`);
  return res.data; // { isLiked }
}

// ✅ 찜한 팝업 목록 전체 삭제
export async function deleteAllWishlistApi() {
  const res = await apiClient.delete("/api/users/me/wishlist");
  return res.data; // Boolean
}

// ✅ 찜한 목록 중 종료된 팝업 전체 삭제
export async function deleteCloseWishlistApi() {
  const res = await apiClient.delete("/api/users/me/wishlist/close");
  return res.data; // Boolean
}

// ✅ 휴대폰 인증번호 전송
export async function sendPhoneCodeApi(phone) {
  // 백엔드: POST /api/auth/phone/send { phone }
  const res = await apiClient.post("/api/auth/phone/send", { phone });
  return res.data; // 필요시 메시지 등
}

// ✅ 휴대폰 인증번호 검증
export async function verifyPhoneCodeApi(payload) {
  // payload: { phone, code }
  // 백엔드: POST /api/auth/phone/verify
  const res = await apiClient.post("/api/auth/phone/verify", payload);
  return res.data; // true / false
}
