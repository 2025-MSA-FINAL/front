import PrimaryButton from "../button/PrimaryButton";

// 홈페이지(지구본) 아이콘
const GlobeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="w-6 h-6 stroke-text-sub transition-colors duration-300 group-hover:stroke-primary"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S12 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S12 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
    />
  </svg>
);

// 공유 아이콘
const ShareIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="w-6 h-6 stroke-text-sub transition-colors duration-300 group-hover:stroke-primary"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
    />
  </svg>
);

// 하트 아이콘
const HeartIcon = ({ filled }) => (
  <svg
    viewBox="0 0 24 24"
    className={`w-7 h-7 transition-colors duration-300 ${
      filled
        ? "fill-primary stroke-primary"
        : "fill-transparent stroke-text-sub group-hover:stroke-primary"
    }`}
    strokeWidth="1.5"
  >
    <path d="M12 21.1c-.4 0-.75-.12-1.03-.34C7.3 17.7 4 14.8 4 11.15 4 8.6 5.9 6.8 8.4 6.8c1.4 0 2.7.7 3.6 1.9.9-1.2 2.2-1.9 3.6-1.9 2.5 0 4.4 1.8 4.4 4.35 0 3.65-3.3 6.55-6.97 9.61-.28.22-.63.34-1.03.34z" />
  </svg>
);

export default function PopupDetailPageActions({
  isLiked,
  wishlistLoading,
  onToggleWishlist,
  homepageUrl,
  hasReservation,
  reservationLabel,
  reservationDisabled,
  onReservationClick,
  onShareClick,
  userRole,
}) {
  const showWishlistBtn = !userRole || userRole === "USER";

  return (
    <div className="flex items-center gap-3 py-4 border-t border-secondary-light md:border-none mt-4 md:mt-0">
      {/* 1. 찜하기 버튼 */}
      {showWishlistBtn && (
        <button
          type="button"
          onClick={onToggleWishlist}
          disabled={wishlistLoading}
          className="
            w-12 h-12 flex items-center justify-center rounded-full 
            border border-secondary bg-paper
            hover:bg-paper-light hover:border-primary transition-colors
            active:scale-95 group pb-[2px]
          "
          aria-label="찜하기"
        >
          <HeartIcon filled={isLiked} />
        </button>
      )}

      {/* 2. 공유하기 버튼 */}
      <button
        type="button"
        onClick={onShareClick}
        className="
          w-12 h-12 flex items-center justify-center rounded-full 
          border border-secondary bg-paper
          hover:bg-paper-light hover:border-primary transition-colors
          active:scale-95 group
        "
        aria-label="공유하기"
      >
        <ShareIcon />
      </button>

      {/* 3. 홈페이지(인스타) 버튼 (URL 있을 때만 표시) */}
      {homepageUrl && (
        <a
          href={homepageUrl}
          target="_blank"
          rel="noreferrer"
          className="
            w-12 h-12 flex items-center justify-center rounded-full 
            border border-secondary bg-paper
            hover:bg-paper-light hover:border-primary transition-colors
            active:scale-95 group
          "
          aria-label="홈페이지 방문"
        >
          <GlobeIcon />
        </a>
      )}

      {/* 4. 예약/입장 정보 */}
      <div className="flex-1 ml-2">
        {!hasReservation ? (
          <div className="h-12 flex items-center justify-center bg-paper-light border border-secondary-light rounded-full text-text-sub font-medium text-[15px]">
            현장 입장만 가능해요
          </div>
        ) : (
          <PrimaryButton
            size="lg"
            fullWidth
            disabled={reservationDisabled}
            className={`
               h-12 rounded-full text-[16px] font-bold shadow-brand transition-all
               !bg-[var(--color-primary-soft)] !text-[var(--color-primary-dark)]
               ${
                 reservationDisabled
                   ? "opacity-50 cursor-not-allowed"
                   : "hover:brightness-105 active:scale-[0.98]"
               }
            `}
            onClick={() => {
              if (!reservationDisabled) onReservationClick();
            }}
          >
            {reservationLabel}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}
