// src/pages/user/MyPage.jsx
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useMyPageStore } from "../../store/myPageStore";
import UserInfoSection from "./MyPageUserInfoSection.jsx";
import ListSection from "./MyPageListSection.jsx";

function MyPage() {
  // ✅ selector에서 새 객체 만들지 말고 각각 분리해서 호출
  const authUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const { activeTab, setActiveTab } = useMyPageStore();

  // =========================
  // 로그인 안 된 상태
  // =========================
  if (!authUser) {
    return (
      <main className="min-h-[calc(100vh-88px)] flex items-center justify-center px-4 py-12 bg-secondary-light">
        <div className="bg-paper rounded-card shadow-card px-8 py-10 max-w-md w-full text-center">
          <h1 className="text-[20px] font-bold text-text-black mb-3">
            마이페이지
          </h1>
          <p className="text-[14px] text-text-sub mb-4">
            로그인 정보가 없습니다. 다시 로그인해주세요.
          </p>
          <div className="flex flex-col gap-2 text-[14px]">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-[10px] bg-primary text-text-white px-4 py-2 hover:bg-primary-dark shadow-brand"
            >
              로그인 하러가기
            </Link>
            <Link
              to="/"
              className="text-text-sub hover:text-primary-dark underline-offset-2 hover:underline"
            >
              메인으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // =========================
  // 실제 렌더
  // =========================
  return (
    <main className="min-h-[calc(100vh-88px)] bg-secondary-light px-4 py-10 flex flex-col items-center">
      {/* 상단: 타이틀 + 내 정보 카드 (예전 폭 유지) */}
      <UserInfoSection authUser={authUser} setUser={setUser} />

      {/* 하단: 리스트 영역 */}
      <ListSection
        authUser={authUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </main>
  );
}

export default MyPage;
