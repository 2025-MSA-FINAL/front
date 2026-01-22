import { createPortal } from "react-dom";

// 아이콘 (SVG)
const LinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.8}
    stroke="currentColor"
    className="w-7 h-7 sm:w-8 sm:h-8"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
    />
  </svg>
);

const ChatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.8}
    stroke="currentColor"
    className="w-7 h-7 sm:w-8 sm:h-8"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
    />
  </svg>
);

const KakaoIcon = () => (
  <svg
    viewBox="0 0 32 32"
    className="w-7 h-7 sm:w-8 sm:h-8 fill-current"
    aria-hidden="true"
  >
    <path d="M16 4C8.82 4 3 8.98 3 15.13c0 3.89 2.33 7.26 5.85 9.16-.27 1.03-1.07 3.73-1.22 4.27-.19.67.25.66.52.48.21-.14 3.4-2.26 4.75-3.17.69.1 1.39.15 2.1.15 7.18 0 13-4.98 13-11.13S22.18 4 16 4z" />
  </svg>
);

export default function ShareModal({
  isOpen,
  onClose,
  onCopyLink,
  onKakaoShare,
  onChatShare,
}) {
  const handleContainerClick = (e) => e.stopPropagation();
  if (!isOpen) return null;

  return createPortal(
    <div
      className="
        fixed inset-0 z-[9999]
        bg-black/60
        flex items-center justify-center
        backdrop-blur-sm
        animate-fade-in
        p-4

        [[data-theme=high-contrast]_&]:bg-black
        [[data-theme=high-contrast]_&]:backdrop-blur-none
      "
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="공유하기"
    >
      <div
        className="
          w-[320px] max-w-[92vw]
          rounded-[24px]
          p-5 sm:p-6
          shadow-dropdown
          flex flex-col items-center gap-5 sm:gap-6
          animate-fade-up

          bg-paper text-text-black
          border border-secondary-light

          [[data-theme=high-contrast]_&]:border-2
        "
        onClick={handleContainerClick}
      >
        {/* 헤더 */}
        <div className="relative w-full text-center">
          <h3 className="text-[16px] sm:text-[18px] font-bold">공유하기</h3>

          <button
            onClick={onClose}
            className="
              absolute right-0 top-0
              p-2 -m-2
              rounded-full
              text-text-sub hover:text-text-black
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
              focus-visible:ring-offset-2 focus-visible:ring-offset-paper
            "
            aria-label="닫기"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* 설명 */}
        <p className="text-[12px] sm:text-[13px] text-text-sub text-center -mt-2">
          공유 방법을 선택하세요.
        </p>

        <div className="grid grid-cols-3 max-[360px]:grid-cols-2 gap-4 sm:gap-6 w-full justify-items-center">
          <ShareButton
            icon={<LinkIcon />}
            label="링크 복사"
            onClick={onCopyLink}
            variant="neutral"
          />

          <ShareButton
            icon={<ChatIcon />}
            label="채팅 공유"
            onClick={onChatShare}
            variant="primary"
          />

          <div className="max-[360px]:col-span-2 max-[360px]:flex max-[360px]:justify-center">
            <ShareButton
              icon={<KakaoIcon />}
              label="카카오톡"
              onClick={onKakaoShare}
              variant="kakao"
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in, .animate-fade-up { animation: none !important; }
        }
      `}</style>
    </div>,
    document.body
  );
}

// 버튼 서브 컴포넌트
function ShareButton({ icon, label, onClick, variant = "neutral" }) {
  const base = `
    rounded-full flex items-center justify-center
    transition
    border
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
    focus-visible:ring-offset-2 focus-visible:ring-offset-paper
  `;

  const styles = {
    neutral: `
      bg-secondary-light text-text-black border-secondary
      hover:bg-secondary

      /* 고대비: 흰 텍스트/아이콘이 흰 배경에 묻지 않게 강제 */
      [[data-theme=high-contrast]_&]:bg-paper
      [[data-theme=high-contrast]_&]:text-text-white
      [[data-theme=high-contrast]_&]:border-secondary-light
      [[data-theme=high-contrast]_&]:border-2
      [[data-theme=high-contrast]_&]:hover:bg-black
    `,
    primary: `
      bg-primary-light text-primary border-primary/30
      hover:bg-primary/20

      [[data-theme=high-contrast]_&]:bg-paper
      [[data-theme=high-contrast]_&]:text-text-white
      [[data-theme=high-contrast]_&]:border-secondary-light
      [[data-theme=high-contrast]_&]:border-2
      [[data-theme=high-contrast]_&]:hover:bg-black
    `,
    kakao: `
      /* 기본(라이트): 카카오 컬러 */
      bg-[#FEE500] text-[#3c1e1e] border-black/10 hover:bg-[#ebd400]

      /* data-theme="dark": 카카오 노랑 대신 톤다운 */
      [[data-theme=dark]_&]:bg-secondary-light
      [[data-theme=dark]_&]:text-text-black
      [[data-theme=dark]_&]:border-secondary
      [[data-theme=dark]_&]:hover:bg-secondary

      /* data-theme="high-contrast": 최대 대비(검정/노랑) */
      [[data-theme=high-contrast]_&]:bg-paper
      [[data-theme=high-contrast]_&]:text-primary
      [[data-theme=high-contrast]_&]:border-secondary-light
      [[data-theme=high-contrast]_&]:border-2
      [[data-theme=high-contrast]_&]:hover:bg-black
    `,
  };

  return (
    <button
      onClick={onClick}
      type="button"
      className="flex flex-col items-center gap-2 group"
      aria-label={label}
    >
      <div
        className={`
          ${base}
          ${styles[variant] || styles.neutral}
          w-12 h-12 sm:w-14 sm:h-14
          group-hover:scale-[1.06] active:scale-[0.98]
        `}
      >
        {icon}
      </div>

      <span
        className="
          text-[11px] sm:text-[12px]
          font-medium
          text-text-sub group-hover:text-text-black
        "
      >
        {label}
      </span>
    </button>
  );
}
