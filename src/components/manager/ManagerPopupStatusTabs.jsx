// src/components/manager/ManagerPopupStatusTabs.jsx
import React from "react";

const STATUS_ITEMS = [
  { value: "ALL", label: "전체" },
  { value: "UPCOMING", label: "오픈예정" },
  { value: "ONGOING", label: "진행중" },
  { value: "ENDED", label: "종료" },
];

export default function ManagerPopupStatusTabs({ value, onChange }) {
  return (
    <div className="w-full max-w-[900px] mx-auto mt-10 border-b border-secondary-light">
      <div className="flex gap-10 px-4">
        {STATUS_ITEMS.map((item) => {
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
