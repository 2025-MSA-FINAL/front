// src/components/NavBar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuthStore } from "../store/authStore";
import {
  setTheme as applyTheme,
  getCurrentTheme,
  AVAILABLE_THEMES,
} from "../theme";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [theme, setTheme] = useState(() => getCurrentTheme());

  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const { user, logout, fetchMe, initialized } = useAuthStore();

  const isLoggedIn = !!user;
  const role = user?.role || "USER";
  const isManager = role === "MANAGER";
  const isAdmin = role === "ADMIN";

  // 로그인 사용자 정보 초기화
  useEffect(() => {
    if (!initialized) {
      fetchMe();
    }
  }, [initialized, fetchMe]);

  const username = user?.nickname || user?.userNickname || "게스트";
  const profileImageUrl =
    user?.profileImage ||
    "https://cdn-icons-png.flaticon.com/512/4211/4211178.png";

  // 프로필 드롭다운 너비 (닉네임 길이에 따라 보정)
  let widthClass = "w-[170px]";
  if (isLoggedIn && username) {
    const rawLen = username.length;
    const clampedLen = Math.min(Math.max(rawLen, 3), 6);

    widthClass =
      clampedLen === 3
        ? "w-[140px]"
        : clampedLen === 4
        ? "w-[150px]"
        : clampedLen === 5
        ? "w-[160px]"
        : "w-[170px]";
  }

  const handleThemeChange = (nextTheme) => {
    applyTheme(nextTheme); // html data-theme + localStorage 업데이트
    setTheme(nextTheme); // NavBar UI 업데이트
    setIsThemeOpen(false); // 팝오버 닫기
  };

  const handleLoginClick = () => navigate("/login");

  const handleLogoutClick = async () => {
    try {
      await logout();
      setIsProfileOpen(false);
      setIsMenuOpen(false);
      navigate("/");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <nav className="sticky top-0 z-100 bg-paper h-[88px]">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 h-full flex justify-between items-center">
        {/* LEFT: 로고 + 데스크탑 메뉴 */}
        <div className="flex items-center gap-12 lg:gap-20">
          {/* 로고 */}
          <Link to="/" className="flex-shrink-0">
            <img
              src={logo}
              alt="POPUP STORE"
              className="w-[100px] md:w-[120px] h-[33px] object-contain"
            />
          </Link>

          {/* 데스크탑 메뉴 */}
          <div className="hidden md:flex items-center gap-8">
            {["HOME", "POP-UP", "MAP", "CHAT"].map((item) => {
              let path;

              if (item === "HOME") {
                path = "/";
              } else if (item === "MAP") {
                // MAP은 가까운 팝업 페이지로 연결
                path = "/popup/nearby";
              } else {
                // POP-UP, CHAT
                path = `/${item.toLowerCase()}`;
              }

              const isActive =
                // HOME
                (item === "HOME" && currentPath === "/") ||
                // MAP: /popup/nearby 로 시작하는 경로
                (item === "MAP" && currentPath.startsWith("/popup/nearby")) ||
                // POP-UP: /popup 로 시작하지만 /popup/nearby 는 제외
                (item === "POP-UP" &&
                  currentPath.startsWith("/pop-up") &&
                  !currentPath.startsWith("/popup/nearby")) ||
                // CHAT: /chat 로 시작하는 경로
                (item === "CHAT" && currentPath.startsWith("/chat"));

              return (
                <Link
                  key={item}
                  to={path}
                  onClick={(e) => {
                    if (item === "CHAT" && !isLoggedIn) {
                      e.preventDefault();
                      alert("로그인 후 이용할 수 있습니다.");
                      navigate("/login");
                      return;
                    }
                  }}
                  className="
                    relative
                    text-title-md font-normal text-text-black
                    hover:text-primary hover:font-extrabold
                    transition-colors
                    group
                  "
                >
                  <span className="relative inline-block">
                    {/* 메뉴 텍스트 */}
                    <span
                      className={
                        isActive
                          ? "font-extrabold text-primary"
                          : "font-normal text-text-black"
                      }
                    >
                      {item}
                    </span>

                    {/* 가운데에서 양옆으로 퍼지는/고정되는 보라색 밑줄 */}
                    <span
                      className={`
                        pointer-events-none
                        absolute
                        left-1/2 -translate-x-1/2
                        -bottom-1
                        h-[2px]
                        bg-primary
                        transition-all
                        duration-300
                        ${isActive ? "w-full" : "w-0 group-hover:w-full"}
                      `}
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* RIGHT: 테마 설정 + 프로필 or 로그인 버튼 (데스크탑) */}
        <div className="hidden md:flex items-center gap-4 relative z-50">
          {/* 테마 설정 버튼 + 팝오버 */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsThemeOpen((prev) => !prev);
                setIsProfileOpen(false); // 설정 열면 프로필 드롭다운은 닫기
              }}
              className="
                flex items-center gap-1
                rounded-full border border-secondary-light bg-paper
                px-3 py-1 text-xs text-text-sub
                hover:bg-secondary-light hover:text-text-main
                transition-colors
              "
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.458 2.5L8.542 2.5L7.917 4.167L6.542 4.792L4.958 3.75L3.75 4.958L4.792 6.542L4.167 7.917L2.5 8.542L2.5 11.458L4.167 12.083L4.792 13.458L3.75 15.042L4.958 16.25L6.542 15.208L7.917 15.833L8.542 17.5L11.458 17.5L12.083 15.833L13.458 15.208L15.042 16.25L16.25 15.042L15.208 13.458L15.833 12.083L17.5 11.458L17.5 8.542L15.833 7.917L15.208 6.542L16.25 4.958L15.042 3.75L13.458 4.792L12.083 4.167L11.458 2.5Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="10"
                  cy="10"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
              <span className="font-medium">설정</span>
              <svg
                className={`w-3 h-3 text-text-sub transition-transform ${
                  isThemeOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {isThemeOpen && (
              <div
                className="
                  absolute right-0 mt-2 w-48
                  rounded-2xl border border-secondary bg-paper
                  shadow-dropdown p-2 text-xs
                "
              >
                <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-text-sub">
                  테마
                </div>
                <div className="flex flex-col gap-1">
                  {AVAILABLE_THEMES.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => handleThemeChange(mode.id)}
                      className={`
                        flex items-center justify-between w-full
                        px-2 py-1 rounded-xl
                        text-left transition-colors
                        ${
                          theme === mode.id
                            ? "bg-primary text-text-white"
                            : "text-text-sub hover:bg-secondary-light hover:text-text-main"
                        }
                      `}
                    >
                      <span>{mode.label}</span>
                      {theme === mode.id && (
                        <span className="text-[10px]">선택됨</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 프로필 드롭다운 */}
          {isLoggedIn && (
            <div className={`relative ${widthClass}`}>
              <div className="h-[40px]" />

              <div className="absolute inset-x-0 top-0 z-20">
                <div
                  className={`
                    overflow-hidden rounded-btn border bg-paper transition-colors
                    ${
                      isProfileOpen
                        ? "border-secondary-light shadow-dropdown"
                        : "border-transparent hover:bg-secondary-light"
                    }
                  `}
                >
                  {/* 드롭다운 트리거 */}
                  <button
                    onClick={() => {
                      setIsProfileOpen(!isProfileOpen);
                      setIsThemeOpen(false); // 프로필 열면 설정 팝오버는 닫기
                    }}
                    className="flex w-full items-center justify-between gap-2 px-2 py-1.5"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <img
                        src={profileImageUrl}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover bg-secondary-light border border-secondary"
                      />
                      <span className="text-sm font-bold text-text-black truncate">
                        {username}
                      </span>
                    </div>

                    <svg
                      className={`w-4 h-4 text-text-sub transition-transform ${
                        isProfileOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* 드롭다운 내용 */}
                  <div
                    className={`
                      overflow-hidden transition-[max-height,opacity] duration-300
                      ${isProfileOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}
                    `}
                  >
                    <div className="h-px bg-secondary-light mx-3 my-1" />

                    <div className="flex flex-col pb-1">
                      {/* USER 메뉴 */}
                      {!isManager && !isAdmin && (
                        <>
                          <Link
                            to="/mypage"
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-secondary-light"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <svg
                              className="w-5 h-5 text-text-sub"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            마이 페이지
                          </Link>

                          <Link
                            to="/me/report"
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-secondary-light"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <svg
                              className="w-5 h-5 text-text-sub"
                              fill="none"
                              viewBox="0 0 32 32"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <rect
                                x="10"
                                y="18"
                                width="8"
                                height="2"
                                fill="currentColor"
                              />
                              <rect
                                x="10"
                                y="13"
                                width="12"
                                height="2"
                                fill="currentColor"
                              />
                              <rect
                                x="10"
                                y="23"
                                width="5"
                                height="2"
                                fill="currentColor"
                              />
                              <path
                                d="M25,5H22V4a2,2,0,0,0-2-2H12a2,2,0,0,0-2,2V5H7A2,2,0,0,0,5,7V28a2,2,0,0,0,2,2H25a2,2,0,0,0,2-2V7A2,2,0,0,0,25,5ZM12,4h8V8H12ZM25,28H7V7h3v3H22V7h3Z"
                                fill="currentColor"
                              />
                            </svg>
                            유저 리포트
                          </Link>
                        </>
                      )}

                      {/* MANAGER 메뉴 */}
                      {isManager && (
                        <>
                          <Link
                            to="/manager"
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-secondary-light"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <svg
                              className="w-5 h-5 text-text-sub"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 7h18M3 12h18M3 17h18"
                              />
                            </svg>
                            매니저 페이지
                          </Link>

                          <Link
                            to="/popup/register"
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-secondary-light"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <svg
                              className="w-5 h-5 text-text-sub"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            팝업 등록
                          </Link>
                        </>
                      )}

                      {/* ADMIN 메뉴 */}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-secondary-light"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <svg
                            className="w-5 h-5 text-text-sub flex-shrink-0"
                            viewBox="0 0 28 28"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M13.6667 17.2667C15.655 17.2667 17.2667 15.6549 17.2667 13.6667C17.2667 11.6785 15.655 10.0667 13.6667 10.0667C11.6785 10.0667 10.0667 11.6785 10.0667 13.6667C10.0667 15.6549 11.6785 17.2667 13.6667 17.2667Z"
                              stroke="#020202"
                              strokeWidth="3.33333"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M21.7395 16.9394C21.5943 17.2684 21.5509 17.6334 21.6151 17.9873C21.6793 18.3412 21.848 18.6678 22.0995 18.9249L22.1649 18.9903C22.3678 19.193 22.5287 19.4336 22.6385 19.6985C22.7483 19.9633 22.8048 20.2472 22.8048 20.534C22.8048 20.8207 22.7483 21.1046 22.6385 21.3695C22.5287 21.6343 22.3678 21.875 22.1649 22.0776C21.9623 22.2805 21.7217 22.4414 21.4568 22.5512C21.1919 22.661 20.908 22.7175 20.6213 22.7175C20.3346 22.7175 20.0507 22.661 19.7858 22.5512C19.5209 22.4414 19.2803 22.2805 19.0777 22.0776L19.0122 22.0121C18.7551 21.7606 18.4285 21.5919 18.0747 21.5278C17.7208 21.4636 17.3558 21.5069 17.0267 21.6521C16.7041 21.7904 16.4289 22.02 16.2351 22.3127C16.0413 22.6054 15.9372 22.9484 15.9358 23.2994V23.4849C15.9358 24.0635 15.706 24.6185 15.2968 25.0276C14.8876 25.4368 14.3327 25.6667 13.754 25.6667C13.1754 25.6667 12.6204 25.4368 12.2112 25.0276C11.8021 24.6185 11.5722 24.0635 11.5722 23.4849V23.3867C11.5638 23.0256 11.4469 22.6754 11.2368 22.3816C11.0266 22.0879 10.733 21.8641 10.394 21.7394C10.065 21.5942 9.69999 21.5509 9.34611 21.615C8.99222 21.6792 8.66567 21.8479 8.40857 22.0994L8.34311 22.1649C8.14048 22.3677 7.89985 22.5287 7.63498 22.6385C7.37011 22.7483 7.0862 22.8048 6.79948 22.8048C6.51275 22.8048 6.22884 22.7483 5.96397 22.6385C5.6991 22.5287 5.45847 22.3677 5.25584 22.1649C5.05298 21.9622 4.89205 21.7216 4.78225 21.4567C4.67246 21.1919 4.61594 20.908 4.61594 20.6212C4.61594 20.3345 4.67246 20.0506 4.78225 19.7857C4.89205 19.5209 5.05298 19.2802 5.25584 19.0776L5.32129 19.0121C5.57279 18.755 5.7415 18.4285 5.80566 18.0746C5.86983 17.7207 5.82651 17.3557 5.68129 17.0267C5.54301 16.704 5.31339 16.4289 5.02071 16.235C4.72803 16.0412 4.38506 15.9372 4.03402 15.9358H3.84857C3.26991 15.9358 2.71496 15.7059 2.30579 15.2967C1.89662 14.8876 1.66675 14.3326 1.66675 13.754C1.66675 13.1753 1.89662 12.6204 2.30579 12.2112C2.71496 11.802 3.26991 11.5721 3.84857 11.5721H3.94675C4.30783 11.5637 4.65803 11.4468 4.9518 11.2367C5.24558 11.0266 5.46935 10.7329 5.59402 10.394C5.73924 10.0649 5.78256 9.69993 5.71839 9.34604C5.65422 8.99216 5.48552 8.66561 5.23402 8.40851L5.16857 8.34305C4.96571 8.14042 4.80478 7.89979 4.69498 7.63492C4.58518 7.37005 4.52867 7.08614 4.52867 6.79941C4.52867 6.51269 4.58518 6.22878 4.69498 5.96391C4.80478 5.69904 4.96571 5.45841 5.16857 5.25578C5.3712 5.05292 5.61183 4.89199 5.8767 4.78219C6.14157 4.67239 6.42548 4.61588 6.7122 4.61588C6.99893 4.61588 7.28284 4.67239 7.54771 4.78219C7.81258 4.89199 8.05321 5.05292 8.25584 5.25578L8.32129 5.32123C8.5784 5.57273 8.90495 5.74143 9.25883 5.8056C9.61272 5.86977 9.97771 5.82645 10.3067 5.68123H10.394C10.7167 5.54295 10.9919 5.31333 11.1857 5.02065C11.3795 4.72797 11.4835 4.385 11.4849 4.03396V3.84851C11.4849 3.26985 11.7148 2.7149 12.124 2.30573C12.5331 1.89656 13.0881 1.66669 13.6667 1.66669C14.2454 1.66669 14.8004 1.89656 15.2095 2.30573C15.6187 2.7149 15.8486 3.26985 15.8486 3.84851V3.94669C15.85 4.29773 15.954 4.6407 16.1478 4.93338C16.3416 5.22606 16.6168 5.45567 16.9395 5.59396C17.2685 5.73918 17.6335 5.78249 17.9874 5.71833C18.3413 5.65416 18.6678 5.48545 18.9249 5.23396L18.9904 5.16851C19.193 4.96565 19.4336 4.80472 19.6985 4.69492C19.9634 4.58512 20.2473 4.52861 20.534 4.52861C20.8207 4.52861 21.1047 4.58512 21.3695 4.69492C21.6344 4.80472 21.875 4.96565 22.0777 5.16851C22.2805 5.37114 22.4414 5.61177 22.5512 5.87664C22.661 6.1415 22.7176 6.42542 22.7176 6.71214C22.7176 6.99887 22.661 7.28278 22.5512 7.54765C22.4414 7.81252 22.2805 8.05315 22.0777 8.25578L22.0122 8.32123C21.7607 8.57834 21.592 8.90489 21.5278 9.25877C21.4637 9.61266 21.507 9.97765 21.6522 10.3067V10.394C21.7905 10.7166 22.0201 10.9918 22.3128 11.1856C22.6055 11.3795 22.9484 11.4835 23.2995 11.4849H23.4849C24.0636 11.4849 24.6185 11.7147 25.0277 12.1239C25.4369 12.5331 25.6667 13.088 25.6667 13.6667C25.6667 14.2453 25.4369 14.8003 25.0277 15.2095C24.6185 15.6186 24.0636 15.8485 23.4849 15.8485H23.3867C23.0357 15.8499 22.6927 15.9539 22.4001 16.1478C22.1074 16.3416 21.8778 16.6168 21.7395 16.9394Z"
                              stroke="#020202"
                              strokeWidth="3.33333"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>

                          <span className="truncate">관리자 페이지</span>
                        </Link>
                      )}

                      {/* 로그아웃 */}
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-accent-pink hover:bg-accent-pink/10 text-left"
                        onClick={handleLogoutClick}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        로그아웃
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {isProfileOpen && (
                <div
                  className="fixed inset-0 z-10 bg-transparent"
                  onClick={() => setIsProfileOpen(false)}
                />
              )}
            </div>
          )}

          {/* 로그인 버튼 (데스크탑) */}
          {!isLoggedIn && (
            <button
              type="button"
              onClick={handleLoginClick}
              className="
                h-[40px] px-6 rounded-full border border-[#C33DFF] text-[#C33DFF]
                hover:bg-[#C33DFF]/10 transition-colors
              "
            >
              Log in
            </button>
          )}
        </div>

        {/* 모바일 메뉴 토글 버튼 */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-text-sub hover:text-primary p-2"
          >
            {isMenuOpen ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 전체 영역 */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-[88px] left-0 w-full bg-paper border-b border-secondary shadow-brand py-4 px-6 flex flex-col gap-4">
          {/* 모바일 상단 메뉴 리스트 */}
          {["HOME", "POP-UP", "MAP", "CHAT"].map((item) => {
            let path;

            if (item === "HOME") {
              path = "/";
            } else if (item === "MAP") {
              path = "/popup/nearby";
            } else {
              path = `/${item.toLowerCase()}`;
            }

            return (
              <Link
                key={item}
                to={path}
                className="text-title-md font-medium text-text-sub hover:text-primary py-2 border-b border-secondary-light"
                onClick={(e) => {
                  if (item === "CHAT" && !isLoggedIn) {
                    e.preventDefault();
                    alert("로그인 후 이용할 수 있습니다.");
                    navigate("/login");
                    setIsMenuOpen(false);
                    return;
                  }
                  setIsMenuOpen(false);
                }}
              >
                {item}
              </Link>
            );
          })}

          <div className="flex flex-col gap-3 mt-2">
            {/* 테마 설정 (모바일용 간단 버전) */}
            <div className="rounded-2xl border border-secondary-light bg-paper-light px-3 py-2 text-xs">
              <div className="mb-1 text-[11px] font-semibold text-text-sub">
                테마
              </div>
              <div className="flex flex-wrap gap-1">
                {AVAILABLE_THEMES.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => handleThemeChange(mode.id)}
                    className={`
                      px-2 py-1 rounded-full
                      transition-colors
                      ${
                        theme === mode.id
                          ? "bg-primary-soft text-text-black"
                          : "bg-paper text-text-sub hover:bg-secondary-light hover:text-text-main"
                      }
                    `}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* USER 버튼들 */}
            {!isManager && !isAdmin && isLoggedIn && (
              <Link
                to="/mypage"
                className="w-full py-3 rounded-btn bg-primary text-text-white font-bold text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                My Page
              </Link>
            )}

            {/* MANAGER 버튼들 */}
            {isManager && (
              <>
                <Link
                  to="/manager"
                  className="w-full py-3 rounded-btn bg-primary text-text-white font-bold text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  매니저 페이지
                </Link>

                <Link
                  to="/popup/register"
                  className="w-full py-3 rounded-btn border border-secondary text-text-sub text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  팝업 등록
                </Link>
              </>
            )}

            {/* ADMIN 버튼 */}
            {isAdmin && (
              <Link
                to="/admin"
                className="w-full py-3 rounded-btn bg-primary text-text-white font-bold text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                관리자 페이지
              </Link>
            )}

            {/* 로그아웃 버튼 (모바일) */}
            {isLoggedIn && (
              <button
                className="w-full py-3 rounded-btn border border-secondary text-text-sub"
                onClick={async () => {
                  await handleLogoutClick();
                  setIsMenuOpen(false);
                }}
              >
                로그아웃
              </button>
            )}

            {/* 비로그인 상태 (모바일) */}
            {!isLoggedIn && (
              <button
                className="w-full py-3 rounded-full border border-[#C33DFF] text-[#C33DFF] hover:bg-[#C33DFF]/10"
                onClick={() => {
                  handleLoginClick();
                  setIsMenuOpen(false);
                }}
              >
                Log in
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
