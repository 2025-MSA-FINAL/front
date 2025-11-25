// src/pages/MyPage.jsx
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

function MyPage() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <main className="min-h-[calc(100vh-88px)] flex items-center justify-center px-4 py-12 bg-secondary-light">
        <div className="bg-paper rounded-card shadow-card px-8 py-10 max-w-md w-full text-center">
          <h1 className="text-[20px] font-bold text-text-black mb-3">
            마이페이지
          </h1>
          <p className="text-[14px] text-text-sub mb-4">
            로그인 정보가 없습니다. 다시 로그인해주세요.
          </p>
          <Link
            to="/login"
            className="text-primary-dark font-semibold hover:underline text-[14px]"
          >
            로그인 페이지로 이동 &gt;
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-88px)] flex items-center justify-center px-4 py-12 bg-secondary-light">
      <div className="bg-paper rounded-card shadow-card px-8 py-10 max-w-xl w-full">
        <h1 className="text-[20px] font-bold text-text-black mb-4">
          마이페이지 (임시)
        </h1>

        <p className="text-[13px] text-text-sub mb-6">
          이 페이지는 NavBar 드롭다운 &amp; 로그인 상태 테스트용 임시 페이지입니다.
          <br />
          이후 실제 마이페이지 API가 구현되면 이 영역을 교체하면 됩니다.
        </p>

        <div className="space-y-2 text-[14px] text-text-black">
          <div>
            <span className="font-semibold mr-2">유저 ID:</span>
            <span>{user.userId ?? "-"}</span>
          </div>
          <div>
            <span className="font-semibold mr-2">이름:</span>
            <span>{user.name ?? "-"}</span>
          </div>
          <div>
            <span className="font-semibold mr-2">닉네임:</span>
            <span>{user.nickname ?? "-"}</span>
          </div>
          <div>
            <span className="font-semibold mr-2">이메일:</span>
            <span>{user.email ?? "-"}</span>
          </div>
          <div>
            <span className="font-semibold mr-2">전화번호:</span>
            <span>{user.phone ?? "-"}</span>
          </div>
          <div>
            <span className="font-semibold mr-2">권한(role):</span>
            <span>{user.role ?? "-"}</span>
          </div>
          <div>
            <span className="font-semibold mr-2">상태(status):</span>
            <span>{user.status ?? "-"}</span>
          </div>
        </div>

        <div className="mt-6 flex gap-3 text-[14px]">
          <Link
            to="/"
            className="text-primary-dark font-semibold hover:underline"
          >
            메인으로 돌아가기 &gt;
          </Link>
          <Link
            to="/login"
            className="text-text-sub hover:text-primary-dark"
          >
            다른 계정으로 로그인
          </Link>
        </div>
      </div>
    </main>
  );
}

export default MyPage;
