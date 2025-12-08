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
export async function fetchManagerPopupListApi(params = {}) {
  const { sort, ...rest } = params;

  //백엔드 요청 파라미터 매핑
  const query = { 
    ...rest, 
    sortBy: sort 
  };

  //null, undefined, 빈 문자열 파라미터 제거
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
  return res.data; 
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
// 4. 팝업 수정 및 삭제 (CRUD)
// ================================

//팝업 기본 정보 수정
export async function updateManagerPopupBasicApi(popId, dto) {
  if (!popId) throw new Error("popId가 없습니다.");
  return apiClient.patch(`/api/managers/popups/${popId}`, dto);
}

//팝업 삭제 (Soft Delete)
export async function deleteManagerPopupApi(popId) {
  if (!popId) throw new Error("popId가 없습니다.");
  return apiClient.delete(`/api/managers/popups/${popId}`);
}

// ================================
// 5. 매니저 리포트(통계)
// ================================

//팝업 리포트 조회
export async function fetchManagerReportApi(popId) {
  if (!popId) throw new Error("popId가 없습니다.");
  const res = await apiClient.get(`/api/manager/popups/${popId}/report`);
  return res.data; // ManagerReportResponseDto
}