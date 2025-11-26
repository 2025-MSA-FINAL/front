import React from "react";
import PopupForm from "../../components/popup/PopupForm";

export default function PopupCreatePage() {
  return (
    <div
      className="
        min-h-screen bg-secondary-light
        flex flex-col items-center
        pt-[80px] sm:pt-[96px] lg:pt-[104px]
        pb-20
      "
    >
      {/* 페이지 타이틀 */}
      <h1
        className="
          text-headline-lg sm:text-display-sm
          font-normal
          mb-10 sm:mb-12
          text-text-black
        "
      >
        팝업 스토어 등록
      </h1>

      {/* 폼 카드 배치 */}
      <div className="w-full flex justify-center px-4">
        <PopupForm />
      </div>
    </div>
  );
}
