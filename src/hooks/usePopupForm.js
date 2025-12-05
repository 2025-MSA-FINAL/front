// src/hooks/usePopupForm.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadImageApi, registerPopupApi } from "../api/popupApi";

const MAX_DETAIL_IMAGES = 10;

const INITIAL_FORM = {
  popName: "",
  popDescription: "",
  popLocation: "",
  locationDetail: "",
  popStartDate: "",
  popEndDate: "",
  popPrice: "",
  popInstaUrl: "",
  popIsReservation: null,
  popThumbnail: "",
  popImages: [],
  hashtags: [],
};

//검증 함수
function validate(form) {
  const errors = {};

  if (!form.popName.trim()) {
    errors.popName = "팝업 스토어 이름을 입력해 주세요.";
  }

  if (!form.popDescription.trim()) {
    errors.popDescription = "팝업 스토어 설명을 입력해 주세요.";
  }

  //장소 + 상세 주소는 한 그룹으로 판단
  if (!form.popLocation) {
    errors.popLocation = "팝업 스토어 장소를 선택해 주세요.";
  }

  if (!form.popStartDate || !form.popEndDate) {
    errors.popDateRange = "팝업 스토어 기간을 선택해 주세요.";
  } else {
    const start = new Date(form.popStartDate);
    const end = new Date(form.popEndDate);
    if (start > end) {
      errors.popDateRange = "종료일은 시작일보다 이후여야 합니다.";
    }
  }

  if (
    form.popPrice === "" ||
    form.popPrice === null ||
    form.popPrice === undefined
  ) {
    errors.popPrice = "가격을 입력해 주세요.";
  } else {
    const priceNumber = Number(String(form.popPrice).replace(/[^0-9]/g, ""));
    if (priceNumber < 0) {
      errors.popPrice = "0원 이상 입력해 주세요.";
    }
  }

  if (!form.popThumbnail) {
    errors.popThumbnail = "대표 이미지를 등록해 주세요.";
  }

  if (!form.popImages || form.popImages.length === 0) {
    errors.popImages = "상세 이미지를 한 개 이상 등록해 주세요.";
  }

  if (!form.hashtags || form.hashtags.length === 0) {
    errors.hashtags = "최소 한 개 이상의 태그를 입력해 주세요.";
  } else if (form.hashtags.length > 10) {
    errors.hashtags = "태그는 최대 10개까지 입력할 수 있습니다.";
  }

  if (form.popInstaUrl && !/^https?:\/\//.test(form.popInstaUrl)) {
    errors.popInstaUrl = "링크는 http:// 또는 https:// 로 시작해야 합니다.";
  }

  if (form.popIsReservation === null || form.popIsReservation === undefined) {
    errors.popIsReservation = "예약 여부를 선택해 주세요.";
  }

  return errors;
}

export function usePopupForm() {
  const navigate = useNavigate();

  //form + touched + 로딩 상태
  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //최신 form 기준으로 에러 계산
  const errors = validate(form);

  //가격 등 공통 onChange
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      if (name === "popPrice") {
        const numeric = value.replace(/[^0-9]/g, "");
        return { ...prev, [name]: numeric };
      }
      return { ...prev, [name]: value };
    });
  };

  //blur 시 touched 처리
  const handleBlur = (e) => {
    const { name } = e.target || {};
    if (!name) return;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  //특정 필드를 강제로 touched
  const markFieldTouched = (name) => {
    if (!name) return;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  //submit 시 전체 필드 touched
  const markAllTouched = () => {
    setTouched((prev) => ({
      ...prev,
      popName: true,
      popDescription: true,
      popLocation: true,
      locationDetail: true,
      popStartDate: true,
      popEndDate: true,
      popPrice: true,
      popInstaUrl: true,
      popIsReservation: true,
      popThumbnail: true,
      popImages: true,
      hashtags: true,
    }));
  };

  //라디오 + touched 처리
  const handleRadioChange = (val) => {
    setForm((prev) => ({
      ...prev,
      popIsReservation: val,
    }));
    markFieldTouched("popIsReservation");
  };

  //태그 추가: # 자동 + 중복/10개 제한
  const addTag = (rawTag) => {
    const trimmed = rawTag.trim();
    if (!trimmed) return;
    setForm((prev) => {
      const current = prev.hashtags || [];
      if (current.length >= 10) return prev;
      const normalized = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
      if (current.includes(normalized)) return prev;
      return {
        ...prev,
        hashtags: [...current, normalized],
      };
    });
    markFieldTouched("hashtags");
  };

  const removeTag = (tagToRemove) => {
    setForm((prev) => ({
      ...prev,
      hashtags: (prev.hashtags || []).filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleImageUpload = async (files, type) => {
    if (!files || files.length === 0) return;

    // 상세 이미지 개수 제한
    if (type === "detail" && (form.popImages?.length || 0) >= MAX_DETAIL_IMAGES) {
      alert(`상세 이미지는 최대 ${MAX_DETAIL_IMAGES}장까지 업로드할 수 있어요.`);
      return;
    }

    try {
      setIsUploading(true);

      // FileList 그대로 전달
      const response = await uploadImageApi(files);

      if (!response) {
        console.warn("업로드 API 응답이 없습니다.", response);
        return;
      }

      let uploadedUrls = [];

      // 여러 장 업로드: [{ url, key }, ...] 또는 ["url1", "url2", ...]
      if (Array.isArray(response)) {
        if (response.length > 0 && typeof response[0] === "string") {
          uploadedUrls = response;
        } else if (response.length > 0 && response[0].url) {
          uploadedUrls = response.map((item) => item.url);
        }
      }
      // 한 장 업로드: { url, key }
      else if (response && response.url) {
        uploadedUrls = [response.url];
      }
      // 혹시 { urls: [...] } 같은 형태도 대비
      else if (Array.isArray(response?.urls)) {
        uploadedUrls = response.urls;
      }

      if (!uploadedUrls || uploadedUrls.length === 0) {
        console.warn("업로드 API 응답 형식을 확인해 주세요.", response);
        return;
      }

      setForm((prev) => {
        if (type === "thumbnail") {
          return {
            ...prev,
            popThumbnail: uploadedUrls[0],
          };
        }

        if (type === "detail") {
          const already = prev.popImages?.length || 0;
          const remain = Math.max(MAX_DETAIL_IMAGES - already, 0);

          const nextImages = [
            ...(prev.popImages || []),
            ...uploadedUrls.slice(0, remain),
          ];

          return {
            ...prev,
            popImages: nextImages,
          };
        }

        return prev;
      });

      markFieldTouched(type === "thumbnail" ? "popThumbnail" : "popImages");
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  // 상세 이미지 삭제
  const handleRemoveDetailImage = (index) => {
    setForm((prev) => ({
      ...prev,
      popImages: prev.popImages.filter((_, i) => i !== index),
    }));
    markFieldTouched("popImages");
  };

  const moveDetailImage = (fromIndex, toIndex) => {
    setForm((prev) => {
      const arr = [...(prev.popImages || [])];

      // 범위 체크
      if (toIndex < 0 || toIndex >= arr.length) {
        return prev;
      }

      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);

      return {
        ...prev,
        popImages: arr,
      };
    });

    markFieldTouched("popImages");
  };

  //submit 시 검증 → 에러 있으면 touched + alert
  const handleSubmit = async () => {
    const currentErrors = validate(form);

    if (Object.keys(currentErrors).length > 0) {
      markAllTouched();
      alert("필수 정보를 확인해 주세요.");
      return;
    }

    const priceNumber = form.popPrice
      ? Number(String(form.popPrice).replace(/[^0-9]/g, ""))
      : 0;

    const fullLocation = [form.popLocation, form.locationDetail]
      .filter(Boolean)
      .join(" ")
      .trim();

    const payload = {
      popName: form.popName,
      popDescription: form.popDescription,
      popLocation: fullLocation,
      popStartDate: form.popStartDate ? form.popStartDate + ":00" : null,
      popEndDate: form.popEndDate ? form.popEndDate + ":00" : null,
      popPrice: priceNumber,
      popInstaUrl: form.popInstaUrl || null,
      popIsReservation: form.popIsReservation,
      popThumbnail: form.popThumbnail,
      popImages: form.popImages,
      hashtags: (form.hashtags || []).map((tag) => tag.replace(/^#/, "")),
    };

    try {
      setIsSubmitting(true);

      // ✅ ResponseEntity<Long> body(Long) 가 반환된다고 가정
      const popupId = await registerPopupApi(payload);

      alert("팝업 스토어가 성공적으로 등록되었습니다!");

      // ✅ 예약 있음 + popupId 있으면 → 팝업 기간을 state 로 함께 전달
      if (form.popIsReservation === true && popupId) {
        navigate(`/manager/popup/${popupId}/reservation`, {
          state: {
            popupStartDate: form.popStartDate, // 예: "2025-12-01T10:00"
            popupEndDate: form.popEndDate,     // 예: "2025-12-10T22:00"
          },
        });
      } else {
        // 예약 없으면 기존처럼 메인으로
        navigate("/");
      }
    } catch (error) {
      console.error("등록 실패:", error);
      alert("등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    errors,
    touched,
    loading: isUploading || isSubmitting,
    isUploading,
    isSubmitting,
    handleChange,
    handleBlur,
    handleRadioChange,
    handleImageUpload,
    handleRemoveDetailImage,
    addTag,
    moveDetailImage,
    removeTag,
    handleSubmit,
    markFieldTouched,
    maxDetailImages: MAX_DETAIL_IMAGES,
  };
}
