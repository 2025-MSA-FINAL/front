import React from "react";

export default function ChatSearchBar({ keyword, setKeyword, onSearch }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") onSearch();
  };

  return (
    <div className="relative w-full flex justify-center">
      {/* 🔍 검색 입력 박스 */}
      <div
        className="
          flex items-center
          w-full h-[48px] pl-4 pr-14
          bg-paper
          border-[2px] border-primary-light
          rounded-full
          shadow-sm
          transition-all duration-200
          focus-within:border-primary focus-within:shadow-brand
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
            placeholder:text-text-sub
          "
        />
      </div>

      {/* 🔍 오른쪽 원형 버튼 */}
      <button
        onClick={onSearch}
        className="
    absolute right-[-6px] top-1/2 -translate-y-1/2
    flex items-center justify-center
    w-[48px] h-[48px]
    bg-primary
    rounded-full
    text-text-white
    hover:bg-primary-dark
    active:scale-95
    transition-all duration-200
    shadow-brand
    cursor-pointer
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
          className="w-5 h-5"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </div>
  );
}
