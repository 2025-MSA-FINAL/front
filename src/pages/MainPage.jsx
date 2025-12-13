// src/pages/MainPage.jsx
import React from "react";
import ghost1 from "../assets/ghost2.png";
import main from "../assets/main.png";

function MainPage() {
  return (
    <main className="min-h-[calc(100vh-88px)] bg-secondary-light">
      {/* =========================
          HERO (전체 폭/높이 꽉 + 퀵슬롯 반겹침)
         ========================= */}
      <section className="relative w-full">
        <div className="w-full h-[420px] md:h-[704px] bg-secondary flex items-center justify-center">
          <img src={main} alt="main" className="w-full h-full object-cover" />
        </div>

        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 md:translate-y-2/3 w-full px-4 sm:px-6">
          <div className="mx-auto w-full max-w-[1400px] md:max-w-[1200px] bg-paper rounded-card shadow-card">
            <div className="flex flex-col md:flex-row md:items-center px-5 sm:px-8 md:px-12 py-5 sm:py-6 md:py-8 gap-5 md:gap-0">
              <div className="flex items-center gap-4 min-w-0 md:min-w-[200px] md:ml-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shrink-0">
                  <img
                    src={ghost1}
                    alt="ghost"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="leading-tight">
                  <p className="text-[15px] sm:text-[16px] font-semibold text-text-black">
                    팝업스토어 안내
                  </p>
                  <p className="text-[13px] sm:text-[14px] text-text-sub">
                    팝스팟 도우미
                  </p>
                </div>
              </div>

              {/* divider: 모바일에서는 숨김 */}
              <div className="hidden md:block h-12 w-[1px] bg-secondary mx-5" />

              {/* 메뉴: 모바일 2x2, 데스크탑 1줄 */}
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-6 sm:gap-8 md:flex md:justify-center md:gap-30">
                  <MenuItem label="팝업리스트" />
                  <MenuItem label="AI 챗봇" />
                  <MenuItem label="팝업등록" />
                  <MenuItem label="마이페이지" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          SEARCH BAR
         ========================= */}
      <section className="pt-24 md:pt-30 pb-10">
        <div className="flex justify-center mt-6 md:mt-8">
          <div className="w-full max-w-[980px] px-4 sm:px-6 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="팝업스토어를 검색해보세요."
              className="flex-1 h-[48px] bg-paper rounded-full shadow-card px-6 text-[14px] text-text-black placeholder:text-text-sub outline-none"
            />

            <button
              type="button"
              aria-label="search"
              className="
                w-full sm:w-[48px] h-[48px]
                rounded-full
                bg-[#6B6B6B]
                shadow-card
                flex items-center justify-center
                transition-all duration-200
                hover:bg-[#4F4F4F]
                hover:scale-105
                active:scale-95
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
              >
                <path
                  d="M16.6725 16.6412L21 21M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* =========================
            RECENT VIEWED
           ========================= */}
        <div className="mt-8 md:mt-10 flex justify-center">
          <div className="w-full max-w-[1400px] px-4 sm:px-6">
            <div className="bg-paper rounded-card shadow-card px-6 sm:px-8 py-7 sm:py-8">
              <div className="flex justify-between items-center mb-5 sm:mb-6">
                <h2 className="text-[16px] font-bold text-primary-dark">
                  최근 본 팝업
                </h2>
                <span className="text-[13px] text-primary-dark">
                  전체보기 &gt;
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="w-full aspect-[3/4] rounded-[18px] bg-secondary flex items-center justify-center">
                      <span className="text-text-sub text-[12px]">POSTER</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 md:mt-10 flex justify-center">
          <div className="w-full max-w-[1400px] px-4 sm:px-6">
            <div className="bg-paper rounded-card shadow-card px-6 sm:px-8 py-7 sm:py-8">
              <div className="flex justify-between items-center mb-5 sm:mb-6">
                <h2 className="text-[16px] font-bold text-primary-dark">
                  최근 본 팝업
                </h2>
                <span className="text-[13px] text-primary-dark">
                  전체보기 &gt;
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="w-full aspect-[3/4] rounded-[18px] bg-secondary flex items-center justify-center">
                      <span className="text-text-sub text-[12px]">POSTER</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 모바일에서 아래 여백 확보 */}
        <div className="h-10 md:h-0" />
      </section>
    </main>
  );
}

function MenuItem({ label }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
        {label === "마이페이지" ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12"
          >
            <path
              d="M17 21C17 18.2386 14.7614 16 12 16C9.23858 16 7 18.2386 7 21M17 21H17.8031C18.921 21 19.48 21 19.9074 20.7822C20.2837 20.5905 20.5905 20.2837 20.7822 19.9074C21 19.48 21 18.921 21 17.8031V6.19691C21 5.07899 21 4.5192 20.7822 4.0918C20.5905 3.71547 20.2837 3.40973 19.9074 3.21799C19.4796 3 18.9203 3 17.8002 3H6.2002C5.08009 3 4.51962 3 4.0918 3.21799C3.71547 3.40973 3.71547 3.71547 3.21799 4.0918C3 4.51962 3 5.08009 3 6.2002V17.8002C3 18.9203 3 19.4796 3.21799 19.9074C3.40973 20.2837 3.71547 20.5905 4.0918 20.7822C4.5192 21 5.07899 21 6.19691 21H7M17 21H7M12 13C10.3431 13 9 11.6569 9 10C9 8.34315 10.3431 7 12 7C13.6569 7 15 8.34315 15 10C15 11.6569 13.6569 13 12 13Z"
              stroke="#FF2A7E"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : label === "AI 챗봇" ? (
          <svg
            viewBox="0 0 24 24"
            data-name="025_SCIENCE"
            id="_025_SCIENCE"
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12"
          >
            <defs>
              <style>{`.cls-1{fill:#B7F731;}`}</style>
            </defs>
            <path
              className="cls-1"
              d="M16,13H8a3,3,0,0,1-3-3V6A3,3,0,0,1,8,3h8a3,3,0,0,1,3,3v4A3,3,0,0,1,16,13ZM8,5A1,1,0,0,0,7,6v4a1,1,0,0,0,1,1h8a1,1,0,0,0,1-1V6a1,1,0,0,0-1-1Z"
            />
            <path
              className="cls-1"
              d="M10,9a1.05,1.05,0,0,1-.71-.29A1,1,0,0,1,10.19,7a.6.6,0,0,1,.19.06.56.56,0,0,1,.17.09l.16.12A1,1,0,0,1,10,9Z"
            />
            <path
              className="cls-1"
              d="M14,9a1,1,0,0,1-.71-1.71,1,1,0,0,1,1.42,1.42,1,1,0,0,1-.16.12.56.56,0,0,1-.17.09.6.6,0,0,1-.19.06Z"
            />
            <path
              className="cls-1"
              d="M12,4a1,1,0,0,1-1-1V2a1,1,0,0,1,2,0V3A1,1,0,0,1,12,4Z"
            />
            <path
              className="cls-1"
              d="M9,22a1,1,0,0,1-1-1V18a1,1,0,0,1,2,0v3A1,1,0,0,1,9,22Z"
            />
            <path
              className="cls-1"
              d="M15,22a1,1,0,0,1-1-1V18a1,1,0,0,1,2,0v3A1,1,0,0,1,15,22Z"
            />
            <path
              className="cls-1"
              d="M15,19H9a1,1,0,0,1-1-1V12a1,1,0,0,1,1-1h6a1,1,0,0,1,1,1v6A1,1,0,0,1,15,19Zm-5-2h4V13H10Z"
            />
            <path
              className="cls-1"
              d="M5,17a1,1,0,0,1-.89-.55,1,1,0,0,1,.44-1.34l4-2a1,1,0,1,1,.9,1.78l-4,2A.93.93,0,0,1,5,17Z"
            />
            <path
              className="cls-1"
              d="M19,17a.93.93,0,0,1-.45-.11l-4-2a1,1,0,1,1,.9-1.78l4,2a1,1,0,0,1,.44,1.34A1,1,0,0,1,19,17Z"
            />
          </svg>
        ) : label === "팝업등록" ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.87617 3.75H19.1238L21 8.86683V10.5C21 11.2516 20.7177 11.9465 20.25 12.4667V21H3.75V12.4667C3.28234 11.9465 3 11.2516 3 10.5V8.86683L4.87617 3.75ZM18.1875 13.3929C18.3807 13.3929 18.5688 13.3731 18.75 13.3355V19.5H15V15H9L9 19.5H5.25V13.3355C5.43122 13.3731 5.61926 13.3929 5.8125 13.3929C6.63629 13.3929 7.36559 13.0334 7.875 12.4667C8.38441 13.0334 9.11371 13.3929 9.9375 13.3929C10.7613 13.3929 11.4906 13.0334 12 12.4667C12.5094 13.0334 13.2387 13.3929 14.0625 13.3929C14.8863 13.3929 15.6156 13.0334 16.125 12.4667C16.6344 13.0334 17.3637 13.3929 18.1875 13.3929ZM10.5 19.5H13.5V16.5H10.5L10.5 19.5ZM19.5 9.75V10.5C19.5 11.2965 18.8856 11.8929 18.1875 11.8929C17.4894 11.8929 16.875 11.2965 16.875 10.5V9.75H19.5ZM19.1762 8.25L18.0762 5.25H5.92383L4.82383 8.25H19.1762ZM4.5 9.75V10.5C4.5 11.2965 5.11439 11.8929 5.8125 11.8929C6.51061 11.8929 7.125 11.2965 7.125 10.5V9.75H4.5ZM8.625 9.75V10.5C8.625 11.2965 9.23939 11.8929 9.9375 11.8929C10.6356 11.8929 11.25 11.2965 11.25 10.5V9.75H8.625ZM12.75 9.75V10.5C12.75 11.2965 13.3644 11.8929 14.0625 11.8929C14.7606 11.8929 15.375 11.2965 15.375 10.5V9.75H12.75Z"
              fill="#45DFD3"
            />
          </svg>
        ) : label === "팝업리스트" ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12"
          >
            <path
              d="M9 11.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm2-1a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1zm1 2a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2h-3zm0 3a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2h-3zm-2-2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
              fill="#FFD93D"
            />
            <path
              d="M9 2a1 1 0 0 0-1 1H6a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2a1 1 0 0 0-1-1H9zm7 3h2v15H6V5h2v1a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V5zm-6 0V4h4v1h-4z"
              fill="#FFD93D"
            />
          </svg>
        ) : (
          <span className="text-[11px] text-text-sub">SVG</span>
        )}
      </div>

      <span className="text-[13px] text-text-black">{label}</span>
    </div>
  );
}

export default MainPage;
