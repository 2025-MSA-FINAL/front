//팝업 폼 검증 함수
export function validatePopup(form) {
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
