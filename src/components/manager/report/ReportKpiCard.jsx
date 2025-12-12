import React from "react";

const ReportKpiCard = ({
  title,
  value,
  subText,
  icon,
  themeColor,
  iconBgColor,
  highlight,
  disabled,
}) => {
  return (
    <div
      className={`
        relative rounded-[24px] h-full flex flex-col justify-between
        bg-paper border border-secondary-light shadow-card
        transition-all duration-300 hover:shadow-[0_10px_35px_rgba(15,23,42,0.07)] hover:-translate-y-1
        ${highlight ? "overflow-hidden" : ""}
        ${disabled ? "opacity-70" : ""}
      `}
      style={
        highlight
          ? {
              // 하이라이트 카드 전용 은은한 그라데이션 (테마 위에 살짝만)
              background:
                "radial-gradient(circle at top left, rgba(69,223,211,0.18), transparent 55%)",
            }
          : undefined
      }
    >
      {highlight && (
        <div className="pointer-events-none absolute -top-10 -right-6 w-28 h-28 rounded-full bg-[var(--color-accent-aqua-soft)] opacity-60 blur-2" />
      )}

      {/* 상단 아이콘 + 뱃지 영역 */}
      <div className="relative z-10 px-5 pt-4 pb-3 flex items-start justify-between">
        <div
          className="rounded-2xl p-2.5 flex items-center justify-center shadow-sm"
          style={{
            // 아이콘 배경: props로 오면 그걸 쓰고, 없으면 토큰 기반 기본값
            backgroundColor: iconBgColor || "var(--color-paper-light)",
          }}
        >
          {icon}
        </div>

        {highlight && (
          <span
            className="mt-1 flex h-2 w-2 rounded-full bg-primary animate-pulse"
            title="최근 집계 기준"
          />
        )}
      </div>

      {/* 본문 텍스트 영역 */}
      <div className="relative z-10 px-5 pb-4">
        <p className="text-[13px] font-medium text-text-sub mb-1">{title}</p>
        <p className="text-[24px] sm:text-[26px] lg:text-[28px] font-extrabold text-text-black leading-none mb-2">
          {value}
        </p>

        {subText && (
          <p
            className="text-[12px] font-medium"
            style={{
              // disabled면 서브 텍스트도 흐리게, 아니면 테마 색상
              color: disabled ? "var(--color-text-sub)" : themeColor,
            }}
          >
            {subText}
          </p>
        )}
      </div>
    </div>
  );
};

export default ReportKpiCard;
