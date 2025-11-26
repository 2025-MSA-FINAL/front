// src/api/popupApi.js
import { apiClient } from "./authApi";

// 이미지 업로드 API (썸네일/상세 공용)
export async function uploadImageApi(files) {
  if (!files) {
    throw new Error("uploadImageApi: files가 없습니다.");
  }

  // FileList, 배열 모두 대응
  const fileArray = Array.from(files);

  if (fileArray.length === 0) {
    throw new Error("uploadImageApi: 업로드할 파일이 없습니다.");
  }

  const formData = new FormData();

  // 여러 장 업로드
  if (fileArray.length > 1) {
    fileArray.forEach((file) => {
      // 백엔드 다중 업로드 필드명에 맞게
      formData.append("files", file);
    });

    const res = await apiClient.post("/api/files/popup/list", formData);
    // 예상: [{ url, key }, ...] 또는 ["url1", "url2", ...]
    return res.data;
  }

  // 한 장 업로드
  formData.append("file", fileArray[0]); // 단일 업로드 필드명

  const res = await apiClient.post("/api/files/popup", formData);
  // 예상: { url, key }
  return res.data;
}

// 팝업 등록 API
export async function registerPopupApi(popupData) {
  const res = await apiClient.post("/api/popups", popupData);
  return res.data;
}
