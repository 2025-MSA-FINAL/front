import React, { useState } from "react";

/**
 * 팝업 정렬 선택 컴포넌트
 * @param {string} value - 현재 선택된 정렬 값
 * @param {function} onChange - 정렬 변경 핸들러 함수
 */
export default function PopupSortSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  //정렬 옵션
  const SORT_OPTIONS = [
    { label: "최신순", value: "CREATED" },
    { label: "마감 임박순", value: "DEADLINE" },
    { label: "조회 많은순", value: "VIEW" },
    { label: "인기순", value: "POPULAR" },
  ];

  //현재 선택된 라벨 찾기
  const currentLabel =
    SORT_OPTIONS.find((opt) => opt.value === value)?.label || "최신순";

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false); //선택 후 닫기
  };

  return (
    <div className="relative z-10">
      {/* 1. 트리거 버튼 (평소에 보이는 것) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-1
          py-2 px-1
          text-body-md text-text-sub font-medium
          hover:text-text-black
          transition-colors
        "
      >
        <span>{currentLabel}</span>
        {/* 화살표 아이콘 (열리면 회전) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-5 h-5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* 2. 드롭다운 메뉴 (열렸을 때만 보임) */}
      {isOpen && (
        <>
          {/* 외부 클릭 감지용 투명 배경 (클릭 시 닫힘) */}
          <div
            className="fixed inset-0 z-[1]"
            onClick={() => setIsOpen(false)}
          />

          {/* 실제 메뉴 박스 */}
          <ul
            className="
              absolute right-0 top-full mt-2
              w-[120px]
              bg-paper
              border border-secondary-light
              rounded-[12px]
              shadow-dropdown
              overflow-hidden
              z-[10]
              animate-fade-up
            "
            style={{ animationDuration: "0.2s" }} // 애니메이션 속도 조절
          >
            {SORT_OPTIONS.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  px-4 py-3
                  text-body-sm cursor-pointer
                  transition-colors
                  hover:bg-secondary-light
                  ${
                    value === option.value
                      ? "text-primary font-bold bg-primary-light/10" // 선택된 항목 스타일
                      : "text-text-black font-medium"
                  }
                `}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
