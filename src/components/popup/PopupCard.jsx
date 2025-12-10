import React from "react";

//날짜 포맷팅 유틸
function formatDate(dateString) {
  if (!dateString) return "";
  const raw = String(dateString).slice(0, 10);
  const [year, month, day] = raw.split("-");
  if (!year || !month || !day) return "";
  return `${year}.${month}.${day}`;
}

function formatDateRange(start, end) {
  if (!start && !end) return "";
  if (!start || !end) return formatDate(start || end);
  return `${formatDate(start)} ~ ${formatDate(end)}`;
}

//무료 뱃지
const FreeBadge = () => (
  //폰트 크기 조절: 모바일 10px / PC 11px
  <span className="inline-flex items-center justify-center px-1.5 py-[2px] rounded-[4px] bg-[var(--color-secondary-light)] text-[10px] sm:text-[11px] font-medium text-[var(--color-text-sub)] whitespace-nowrap">
    무료
  </span>
);

export default function PopupCard({
  popup,
  viewMode = "grid", // "grid" | "list2" | "list1"
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

  const showWishlistBtn = !userRole || userRole === "USER";
  const dateRange = formatDateRange(popStartDate, popEndDate);
  const isFree = popPriceType === "FREE";

  //상태 뱃지 UI
  const renderStatusBadge = (customClass = "") => {
    let styles = "";
    let label = "진행 중";

    switch (popStatus) {
      case "UPCOMING":
        styles = "bg-[var(--color-accent-aqua-soft)] text-[#007E71]";
        label = "오픈 예정";
        break;
      case "ENDED":
        styles = "bg-[var(--color-secondary-light)] text-[var(--color-text-sub)]";
        label = "종료";
        break;
      case "ONGOING":
      default:
        styles = "bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)]";
        label = "진행 중";
        break;
    }

    return (
      <span
        //폰트 크기: 모바일 10px / PC 11px
        className={`inline-flex items-center justify-center px-2 py-[2px] rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide shadow-sm ${styles} ${customClass}`}
      >
        {label}
      </span>
    );
  };

  /**
   * 하트 버튼 UI
   */
  const renderHeartBtn = (isGridMode = true, customClass = "") => {
    if (!showWishlistBtn) return null;

    const activeColor = "text-[var(--color-primary)]";
    const inactiveColor = "text-[var(--color-secondary)] hover:text-[var(--color-primary)]";
    const baseColor = isLiked ? activeColor : inactiveColor;

    const gridStyle =
      "w-10 h-10 bg-[var(--color-paper)] rounded-full shadow-md flex items-center justify-center z-10 transition-all duration-100 hover:scale-110 active:scale-90";
    
    const listStyle = "p-1 bg-transparent shadow-none z-10 transition-transform duration-100 active:scale-90";

    const containerStyle = isGridMode ? gridStyle : listStyle;

    return (
      <button
        type="button"
        className={`${containerStyle} ${baseColor} ${customClass} disabled:opacity-60`}
        onClick={(e) => {
          e.stopPropagation();
          if (!isWishlistLoading && onToggleWishlist) onToggleWishlist(popId);
        }}
        disabled={isWishlistLoading}
      >
        <div className={!isGridMode ? "hover:scale-110 transition-transform duration-100" : ""}>
            <HeartIcon filled={isLiked} size={20} />
        </div>
      </button>
    );
  };

  //공통 이미지 렌더링
  const renderImage = (wrapperClass, imgClass = "object-cover") => (
    <div className={`relative overflow-hidden bg-[var(--color-secondary-light)] ${wrapperClass}`}>
      {popThumbnail ? (
        <img
          src={popThumbnail}
          alt={popName}
          className={`absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105 ${imgClass}`}
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-sub)]">
          <span className="text-2xl">🖼️</span>
        </div>
      )}
    </div>
  );

  // =================================================================================
  // 1. [GRID VIEW] 갤러리 스타일
  // =================================================================================
  if (viewMode === "grid") {
    return (
      <div
        key={viewMode}
        onClick={onClick}
        className="group cursor-pointer flex flex-col h-full bg-[var(--color-paper)] rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-secondary-light)] 
                   shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] 
                   hover:-translate-y-1 transition-all duration-300"
      >
        <div className="relative w-full aspect-[4/5] bg-[var(--color-secondary-light)] overflow-hidden">
          {renderImage("w-full h-full")}
          <div className="absolute top-3 left-3">{renderStatusBadge("backdrop-blur-md")}</div>
          <div className="absolute top-3 right-3">
             {renderHeartBtn(true)}
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="flex justify-between items-start gap-2 mb-2">
             {/* 제목: 모바일 16px / PC 18px */}
             <h3 className="text-[16px] sm:text-[18px] font-bold text-[var(--color-text-black)] leading-tight line-clamp-2 group-hover:text-[var(--color-primary-dark)] transition-colors flex-1 min-w-0">
              {popName}
            </h3>
          </div>
          
          {/* 메타정보: 모바일 12px / PC 13px */}
          <div className="mt-auto space-y-1 text-[12px] sm:text-[13px] text-[var(--color-text-sub)]">
            <p className="flex items-center gap-1.5">
               <span>📍</span> <span className="truncate">{popLocation}</span>
            </p>
            <p className="flex items-center gap-1.5 text-[var(--color-text-sub)] opacity-80">
              <span>🗓</span> <span>{dateRange}</span>
            </p>
             {isFree && (
              <div className="pt-1">
                <FreeBadge />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =================================================================================
  // 2. [LIST 2 VIEW] 포스터/티켓 스타일 (하단 정렬 + 제목 확대)
  // =================================================================================
  if (viewMode === "list2") {
    return (
      <div
        key={viewMode}
        onClick={onClick}
        //패딩과 갭 조절 (모바일에서 여백 줄임)
        className="group cursor-pointer flex items-stretch gap-3 sm:gap-5 p-4 sm:p-5
                   bg-[var(--color-paper)] rounded-[24px] border border-transparent
                   shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] 
                   hover:-translate-y-1 transition-all duration-300"
      >
        {/* 이미지 크기: 모바일 100x135 / PC 135x180 */}
        <div className="w-[100px] h-[135px] sm:w-[135px] sm:h-[180px] flex-shrink-0 rounded-[var(--radius-card)] overflow-hidden shadow-sm relative bg-[var(--color-secondary-light)] self-center">
           {renderImage("w-full h-full")}
        </div>

        <div className="flex-1 min-w-0 flex flex-col relative py-1">
          {/* 1. 하트: 우측 상단 고정 */}
          <div className="flex justify-end mb-auto">
             {renderHeartBtn(false)}
          </div>

          {/* 2. 텍스트 정보 */}
          <div className="mt-auto flex flex-col">
             <div className="mb-2 sm:mb-3">
                {renderStatusBadge()}
             </div>

             {/* 제목: 모바일 16px / PC 19px */}
             <h3 className="text-[16px] sm:text-[19px] font-bold text-[var(--color-text-black)] leading-tight line-clamp-2 group-hover:text-[var(--color-primary-dark)]">
               {popName}
             </h3>

             {/* 메타정보 & 간격: 모바일 12px / PC 13px */}
             <div className="mt-2 space-y-[2px] sm:space-y-[3px]">
               <p className="text-[12px] sm:text-[13px] text-[var(--color-text-sub)] flex items-center gap-1.5">
                 <span>📍</span> <span className="truncate">{popLocation}</span>
               </p>
               <p className="text-[12px] sm:text-[13px] text-[var(--color-text-sub)] opacity-80 flex items-center gap-1.5">
                 <span>🗓</span> <span>{dateRange}</span>
               </p>
               {isFree && (
                 <div className="pt-1">
                   <FreeBadge />
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    );
  }

  // =================================================================================
  // 3. [LIST 1 VIEW] 리얼 목록 스타일
  // =================================================================================
  if (viewMode === "list1") {
    return (
      <div
        key={viewMode}
        onClick={onClick}
        //패딩과 갭 조절
        className="group cursor-pointer flex items-center gap-3 sm:gap-5 p-3 sm:p-4 mb-3
                   bg-[var(--color-paper)] rounded-[24px] border border-[var(--color-secondary-light)]
                   shadow-sm hover:shadow-md hover:-translate-y-0.5
                   transition-all duration-200"
      >
        {/* 이미지 크기: 모바일 60x60 / PC 80x80 */}
        <div className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] flex-shrink-0 rounded-[12px] overflow-hidden shadow-sm">
          {renderImage("w-full h-full")}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
                {renderStatusBadge()}
                {isFree && <FreeBadge />}
            </div>
            {/* 제목: 모바일 14px / PC 16px */}
            <h3 className="text-[14px] sm:text-[16px] font-bold text-[var(--color-text-black)] truncate group-hover:text-[var(--color-primary-dark)]">
                {popName}
            </h3>
            {/* 메타정보: 모바일 12px / PC 13px */}
            <p className="text-[12px] sm:text-[13px] text-[var(--color-text-sub)] mt-1 flex items-center gap-2 sm:gap-3">
                <span className="truncate max-w-[150px] sm:max-w-[200px]">{popLocation}</span>
                <span className="w-[1px] h-[10px] bg-[var(--color-secondary)]"></span>
                <span>{dateRange}</span>
            </p>
        </div>

        <div className="flex-shrink-0 pl-1 sm:pl-2">
            {renderHeartBtn(false)}
        </div>
      </div>
    );
  }

  return null;
}

//아이콘 컴포넌트
function HeartIcon({ filled, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      className="transition-colors duration-75"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
  );
}