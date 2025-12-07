import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  Home,
  Users,
  Store,
  MessageSquare,
  AlertCircle,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: "/", icon: Home, label: "대시보드", end: true },
    { path: "/users", icon: Users, label: "유저 관리" },
    { path: "/popups", icon: Store, label: "팝업 관리" },
    { path: "/chatrooms", icon: MessageSquare, label: "채팅방 관리" },
    { path: "/reports", icon: AlertCircle, label: "신고 관리" },
  ];

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="flex min-h-screen bg-[#F8F8F9]">
      {/* 모바일: 오버레이 + 사이드바 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed z-40 h-full w-72 bg-white shadow-2xl border-r border-[#DDDFE2]
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#DDDFE2]">
          <div>
            <h1 className="text-2xl font-extrabold text-[#C33DFF]">
              PopSpot Admin
            </h1>
            <p className="text-xs text-[#70757A] mt-1">관리자 대시보드</p>
          </div>
          <button
            className="md:hidden text-[#70757A]"
            onClick={toggleSidebar}
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Nav */}
        <nav className="mt-4 px-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `
                flex items-center gap-4 px-5 py-3 mb-2 rounded-xl text-sm
                transition-all duration-200
                ${
                  isActive
                    ? "bg-gradient-to-r from-[#C33DFF] to-[#7E00CC] text-white shadow-lg"
                    : "text-[#424242] hover:bg-[#F0F1F3] hover:text-black"
                }
              `
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-72 px-6 py-4 border-t border-[#DDDFE2] bg-white">
          <button className="flex items-center gap-3 text-[#FF2A7E] hover:text-[#C33DFF] text-sm">
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
          <p className="text-[11px] text-[#70757A] mt-3 leading-relaxed">
            PopSpot Admin <br /> © 2025 PopSpot
          </p>
        </div>
      </aside>

      {/* Main */}
      <div className={` 
          flex-1 flex flex-col 
          transition-all duration-300 
          overflow-x-hidden overflow-y-auto
          md:ml-72 
          `}
        >

        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[#F8F8F9]/80 backdrop-blur border-b border-[#DDDFE2] px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg bg-white shadow-sm text-[#424242]"
              onClick={toggleSidebar}
              aria-label="메뉴 열기"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[#242424]">
                Dashboard Overview
              </h2>
              <p className="text-xs md:text-sm text-[#70757A]">
                전체 통계 및 현황을 확인하세요
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <input
                type="text"
                placeholder="검색..."
                className="px-4 py-2 rounded-full border border-[#DDDFE2] bg-white text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#C33DFF] focus:border-transparent
                           w-48 lg:w-64"
              />
            </div>
            <div className="w-9 h-9 rounded-full bg-[#C33DFF] flex items-center justify-center text-white text-sm font-bold shadow-md">
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 w-full max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
