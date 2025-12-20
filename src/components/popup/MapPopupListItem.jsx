import React from "react";
import PopupCard from "./PopupCard";

function MapPopupListItem({
  popup,
  isSelected,
  onFocusOnMap, // 카드 전체 클릭 시 지도에서 해당 마커 포커스
  onOpenDetail, // 상세보기 버튼 클릭 시 상세 페이지 이동
  onToggleWishlist,
  isWishlistLoading,
  userRole,
}) {
  return (
    <div
      className={`
        relative
        transition-all duration-200
        ${
          isSelected
            ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-paper rounded-[24px]"
            : ""
        }
      `}
    >
      {/* 카드 전체 클릭 시 지도 포커스 */}
      <PopupCard
        popup={popup}
        viewMode="list1" // 지도 사이드바용 컴팩트 레이아웃
        onClick={onFocusOnMap}
        onToggleWishlist={onToggleWishlist}
        isWishlistLoading={isWishlistLoading}
        userRole={userRole}
      />

      {/* 상세보기 버튼: 우측 하단에 고정 */}
      <button
        type="button"
        className="
          absolute right-4 bottom-3
          z-10
          text-[11px] font-semibold text-text-black
          px-3 py-1
          rounded-full
          bg-paper
          border border-secondary-light
          shadow-card
          hover:bg-primary-soft
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60
        "
        onClick={(e) => {
          e.stopPropagation(); // 카드 onClick(지도 포커스)랑 분리
          onOpenDetail?.(popup.popId);
        }}
        aria-label="팝업 상세보기"
      >
        상세보기
      </button>
    </div>
  );
}

export default MapPopupListItem;
