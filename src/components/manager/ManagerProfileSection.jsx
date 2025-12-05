import React, { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  fetchManagerProfileApi,
  updateManagerEmailApi,
  updateManagerPhoneApi,
  changeManagerPasswordApi,
} from "../../api/managerApi";
import {
  uploadProfileImageApi,
  updateProfileApi,
  sendPhoneCodeApi,
  verifyPhoneCodeApi,
} from "../../api/myPageApi";
import { fetchMeApi } from "../../api/authApi";

// 같은 폴더 내 컴포넌트 import
import ManagerProfileCard from "./ManagerProfileCard"; 
import Toast from "../common/Toast";

export default function ManagerProfileSection() {
  const authUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(authUser?.profileImage);
  const [profileUploading, setProfileUploading] = useState(false);
  const fileInputRef = useRef(null);

  // 모달 상태들
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [phoneSending, setPhoneSending] = useState(false);
  const [phoneVerifying, setPhoneVerifying] = useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // 토스트 상태
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastVariant, setToastVariant] = useState("success");
  const toastTimerRef = useRef(null);

  const showToast = (msg, variant = "success") => {
    if (!msg) return;
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    setToastVariant(variant);
    setToastVisible(true);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2500);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // 1. 프로필 로딩
  useEffect(() => {
    if (!authUser) return;
    const loadProfile = async () => {
      setProfileLoading(true);
      try {
        const data = await fetchManagerProfileApi();
        setProfile(data);
        setProfileImage(data.profileImage || authUser.profileImage);
      } catch (err) {
        console.error(err);
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, [authUser]);

  // 프로필 이미지 변경 핸들러
  const handleProfileFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setProfileUploading(true);
      const uploaded = await uploadProfileImageApi(file);
      await updateProfileApi(uploaded);
      const me = await fetchMeApi();
      setUser(me);
      setProfileImage(me.profileImage ?? null);
      showToast("프로필 이미지가 변경되었습니다.");
    } catch (err) {
      console.error(err);
      showToast("이미지 변경 실패", "error");
    } finally {
      setProfileUploading(false);
      e.target.value = "";
    }
  };

  const handleClickProfileEdit = () => {
    if (profileUploading) return;
    fileInputRef.current?.click();
  };

  const handleResetProfileImage = async () => {
    if (!window.confirm("기본 프로필 이미지로 변경하시겠습니까?")) return;
    try {
      setProfileUploading(true);
      await updateProfileApi({ url: null, key: null });
      const me = await fetchMeApi();
      setUser(me);
      setProfileImage(me.profileImage ?? null);
      showToast("기본 이미지로 변경되었습니다.");
    } catch (err) {
      console.error(err);
      showToast("이미지 초기화 실패", "error");
    } finally {
      setProfileUploading(false);
    }
  };

  // 이메일 수정 핸들러
  const handleEditEmail = () => {
    if (!profile) return;
    setEmailInput(profile.email ?? "");
    setIsEmailModalOpen(true);
  };

  const handleSubmitEmail = async (e) => {
    e?.preventDefault();
    if (!profile) return;
    const trimmed = emailInput.trim();
    if (!trimmed || trimmed === profile.email) {
      setIsEmailModalOpen(false);
      return;
    }
    try {
      setEmailSubmitting(true);
      await updateManagerEmailApi({ email: trimmed });
      setProfile((prev) => (prev ? { ...prev, email: trimmed } : prev));
      setUser({ email: trimmed });
      showToast("이메일이 변경되었습니다.");
      setIsEmailModalOpen(false);
    } catch (err) {
      showToast(err?.response?.data?.message ?? "오류 발생", "error");
    } finally {
      setEmailSubmitting(false);
    }
  };

  // 휴대폰 수정 핸들러
  const handleEditPhone = () => {
    if (!profile) return;
    setPhoneInput(profile.phone ?? "");
    setVerificationCode("");
    setIsPhoneModalOpen(true);
  };

  const handleSendPhoneCode = async () => {
    const trimmed = phoneInput.trim();
    if (!trimmed) return showToast("번호를 입력해주세요.", "error");
    try {
      setPhoneSending(true);
      await sendPhoneCodeApi(trimmed);
      showToast("인증번호를 전송했습니다.");
    } catch (err) {
      showToast(err?.response?.data?.message ?? "전송 실패", "error");
    } finally {
      setPhoneSending(false);
    }
  };

  const handleVerifyPhoneCode = async (e) => {
    e?.preventDefault();
    const trimmedPhone = phoneInput.trim();
    const trimmedCode = verificationCode.trim();
    if (!trimmedPhone || !trimmedCode) return showToast("모두 입력해주세요.", "error");

    try {
      setPhoneVerifying(true);
      const ok = await verifyPhoneCodeApi({ phone: trimmedPhone, code: trimmedCode });
      if (!ok) return showToast("인증번호 불일치", "error");

      await updateManagerPhoneApi({ phone: trimmedPhone, code: trimmedCode });
      setProfile((prev) => (prev ? { ...prev, phone: trimmedPhone } : prev));
      setUser({ phone: trimmedPhone });
      showToast("휴대폰 번호 변경 완료");
      setIsPhoneModalOpen(false);
    } catch (err) {
      showToast(err?.response?.data?.message ?? "변경 실패", "error");
    } finally {
      setPhoneVerifying(false);
    }
  };

  // 비밀번호 변경 핸들러
  const handleChangePassword = () => {
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordError("");
    setIsPasswordModalOpen(true);
  };

  const handlePasswordChangeSubmit = async (e) => {
    e?.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordError("비밀번호가 일치하지 않습니다.");
    }
    try {
      setPasswordSubmitting(true);
      await changeManagerPasswordApi({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showToast("비밀번호 변경 완료. 다시 로그인해주세요.");
      setIsPasswordModalOpen(false);
    } catch (err) {
      setPasswordError(err?.response?.data?.message ?? "변경 실패");
    } finally {
      setPasswordSubmitting(false);
    }
  };


  return (
    <section className="w-full max-w-3xl">
      <header className="mb-6">
        <h1 className="text-[24px] font-bold text-text-black mb-1">
          매니저 마이페이지
        </h1>
        <p className="text-[13px] text-text-sub">
          매니저 계정 정보와 내가 등록한 팝업 스토어를 한 곳에서 관리할 수 있어요.
        </p>
      </header>

      {profileLoading ? (
        <div className="w-full h-[260px] rounded-[36px] bg-secondary-light animate-pulse" />
      ) : (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfileFileChange}
          />
          <ManagerProfileCard
            brandName={profile?.brandName}
            email={profile?.email}
            phone={profile?.phone}
            profileImageUrl={profileImage}
            profileUploading={profileUploading}
            onClickProfileEdit={handleClickProfileEdit}
            onResetProfileImage={handleResetProfileImage}
            onEditEmail={handleEditEmail}
            onEditPhone={handleEditPhone}
            onChangePassword={handleChangePassword}
          />
        </>
      )}

      {/* 이메일 수정 모달 */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-[360px] rounded-2xl bg-white px-5 py-4 shadow-card">
            <h2 className="text-[16px] font-semibold mb-2">이메일 수정</h2>
            <form onSubmit={handleSubmitEmail} className="space-y-3">
              <input
                type="email"
                className="w-full rounded-xl border border-secondary-light px-3 py-2 text-[14px]"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <div className="flex justify-end gap-2 text-[13px]">
                <button type="button" onClick={() => setIsEmailModalOpen(false)}>취소</button>
                <button type="submit" className="text-primary font-semibold" disabled={emailSubmitting}>저장</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 휴대폰 수정 모달 */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-[380px] rounded-2xl bg-white px-6 py-5 shadow-card">
            <h2 className="text-[16px] font-semibold mb-3">휴대폰 번호 변경</h2>
            <form onSubmit={handleVerifyPhoneCode} className="space-y-3">
              <div className="flex gap-2">
                <input
                    type="tel" placeholder="번호 입력"
                    className="flex-1 rounded-xl border border-secondary-light px-3 py-2 text-[14px]"
                    value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)}
                />
                <button type="button" onClick={handleSendPhoneCode} className="text-[13px] bg-primary text-white px-3 rounded-full">
                    {phoneSending ? "전송..." : "인증"}
                </button>
              </div>
              <input
                type="text" placeholder="인증번호"
                className="w-full rounded-xl border border-secondary-light px-3 py-2 text-[14px]"
                value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)}
              />
              <div className="flex justify-end gap-2 text-[13px] mt-2">
                <button type="button" onClick={() => setIsPhoneModalOpen(false)}>취소</button>
                <button type="submit" className="text-primary font-semibold" disabled={phoneVerifying}>변경</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 비밀번호 변경 모달 */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
           <div className="w-full max-w-[380px] rounded-2xl bg-white px-6 py-5 shadow-card">
             <h2 className="text-[16px] font-semibold mb-3">비밀번호 변경</h2>
             <form onSubmit={handlePasswordChangeSubmit} className="space-y-3">
               
               {/* 1. 현재 비밀번호 */}
               <input 
                 type="password" 
                 placeholder="현재 비밀번호" 
                 className="w-full rounded-xl border border-secondary-light px-3 py-2 text-[14px] focus:outline-none focus:border-primary"
                 value={passwordForm.currentPassword}
                 onChange={(e)=>setPasswordForm(prev=>({...prev, currentPassword:e.target.value}))}
               />

               {/* 2. 새 비밀번호 */}
               <input 
                 type="password" 
                 placeholder="새 비밀번호" 
                 className="w-full rounded-xl border border-secondary-light px-3 py-2 text-[14px] focus:outline-none focus:border-primary"
                 value={passwordForm.newPassword}
                 onChange={(e)=>setPasswordForm(prev=>({...prev, newPassword:e.target.value}))}
               />

               {/* 3. 새 비밀번호 확인 */}
               <input 
                 type="password" 
                 placeholder="새 비밀번호 확인" 
                 className="w-full rounded-xl border border-secondary-light px-3 py-2 text-[14px] focus:outline-none focus:border-primary"
                 value={passwordForm.confirmPassword}
                 onChange={(e)=>setPasswordForm(prev=>({...prev, confirmPassword:e.target.value}))}
               />

               {passwordError && <p className="text-red-500 text-[12px]">{passwordError}</p>}
               
               <div className="flex justify-end gap-2 text-[13px] mt-2">
                 <button type="button" onClick={() => setIsPasswordModalOpen(false)}>취소</button>
                 <button type="submit" className="text-primary font-semibold" disabled={passwordSubmitting}>변경하기</button>
               </div>
             </form>
           </div>
        </div>
      )}

      <Toast message={toastMessage} visible={toastVisible} variant={toastVariant} />
    </section>
  );
}