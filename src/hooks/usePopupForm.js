import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadImageApi, registerPopupApi } from "../api/popupApi";
import { extractUploadedUrls } from "../utils/imageUpload";
import { validatePopup } from "../utils/popupValidation";

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


export function usePopupForm() {
  const navigate = useNavigate();

  //form + touched + 로딩 상태
  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //최신 form 기준으로 에러 계산
  const errors = validatePopup(form);

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

    if (type === "detail" && form.popImages.length >= MAX_DETAIL_IMAGES) {
      alert(`상세 이미지는 최대 ${MAX_DETAIL_IMAGES}장까지 업로드할 수 있어요.`);
      return;
    }

    try {
      setIsUploading(true);
      const response = await uploadImageApi(files);

      const uploadedUrls = extractUploadedUrls(response);
      if (!uploadedUrls || uploadedUrls.length === 0) return;

      setForm((prev) => {
        if (type === "thumbnail") {
          return { ...prev, popThumbnail: uploadedUrls[0] };
        }
        if (type === "detail") {
          const current = prev.popImages || [];
          const remain = MAX_DETAIL_IMAGES - current.length;
          const toAdd = uploadedUrls.slice(0, remain);
          return { ...prev, popImages: [...current, ...toAdd] };
        }
        return prev;
      });
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  //상세 이미지 삭제
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

      //범위 체크
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
    const currentErrors = validatePopup(form);

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
      const popupId = await registerPopupApi(payload);

      alert("팝업 스토어가 성공적으로 등록되었습니다!");

      if (form.popIsReservation === true && popupId) {
        navigate(`/manager/popup/${popupId}/reservation`, {
          state: {
            popupStartDate: form.popStartDate,
            popupEndDate: form.popEndDate,
          },
        });
      } else {
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
