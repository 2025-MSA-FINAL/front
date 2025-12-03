// src/App.jsx
import { Routes, Route } from "react-router-dom";
import DefaultLayout from "./layouts/DefaultLayout.jsx";
import NoNavLayout from "./layouts/NoNavLayout.jsx";

import LoginPage from "./pages/auth/LoginPage.jsx";
import MainPage from "./pages/MainPage.jsx";
import MyPage from "./pages/user/MyPage.jsx";
import SignupPage from "./pages/auth/SignupPage.jsx";
import ManagerInquiryPage from "./pages/auth/ManagerInquiryPage.jsx"; // ⭐ 추가
import PopupCreatePage from "./pages/popup/PopupCreatePage.jsx";
import PopupListPage from "./pages/popup/PopupListPage.jsx";
import PopupDetailPage from "./pages/popup/PopupDetailPage.jsx";
import ManagerMyPage from "./pages/manager/ManagerMyPage.jsx";
import ChatMainPage from "./pages/chat/ChatMainPage.jsx";
import ManagerPopupDetailPage from "./pages/manager/ManagerPopupDetailPage.jsx";

function App() {
  return (
    <div className="min-h-screen  bg-paper-light text-text-black">
      <Routes>
        {/* NavBar 사용하는 일반 페이지 */}
        <Route element={<DefaultLayout />}>
          {/* 임시 메인 페이지 */}
          <Route path="/" element={<MainPage />} />

          {/* 로그인 페이지 */}
          <Route path="/login" element={<LoginPage />} />

          {/* ✅ 네이버 소셜 인증 후 회원가입 페이지 */}
          <Route path="/signup/social" element={<SignupPage />} />

          {/* 임시 마이페이지 */}
          <Route path="/mypage" element={<MyPage />} />

          {/* ⭐ 매니저 계정 문의 페이지 */}
          <Route path="/manager-inquiry" element={<ManagerInquiryPage />} />

          {/* 팝업스토어 등록 페이지 */}
          <Route path="/popup/register" element={<PopupCreatePage />} />

          {/* 팝업스토어 목록 페이지 */}
          <Route path="/pop-up" element={<PopupListPage />} />

          {/* 팝업스토어 상세 페이지 */}
          <Route path="/popup/:popupId" element={<PopupDetailPage />} />

          {/* 매니저 페이지 */}
          <Route path="/manager" element={<ManagerMyPage />} />
          <Route
            path="/manager/popup/:popupId"
            element={<ManagerPopupDetailPage />}
          />
        </Route>

        {/* NavBar 없는 페이지 (채팅 + 관리자 등) */}
        <Route element={<NoNavLayout />}>
          <Route path="/chat" element={<ChatMainPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
