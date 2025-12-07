/**
 * 업로드 API 응답에서 이미지 URL 배열만 뽑아주는 유틸
 * - ["url1", "url2"]
 * - [{ url: "..." }, ...]
 * - { url: "..." }
 * - { urls: ["...", ...] }
 * 같은 케이스를 공통 처리
 */
export function extractUploadedUrls(response) {
  if (!response) {
    console.warn("업로드 API 응답이 없습니다.", response);
    return [];
  }

  // 여러 장: ["url1", "url2", ...] 또는 [{ url, ... }, ...]
  if (Array.isArray(response)) {
    if (response.length === 0) return [];

    // ["url1", "url2", ...]
    if (typeof response[0] === "string") {
      return response;
    }

    // [{ url, ... }, ...]
    if (response[0].url) {
      return response.map((item) => item.url);
    }

    return [];
  }

  // 한 장: { url: "..." }
  if (response && response.url) {
    return [response.url];
  }

  // { urls: ["...", ...] } 형태
  if (Array.isArray(response?.urls)) {
    return response.urls;
  }

  console.warn("업로드 API 응답 형식을 확인해 주세요.", response);
  return [];
}
