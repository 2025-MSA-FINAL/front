// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar.jsx";

import LoginPage from "./pages/auth/LoginPage.jsx";
import MainPage from "./pages/MainPage.jsx";
import MyPage from "./pages/user/MyPage.jsx";
import SignupPage from "./pages/auth/SignupPage.jsx";
import ManagerInquiryPage from "./pages/auth/ManagerInquiryPage.jsx"; // ⭐ 추가
import PopupCreatePage from "./pages/popup/PopupCreatePage.jsx";

function App() {
  return (
    <div className="min-h-screen bg-secondary-light text-text-black">
      {/* 항상 NavBar 표시 */}
      <Navbar />

      <Routes>
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

        {/* 팝업 스토어 등록 페이지 */}
        <Route path="/popup/register" element={<PopupCreatePage />} />


      </Routes>
    </div>
  );
}

export default App;
