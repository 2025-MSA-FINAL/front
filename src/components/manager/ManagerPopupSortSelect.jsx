import React, { useState } from "react";

/**
 * 매니저용 정렬 셀렉트
 */
const SORT_OPTIONS = [
  { label: "마감 임박순", value: "DEADLINE" },
  { label: "최신순", value: "CREATED" },
  { label: "조회 많은순", value: "VIEW" },
  { label: "인기순", value: "POPULAR" },
];

export default function ManagerPopupSortSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const current =
    SORT_OPTIONS.find((opt) => opt.value === value) ?? SORT_OPTIONS[0];

  const handleSelect = (nextValue) => {
    if (nextValue === value) {
      setIsOpen(false);
      return;
    }
    onChange?.(nextValue);
    setIsOpen(false);
  };

  return (
    <div className="relative text-[13px]">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="
          flex items-center gap-1
          rounded-full border border-secondary-light
          bg-paper px-3 py-1.5
          hover:bg-secondary-light
        "
      >
        <span className="text-text-black">{current.label}</span>
        <span className="text-[10px] text-secondary-dark">
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen && (
        <div
          className="
            absolute right-0 mt-1
            w-[150px]
            rounded-2xl bg-white
            border border-secondary-light shadow-card
            z-30
          "
        >
          <ul className="py-1">
            {SORT_OPTIONS.map((option) => {
              const selected = option.value === value;
              return (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    px-3 py-1.5 cursor-pointer text-[13px]
                    ${
                      selected
                        ? "text-primary font-semibold bg-primary-light/10"
                        : "text-text-black hover:bg-secondary-light"
                    }
                  `}
                >
                  {option.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
