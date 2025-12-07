// src/components/filter/FilterDropdown.jsx
import { useState } from "react";

/**
 * 마이페이지 필터/정렬 공용 드롭다운
 * - Navbar 스타일 느낌
 * - SVG 아이콘 사용 X, 텍스트 화살표(▾)만 사용
 */
export default function FilterDropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false);

  const selected = options.find((opt) => opt.value === value);
  const label = selected ? selected.label : "";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`
          flex items-center justify-between gap-2
          min-w-[120px] h-[34px]
          rounded-full border px-3
          text-[12px]
          bg-paper
          ${
            open
              ? "border-secondary-light shadow-dropdown"
              : "border-secondary hover:bg-secondary-light"
          }
        `}
      >
        <span className="truncate text-text-sub">{label}</span>
        <span
          className={`text-[10px] text-text-sub transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute mt-1 w-full rounded-[12px] border border-secondary-light bg-paper shadow-dropdown z-20 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`
                w-full text-left px-3 py-2 text-[12px]
                hover:bg-secondary-light
                ${
                  opt.value === value
                    ? "font-semibold text-text-black"
                    : "text-text-sub"
                }
              `}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
