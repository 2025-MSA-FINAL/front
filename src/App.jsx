// src/App.jsx
import { useEffect, useRef, useState } from "react";
import { Routes, Route } from "react-router-dom";
import DefaultLayout from "./layouts/DefaultLayout.jsx";
import NoNavLayout from "./layouts/NoNavLayout.jsx";

import LoginPage from "./pages/auth/LoginPage.jsx";
import MainPage from "./pages/MainPage.jsx";
import MyPage from "./pages/user/MyPage.jsx";
import SignupPage from "./pages/auth/SignupPage.jsx";
import ManagerInquiryPage from "./pages/auth/ManagerInquiryPage.jsx";
import PopupCreatePage from "./pages/popup/PopupCreatePage.jsx";
import PopupListPage from "./pages/popup/PopupListPage.jsx";
import PopupDetailPage from "./pages/popup/PopupDetailPage.jsx";
import ManagerMyPage from "./pages/manager/ManagerMyPage.jsx";
import ChatMainPage from "./pages/chat/ChatMainPage.jsx";
import ManagerPopupDetailPage from "./pages/manager/ManagerPopupDetailPage.jsx";
import PopupNearbyPage from "./pages/popup/PopupNearbyPage";
import PopupEdit from "./pages/manager/PopupEdit.jsx";
import PopupReservationSettingPage from "./pages/reservation/PopupReservationSettingPage.jsx";

// 관리자 페이지
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Users from "./pages/admin/Users.jsx";
import Popups from "./pages/admin/Popups.jsx";
import Reports from "./pages/admin/Reports.jsx";
import ChatRooms from "./pages/admin/ChatRooms.jsx";
import UserReportPage from "./pages/user/UserReportPage.jsx";
import PopupUserReservationPage from "./pages/reservation/PopupUserReservationPage.jsx";

function App() {
  const [alertMessage, setAlertMessage] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const confirmResolverRef = useRef(null);

  /* ===============================
     window.alert / confirm override
     =============================== */
  useEffect(() => {
    // alert
    window.alert = (message) => {
      setAlertMessage(String(message));
    };

    // confirm (Promise 기반)
    window.confirm = (message) => {
      setConfirmState(String(message));
      return new Promise((resolve) => {
        confirmResolverRef.current = resolve;
      });
    };
  }, []);

  /* ===============================
     confirm 버튼 핸들러
     =============================== */
  const handleConfirm = (result) => {
    if (confirmResolverRef.current) {
      confirmResolverRef.current(result);
      confirmResolverRef.current = null;
    }
    setConfirmState(null);
  };

  return (
    <div className="min-h-screen text-text-black">
      <Routes>
        {/* NavBar 사용하는 일반 페이지 */}
        <Route element={<DefaultLayout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup/social" element={<SignupPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/popup/register" element={<PopupCreatePage />} />
          <Route path="/pop-up" element={<PopupListPage />} />
          <Route path="/popup/:popupId" element={<PopupDetailPage />} />
          <Route path="/popup/nearby" element={<PopupNearbyPage />} />
          <Route path="/manager" element={<ManagerMyPage />} />
          <Route
            path="/manager/popup/:popupId"
            element={<ManagerPopupDetailPage />}
          />
          <Route path="/manager/popup/:popupId/edit" element={<PopupEdit />} />
          <Route
            path="/manager/popup/:popupId"
            element={<ManagerPopupDetailPage />}
          />
          <Route
            path="/manager/popup/:popupId/reservation"
            element={<PopupReservationSettingPage />}
          />
          <Route path="/me/report" element={<UserReportPage />} />
          <Route
            path="/popup/:popupId/reserve"
            element={<PopupUserReservationPage />}
          />
          <Route path="/manager-inquiry" element={<ManagerInquiryPage />} />
        </Route>

        {/* NavBar 없는 페이지 */}
        <Route element={<NoNavLayout />}>
          <Route path="/chat" element={<ChatMainPage />} />
        </Route>

        {/* 관리자 라우트 */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="popups" element={<Popups />} />
          <Route path="reports" element={<Reports />} />
          <Route path="chatrooms" element={<ChatRooms />} />
        </Route>
      </Routes>

      {/* ===============================
          Alert 모달
         =============================== */}
      {alertMessage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
          onClick={(e) => {
            // ✅ 모달 뒤 클릭/전파 방지
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div
            className="w-[320px] rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => {
              // ✅ 내용 영역 클릭도 전파 방지
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <p className="text-center text-sm text-gray-800 whitespace-pre-wrap">
              {alertMessage}
            </p>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setAlertMessage(null);
              }}
              className="mx-auto mt-5 block rounded-md bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* ===============================
          Confirm 모달
         =============================== */}
      {confirmState && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
          onClick={(e) => {
            // ✅ 모달 뒤 클릭/전파 방지
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div
            className="w-[320px] rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => {
              // ✅ 내용 영역 클릭도 전파 방지
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <p className="text-center text-sm text-gray-800 whitespace-pre-wrap">
              {confirmState}
            </p>

            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleConfirm(false);
                }}
                className="rounded-md bg-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-300"
              >
                취소
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleConfirm(true);
                }}
                className="rounded-md bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
