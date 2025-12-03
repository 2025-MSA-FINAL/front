import { apiClient } from "./authApi";

// ================================
// 1. 매니저 프로필
// ================================

//매니저 프로필 정보 조회
export async function fetchManagerProfileApi() {
  const res = await apiClient.get("/api/managers/me/profile");
  return res.data; // { userId, brandName, email, phone, ... }
}

//이메일 수정
export async function updateManagerEmailApi(payload) {
  // payload: { email }
  return apiClient.patch("/api/managers/me/email", payload);
}

//전화번호 수정
export async function updateManagerPhoneApi(payload) {
  return apiClient.patch("/api/managers/me/phone", payload);
}

//비밀번호 변경
export async function changeManagerPasswordApi(payload) {
  // payload: { currentPassword, newPassword }
  return apiClient.patch("/api/managers/me/password", payload);
}

// ================================
// 2. 내가 등록한 팝업 목록
// ================================

//내가 등록한 팝업 목록 조회
// params: { page, size, status, sortDir }
export async function fetchManagerPopupListApi(params = {}) {
  const query = { ...params };

  Object.keys(query).forEach((key) => {
    if (
      query[key] === undefined ||
      query[key] === null ||
      query[key] === ""
    ) {
      delete query[key];
    }
  });

  const res = await apiClient.get("/api/managers/me/popups", {
    params: query,
  });
  return res.data; // PageDTO<PopupListItemResponse>
}

// ================================
// 3. 팝업 상세 + 예약자 목록
// ================================

//팝업 상세 (매니저 전용)
export async function fetchManagerPopupDetailApi(popId) {
  if (!popId) throw new Error("popId가 없습니다.");
  const res = await apiClient.get(`/api/managers/popups/${popId}`);
  return res.data; // ManagerPopupDetailResponse
}

//예약자 명단 조회
export async function fetchManagerReservationListApi(popId, params = {}) {
  if (!popId) throw new Error("popId가 없습니다.");

  const query = { ...params };
  Object.keys(query).forEach((key) => {
    if (
      query[key] === undefined ||
      query[key] === null ||
      query[key] === ""
    ) {
      delete query[key];
    }
  });

  const res = await apiClient.get(
    `/api/managers/popups/${popId}/reservations`,
    { params: query }
  );
  return res.data; // PageDTO<ManagerReservationResponse>
}

// ================================
// 4. 팝업 기본 정보 수정
// ================================

//팝업 기본 정보 수정 (제목, 날짜, 가격 등)
export async function updateManagerPopupBasicApi(popId, dto) {
  if (!popId) throw new Error("popId가 없습니다.");
  return apiClient.patch(`/api/managers/popups/${popId}`, dto);
}
