// src/pages/user/MyPage.jsx
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useMyPageStore } from "../../store/myPageStore";
import {
  updateNicknameApi,
  updateEmailApi,
  updatePhoneApi,
  changePasswordApi,
  deleteMeApi,
  uploadProfileImageApi,
  updateProfileApi,
  checkPasswordApi,
  toggleWishlistApi,
  deleteAllWishlistApi,
  deleteCloseWishlistApi,
} from "../../api/myPageApi";
import { apiClient } from "../../api/authApi"; // ✅ 토큰 붙여서 /me 호출용

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const PAGE_SIZE = 6; // ✅ 5 → 6으로 변경

function formatPrice(value) {
  if (typeof value !== "number") return value;
  return value.toLocaleString("ko-KR");
}

// 성별 표기: MALE → 남자, FEMALE → 여자
function getGenderLabel(gender) {
  if (!gender) return "-";
  if (gender === "MALE") return "남자";
  if (gender === "FEMALE") return "여자";
  return gender;
}

// 전화번호 포맷팅: 01012345678 → 010-1234-5678
function formatPhone(num) {
  if (!num) return "-";
  const only = num.replace(/[^0-9]/g, "");
  if (only.length === 11) {
    return only.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  if (only.length === 10) {
    return only.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  return num;
}

function MyPage() {
  // ✅ selector에서 새 객체 만들지 말고 각각 분리해서 호출
  const authUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const { activeTab, setActiveTab } = useMyPageStore();

  const [updating, setUpdating] = useState(false);

  // 프로필 이미지 (화면용)
  const [profileImage, setProfileImage] = useState(
    () => authUser?.profileImage ?? null
  );
  const fileInputRef = useRef(null);
  const [profileUploading, setProfileUploading] = useState(false);

  // ✅ 휴대폰 변경 모달 상태
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState(authUser?.phone ?? "");
  const [phoneSending, setPhoneSending] = useState(false);
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  // 비밀번호 변경 모달 상태
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const genderLabel = getGenderLabel(authUser?.gender);

  // ✅ 모달 새 비밀번호 복잡도 체크 (회원가입과 동일 규칙: 8자 + 영문 + 특문)
  const newPwd = passwordForm.newPassword;
  const newPwdLengthOk = newPwd.length >= 8;
  const newPwdHasLetter = /[A-Za-z]/.test(newPwd);
  const newPwdHasSpecial = /[^A-Za-z0-9]/.test(newPwd);
  const newPwdComplexOk =
    newPwdLengthOk && newPwdHasLetter && newPwdHasSpecial;

  // ✅ 모달에서 비밀번호/확인 일치 여부
  const passwordsMatchInModal =
    passwordForm.newPassword.length > 0 &&
    passwordForm.confirmPassword.length > 0 &&
    passwordForm.newPassword === passwordForm.confirmPassword;

  // =========================
  // 예약/찜 리스트 페이징 상태
  // =========================
  const [reservationPage, setReservationPage] = useState(0); // 0-based
  const [reservationPageData, setReservationPageData] = useState({
    content: [],
    pageNumber: 0,
    pageSize: PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
  });
  const [reservationLoading, setReservationLoading] = useState(false);

  const [wishlistPage, setWishlistPage] = useState(0); // 0-based
  const [wishlistPageData, setWishlistPageData] = useState({
    content: [],
    pageNumber: 0,
    pageSize: PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
  });
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // =========================
  // 기본 정보 수정 핸들러들
  // =========================
  const handleUpdateNickname = async () => {
    if (!authUser) return;
    const next = window.prompt("새 닉네임을 입력하세요.", authUser.nickname);
    if (!next || next === authUser.nickname) return;

    try {
      setUpdating(true);
      await updateNicknameApi({ nickname: next });

      // 🔥 즉시 UI 반영
      setUser({ nickname: next });
    } catch (err) {
      alert(
        err?.response?.data?.message ?? "닉네임 변경 중 오류가 발생했습니다."
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!authUser) return;
    const next = window.prompt("새 이메일을 입력하세요.", authUser.email);
    if (!next || next === authUser.email) return;

    try {
      setUpdating(true);
      await updateEmailApi({ email: next });

      // 🔥 즉시 UI 반영
      setUser({ email: next });
    } catch (err) {
      alert(
        err?.response?.data?.message ?? "이메일 변경 중 오류가 발생했습니다."
      );
    } finally {
      setUpdating(false);
    }
  };

  // ✅ 휴대폰 수정 → 모달 오픈으로 변경
  const handleUpdatePhone = () => {
    if (!authUser) return;
    setPhoneInput(authUser.phone || "");
    setVerificationCode("");
    setIsPhoneModalOpen(true);
  };

  // =========================
  // 휴대폰 인증 로직 (모달)
  // =========================
  const handleSendPhoneCode = async () => {
    if (!phoneInput) {
      alert("휴대폰 번호를 입력해주세요.");
      return;
    }
    setPhoneSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/phone/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneInput }),
      });
      if (!res.ok) {
        alert("인증번호 전송 중 오류가 발생했습니다.");
        return;
      }
      alert("인증번호를 전송했습니다.");
    } catch (e) {
      console.error(e);
      alert("인증번호 전송 중 오류가 발생했습니다.");
    } finally {
      setPhoneSending(false);
    }
  };

  const handleVerifyPhoneCode = async () => {
    if (!phoneInput || !verificationCode) {
      alert("휴대폰 번호와 인증번호를 모두 입력해주세요.");
      return;
    }
    setPhoneVerifying(true);
    try {
      // 1) 인증번호 검증
      const res = await fetch(`${API_BASE}/api/auth/phone/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneInput, code: verificationCode }),
      });

      if (!res.ok) {
        alert("인증번호 검증 중 오류가 발생했습니다.");
        return;
      }

      const ok = await res.json();
      if (!ok) {
        alert("인증번호가 올바르지 않습니다.");
        return;
      }

      // 2) 실제 휴대폰 번호 변경 API 호출 (apiClient → 토큰 자동 포함)
      await updatePhoneApi({ phone: phoneInput });

      // 3) 전역 상태 & 화면 반영
      setUser({ phone: phoneInput });
      alert("휴대폰 번호가 변경되었습니다.");
      setIsPhoneModalOpen(false);
    } catch (e) {
      console.error(e);
      alert(
        e?.response?.data?.message ??
          "휴대폰 번호 변경 중 오류가 발생했습니다."
      );
    } finally {
      setPhoneVerifying(false);
    }
  };

  const closePhoneModal = () => {
    if (phoneSending || phoneVerifying) return;
    setIsPhoneModalOpen(false);
  };

  // =========================
  // 프로필 이미지 변경
  // =========================
  const handleClickProfileEdit = () => {
    if (profileUploading) return;
    fileInputRef.current?.click();
  };

  const handleProfileFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setProfileUploading(true);

      // 1) S3 업로드 → { url, key } 받기
      const result = await uploadProfileImageApi(file); // { url, key }

      // 2) 내 프로필에 이 url/key 반영 (백엔드 PATCH /api/users/me/profile)
      await updateProfileApi(result); // 🔥 새 API 호출

      // 3) 화면 & 전역 authUser 동기화
      setProfileImage(result.url);
      setUser({ profileImage: result.url });
    } catch (err) {
      alert(
        err?.response?.data?.message ??
          "프로필 이미지 변경 중 오류가 발생했습니다."
      );
    } finally {
      setProfileUploading(false);
      e.target.value = "";
    }
  };

  // ✅ 프로필 기본이미지로 되돌리기
  const handleResetProfileImage = async () => {
    if (!window.confirm("기본 프로필 이미지로 변경하시겠습니까?")) return;

    try {
      setProfileUploading(true);

      // url, key를 null로 보내서 백엔드가 기본 이미지로 처리하도록
      await updateProfileApi({ url: null, key: null });

      // ✅ 변경 후 /api/users/me 다시 호출 (apiClient 사용 → 토큰 자동 포함)
      const res = await apiClient.get("/api/users/me");
      const me = res.data;

      // 백엔드에서 defaultProfileUrl 적용된 값 받아서 Zustand에 반영
      setUser(me);
      setProfileImage(me.profileImage ?? null);
    } catch (err) {
      alert(
        err?.response?.data?.message ??
          "프로필 이미지를 기본으로 되돌리는 중 오류가 발생했습니다."
      );
    } finally {
      setProfileUploading(false);
    }
  };

  // =========================
  // 비밀번호 변경 모달
  // =========================
  const openPasswordModal = () => {
    setPasswordError("");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    if (passwordSubmitting) return;
    setIsPasswordModalOpen(false);
  };

  const handlePasswordFormChange = (field) => (e) => {
    setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    // 1) 필수 값 체크
    if (!currentPassword || !newPassword || !confirmPassword) {
      const msg = "모든 비밀번호를 입력해주세요.";
      setPasswordError(msg);
      alert(msg);
      return;
    }

    try {
      setPasswordSubmitting(true);

      // 2) 서버에 현재 비밀번호 검증 요청
      const isValid = await checkPasswordApi({ password: currentPassword });

      if (!isValid) {
        const msg = "현재 비밀번호가 올바르지 않습니다.";
        setPasswordError(msg);
        alert(msg);
        return;
      }

      // 3) 새 비밀번호 복잡도 검사 (8자 + 영문 + 특문)
      if (!newPwdComplexOk) {
        const msg =
          "새 비밀번호는 최소 8자리이며, 영문자와 특수문자를 포함해야 합니다.";
        setPasswordError(msg);
        alert(msg);
        return;
      }

      // 4) 새 비밀번호 & 확인 일치 검사
      if (newPassword !== confirmPassword) {
        const msg = "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.";
        setPasswordError(msg);
        alert(msg);
        return;
      }

      // 5) 실제 비밀번호 변경 API 호출
      await changePasswordApi({ currentPassword, newPassword });
      alert("비밀번호가 변경되었습니다.");
      setIsPasswordModalOpen(false);
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        "비밀번호 변경 중 오류가 발생했습니다.";
      setPasswordError(msg);
      alert(msg);
    } finally {
      setPasswordSubmitting(false);
    }
  };

  // =========================
  // 회원탈퇴
  // =========================
  const handleDeleteUser = async () => {
    if (!window.confirm("정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    try {
      setUpdating(true);
      await deleteMeApi();
      alert("회원탈퇴가 완료되었습니다. 메인 페이지로 이동합니다.");

      // ✅ 프론트 상태 정리
      setUser(null);

      // ✅ 메인 페이지로 이동
      window.location.href = "/";
    } catch (err) {
      alert(
        err?.response?.data?.message ??
          "회원탈퇴 처리 중 오류가 발생했습니다."
      );
    } finally {
      setUpdating(false);
    }
  };

  // =========================
  // 예약/찜 리스트 API 호출
  // =========================
  const loadReservationPage = async (page) => {
    if (!authUser) return;
    setReservationLoading(true);
    try {
      const res = await apiClient.get("/api/users/me/reservations", {
        params: { page, size: PAGE_SIZE },
      });
      setReservationPageData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setReservationLoading(false);
    }
  };

  const loadWishlistPage = async (page) => {
    if (!authUser) return;
    setWishlistLoading(true);
    try {
      const res = await apiClient.get("/api/users/me/wishlist", {
        params: { page, size: PAGE_SIZE },
      });
      setWishlistPageData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setWishlistLoading(false);
    }
  };

  // ✅ 찜한 목록 전체 삭제
  const handleDeleteAllWishlist = async () => {
    if (
      !window.confirm("찜한 팝업 전체를 삭제하시겠습니까? 되돌릴 수 없습니다.")
    ) {
      return;
    }
    try {
      await deleteAllWishlistApi();
      setWishlistPage(0);
      setWishlistPageData((prev) => ({
        ...prev,
        content: [],
        pageNumber: 0,
        totalElements: 0,
        totalPages: 0,
      }));
    } catch (e) {
      console.error(e);
      alert(
        e?.response?.data?.message ??
          "전체 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    }
  };

  // ✅ 종료된 팝업만 전체 삭제
  const handleDeleteCloseWishlist = async () => {
    if (!window.confirm("종료된 팝업만 모두 삭제하시겠습니까?")) {
      return;
    }
    try {
      await deleteCloseWishlistApi();
      // 프론트에서 현재 페이지에서 종료된 것만 제거
      setWishlistPageData((prev) => {
        const filtered = prev.content.filter(
          (it) => it.popupStatus !== "ENDED"
        );
        return {
          ...prev,
          content: filtered,
          // totalElements는 정확히 맞추긴 어렵지만 대략 줄여 줌
          totalElements:
            prev.totalElements - (prev.content.length - filtered.length),
        };
      });
    } catch (e) {
      console.error(e);
      alert(
        e?.response?.data?.message ??
          "종료된 팝업 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    }
  };

  // ✅ 찜 리스트에서 하트 눌렀을 때: 찜 토글 API 호출 후, 해제된 경우 목록에서 제거
  const handleToggleWishlistFromMyPage = async (popupId) => {
    try {
      const { isLiked } = await toggleWishlistApi(popupId);

      // false면 해제된 상태이므로 리스트에서 제거
      if (!isLiked) {
        setWishlistPageData((prev) => ({
          ...prev,
          content: prev.content.filter((it) => it.popupId !== popupId),
          totalElements:
            prev.totalElements > 0 ? prev.totalElements - 1 : prev.totalElements,
        }));
      }
    } catch (e) {
      console.error(e);
      alert(
        e?.response?.data?.message ??
          "찜 해제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    }
  };

  // 탭 전환 시 첫 페이지로 초기화
  useEffect(() => {
    if (activeTab === "reservation") {
      setReservationPage(0);
    } else if (activeTab === "wishlist") {
      setWishlistPage(0);
    }
  }, [activeTab]);

  // 페이지 / 탭 변경 시 데이터 로드
  useEffect(() => {
    if (!authUser) return;

    if (activeTab === "reservation") {
      loadReservationPage(reservationPage);
    } else if (activeTab === "wishlist") {
      loadWishlistPage(wishlistPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, activeTab, reservationPage, wishlistPage]);

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
              className="inline-flex items-center justify-center rounded-[10px] bg-primary text-text-white px-4 py-2 hover:bg-primary-dark"
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
    <main className="min-h-[calc(100vh-88px)] bg-white px-4 py-10 flex flex-col items-center">
      {/* 상단: 타이틀 + 내 정보 카드 (예전 폭 유지) */}
      <div className="w-full max-w-3xl">
        {/* 상단 타이틀 */}
        <h1 className="text-[28px] font-bold text-center text-text-black mb-10">
          마이페이지
        </h1>

        {/* 상단 큰 카드 */}
        <section
          className="
            relative
            bg-[#F8F8F8]
            rounded-[36px]
            px-10 pt-10 pb-8
            flex flex-col items-center
            border border-[#E3E3E3]
            shadow-[0_18px_40px_rgba(0,0,0,0.06)]
          "
        >
          {/* 프로필 이미지 */}
          <div className="relative mb-3">
            <div className="w-[140px] h-[140px] rounded-full overflow-hidden bg-secondary-light flex items-center justify-center">
              {profileImage || authUser.profileImage ? (
                <img
                  src={profileImage || authUser.profileImage}
                  alt="프로필"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[44px] text-secondary-dark">
                  {authUser.nickname?.charAt(0) ?? "U"}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleClickProfileEdit}
              disabled={profileUploading}
              className="absolute -bottom-1 right-2 w-7 h-7 rounded-full bg-white border border-secondary flex items-center justify-center text-[13px] text-secondary-dark hover:bg-secondary-light disabled:opacity-60"
              title="프로필 사진 수정"
            >
              ✏️
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfileFileChange}
            />
          </div>

          {/* 기본 이미지로 변경 버튼 */}
          <button
            type="button"
            onClick={handleResetProfileImage}
            disabled={profileUploading}
            className="mb-5 text-[12px] text-text-sub underline underline-offset-4 hover:text-primary-dark disabled:opacity-60"
          >
            기본 이미지로 변경
          </button>

          {/* 정보 카드 – 라벨/값/아이콘 한 줄 */}
          <div className="bg-white rounded-[24px] shadow-card border border-[#E4E4E4] px-14 py-8 w-full max-w-[560px] translate-y-1">
            <div className="space-y-4 text-[15px]">
              {/* 닉네임 */}
              <div className="flex items_center justify-between">
                <span className="text-text-black w-[90px]">닉네임</span>
                <span className="flex-1 text-text-black font-medium whitespace-nowrap">
                  {authUser.nickname}
                </span>
                <button
                  type="button"
                  onClick={handleUpdateNickname}
                  disabled={updating}
                  className="text-[14px] text-secondary-dark hover:text-primary-dark"
                  title="닉네임 수정"
                >
                  ✏️
                </button>
              </div>

              {/* 성별 */}
              <div className="flex items-center justify-between">
                <span className="text-text-black w-[90px]">성별</span>
                <span className="flex-1 text-text-black whitespace-nowrap">
                  {genderLabel}
                </span>
                <span className="w-[22px]" />
              </div>

              {/* 전화번호 */}
              <div className="flex items-center justify-between">
                <span className="text-text-black w-[90px]">전화번호</span>
                <span className="flex-1 text-text-black whitespace-nowrap">
                  {formatPhone(authUser.phone)}
                </span>
                <button
                  type="button"
                  onClick={handleUpdatePhone}
                  disabled={updating}
                  className="text-[14px] text-secondary-dark hover:text-primary-dark"
                  title="전화번호 수정"
                >
                  ✏️
                </button>
              </div>

              {/* 이메일 */}
              <div className="flex items-center justify-between">
                <span className="text-text-black w-[90px]">이메일</span>
                <span className="flex-1 text-text-black whitespace-nowrap">
                  {authUser.email}
                </span>
                <button
                  type="button"
                  onClick={handleUpdateEmail}
                  disabled={updating}
                  className="text-[14px] text-secondary-dark hover:text-primary-dark"
                  title="이메일 수정"
                >
                  ✏️
                </button>
              </div>
            </div>
          </div>

          {/* 하단 버튼 줄 */}
          <div className="mt-5 w-full max-w-[560px] flex justify-center gap-10 text-[13px] text-[#777777]">
            <button
              type="button"
              onClick={openPasswordModal}
              className="hover:text-primary-dark"
            >
              비번 수정
            </button>
            <button
              type="button"
              onClick={handleDeleteUser}
              disabled={updating}
              className="hover:text-error"
            >
              회원 탈퇴
            </button>
          </div>
        </section>
      </div>

      {/* 하단: 리스트 영역만 좀 더 넓게 (max-w-5xl) */}
      <div className="w-full max-w-5xl mt-12">
        {/* 예약 / 찜 리스트 */}
        <section>
          {/* 탭 영역 */}
          <div className="flex justify-center gap-12 text-[15px] mb-4 border-b border-secondary">
            <TabButton
              active={activeTab === "reservation"}
              icon="📋"
              label="예약한 리스트"
              activeUnderlineClass="border-primary"
              onClick={() => setActiveTab("reservation")}
            />
            <TabButton
              active={activeTab === "wishlist"}
              icon="❤"
              label="찜한 리스트"
              activeUnderlineClass="border-primary"
              onClick={() => setActiveTab("wishlist")}
            />
          </div>

          {/* 찜 리스트 전용 상단 액션 */}
          {activeTab === "wishlist" && (
            <div className="flex justify-end mb-2 text-[13px] text-text-sub gap-2 pr-1">
              <button
                type="button"
                className="hover:text-primary-dark whitespace-nowrap"
                onClick={handleDeleteCloseWishlist}
              >
                종료된 팝업 전체삭제
              </button>
              <span className="text-secondary-dark">|</span>
              <button
                type="button"
                className="hover:text-primary-dark whitespace-nowrap"
                onClick={handleDeleteAllWishlist}
              >
                목록 전체 삭제
              </button>
            </div>
          )}

          {/* 리스트 – 헤더 제거, 카드 2열 */}
          <div className="mt-4">
            {activeTab === "reservation" && (
              <>
                {reservationLoading && (
                  <div className="text-center text-[14px] text-text-sub py-6">
                    로딩 중...
                  </div>
                )}
                {!reservationLoading &&
                  reservationPageData.content.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {reservationPageData.content.map((item) => (
                        <ReservationRow
                          key={item.reservationId}
                          item={item}
                        />
                      ))}
                    </div>
                  )}
                {!reservationLoading &&
                  reservationPageData.content.length === 0 && (
                    <div className="bg-paper rounded-[18px] px-6 py-6 text-center text-[14px] text-text-sub border border-secondary-light">
                      예약한 팝업이 없습니다.
                    </div>
                  )}
              </>
            )}

            {activeTab === "wishlist" && (
              <>
                {wishlistLoading && (
                  <div className="text-center text-[14px] text-text-sub py-6">
                    로딩 중...
                  </div>
                )}
                {!wishlistLoading &&
                  wishlistPageData.content.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {wishlistPageData.content.map((item) => (
                        <WishlistRow
                          key={item.popupId}
                          item={item}
                          onToggleWishlist={handleToggleWishlistFromMyPage}
                        />
                      ))}
                    </div>
                  )}
                {!wishlistLoading &&
                  wishlistPageData.content.length === 0 && (
                    <div className="bg-paper rounded-[18px] px-6 py-6 text-center text-[14px] text-text-sub border border-secondary-light">
                      찜한 팝업이 없습니다.
                    </div>
                  )}
              </>
            )}
          </div>

          {/* 페이지네이션 */}
          {activeTab === "reservation" &&
            reservationPageData.totalPages > 1 && (
              <Pagination
                page={reservationPageData.pageNumber}
                totalPages={reservationPageData.totalPages}
                onChange={(nextPage) => setReservationPage(nextPage)}
              />
            )}

          {activeTab === "wishlist" && wishlistPageData.totalPages > 1 && (
            <Pagination
              page={wishlistPageData.pageNumber}
              totalPages={wishlistPageData.totalPages}
              onChange={(nextPage) => setWishlistPage(nextPage)}
            />
          )}
        </section>
      </div>

      {/* ✅ 휴대폰 변경 모달 */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.35)]">
          <div className="bg-paper rounded-[20px] shadow-dropdown w-full max-w-md px-7 py-6">
            <div className="flex items-center justify_between mb-3">
              <h2 className="text-[18px] font-semibold text-text-black">
                휴대폰 번호 변경
              </h2>
              <button
                type="button"
                className="text-[20px] leading-none text-secondary-dark hover:text-text-black"
                onClick={closePhoneModal}
              >
                ×
              </button>
            </div>

            <p className="text-[13px] text-text-sub mb-3">
              새로 사용할 휴대폰 번호를 입력하고 인증을 완료해주세요.
            </p>

            <div className="space-y-3">
              {/* 휴대폰 번호 + 인증번호 전송 한 줄 */}
              <div className="flex gap-2 items-end">
                <div className="flex-1 flex flex-col gap-1.5 text-[13px] text-text-sub">
                  <span>휴대폰 번호</span>
                  <input
                    type="tel"
                    placeholder="- 없이 숫자만 입력"
                    className="w-full h-[42px] rounded-[10px] border border-secondary bg-paper px-3 text-[14px] focus:outline-none focus:border-primary"
                    value={phoneInput}
                    onChange={(e) =>
                      setPhoneInput(e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendPhoneCode}
                  disabled={phoneSending}
                  className="min-w-[110px] h-[38px] rounded-[10px] border border-secondary text-[13px] text-text-sub hover:bg-secondary-light disabled:opacity-70"
                >
                  {phoneSending ? "전송 중..." : "인증번호 전송"}
                </button>
              </div>

              {/* 인증번호 입력 */}
              <div className="flex flex-col gap-1.5 text-[13px] text-text-sub">
                <span>인증번호</span>
                <input
                  type="text"
                  placeholder="문자로 받은 인증번호 입력"
                  className="w-full h-[42px] rounded-[10px] border border-secondary bg-paper px-3 text-[14px] focus:outline-none focus:border-primary"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>

              <div className="mt-3 flex justify-end gap-3">
                <button
                  type="button"
                  className="min-w-[80px] h-[38px] rounded-[10px] border border-secondary text-[13px] text-text-sub hover:bg-secondary-light disabled:opacity-70"
                  onClick={closePhoneModal}
                  disabled={phoneSending || phoneVerifying}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="min-w-[110px] h-[38px] rounded-[10px] bg-primary text-[13px] text-white hover:bg-primary-dark disabled:opacity-70"
                  onClick={handleVerifyPhoneCode}
                  disabled={phoneVerifying}
                >
                  {phoneVerifying ? "확인 중..." : "인증 후 변경"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 비밀번호 변경 모달 */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.35)]">
          <div className="bg-paper rounded-[20px] shadow-dropdown w_full max-w-md px-7 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-semibold text-text-black">
                비밀번호 변경
              </h2>
              <button
                type="button"
                className="text-[20px] leading-none text-secondary-dark hover:text-text-black"
                onClick={closePasswordModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[13px] text-text-sub">
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  className="w-full h-[42px] rounded-[10px] border border-secondary bg-paper px-3 text-[14px] focus:outline-none focus:border-primary"
                  placeholder="현재 비밀번호"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordFormChange("currentPassword")}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] text-text-sub">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  className="w-full h-[42px] rounded-[10px] border border-secondary bg-paper px-3 text-[14px] focus:outline-none focus:border-primary"
                  placeholder="새 비밀번호"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordFormChange("newPassword")}
                />
                {/* ✅ 새 비밀번호 조건 안내 */}
                <ul className="mt-1 text-[12px] space-y-0.5 text-text-sub">
                  <li className={newPwdLengthOk ? "text-green-600" : ""}>
                    • 8자리 이상
                  </li>
                  <li className={newPwdHasLetter ? "text-green-600" : ""}>
                    • 영문자 포함
                  </li>
                  <li className={newPwdHasSpecial ? "text-green-600" : ""}>
                    • 특수문자 포함
                  </li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] text-text-sub">
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  className="w-full h-[42px] rounded-[10px] border border-secondary bg-paper px-3 text-[14px] focus:outline-none focus:border-primary"
                  placeholder="새 비밀번호 확인"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordFormChange("confirmPassword")}
                />

                {/* ✅ 실시간 일치 여부 표시 */}
                {passwordForm.confirmPassword.length > 0 && (
                  <p
                    className={`text-[12px] mt-0.5 ${
                      passwordsMatchInModal ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {passwordsMatchInModal
                      ? "비밀번호가 일치합니다."
                      : "비밀번호가 일치하지 않습니다."}
                  </p>
                )}
              </div>

              {passwordError && (
                <p className="text-[12px] text-error mt-1">{passwordError}</p>
              )}

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  className="min-w-[80px] h-[38px] rounded-[10px] border border-secondary text-[13px] text-text-sub hover:bg-secondary-light disabled:opacity-70"
                  onClick={closePasswordModal}
                  disabled={passwordSubmitting}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="min-w-[90px] h-[38px] rounded-[10px] bg-primary text-[13px] text-white hover:bg-primary-dark disabled:opacity-70"
                  disabled={passwordSubmitting}
                >
                  {passwordSubmitting ? "변경 중..." : "변경하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================
   공용 컴포넌트들 (리스트 전용)
   ========================= */

// 탭 버튼 (찜한 리스트 하트는 항상 빨간색으로)
function TabButton({ active, icon, label, onClick, activeUnderlineClass }) {
  const isWishlist = label === "찜한 리스트";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 pb-3 -mb-px border-b-2 ${
        active
          ? `${activeUnderlineClass} text-text-black`
          : "border-transparent text-text-sub"
      }`}
    >
      <span
        className={`text-[15px] ${
          active ? "text-text-black" : "text-text-sub"
        } ${isWishlist ? "text-red-500" : ""}`}
        style={isWishlist ? { color: "#ff4b4b" } : undefined}
      >
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

function formatDateTime(dateTimeString) {
  if (!dateTimeString) return { date: "-", time: "-" };
  const d = new Date(dateTimeString);
  if (Number.isNaN(d.getTime())) return { date: "-", time: "-" };

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return {
    date: `${year}.${month}.${day}`,
    time: `${hours}:${minutes}`,
  };
}

/* =========================================
   예약 리스트 카드 – 이미지 왼쪽, 정보 오른쪽
   ========================================= */
function ReservationRow({ item }) {
  const { date, time } = formatDateTime(item.reserveDateTime);

  const isCancelled = item.reserveStatus === false;
  const statusLabel = isCancelled ? "취소됨" : "예약 완료";

  return (
    <div className="bg-paper rounded-[20px] border border-secondary-light shadow-card overflow-hidden flex">
      {/* 왼쪽: 썸네일 영역 (전체가 아니라, 안에 네모 박스) */}
      <div className="w-[160px] flex-shrink-0 flex items-center justify-center px-4 py-4">
        <div className="w-[120px] h-[140px] rounded-[18px] bg-secondary-light overflow-hidden flex items-center justify-center">
          {item.popupThumbnail ? (
            <img
              src={item.popupThumbnail}
              alt={item.popupName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[13px] text-secondary-dark">이미지</span>
          )}
        </div>
      </div>

      {/* 오른쪽: 내용 */}
      <div className="flex-1 flex flex-col px-5 py-4 min-w-0">
        {/* 위쪽 정보 영역을 꽉 채우기 위해 flex-1 */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="font-semibold text-[16px] text-text-black leading-snug line-clamp-2">
            {item.popupName}
          </div>

          {/* ✅ 제목 밑에 예약일/예약시간 분리 */}
          <div className="mt-1 text-[13px] text-text-sub">
            <span className="font-medium text-text-black mr-1">예약일</span>
            {date}
          </div>
          <div className="text-[13px] text-text-sub">
            <span className="font-medium text-text-black mr-1">
              예약 시간
            </span>
            {time}
          </div>

          <div className="text-[13px] text-text-sub">
            <span className="font-medium text-text-black mr-1">인원</span>
            {item.reserveUserCount}명
            <span className="mx-2 text-secondary-dark">|</span>
            <span className="font-medium text-text-black mr-1">가격</span>
            {formatPrice(item.price)}원
          </div>
        </div>

        {/* 아래쪽 상태 + 버튼 영역 (선 제거) */}
        <div className="mt-3 pt-2 flex items-center justify-between flex-wrap gap-2">
          <span
            className={`inline-flex items-center rounded-full px-4 py-1 text-[13px] border ${
              isCancelled
                ? "border-secondary-dark text-secondary-dark bg-white"
                : "border-primary text-primary bg-white"
            }`}
          >
            {statusLabel}
          </span>

          {/* 취소된 예약이면 버튼 자체를 표시하지 않음 */}
          {!isCancelled && (
            <button
              type="button"
              className="text-[12px] text-text-sub hover:text-primary-dark"
            >
              취소하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================
   찜 리스트 카드 – 이미지 왼쪽, 정보 오른쪽
   ========================================= */
function WishlistRow({ item, onToggleWishlist }) {
  const { date: startDate } = formatDateTime(item.startDate);
  const { date: endDate } = formatDateTime(item.endDate);
  const period =
    startDate !== "-" && endDate !== "-" ? `${startDate} ~ ${endDate}` : "-";

  const statusLabel =
    item.popupStatus === "ENDED"
      ? "종료"
      : item.popupStatus === "UPCOMING"
      ? "예정"
      : "진행중";

  const isEnded = item.popupStatus === "ENDED";

  return (
    <div className="bg-paper rounded-[20px] border border-secondary-light shadow-card overflow-hidden flex">
      {/* 왼쪽: 썸네일 영역 (전체가 아니라, 안에 네모 박스) */}
      <div className="w-[160px] flex-shrink-0 flex items-center justify-center px-4 py-4">
        <div className="w-[120px] h-[140px] rounded-[18px] bg-secondary-light overflow-hidden flex items-center justify-center">
          {item.popupThumbnail ? (
            <img
              src={item.popupThumbnail}
              alt={item.popupName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[13px] text-secondary-dark">이미지</span>
          )}
        </div>
      </div>

      {/* 오른쪽: 내용 */}
      <div className="flex-1 flex flex-col px-5 py-4 min-w-0">
        {/* 정보 영역을 꽉 채우기 위해 flex-1 */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="font-semibold text-[16px] text-text-black leading-snug line-clamp-2">
            {item.popupName}
          </div>

          {/* ✅ 제목 밑 여백 + 장소/기간 */}
          <div className="mt-1 text-[13px] text-text-sub">
            <span className="font-medium text-text-black mr-1">장소</span>
            {item.popupLocation ?? "-"}
          </div>

          <div className="text-[13px] text-text-sub">
            <span className="font-medium text-text-black mr-1">기간</span>
            {period}
          </div>

          {/* ✅ 찜 리스트 가격 표시 추가 */}
          <div className="text-[13px] text-text-sub">
            <span className="font-medium text-text-black mr-1">가격</span>
            {item.price != null ? `${formatPrice(item.price)}원` : "-"}
          </div>
        </div>

        {/* ✅ 설명 아래 선 제거 + 하트 hover 효과 + flex-wrap */}
        <div className="mt-3 pt-2 flex items-center justify-between flex-wrap gap-2">
          <span
            className={`inline-flex items-center rounded-full px-4 py-1 text-[13px] border ${
              isEnded
                ? "border-secondary-dark text-secondary-dark bg-white"
                : "border-primary text-primary bg-white"
            }`}
          >
            {statusLabel}
          </span>
          <button
            type="button"
            className="text-[18px] text-red-500 hover:text-red-500 transition-transform duration-150 hover:scale-110"
            title="삭제"
            onClick={() => onToggleWishlist && onToggleWishlist(item.popupId)}
          >
            ❤
          </button>
        </div>
      </div>
    </div>
  );
}

// 페이지네이션
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const current = page; // 0-based
  const pages = Array.from({ length: totalPages }, (_, i) => i);

  const handlePrev = () => {
    if (current <= 0) return;
    onChange(current - 1);
  };

  const handleNext = () => {
    if (current >= totalPages - 1) return;
    onChange(current + 1);
  };

  return (
    <div className="mt-6 flex justify-center items-center gap-4 text-[13px] text-text-sub">
      <button
        type="button"
        onClick={handlePrev}
        disabled={current === 0}
        className={`flex items-center gap-1 px-2 py-1 rounded-full ${
          current === 0
            ? "opacity-40 cursor-default"
            : "hover:text-primary-dark"
        }`}
      >
        <span>{"<"}</span>
        <span>이전</span>
      </button>

      <div className="flex items-center gap-2">
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`w-7 h-7 rounded-full text-[13px] flex items-center justify-center ${
              p === current
                ? "bg-primary-light text-primary font-semibold"
                : "text-text-sub hover:text-primary-dark"
            }`}
          >
            {p + 1}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={current === totalPages - 1}
        className={`flex items-center gap-1 px-2 py-1 rounded-full ${
          current === totalPages - 1
            ? "opacity-40 cursor-default"
            : "hover:text-primary-dark"
        }`}
      >
        <span>다음</span>
        <span>{">"}</span>
      </button>
    </div>
  );
}

export default MyPage;
