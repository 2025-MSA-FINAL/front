// src/pages/MainPage.jsx
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

function MainPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <main className="min-h-[calc(100vh-88px)] flex items-center justify-center px-4 py-12">
      <div className="bg-paper rounded-card shadow-card px-8 py-10 max-w-xl w-full">
        <h1 className="text-[24px] font-bold text-text-black mb-3 rounded-[]">
          임시 메인 페이지
        </h1>
        {user ? (
          <>
            <p className="text-[14px] text-text-sub mb-4">
              {user.nickname || user.name || "회원"}님, 안녕하세요! 👋
            </p>
            <p className="text-[13px] text-text-sub mb-6">
              상단 네비게이션 바에서 닉네임을 호버하면
              <br />
              마이페이지로 이동할 수 있는 드롭다운이 열립니다.
            </p>
            <div className="flex gap-3 text-[14px]">
              <Link
                to="/mypage"
                className="text-primary-dark font-semibold hover:underline"
              >
                마이페이지 바로가기 &gt;
              </Link>
              <span className="text-text-sub">
                또는 상단 프로필 드롭다운을 테스트해보세요.
              </span>
            </div>
          </>
        ) : (
          <>
            <p className="text-[14px] text-text-sub mb-4">
              현재 로그인되어 있지 않습니다.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center text-primary-dark font-semibold hover:underline text-[14px]"
            >
              로그인 페이지로 이동 &gt;
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default MainPage;
