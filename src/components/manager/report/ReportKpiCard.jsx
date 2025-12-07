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
        bg-white border border-gray-100 shadow-card
        transition-all duration-300 hover:shadow-[0_10px_35px_rgba(15,23,42,0.07)] hover:-translate-y-1
        ${highlight ? "overflow-hidden" : ""}
        ${disabled ? "opacity-70" : ""}
      `}
      style={
        highlight
          ? {
              background:
                "radial-gradient(circle at top left, rgba(69,223,211,0.18), transparent 55%)",
            }
          : {}
      }
    >
      {highlight && (
        <div className="pointer-events-none absolute -top-10 -right-6 w-28 h-28 rounded-full bg-[var(--color-accent-aqua-soft)] opacity-60 blur-2" />
      )}

      <div className="relative z-10 px-5 pt-4 pb-3 flex items-start justify-between">
        <div
          className="rounded-2xl p-2.5 flex items-center justify-center shadow-sm"
          style={{
            backgroundColor: iconBgColor || "rgba(249,250,251,0.9)",
          }}
        >
          {icon}
        </div>
        {highlight && (
          <span
            className="mt-1 flex h-2 w-2 rounded-full bg-red-500 animate-pulse"
            title="최근 집계 기준"
          />
        )}
      </div>

      <div className="relative z-10 px-5 pb-4">
        <p className="text-[13px] font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-[24px] sm:text-[26px] lg:text-[28px] font-extrabold text-gray-900 leading-none mb-2">
          {value}
        </p>
        {subText && (
          <p
            className="text-[12px] font-medium"
            style={{
              color: disabled ? "#9CA3AF" : themeColor,
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