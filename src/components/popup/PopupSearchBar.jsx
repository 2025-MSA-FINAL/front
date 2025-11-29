import React from "react";

/**
 * 팝업 검색 바 컴포넌트
 * @param {string} keyword - 부모에서 관리하는 검색어 상태
 * @param {function} setKeyword - 검색어 상태 변경 함수 (onChange)
 * @param {function} onSearch - 검색 실행 함수 (Enter 또는 버튼 클릭 시)
 */
export default function PopupSearchBar({ keyword, setKeyword, onSearch }) {
  //엔터키 입력 처리
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div
        className="
          relative flex items-center w-full max-w-[800px] h-[64px]
          px-3
          bg-paper
          border-[2px] border-primary-light
          rounded-full
          shadow-sm
          transition-all duration-200
          focus-within:border-primary focus-within:shadow-brand
        "
      >
        {/* 입력창 */}
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="팝업 이름을 검색해 보세요"
          className="
            flex-1 w-full h-full
            pl-6 pr-4
            bg-transparent
            border-none outline-none
            text-headline-sm text-text-black
            placeholder:text-text-sub placeholder:text-body-lg
          "
        />

        {/* 검색 버튼 */}
        <button
          onClick={onSearch}
          className="
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
          {/* 돋보기 아이콘 SVG */}
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
    </div>
  );
}
