// src/components/manager/ManagerProfileCard.jsx
import React from "react";

function formatPhone(num) {
  if (!num) return "-";
  const only = num.replace(/[^0-9]/g, "");
  if (only.length === 11) {
    return only.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  if (only.length === 10) {
    return only.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  return num;
}

/**
 * 유저 마이페이지 상단 UI를 거의 그대로 가져온 매니저 버전.
 *
 * - brandName / email / phone 표시
 * - 프로필 이미지 변경 + 기본 이미지로 변경 가능
 * - 이메일 / 연락처 오른쪽에 연필 아이콘
 * - 비밀번호 변경 버튼은 카드 아래 한 줄
 */
export default function ManagerProfileCard({
  // 프로필/브랜드 정보
  brandName,
  email,
  phone,
  profileImageUrl,

  // 상태
  profileUploading,

  // 핸들러
  onClickProfileEdit,
  onResetProfileImage,
  onEditEmail,
  onEditPhone,
  onChangePassword,
}) {
  const displayBrandName = brandName || "-";
  const displayEmail = email || "-";
  const displayPhone = formatPhone(phone);
  const firstChar = displayBrandName.trim().charAt(0) || "M";

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* 상단 큰 카드 – MyPage와 동일 스타일 */}
      <section
        className="
          relative
          bg-paper-light
          rounded-[36px]
          px-10 pt-10 pb-8
          flex flex-col items-center
          border border-secondary
          shadow-hover
        "
      >
        {/* 프로필 이미지 */}
        <div className="relative mb-3">
          <div className="w-[140px] h-[140px] rounded-full overflow-hidden bg-secondary-light flex items-center justify-center">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="프로필"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[44px] text-secondary-dark">
                {firstChar}
              </span>
            )}
          </div>

          {/* 프로필 수정 버튼 (오른쪽 아래) */}
          <button
            type="button"
            onClick={onClickProfileEdit}
            disabled={profileUploading}
            className="absolute -bottom-1 right-2 w-7 h-7 rounded-full bg-paper border border-secondary flex items-center justify-center text-[13px] text-secondary-dark hover:bg-secondary-light disabled:opacity-60"
            title="프로필 사진 수정"
          >
            ✏️
          </button>
        </div>

        {/* 기본 이미지로 변경 버튼 */}
        <button
          type="button"
          onClick={onResetProfileImage}
          disabled={profileUploading}
          className="mb-5 text-[12px] text-text-sub underline underline-offset-4 hover:text-primary-dark disabled:opacity-60"
        >
          기본 이미지로 변경
        </button>

        {/* 정보 카드 – 라벨/값/연필 구조 (MyPage 상단과 동일) */}
        <div className="bg-paper rounded-[24px] shadow-card border border-secondary px-14 py-8 w-full max-w-[560px] translate-y-1">
          <div className="space-y-4 text-[15px]">
            {/* 브랜드 명 */}
            <div className="flex items-center justify-between">
              <span className="text-text-black w-[90px]">브랜드 명</span>
              <span className="flex-1 text-text-black font-medium whitespace-nowrap">
                {displayBrandName}
              </span>
              <span className="w-[22px]" />
            </div>

            {/* 이메일 */}
            <div className="flex items-center justify-between">
              <span className="text-text-black w-[90px]">이메일</span>
              <span className="flex-1 text-text-black whitespace-nowrap">
                {displayEmail}
              </span>
              <button
                type="button"
                onClick={onEditEmail}
                className="text-[14px] text-secondary-dark hover:text-primary-dark"
                title="이메일 수정"
              >
                ✏️
              </button>
            </div>

            {/* 연락처 */}
            <div className="flex items-center justify-between">
              <span className="text-text-black w-[90px]">연락처</span>
              <span className="flex-1 text-text-black whitespace-nowrap">
                {displayPhone}
              </span>
              <button
                type="button"
                onClick={onEditPhone}
                className="text-[14px] text-secondary-dark hover:text-primary-dark"
                title="연락처 수정"
              >
                ✏️
              </button>
            </div>
          </div>
        </div>

        {/* 하단 버튼 줄 */}
        <div className="mt-5 w-full max-w-[560px] flex justify-center text-[13px] text-text-sub">
          <button
            type="button"
            onClick={onChangePassword}
            className="hover:text-primary-dark"
          >
            비밀번호 변경
          </button>
        </div>
      </section>
    </div>
  );
}
