import React from "react";

const TABS = [
  { value: "RESERVATION", label: "예약 관리" },
  { value: "REPORT", label: "리포트/통계" },
];

export default function ManagerDetailTabs({ activeTab, onChange }) {
  return (
    <div className="flex gap-2 mb-6">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`
              px-5 py-2.5 rounded-[12px] text-[15px] font-semibold transition-all duration-200
              ${isActive 
                ? "bg-[var(--color-primary)] text-white shadow-brand" 
                : "bg-white text-[var(--color-text-sub)] border border-[var(--color-secondary)] hover:bg-[var(--color-secondary-light)]"
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}