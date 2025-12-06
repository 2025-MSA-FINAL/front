import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// API
import { fetchManagerPopupDetailApi, updateManagerPopupBasicApi } from "../../api/managerApi";
import { uploadImageApi } from "../../api/popupApi";

// UI Components
import { 
  TextInput, 
  DateInput, 
  PriceInput, 
  TextArea, 
  TagInput, 
  AddressInput,
  InputWrapper // [추가됨] 읽기 전용 UI를 위해 가져옴
} from "../../components/form/FormFields";
import { ThumbnailUploader, DetailImageUploader } from "../../components/popup/ImageUploader";
import PrimaryButton from "../../components/button/PrimaryButton";
import OutlineButton from "../../components/button/OutlineButton";

const MAX_DETAIL_IMAGES = 10;

// 날짜 변환 함수 (Date 객체 -> 문자열 "YYYY-MM-DDTHH:mm")
function toDatetimeLocal(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function PopupEdit() {
  const { popupId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 폼 상태
  const [form, setForm] = useState({
    popName: "",
    popDescription: "",
    popLocation: "",
    locationDetail: "",
    popStartDate: "", 
    popEndDate: "",   
    popPrice: "",
    popPriceType: "ENTRY",
    popInstaUrl: "",
    popThumbnail: "",
    popImages: [],
    hashtags: [],
    popIsReservation: false,
  });

  // 1. 기존 데이터 불러오기
  useEffect(() => {
    async function loadData() {
      if (!popupId) return;
      try {
        const data = await fetchManagerPopupDetailApi(popupId);

        // 주소 처리 (상세주소 분리 없이 전체 주소로 매핑)
        const fullAddress = data.popLocation || "";
        
        setForm({
          popName: data.popName || "",
          popDescription: data.popDescription || "",
          popLocation: fullAddress, 
          locationDetail: "", 
          // 문자열로 변환해서 저장 (DateInput 오류 방지)
          popStartDate: toDatetimeLocal(data.popStartDate),
          popEndDate: toDatetimeLocal(data.popEndDate),
          popPrice: data.popPrice || 0,
          popPriceType: data.popPriceType || "ENTRY",
          popInstaUrl: data.popInstaUrl || "",
          popThumbnail: data.popThumbnail || "",
          popImages: data.popImages || [], 
          hashtags: data.hashtags || [],
          popIsReservation: data.popIsReservation ?? false,
        });
      } catch (err) {
        console.error("Load failed:", err);
        alert("데이터를 불러오지 못했습니다.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [popupId, navigate]);

  // =========================================
  // 2. 입력 핸들러
  // =========================================

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // 가격 숫자 처리
    if (name === "popPrice") {
        const numeric = String(value).replace(/[^0-9]/g, "");
        setForm(prev => ({ ...prev, [name]: numeric }));
        return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 태그 핸들러
  const addTag = (rawTag) => {
    const trimmed = rawTag.trim();
    if (!trimmed) return;
    setForm((prev) => {
      const current = prev.hashtags || [];
      if (current.length >= 10) {
         alert("태그는 최대 10개까지 가능합니다.");
         return prev;
      }
      const normalized = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
      if (current.includes(normalized)) return prev;
      return { ...prev, hashtags: [...current, normalized] };
    });
  };

  const removeTag = (tagToRemove) => {
    setForm((prev) => ({
      ...prev,
      hashtags: prev.hashtags.filter((t) => t !== tagToRemove),
    }));
  };

  // =========================================
  // 3. 이미지 업로드 핸들러
  // =========================================
  const handleImageUpload = async (files, type) => {
    if (!files || files.length === 0) return;

    if (type === "detail" && (form.popImages?.length || 0) >= MAX_DETAIL_IMAGES) {
      alert(`상세 이미지는 최대 ${MAX_DETAIL_IMAGES}장까지 업로드할 수 있어요.`);
      return;
    }

    try {
      setIsUploading(true);
      const response = await uploadImageApi(files);

      let uploadedUrls = [];
      if (Array.isArray(response)) {
         if (response.length > 0 && typeof response[0] === "string") uploadedUrls = response;
         else if (response.length > 0 && response[0].url) uploadedUrls = response.map(item => item.url);
      } else if (response && response.url) {
         uploadedUrls = [response.url];
      } else if (Array.isArray(response?.urls)) {
         uploadedUrls = response.urls;
      }

      if (uploadedUrls.length === 0) return;

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

  const handleRemoveDetailImage = (index) => {
    setForm((prev) => ({
      ...prev,
      popImages: prev.popImages.filter((_, i) => i !== index),
    }));
  };

  const moveDetailImage = (dragIndex, hoverIndex) => {
    const arr = [...form.popImages];
    const draggedItem = arr[dragIndex];
    arr.splice(dragIndex, 1);
    arr.splice(hoverIndex, 0, draggedItem);
    setForm((prev) => ({ ...prev, popImages: arr }));
  };

  // =========================================
  // 4. 수정 저장 핸들러
  // =========================================
  const handleSubmit = async () => {
    if (!form.popName.trim()) return alert("팝업 이름을 입력해주세요.");
    if (!form.popStartDate || !form.popEndDate) return alert("기간을 설정해주세요.");
    
    // 문자열 비교 (ISO 포맷이라 문자열 비교 가능)
    if (form.popStartDate > form.popEndDate) return alert("종료일은 시작일보다 이후여야 합니다.");
    if (!form.popThumbnail) return alert("대표 이미지는 필수입니다.");
    if (form.popImages.length === 0) return alert("상세 이미지를 최소 1장 등록해주세요.");

    if (!window.confirm("수정하시겠습니까?")) return;

    setSubmitting(true);
    try {
      const fullLocation = [form.popLocation, form.locationDetail]
        .filter(Boolean)
        .join(" ")
        .trim();

      const cleanHashtags = form.hashtags.map(tag => tag.replace(/^#/, ""));

      // 백엔드 전송 시 초(:00) 단위 추가
      const startDateToSend = form.popStartDate.length === 16 ? form.popStartDate + ":00" : form.popStartDate;
      const endDateToSend = form.popEndDate.length === 16 ? form.popEndDate + ":00" : form.popEndDate;

      const payload = {
        popName: form.popName,
        popDescription: form.popDescription,
        popThumbnail: form.popThumbnail,
        popLocation: fullLocation,
        popStartDate: startDateToSend,
        popEndDate: endDateToSend,
        popPriceType: form.popPriceType,
        popPrice: Number(form.popPrice),
        popInstaUrl: form.popInstaUrl,
        popImages: form.popImages,
        hashtags: cleanHashtags,
      };

      await updateManagerPopupBasicApi(popupId, payload);
      alert("성공적으로 수정되었습니다.");
      navigate(`/manager/popup/${popupId}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-light flex items-center justify-center text-text-sub">
        데이터 불러오는 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-light flex flex-col items-center pt-[80px] sm:pt-[96px] lg:pt-[104px] pb-20">
      
      <h1 className="text-headline-lg sm:text-display-sm font-normal mb-10 sm:mb-12 text-text-black">
        팝업 스토어 정보 수정
      </h1>

      <div className="w-full flex justify-center px-4">
        <div className="w-full max-w-[1200px] mx-auto bg-paper rounded-card shadow-card px-8 py-10 sm:px-12 sm:py-12 xl:px-16 xl:py-14 flex flex-col xl:flex-row gap-10 xl:gap-24">
            
            {/* 왼쪽: 이미지 업로드 */}
            <div className="w-full max-w-[420px] mx-auto xl:w-[420px] xl:max-w-none xl:mx-0 2xl:w-[460px] xl:flex-shrink-0">
                <ThumbnailUploader
                    previewUrl={form.popThumbnail}
                    onUpload={(files) => handleImageUpload(files, "thumbnail")}
                    isUploading={isUploading}
                    touched={false}
                    error={null}
                />
                <DetailImageUploader
                    images={form.popImages}
                    onUpload={(files) => handleImageUpload(files, "detail")}
                    onRemove={handleRemoveDetailImage}
                    onMove={moveDetailImage}
                    isUploading={isUploading}
                    maxCount={MAX_DETAIL_IMAGES}
                    touched={false}
                    error={null}
                />
            </div>

            {/* 오른쪽: 입력 폼 */}
            <div className="w-full max-w-[560px] mt-10 xl:mt-0 mx-auto xl:mx-0 xl:ml-auto">
                <TextInput
                    label="팝업 스토어 이름"
                    name="popName"
                    value={form.popName}
                    onChange={handleChange}
                    placeholder="텍스트 입력"
                    required
                />

                <DateInput
                    label="팝업 스토어 기간"
                    startDate={form.popStartDate}
                    endDate={form.popEndDate}
                    onChange={handleChange} 
                    required
                />

                <AddressInput
                    label="팝업 스토어 장소"
                    addressName="popLocation"
                    detailName="locationDetail"
                    addressValue={form.popLocation}
                    detailValue={form.locationDetail}
                    onChange={handleChange}
                    required
                />

                <TextArea
                    label="팝업 스토어 설명"
                    name="popDescription"
                    value={form.popDescription}
                    onChange={handleChange}
                    placeholder="설명을 입력해 주세요"
                    required
                />

                <PriceInput
                    label="팝업 스토어 가격"
                    name="popPrice"
                    value={form.popPrice}
                    onChange={handleChange}
                    required
                />

                <TagInput
                    label="팝업 스토어 태그 (10개 이하)"
                    tags={form.hashtags}
                    onAdd={addTag}
                    onRemove={removeTag}
                    required
                />

                <TextInput
                    label="홈페이지 링크"
                    name="popInstaUrl"
                    value={form.popInstaUrl}
                    onChange={handleChange}
                    placeholder="링크 입력"
                />

                {/* ✅ [수정됨] 예약 유무는 수정 불가 (읽기 전용 UI) */}
                <InputWrapper label="팝업 스토어 예약 유무">
                  <div className="w-full h-[50px] px-4 border-[1.5px] border-secondary bg-gray-100 rounded-[16px] flex items-center justify-between text-body-lg text-text-sub cursor-not-allowed">
                    <span>
                      {form.popIsReservation ? "예약 기능 사용" : "예약 기능 미사용 (현장 대기)"}
                    </span>
                    <span className="text-label-sm text-text-sub/60">
                      * 등록 후 변경 불가
                    </span>
                  </div>
                </InputWrapper>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-12 sm:mt-16">
                    <OutlineButton
                        type="button"
                        onClick={() => navigate(-1)}
                        fullWidth
                        className="sm:w-[140px]"
                        disabled={submitting || isUploading}
                    >
                        취소
                    </OutlineButton>
                    <PrimaryButton
                        type="button"
                        onClick={handleSubmit}
                        loading={submitting}
                        fullWidth
                        className="sm:w-[160px]"
                        disabled={submitting || isUploading}
                    >
                        수정 완료
                    </PrimaryButton>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}