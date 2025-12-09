// src/components/popup/MapPopupListItem.jsx
import React from "react";
import PopupCard from "./PopupCard";

function MapPopupListItem({
    popup,
    isSelected,
    onFocusOnMap,       //카드 전체 클릭 시 지도에서 해당 마커 포커스
    onOpenDetail,       //상세보기 버튼 클릭 시 상세 페이지 이동
    onToggleWishlist,
    isWishlistLoading,
    userRole,
}) {
    return (
        <div
            className={`
        transition-all duration-200
        ${isSelected ? "ring-2 ring-primary/60 rounded-[24px]" : ""}
      `}
        >
            {/* relative 컨테이너 안에 카드 + 오버레이 버튼 배치 */}
            <div className="relative">
                {/* 카드 전체 클릭 시 지도 포커스 */}
                <PopupCard
                    popup={popup}
                    onClick={onFocusOnMap}
                    onToggleWishlist={onToggleWishlist}
                    isWishlistLoading={isWishlistLoading}
                    userRole={userRole}
                />

                {/* 상세보기 버튼 (카드 위에 살짝 띄우기) */}
                <button
                    type="button"
                    className="
            absolute right-4 top-3
            z-10
            text-[11px] font-semibold
            px-3 py-1
            rounded-full
            bg-paper
            border border-secondary-light
            shadow-card
            hover:bg-secondary-light
          "
                    onClick={(e) => {
                        e.stopPropagation(); //버블링 방지용
                        if (onOpenDetail) {
                            onOpenDetail(popup.popId);
                        }
                    }}
                >
                    상세보기
                </button>
            </div>
        </div>
    );
}

export default MapPopupListItem;
