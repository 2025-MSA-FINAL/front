// src/pages/user/MyPageUserInfoSection.jsx
import { useEffect, useRef, useState } from "react";
import {
  updateNicknameApi,
  updateEmailApi,
  updatePhoneApi,
  changePasswordApi,
  deleteMeApi,
  uploadProfileImageApi,
  updateProfileApi,
  checkPasswordApi,
  sendPhoneCodeApi,
  verifyPhoneCodeApi,
  updateIntroductionApi, // ✅ 자기소개 수정 API
} from "../../api/myPageApi";
import { apiClient } from "../../api/authApi";
import Toast from "../../components/common/Toast";

// ✅ 연필 버튼 svg (경로는 프로젝트 구조에 맞게 조정)
import editIcon from "../../assets/editButton.svg";

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

function UserInfoSection({ authUser, setUser }) {
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

  // ✅ 자기소개 상태 (백엔드 필드: introduction)
  const [intro, setIntro] = useState(authUser?.introduction ?? "");
  const [introSaving, setIntroSaving] = useState(false);

  // ✅ 닉네임 / 이메일 수정 모달 상태
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(authUser?.nickname ?? "");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState(authUser?.email ?? "");

  // ✅ 토스트 상태
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastVariant, setToastVariant] = useState("success"); // "success" | "error"
  const toastTimerRef = useRef(null);

  const showToast = (msg, variant = "success") => {
    if (!msg) return;
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    setToastVariant(variant);
    setToastVisible(true);
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 2500);
  };

  // authUser 변경 시 자기소개/닉네임/이메일 동기화
  useEffect(() => {
    setIntro(authUser?.introduction ?? "");
    setNicknameInput(authUser?.nickname ?? "");
    setEmailInput(authUser?.email ?? "");
  }, [authUser]);

  // 언마운트 시 토스트 타이머 정리
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

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
  // 기본 정보 수정 핸들러들
  // =========================
  const handleUpdateNickname = () => {
    if (!authUser) return;
    setNicknameInput(authUser.nickname || "");
    setIsNicknameModalOpen(true);
  };

  const handleConfirmNicknameChange = async () => {
    if (!authUser) return;
    const next = nicknameInput.trim();
    if (!next || next === authUser.nickname) {
      setIsNicknameModalOpen(false);
      return;
    }

    try {
      setUpdating(true);
      await updateNicknameApi({ nickname: next });

      // 🔥 즉시 UI 반영
      setUser({ nickname: next });
      showToast("닉네임이 변경되었습니다.", "success");
      setIsNicknameModalOpen(false);
    } catch (err) {
      showToast(
        err?.response?.data?.message ?? "닉네임 변경 중 오류가 발생했습니다.",
        "error"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateEmail = () => {
    if (!authUser) return;
    setEmailInput(authUser.email || "");
    setIsEmailModalOpen(true);
  };

  const handleConfirmEmailChange = async () => {
    if (!authUser) return;
    const next = emailInput.trim();
    if (!next || next === authUser.email) {
      setIsEmailModalOpen(false);
      return;
    }

    try {
      setUpdating(true);
      await updateEmailApi({ email: next });

      // 🔥 즉시 UI 반영
      setUser({ email: next });
      showToast("이메일이 변경되었습니다.", "success");
      setIsEmailModalOpen(false);
    } catch (err) {
      showToast(
        err?.response?.data?.message ?? "이메일 변경 중 오류가 발생했습니다.",
        "error"
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
      showToast("휴대폰 번호를 입력해주세요.", "error");
      return;
    }
    setPhoneSending(true);
    try {
      await sendPhoneCodeApi(phoneInput);
      showToast("인증번호를 전송했습니다.", "success");
    } catch (e) {
      console.error(e);
      showToast(
        e?.response?.data?.message ??
          "인증번호 전송 중 오류가 발생했습니다.",
        "error"
      );
    } finally {
      setPhoneSending(false);
    }
  };

  const handleVerifyPhoneCode = async () => {
    if (!phoneInput || !verificationCode) {
      showToast("휴대폰 번호와 인증번호를 모두 입력해주세요.", "error");
      return;
    }
    setPhoneVerifying(true);
    try {
      // 1) 인증번호 검증
      const ok = await verifyPhoneCodeApi({
        phone: phoneInput,
        code: verificationCode,
      });

      if (!ok) {
        showToast("인증번호가 올바르지 않습니다.", "error");
        return;
      }

      // 2) 실제 휴대폰 번호 변경 API 호출
      await updatePhoneApi({ phone: phoneInput });

      // 3) 전역 상태 & 화면 반영
      setUser({ phone: phoneInput });
      showToast("휴대폰 번호가 변경되었습니다.", "success");
      setIsPhoneModalOpen(false);
    } catch (e) {
      console.error(e);
      showToast(
        e?.response?.data?.message ??
          "휴대폰 번호 변경 중 오류가 발생했습니다.",
        "error"
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
      showToast("프로필 이미지가 변경되었습니다.", "success");
    } catch (err) {
      showToast(
        err?.response?.data?.message ??
          "프로필 이미지 변경 중 오류가 발생했습니다.",
        "error"
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
      showToast("기본 프로필 이미지로 변경되었습니다.", "success");
    } catch (err) {
      showToast(
        err?.response?.data?.message ??
          "프로필 이미지를 기본으로 되돌리는 중 오류가 발생했습니다.",
        "error"
      );
    } finally {
      setProfileUploading(false);
    }
  };

  // =========================
  // 자기소개 저장 핸들러
  // =========================
  const handleSaveIntro = async () => {
    if (!authUser) return;

    try {
      if (!intro || intro.trim().length === 0) {
        const ok = window.confirm("자기소개를 비워둘까요?");
        if (!ok) return;
      }

      setIntroSaving(true);

      // ✅ 전용 API로 자기소개만 PATCH
      await updateIntroductionApi({ introduction: intro });

      // 전역 유저 상태 업데이트
      setUser({ introduction: intro });

      showToast("자기소개가 저장되었습니다.", "success");
    } catch (err) {
      showToast(
        err?.response?.data?.message ??
          "자기소개 저장 중 오류가 발생했습니다.",
        "error"
      );
    } finally {
      setIntroSaving(false);
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
      showToast(msg, "error");
      return;
    }

    try {
      setPasswordSubmitting(true);

      // 2) 서버에 현재 비밀번호 검증 요청
      const isValid = await checkPasswordApi({ password: currentPassword });

      if (!isValid) {
        const msg = "현재 비밀번호가 올바르지 않습니다.";
        setPasswordError(msg);
        showToast(msg, "error");
        return;
      }

      // 3) 새 비밀번호 복잡도 검사 (8자 + 영문 + 특문)
      if (!newPwdComplexOk) {
        const msg =
          "새 비밀번호는 최소 8자리이며, 영문자와 특수문자를 포함해야 합니다.";
        setPasswordError(msg);
        showToast(msg, "error");
        return;
      }

      // 4) 새 비밀번호 & 확인 일치 검사
      if (newPassword !== confirmPassword) {
        const msg = "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.";
        setPasswordError(msg);
        showToast(msg, "error");
        return;
      }

      // 5) 실제 비밀번호 변경 API 호출
      await changePasswordApi({ currentPassword, newPassword });
      showToast("비밀번호가 변경되었습니다.", "success");
      setIsPasswordModalOpen(false);
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        "비밀번호 변경 중 오류가 발생했습니다.";
      setPasswordError(msg);
      showToast(msg, "error");
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
      showToast("회원탈퇴가 완료되었습니다. 메인 페이지로 이동합니다.", "success");

      // ✅ 프론트 상태 정리
      setUser(null);

      // ✅ 메인 페이지로 이동
      window.location.href = "/";
    } catch (err) {
      showToast(
        err?.response?.data?.message ??
          "회원탈퇴 처리 중 오류가 발생했습니다.",
        "error"
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-3xl">
        {/* 상단 타이틀 */}
        <h1 className="text-[28px] font-bold text-center text-text-black mb-10">
          마이페이지
        </h1>

        {/* 상단 큰 카드 */}
        <section
          className="
            relative
            bg-paper-light
            rounded-[36px]
            px-10 pt-10 pb-8
            flex flex-col items-center
            border border-secondary
            shadow-hover
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
              className="absolute -bottom-1 right-2 w-7 h-7 rounded-full bg-paper border border-secondary flex items-center justify-center text-secondary-dark hover:bg-secondary-light disabled:opacity-60"
              title="프로필 사진 수정"
            >
              <img
                src={editIcon}
                alt="프로필 수정"
                className="w-3.5 h-3.5"
              />
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
          <div className="bg-paper rounded-[24px] shadow-card border border-secondary px-14 py-8 w-full max-w-[560px] translate-y-1">
            <div className="space-y-4 text-[15px]">
              {/* 닉네임 */}
              <div className="flex items-center justify-between">
                <span className="text-text-black w-[90px]">닉네임</span>
                <span className="flex-1 text-text-black font-medium whitespace-nowrap">
                  {authUser.nickname}
                </span>
                <button
                  type="button"
                  onClick={handleUpdateNickname}
                  disabled={updating}
                  className="flex items-center justify-center w-[24px] h-[24px] text-secondary-dark hover:text-primary-dark"
                  title="닉네임 수정"
                >
                  <img src={editIcon} alt="닉네임 수정" className="w-4 h-4" />
                </button>
              </div>

              {/* 성별 */}
              <div className="flex items-center justify-between">
                <span className="text-text-black w-[90px]">성별</span>
                <span className="flex-1 text-text-black whitespace-nowrap">
                  {genderLabel}
                </span>
                <span className="w-[24px]" />
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
                  className="flex items-center justify-center w-[24px] h-[24px] text-secondary-dark hover:text-primary-dark"
                  title="전화번호 수정"
                >
                  <img src={editIcon} alt="전화번호 수정" className="w-4 h-4" />
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
                  className="flex items-center justify-center w-[24px] h-[24px] text-secondary-dark hover:text-primary-dark"
                  title="이메일 수정"
                >
                  <img src={editIcon} alt="이메일 수정" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ✅ 자기소개 섹션 */}
          <div className="mt-6 w-full max-w-[560px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[14px] font-medium text-text-black">
                자기소개
              </span>
              <span className="text-[12px] text-text-sub"></span>
            </div>

            <div className="bg-paper rounded-[18px] border border-secondary-light px-4 py-3 shadow-card">
              <textarea
                className="w-full min-h-[80px] max-h-[160px] resize-none rounded-[10px] border border-secondary bg-paper px-3 py-2 text-[14px] focus:outline-none focus:border-primary"
                placeholder="예) 팝업투어를 좋아하는 20대 직장인입니다 🙂"
                maxLength={500}
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
              />
              <div className="mt-2 flex items-center justify-between text-[12px] text-text-sub">
                <span>{intro.length} / 500</span>
                <button
                  type="button"
                  onClick={handleSaveIntro}
                  disabled={introSaving}
                  className="min-w-[80px] h-[32px] rounded-[10px] bg-primary text-white text-[12px] hover:bg-primary-dark disabled:opacity-60"
                >
                  {introSaving ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          </div>

          {/* 하단 버튼 줄 */}
          <div className="mt-5 w-full max-w-[560px] flex justify-center gap-10 text-[13px] text-text-sub">
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

      {/* ✅ 닉네임 변경 모달 */}
      {isNicknameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.35)]">
          <div className="bg-paper rounded-[20px] shadow-dropdown w-full max-w-md px-7 py-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[18px] font-semibold text-text-black">
                닉네임 변경
              </h2>
              <button
                type="button"
                className="text-[20px] leading-none text-secondary-dark hover:text-text-black"
                onClick={() => setIsNicknameModalOpen(false)}
              >
                ×
              </button>
            </div>

            <p className="text-[13px] text-text-sub mb-3">
              새 닉네임을 입력해주세요.
            </p>

            <div className="space-y-3">
              <input
                type="text"
                className="w-full h-[42px] rounded-[10px] border border-secondary bg-paper px-3 text-[14px] focus:outline-none focus:border-primary"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
              />

              <div className="mt-3 flex justify-end gap-3">
                <button
                  type="button"
                  className="min-w-[80px] h-[38px] rounded-[10px] border border-secondary text-[13px] text-text-sub hover:bg-secondary-light disabled:opacity-70"
                  onClick={() => setIsNicknameModalOpen(false)}
                  disabled={updating}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="min-w-[90px] h-[38px] rounded-[10px] bg-primary text-[13px] text-white hover:bg-primary-dark disabled:opacity-70"
                  onClick={handleConfirmNicknameChange}
                  disabled={updating}
                >
                  변경하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ 이메일 변경 모달 */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.35)]">
          <div className="bg-paper rounded-[20px] shadow-dropdown w-full max-w-md px-7 py-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[18px] font-semibold text-text-black">
                이메일 변경
              </h2>
              <button
                type="button"
                className="text-[20px] leading-none text-secondary-dark hover:text-text-black"
                onClick={() => setIsEmailModalOpen(false)}
              >
                ×
              </button>
            </div>

            <p className="text-[13px] text-text-sub mb-3">
              새 이메일을 입력해주세요.
            </p>

            <div className="space-y-3">
              <input
                type="email"
                className="w-full h-[42px] rounded-[10px] border border-secondary bg-paper px-3 text-[14px] focus:outline-none focus:border-primary"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />

              <div className="mt-3 flex justify-end gap-3">
                <button
                  type="button"
                  className="min-w-[80px] h-[38px] rounded-[10px] border border-secondary text-[13px] text-text-sub hover:bg-secondary-light disabled:opacity-70"
                  onClick={() => setIsEmailModalOpen(false)}
                  disabled={updating}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="min-w-[90px] h-[38px] rounded-[10px] bg-primary text-[13px] text-white hover:bg-primary-dark disabled:opacity-70"
                  onClick={handleConfirmEmailChange}
                  disabled={updating}
                >
                  변경하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ 휴대폰 변경 모달 */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.35)]">
          <div className="bg-paper rounded-[20px] shadow-dropdown w-full max-w-md px-7 py-6">
            <div className="flex items-center justify-between mb-3">
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
          <div className="bg-paper rounded-[20px] shadow-dropdown w-full max-w-md px-7 py-6">
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

      {/* ✅ 공통 Toast */}
      <Toast
        message={toastMessage}
        visible={toastVisible}
        variant={toastVariant}
      />
    </>
  );
}

export default UserInfoSection;
