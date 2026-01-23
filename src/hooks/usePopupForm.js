import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { uploadImageApi, registerPopupApi } from "../api/popupApi";
import { extractUploadedUrls } from "../utils/imageUpload";
import { validatePopup } from "../utils/popupValidation";
import { buildStartDateTime, buildEndDateTime } from "../utils/popupDate";

const MAX_DETAIL_IMAGES = 10;

//Undo 토스트 노출 시간
const UNDO_TOAST_DURATION_MS = 4000;

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

/** 업로드 검증 정책 */
const ALLOWED_IMAGE_EXT = ["jpg", "jpeg", "png", "webp", "heic", "heif"];
const MAX_FILE_MB = 5;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

const MAX_TOTAL_UPLOAD_MB = 18;
const MAX_TOTAL_UPLOAD_BYTES = MAX_TOTAL_UPLOAD_MB * 1024 * 1024;

const getExt = (name = "") => {
  const parts = name.split(".");
  return (parts[parts.length - 1] || "").toLowerCase();
};

const bytesToMB = (bytes) => (bytes / 1024 / 1024).toFixed(1);

export function usePopupForm() {
  const navigate = useNavigate();

  //form + touched + 로딩 상태
  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //업로드 관련 에러(필드별) + 폼 하단 메시지
  const [uploadErrors, setUploadErrors] = useState({});
  const [formMessage, setFormMessage] = useState("");

  //Undo 토스트(마지막 삭제 1건)
  const [undoToast, setUndoToast] = useState({
    visible: false,
    message: "",
    variant: "success",
  });
  const [lastRemoved, setLastRemoved] = useState(null); // { url, index }
  const undoTimerRef = useRef(null);

  const clearFormMessage = () => setFormMessage("");

  //최신 form 기준으로 에러 계산 + 업로드 에러 merge
  const baseErrors = validatePopup(form);
  const errors = { ...baseErrors, ...uploadErrors };

  //가격 등 공통 onChange
  const handleChange = (e) => {
    const { name, value } = e.target;
    clearFormMessage();

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
    clearFormMessage();
    setForm((prev) => ({
      ...prev,
      popIsReservation: val,
    }));
    markFieldTouched("popIsReservation");
  };

  //태그 추가: # 자동 + 중복/10개 제한
  const addTag = (rawTag) => {
    clearFormMessage();
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
    clearFormMessage();
    setForm((prev) => ({
      ...prev,
      hashtags: (prev.hashtags || []).filter((tag) => tag !== tagToRemove),
    }));
  };

  /** uploadErrors 유틸 */
  const setFieldUploadError = (field, message) => {
    setUploadErrors((prev) => ({ ...prev, [field]: message }));
    setFormMessage(message);
    markFieldTouched(field);
  };

  const clearFieldUploadError = (field) => {
    setUploadErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  /** 파일 검증 */
  const validateImageFiles = (files, { field, maxTotalBytes } = {}) => {
    const arr = Array.from(files || []);
    if (arr.length === 0) {
      setFieldUploadError(field, "업로드할 파일이 없습니다.");
      return false;
    }

    //요청 총합
    if (maxTotalBytes != null) {
      const total = arr.reduce((sum, f) => sum + (f?.size || 0), 0);
      if (total > maxTotalBytes) {
        setFieldUploadError(
          field,
          `한 번에 업로드하는 파일 총합이 너무 커요. (현재 ${bytesToMB(
            total
          )}MB / 권장 ${MAX_TOTAL_UPLOAD_MB}MB 이하)`
        );
        return false;
      }
    }

    //파일별 확장자/사이즈
    for (const f of arr) {
      const ext = getExt(f?.name || "");
      if (!ALLOWED_IMAGE_EXT.includes(ext)) {
        setFieldUploadError(
          field,
          `지원하지 않는 확장자예요: .${ext} (허용: ${ALLOWED_IMAGE_EXT.join(", ")})`
        );
        return false;
      }
      if ((f?.size || 0) > MAX_FILE_BYTES) {
        setFieldUploadError(
          field,
          `파일이 너무 커요: ${f.name} (최대 ${MAX_FILE_MB}MB)`
        );
        return false;
      }
    }

    return true;
  };

  const handleImageUpload = async (files, type) => {
    if (!files || files.length === 0) return;
    clearFormMessage();

    const field = type === "thumbnail" ? "popThumbnail" : "popImages";

    //업로드 전 기존 업로드 에러 제거
    clearFieldUploadError(field);

    //썸네일은 1장만
    if (type === "thumbnail" && Array.from(files).length > 1) {
      setFieldUploadError("popThumbnail", "썸네일은 1장만 업로드할 수 있어요.");
      return;
    }

    //상세 최대 장수 체크
    if (type === "detail" && form.popImages.length >= MAX_DETAIL_IMAGES) {
      setFieldUploadError(
        "popImages",
        `상세 이미지는 최대 ${MAX_DETAIL_IMAGES}장까지 업로드할 수 있어요.`
      );
      return;
    }

    //상세는 남은 장수보다 많이 선택한 경우 초과분은 무시 + 안내 메시지
    let filesToUpload = files;
    if (type === "detail") {
      const remain = MAX_DETAIL_IMAGES - (form.popImages?.length || 0);
      const selected = Array.from(files);
      if (selected.length > remain) {
        setFormMessage(
          `상세 이미지는 최대 ${MAX_DETAIL_IMAGES}장까지예요. 지금은 ${remain}장만 추가돼요.`
        );
        filesToUpload = selected.slice(0, remain);
      }
    }

    //파일 확장자/사이즈 검증
    if (type === "thumbnail") {
      if (!validateImageFiles(filesToUpload, { field: "popThumbnail" })) return;
    } else {
      //다중 업로드 총합 제한
      if (
        !validateImageFiles(filesToUpload, {
          field: "popImages",
          maxTotalBytes: MAX_TOTAL_UPLOAD_BYTES,
        })
      ) {
        return;
      }
    }

    try {
      setIsUploading(true);

      const response = await uploadImageApi(filesToUpload);
      const uploadedUrls = extractUploadedUrls(response);

      if (!uploadedUrls || uploadedUrls.length === 0) {
        setFieldUploadError(field, "업로드 응답에서 이미지 URL을 받지 못했어요.");
        return;
      }

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

      //성공 시 업로드 에러 제거
      clearFieldUploadError(field);
    } catch (error) {
      console.error("이미지 업로드 실패:", error);

      const status = error?.response?.status;
      if (status === 413) {
        setFieldUploadError(
          field,
          "업로드 용량이 너무 커요. (서버 요청 최대 20MB) 파일 용량/개수를 줄여 주세요."
        );
      } else {
        setFieldUploadError(field, "이미지 업로드에 실패했어요. 다시 시도해 주세요.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  /** Undo 토스트 띄우기 */
  const showUndoToast = (message) => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

    setUndoToast({
      visible: true,
      message,
      variant: "success",
    });

    undoTimerRef.current = setTimeout(() => {
      setUndoToast((t) => ({ ...t, visible: false }));
      setLastRemoved(null);
      undoTimerRef.current = null;
    }, UNDO_TOAST_DURATION_MS);
  };

  /** 되돌리기(마지막 1건) */
  const handleUndoRemove = () => {
    if (!lastRemoved) return;

    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }

    setForm((prev) => {
      const arr = [...(prev.popImages || [])];

      //이미 존재하면(드물지만) 중복 삽입 방지
      if (arr.includes(lastRemoved.url)) return prev;

      const insertIndex = Math.min(lastRemoved.index, arr.length);
      arr.splice(insertIndex, 0, lastRemoved.url);
      return { ...prev, popImages: arr };
    });

    markFieldTouched("popImages");
    setUndoToast((t) => ({ ...t, visible: false }));
    setLastRemoved(null);
  };

  //상세 이미지 삭제(Undo)
  const handleRemoveDetailImage = (index) => {
    clearFormMessage();

    const url = form.popImages?.[index];
    if (!url) return;

    // 1) 즉시 제거
    setForm((prev) => ({
      ...prev,
      popImages: prev.popImages.filter((_, i) => i !== index),
    }));

    // 2) 마지막 삭제 저장 + 토스트
    setLastRemoved({ url, index });
    showUndoToast("이미지를 삭제했어요.");

    // 3) touched
    markFieldTouched("popImages");
  };

  const moveDetailImage = (fromIndex, toIndex) => {
    clearFormMessage();
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

  //submit 시 검증 → 에러 있으면 touched + 폼 하단 메시지
  const handleSubmit = async () => {
    clearFormMessage();

    const currentErrors = validatePopup(form);

    if (Object.keys(currentErrors).length > 0) {
      markAllTouched();
      setFormMessage("필수 정보를 확인해 주세요.");
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
      popStartDate: buildStartDateTime(form.popStartDate),
      popEndDate: buildEndDateTime(form.popEndDate),
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
      setFormMessage("등록 중 오류가 발생했습니다.");
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
    formMessage,
    undoToast,
    handleUndoRemove,
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
