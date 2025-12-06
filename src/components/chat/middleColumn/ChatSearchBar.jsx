import React from "react";

export default function ChatSearchBar({ keyword, setKeyword, onSearch }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") onSearch();
  };

  return (
    <div className="w-full flex justify-center items-center gap-2">
      {/* 🔍 검색 입력 박스 */}
      <div
        className="
          flex items-center
          w-[70%] h-[46px] pl-4 pr-4
          bg-white
          border-2 border-primary-soft/70
          rounded-3xl 
          transition-all duration-200
          focus-within:border-primary focus-within:shadow-dropdown
        "
      >
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="팝업 검색"
          className="
            flex-1 
            bg-transparent
            border-none outline-none
            text-body-md text-text-black font-medium
            placeholder:text-text-main
          "
        />
      </div>

      {/* 🔍 오른쪽 원형 버튼 — 입력창과 완전히 분리됨 */}
      <button
        onClick={onSearch}
        className="
          flex items-center justify-center
          w-[48px] h-[48px]
          bg-primary-soft
          rounded-full
          text-white
          hover:bg-primary
          active:scale-95
          transition-all duration-200
        "
        aria-label="검색"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </div>
  );
}
