// src/components/NavBar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navigate = useNavigate();

  // 🔐 Zustand에서 auth 상태 사용
  const { user, logout, fetchMe, initialized } = useAuthStore();

  const isLoggedIn = !!user;

  // 앱 첫 렌더링 시 내 정보 조회 (쿠키에 토큰 있으면 로그인 상태로)
  useEffect(() => {
    if (!initialized) {
      fetchMe();
    }
  }, [initialized, fetchMe]);

  // 유저 닉네임 / 프로필 이미지
  const username = user?.nickname || user?.userNickname || '게스트';
  const profileImageUrl =
    user?.profileImage ||
    'https://cdn-icons-png.flaticon.com/512/4211/4211178.png';

  // 닉네임 길이에 따른 버튼 너비 계산 (로그인 상태일 때만 사용)
  let widthClass = 'w-[170px]';
  if (isLoggedIn && username) {
    const rawLen = username.length;
    const clampedLen = Math.min(Math.max(rawLen, 3), 6);

    switch (clampedLen) {
      case 3: widthClass = 'w-[140px]'; break;
      case 4: widthClass = 'w-[150px]'; break;
      case 5: widthClass = 'w-[160px]'; break;
      default: widthClass = 'w-[170px]'; break;
    }
  }

  // 로그인 버튼 클릭 → 로그인 페이지로 이동
  const handleLoginClick = () => {
    navigate('/login');
  };

  // 로그아웃 버튼 (드롭다운 안) 클릭
  const handleLogoutClick = async () => {
    try {
      await logout();
      setIsProfileOpen(false);
      setIsMenuOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-paper border-b-2 border-secondary h-[88px]">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 h-full flex justify-between items-center">
        
        {/* 1. Left Group: Logo & Desktop Menu */}
        <div className="flex items-center gap-12 lg:gap-20">
          <Link to="/" className="flex-shrink-0">
            <img 
              src={logo}
              alt="POPUP STORE" 
              className="w-[100px] md:w-[120px] h-[33px] object-contain" 
            />
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            {['HOME', 'POP-UP', 'CHAT'].map((item) => (
              <Link 
                key={item} 
                to={item === 'HOME' ? '/' : `/${item.toLowerCase()}`} 
                className="text-title-md font-normal text-text-black hover:text-primary transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        {/* 2. Right Group: 로그인 상태에 따라 분기 */}
        <div className="hidden md:flex items-center gap-4 relative z-50">
          
          {/* ✅ (1) 로그인 상태: 프로필 드롭다운 + 드롭다운 안에 로그아웃 */}
          {isLoggedIn && (
            <div className={`relative ${widthClass}`}>
              {/* Layout Placeholder(자리 확보용) */}
              <div className="h-[40px]" />

              {/* Actual Floating Card */}
              <div className="absolute inset-x-0 top-0 z-20">
                <div
                  className={`
                    overflow-hidden rounded-btn border bg-paper transition-colors
                    ${isProfileOpen
                      ? 'border-secondary-light shadow-dropdown'
                      : 'border-transparent hover:bg-secondary-light'}
                  `}
                >
                  {/* (1) Profile Trigger Button */}
                  <button
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between gap-2 px-2 py-1.5 focus:outline-none"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <img
                        src={profileImageUrl}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover bg-secondary-light border border-secondary flex-shrink-0"
                      />
                      <span className="text-sm font-bold text-text-black truncate">
                        {username}
                      </span>
                    </div>

                    <svg
                      className={`w-4 h-4 text-text-sub flex-shrink-0 transition-transform duration-200 ${
                        isProfileOpen ? 'rotate-180' : ''
                      }`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* (2) Expandable Menu Area */}
                  <div
                    className={`
                      overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out
                      ${isProfileOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
                    `}
                  >
                    <div className="h-px bg-secondary-light mx-3 my-1" />

                    <div className="flex flex-col pb-1">
                      {/* 마이페이지 이동 */}
                      <Link
                        to="/mypage"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-black rounded-btn hover:bg-secondary-light transition-colors whitespace-nowrap"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <svg
                          className="w-5 h-5 text-text-sub flex-shrink-0"
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
                        <span className="truncate">마이 페이지</span>
                      </Link>
                      
                      {/* 로그아웃 */}
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-accent-pink hover:bg-accent-pink/10 rounded-btn transition-colors text-left whitespace-nowrap"
                        onClick={handleLogoutClick}
                      >
                        <svg
                          className="w-5 h-5 flex-shrink-0"
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
                        <span className="truncate">로그아웃</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Backdrop Layer */}
              {isProfileOpen && (
                <div
                  className="fixed inset-0 z-10 bg-transparent cursor-default"
                  onClick={() => setIsProfileOpen(false)}
                />
              )}
            </div>
          )}

          {/* ✅ (2) 비로그인 상태: 오른쪽에 보라색 캡슐 Log in 버튼만 */}
          {!isLoggedIn && (
            <button
              type="button"
              onClick={handleLoginClick}
              className="
                h-[40px] px-6 rounded-full
                border border-[#C33DFF]
                text-[#C33DFF] text-sm font-medium
                flex items-center justify-center
                hover:bg-[#C33DFF]/10
                transition-colors
              "
            >
              Log in
            </button>
          )}
        </div>

        {/* 3. Mobile Toggle Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="text-text-sub hover:text-primary p-2"
          >
            {isMenuOpen ? (
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
            ) : (
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
               </svg>
            )}
          </button>
        </div>
      </div>

      {/* 4. Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-[88px] left-0 w-full bg-paper border-b border-secondary shadow-brand py-4 px-6 flex flex-col gap-4">
          {['HOME', 'POP-UP', 'CHAT'].map((item) => (
            <Link 
              key={item} 
              to={item === 'HOME' ? '/' : `/${item.toLowerCase()}`} 
              className="text-title-md font-medium text-text-sub hover:text-primary py-2 border-b border-secondary-light" 
              onClick={() => setIsMenuOpen(false)}
            >
              {item}
            </Link>
          ))}

          <div className="flex flex-col gap-3 mt-2">
            {/* 모바일: 로그인 상태일 때만 My Page + 로그아웃 */}
            {isLoggedIn && (
              <>
                <Link 
                  to="/mypage" 
                  className="w-full py-3 rounded-btn bg-primary text-text-white font-bold text-center" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Page
                </Link>
                <button
                  className="
                    w-full py-3 rounded-btn
                    border border-secondary
                    text-text-sub font-medium
                  "
                  onClick={async () => {
                    await handleLogoutClick();
                    setIsMenuOpen(false);
                  }}
                >
                  로그아웃
                </button>
              </>
            )}

            {/* 모바일: 비로그인 상태일 때 로그인 캡슐 버튼 */}
            {!isLoggedIn && (
              <button
                className="
                  w-full py-3 rounded-full
                  border border-[#C33DFF]
                  text-[#C33DFF] text-sm font-medium
                  flex items-center justify-center
                  hover:bg-[#C33DFF]/10
                  transition-colors
                "
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
