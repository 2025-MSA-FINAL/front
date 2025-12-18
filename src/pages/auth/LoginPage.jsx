// src/pages/auth/LoginPage.jsx

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import PrimaryButton from "../../components/button/PrimaryButton.jsx";
import { useAuthStore } from "../../store/authStore";

import kakaoBtn from "../../assets/kakaoBtn.png";
import logo from "../../assets/logo.png";
import ghost1 from "../../assets/ghost1.png";
import naverBtn from "../../assets/naverBtn.png";
import googleBtn from "../../assets/googleBtn.png";

import { EyeIcon, EyeOffIcon } from "../../components/icon/EyeIcons.jsx"; // 👈 공용 아이콘
import Toast from "../../components/common/Toast.jsx"; // ✅ 추가

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const NAVER_AUTH_URL = `${API_BASE}/oauth2/authorization/naver`;

function LoginPage() {
  const [form, setForm] = useState({ loginId: "", password: "" });
  const [showPassword, setShowPassword] = useState(false); // 👈 비밀번호 보기 상태

  // ✅ 토스트 상태 추가
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    variant: "success",
  });

  const navigate = useNavigate();

  const login = useAuthStore((s) => s.login);
  const globalLoading = useAuthStore((s) => s.loading);

  const loading = globalLoading;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.loginId || !form.password) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    try {
      await login({ loginId: form.loginId, password: form.password });

      // ✅ 성공 alert 대신 토스트
      setToast({
        visible: true,
        message: "로그인 되었습니다.",
        variant: "success",
      });

      // ✅ 바로 이동
      navigate("/", { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        alert("아이디 또는 비밀번호가 올바르지 않습니다.");
      } else if (status === 403) {
        alert("비활성화된 계정입니다. 관리자에게 문의해주세요.");
      } else {
        alert("로그인 중 오류가 발생했습니다.");
      }
    }
  };

  const handleNaverLogin = () => {
    window.location.href = NAVER_AUTH_URL;
  };

  const handleNotReady = (provider) => {
    alert(`${provider} 로그인은 아직 준비 중입니다.`);
  };

  return (
    <>
      {/* ✅ 토스트 렌더 */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        variant={toast.variant}
      />

      <main className="min-h-[calc(100vh-88px)] flex items-center justify-center px-4 py-12 bg-secondary-light">
        <div className="flex max-w-[900px] w-full bg-paper rounded-card shadow-card overflow-hidden flex-col md:flex-row">
          {/* Left */}
          <section className="flex-[0.9] bg-primary-light flex flex-col items-center justify-center px-10 py-12 gap-4">
            {/* 👇 동그란 div 삭제, 이미지만 남김 */}
            <img
              src={ghost1}
              alt="ghost"
              className="w-[80px] h-[80px] mb-4 object-contain"
            />

            <img src={logo} alt="logo" className="w-[120px] object-contain" />

            <p className="mt-2 text-[14px] text-text-black text-center leading-relaxed">
              당신이 관심있는 팝업 스토어를
              <br />
              더 빠르고 쉽게 만나보세요.
            </p>
          </section>

          {/* Right */}
          <section className="flex-[1.1] bg-paper px-8 md:px-14 py-10">
            <h2 className="text-[22px] font-bold text-text-black mb-6">로그인</h2>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {/* 아이디 */}
              <label className="flex flex-col gap-1.5 text-[13px] text-text-sub">
                아이디
                <input
                  type="text"
                  name="loginId"
                  placeholder="아이디 입력"
                  className="w-full px-3 py-2.5 rounded-input border border-secondary text-[14px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  value={form.loginId}
                  onChange={handleChange}
                  disabled={loading}
                />
              </label>

              {/* 비밀번호 + 눈 아이콘 */}
              <label className="flex flex-col gap-1.5 text-[13px] text-text-sub">
                비밀번호
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="비밀번호 입력"
                    className="w-full px-3 py-2.5 pr-10 rounded-input border border-secondary text-[14px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </label>

              <PrimaryButton
                type="submit"
                fullWidth
                loading={loading}
                className="mt-1"
              >
                {loading ? "로그인 중..." : "일반 로그인"}
              </PrimaryButton>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-2">
              <span className="flex-1 h-px bg-[#eeeeee]" />
              <span className="text-[12px] text-[#999999]">또는</span>
              <span className="flex-1 h-px bg-[#eeeeee]" />
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-3 gap-2 mb-4 h-[40px]">
              <button
                className="w-full h-full rounded-[8px]"
                type="button"
                onClick={handleNaverLogin}
              >
                <img
                  src={naverBtn}
                  alt="naver-login"
                  className="object-scale-down w-full h-full rounded-[8px]"
                />
              </button>

              <button
                className="w-full h-full rounded-[8px]"
                type="button"
                onClick={() => handleNotReady("카카오")}
              >
                <img
                  src={kakaoBtn}
                  alt="kakao-login"
                  className="object-scale-down w-full h-full rounded-[8px]"
                />
              </button>

              <button
                className="w-full h-full rounded-[8px]"
                type="button"
                onClick={() => handleNotReady("구글")}
              >
                <img
                  src={googleBtn}
                  alt="google-login"
                  className="object-scale-down w-full h-full rounded-[8px]"
                />
              </button>
            </div>

            {/* 하단 */}
            <div className="mt-4 flex flex-col gap-2 text-[13px] text-text-sub">
              <div className="mt-1">
                매니저 계정이 필요하신가요?
                <Link
                  to="/manager-inquiry"
                  className="ml-1 text-primary-dark font-semibold hover:underline"
                >
                  문의하기 &gt;
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default LoginPage;
