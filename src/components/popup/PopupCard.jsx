import React from "react";

const STATUS_LABEL = {
    UPCOMING: "오픈 예정",
    ONGOING: "진행 중",
    ENDED: "종료",
};

function formatDate(dateString) {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d
        .toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
        .replace(/\.\s/g, ".")
        .replace(/\.$/, "");
}

function formatDateRange(start, end) {
    if (!start && !end) return "";
    if (!start || !end) return formatDate(start || end);
    return `${formatDate(start)} ~ ${formatDate(end)}`;
}

export default function PopupCard({
    popup,
    onClick,
    onToggleWishlist,
    isWishlistLoading,
    userRole,
}) {
    const {
        popId,
        popName,
        popThumbnail,
        popLocation,
        popStartDate,
        popEndDate,
        popStatus,
        popPriceType,
        isLiked,
    } = popup;

    const statusLabel = STATUS_LABEL[popStatus] || "진행 중";
    const dateRange = formatDateRange(popStartDate, popEndDate);
    const isFree = popPriceType === "FREE";

    const showWishlistBtn = !userRole || userRole === "USER";

    //상태별 디자인 
    const getStatusStyle = () => {
        switch (popStatus) {
            case "UPCOMING":
                //오픈 예정
                return "border-accent-aqua text-accent-aqua bg-accent-aqua/10";
            case "ONGOING":
                //진행 중
                return "border-primary text-primary bg-primary-light/50";
            case "ENDED":
                //종료
                return "border-secondary text-secondary-dark bg-secondary-light";
            default:
                //기본값
                return "border-primary text-primary bg-primary-light/50";
        }
    };

    return (
        <div
            className="
                flex items-end gap-5
                px-4 py-4            
                rounded-[24px]
                hover:bg-paper
                hover:shadow-card
                transition-all duration-300
                cursor-pointer
                group
            "
            onClick={onClick}
        >
            {/* 썸네일 */}
            <div
                className="
                relative
                w-[140px] h-[186px]
                bg-secondary-light
                rounded-[20px]
                border border-secondary-light
                flex items-center justify-center
                overflow-hidden
                flex-shrink-0
                "
            >
                {popThumbnail ? (
                    <img
                        src={popThumbnail}
                        alt={popName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full relative opacity-50">
                        <div className="absolute inset-0 bg-transparent border border-secondary m-[-3px]" />
                        <div
                            className="absolute w-full h-[1px] bg-secondary"
                            style={{ top: "50%", transform: "rotate(45deg)" }}
                        />
                        <div
                            className="absolute w-full h-[1px] bg-secondary"
                            style={{ top: "50%", transform: "rotate(-45deg)" }}
                        />
                    </div>
                )}
            </div>

            {/* 텍스트 + 하트 */}
            <div className="flex-1 flex items-end gap-4 min-w-0">
                <div className="flex-1 min-w-0">
                    {/* 상태 pill */}
                    <div className="mb-2">
                        <span
                            className={`
                inline-flex items-center justify-center
                px-3 py-[3px]
                rounded-full
                border-[1.5px]
                text-[12px] font-bold
                leading-none
                ${getStatusStyle()}
              `}
                        >
                            {statusLabel}
                        </span>
                    </div>

                    {/* 제목 */}
                    <h3 className="text-[17px] leading-[1.4] text-text-black font-bold line-clamp-2 overflow-hidden mb-1">
                        {popName}
                    </h3>

                    {/* 위치 */}
                    {popLocation && (
                        <p className="mt-1 flex items-center gap-1 text-[13px] text-text-sub font-medium">
                            <span className="text-[14px]">📍</span>
                            <span className="truncate">{popLocation}</span>
                        </p>
                    )}

                    {/* 기간 */}
                    {dateRange && (
                        <p className="mt-[2px] text-[13px] text-text-sub">
                            {dateRange}
                        </p>
                    )}

                    {/* 무료 태그 */}
                    <div className={`mt-[6px] ${isFree ? "" : "invisible"}`}>
                        <span
                            className="
                                inline-flex items-center justify-center
                                px-2 py-[3px]
                                rounded-[6px]
                                bg-secondary-light
                                text-[11px] font-medium
                                text-text-sub
                            "
                        >
                            무료
                        </span>
                    </div>
                </div>

                {/* 하트 아이콘 */}
                {showWishlistBtn && (
                    <button
                        type="button"
                        className="w-10 h-10 flex items-center justify-center flex-shrink-0 mb-[-4px] hover:scale-110 transition-transform active:scale-95"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isWishlistLoading && onToggleWishlist) {
                                onToggleWishlist(popId);
                            }
                        }}
                        disabled={isWishlistLoading}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className={`w-[24px] h-[24px] transition-colors duration-300 ${
                                isLiked
                                    ? "fill-primary stroke-primary"
                                    : "fill-transparent stroke-secondary hover:stroke-primary"
                            }`}
                            strokeWidth="2"
                        >
                            <path d="M12 21.1c-.4 0-.75-.12-1.03-.34C7.3 17.7 4 14.8 4 11.15 4 8.6 5.9 6.8 8.4 6.8c1.4 0 2.7.7 3.6 1.9.9-1.2 2.2-1.9 3.6-1.9 2.5 0 4.4 1.8 4.4 4.35 0 3.65-3.3 6.55-6.97 9.61-.28.22-.63.34-1.03.34z" />

                            
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
