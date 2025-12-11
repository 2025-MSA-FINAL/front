import React from "react";

// 승인 상태 탭
// 순서: 전체 > 완료 > 대기 > 반려
const MODERATION_ITEMS = [
  { value: "ALL", label: "전체" },
  { value: "APPROVED", label: "승인 완료" },
  { value: "PENDING", label: "승인 대기" },
  { value: "REJECTED", label: "승인 반려" },
];

export default function ManagerPopupStatusTabs({ value, onChange }) {
  return (
    <div className="w-full max-w-[1120px] mx-auto mt-6 border-b border-secondary-light">
      <div className="flex gap-8 px-4">
        {MODERATION_ITEMS.map((item) => {
          const active = value === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange(item.value)}
              className={`relative pb-3 text-[15px] font-medium transition-colors ${
                active ? "text-primary" : "text-text-sub hover:text-text-black"
              }`}
            >
              {item.label}
              {active && (
                <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
