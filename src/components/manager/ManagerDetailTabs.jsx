import React from "react";

const TABS = [
  { value: "RESERVATION", label: "예약 관리" },
  { value: "REPORT", label: "리포트/통계" },
];

// 팝업 상세 페이지(PopupDetailBottomSection)와 동일한 TabButton 컴포넌트
function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative flex-1 pb-4 px-1
        text-[16px] font-bold text-center
        transition-colors duration-300
        outline-none select-none
        ${
          active
            ? "text-[var(--color-primary)]"
            : "text-[var(--color-text-sub)] hover:text-[var(--color-text-black)]"
        }
      `}
    >
      {/* 텍스트 스케일 애니메이션 (쫀득한 느낌) */}
      <span
        className={`
          inline-block
          transition-transform duration-300
          ease-[cubic-bezier(0.34,1.56,0.64,1)] 
          ${active ? "scale-105" : "scale-100"}
        `}
      >
        {children}
      </span>
    </button>
  );
}

export default function ManagerDetailTabs({ activeTab, onChange }) {
  // 현재 활성화된 탭의 인덱스 찾기 (슬라이딩 바 위치 계산용)
  const activeIndex = TABS.findIndex((tab) => tab.value === activeTab);
  const safeIndex = activeIndex === -1 ? 0 : activeIndex;

  return (
    // 전체 컨테이너: 하단 보더 추가
    <div className="w-full border-b border-[var(--color-secondary-light)] mb-8">
      <div className="relative flex w-full">
        {TABS.map((tab) => (
          <TabButton
            key={tab.value}
            active={activeTab === tab.value}
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
          </TabButton>
        ))}

        {/* 슬라이딩 밑줄 (Magic Line) */}
        <span
          className="
            absolute bottom-0 left-0
            h-[3px] bg-[var(--color-primary)] rounded-full
            transition-transform duration-500
            ease-[cubic-bezier(0.34,1.25,0.64,1)]
          "
          style={{
            width: `${100 / TABS.length}%`, // 탭 개수만큼 등분
            transform: `translateX(${safeIndex * 100}%)`, // 인덱스만큼 이동
          }}
        />
      </div>
    </div>
  );
}