// src/pages/auth/SignupPage.jsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../../components/button/PrimaryButton.jsx";
import OutlineButton from "../../components/button/OutlineButton.jsx";
import { useAuthStore } from "../../store/authStore";
import ghost1 from "../../assets/ghost1.png";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

function SignupPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const [form, setForm] = useState({
    email: "",
    loginId: "",
    name: "",
    password: "",
    passwordCheck: "",
    nickname: "",
    birthYear: "",
    gender: "",
    phone: "",
    profileImageUrl: "",
    profileImageKey: "",
  });

  const [emailChecked, setEmailChecked] = useState(false);
  const [loginIdChecked, setLoginIdChecked] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);

  const [phoneSending, setPhoneSending] = useState(false);
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ✅ 비밀번호 복잡도 / 일치 상태 계산 (UI + 검증에 사용)
  const password = form.password;
  const passwordLengthOk = password.length >= 8;
  const passwordHasLetter = /[A-Za-z]/.test(password);
  const passwordHasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordComplexOk =
    passwordLengthOk && passwordHasLetter && passwordHasSpecial;
  const passwordsMatch =
    form.password.length > 0 &&
    form.passwordCheck.length > 0 &&
    form.password === form.passwordCheck;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "email") setEmailChecked(false);
    if (name === "loginId") setLoginIdChecked(false);
    if (name === "nickname") setNicknameChecked(false);
    if (name === "phone") {
      setPhoneVerified(false);
      setVerificationCode("");
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleProfileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProfile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/api/files/profile`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        alert("프로필 이미지 업로드 중 오류가 발생했습니다.");
        return;
      }

      const data = await res.json();
      setForm((prev) => ({
        ...prev,
        profileImageUrl: data.url,
        profileImageKey: data.key,
      }));
    } catch (err) {
      console.error(err);
      alert("프로필 이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleCheckEmail = async () => {
    if (!form.email) {
      alert("이메일을 입력해주세요.");
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE}/api/auth/check/email?email=${encodeURIComponent(
          form.email
        )}`
      );
      if (!res.ok) {
        alert("이메일 중복 체크 중 오류가 발생했습니다.");
        return;
      }
      const duplicate = await res.json();
      if (duplicate) {
        alert("이미 사용 중인 이메일입니다.");
        setEmailChecked(false);
      } else {
        alert("사용 가능한 이메일입니다.");
        setEmailChecked(true);
      }
    } catch (e) {
      console.error(e);
      alert("이메일 중복 체크 중 오류가 발생했습니다.");
    }
  };

  const handleCheckLoginId = async () => {
    if (!form.loginId) {
      alert("아이디를 입력해주세요.");
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE}/api/auth/check/login-id?loginId=${encodeURIComponent(
          form.loginId
        )}`
      );
      if (!res.ok) {
        alert("아이디 중복 체크 중 오류가 발생했습니다.");
        return;
      }
      const duplicate = await res.json();
      if (duplicate) {
        alert("이미 사용 중인 아이디입니다.");
        setLoginIdChecked(false);
      } else {
        alert("사용 가능한 아이디입니다.");
        setLoginIdChecked(true);
      }
    } catch (e) {
      console.error(e);
      alert("아이디 중복 체크 중 오류가 발생했습니다.");
    }
  };

  const handleCheckNickname = async () => {
    if (!form.nickname) {
      alert("닉네임을 입력해주세요.");
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE}/api/auth/check/nickname?nickname=${encodeURIComponent(
          form.nickname
        )}`
      );
      if (!res.ok) {
        alert("닉네임 중복 체크 중 오류가 발생했습니다.");
        return;
      }
      const duplicate = await res.json();
      if (duplicate) {
        alert("이미 사용 중인 닉네임입니다.");
        setNicknameChecked(false);
      } else {
        alert("사용 가능한 닉네임입니다.");
        setNicknameChecked(true);
      }
    } catch (e) {
      console.error(e);
      alert("닉네임 중복 체크 중 오류가 발생했습니다.");
    }
  };

  const handleSendPhoneCode = async () => {
    if (!form.phone) {
      alert("휴대폰 번호를 입력해주세요.");
      return;
    }
    setPhoneSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/phone/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone }),
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
    if (!form.phone || !verificationCode) {
      alert("휴대폰 번호와 인증번호를 모두 입력해주세요.");
      return;
    }
    setPhoneVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/phone/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, code: verificationCode }),
      });
      if (!res.ok) {
        alert("인증번호 검증 중 오류가 발생했습니다.");
        return;
      }
      const ok = await res.json();
      if (ok) {
        alert("휴대폰 인증이 완료되었습니다.");
        setPhoneVerified(true);
      } else {
        alert("인증번호가 올바르지 않습니다.");
        setPhoneVerified(false);
      }
    } catch (e) {
      console.error(e);
      alert("인증번호 검증 중 오류가 발생했습니다.");
    } finally {
      setPhoneVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email) return alert("이메일을 입력해주세요.");
    if (!emailChecked) return alert("이메일 중복 체크를 완료해주세요.");

    if (!form.loginId) return alert("아이디를 입력해주세요.");
    if (!loginIdChecked) return alert("아이디 중복 체크를 완료해주세요.");

    if (!form.name) return alert("이름을 입력해주세요.");

    if (!form.password || !form.passwordCheck)
      return alert("비밀번호와 비밀번호 확인을 입력해주세요.");

    // ✅ 비밀번호 복잡도 체크: 8자리 이상 + 영문 + 특수문자
    if (!passwordComplexOk) {
      return alert(
        "비밀번호는 최소 8자리이며, 영문자와 특수문자를 포함해야 합니다."
      );
    }

    if (form.password !== form.passwordCheck)
      return alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");

    if (!form.nickname) return alert("닉네임을 입력해주세요.");
    if (!nicknameChecked) return alert("닉네임 중복 체크를 완료해주세요.");

    if (!form.birthYear) return alert("출생년도를 입력해주세요.");
    if (!form.gender) return alert("성별을 선택해주세요.");
    if (!form.phone) return alert("휴대폰 번호를 입력해주세요.");
    if (!phoneVerified) return alert("휴대폰 인증을 완료해주세요.");

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/social/signup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          nickname: form.nickname,
          gender: form.gender,
          phone: form.phone,
          birthYear: Number(form.birthYear),
          loginId: form.loginId,
          password: form.password,
          profileImageUrl: form.profileImageUrl || null,
          profileImageKey: form.profileImageKey || null,
        }),
      });

      if (res.ok) {
        alert("회원가입이 완료되었습니다.");
        await fetchMe(true);
        navigate("/", { replace: true });
      } else {
        const text = await res.text();
        console.error("signup error:", text);
        alert("회원가입 중 오류가 발생했습니다.\n" + text);
      }
    } catch (e) {
      console.error(e);
      alert("회원가입 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-88px)] flex items-center justify-center px-4 py-8 bg-secondary-light">
      <div className="flex max-w-[960px] w-full bg-paper rounded-card shadow-card overflow-hidden flex-col md:flex-row">
        <section className="flex-[0.9] bg-primary-light flex flex-col items-center justify-center px-8 py-10 gap-3">
          <div className="w-[110px] h-[110px] rounded-full bg-paper flex items-center justify-center mb-3 shadow-card">
            <img
              src={ghost1}
              alt="팝스팝 유령"
              className="w-[80px] h-[80px] object-contain"
            />
          </div>
          <h2 className="text-[22px] font-extrabold text-primary-dark tracking-[0.1em]">
            회원가입
          </h2>
          <p className="mt-1 text-[13px] text-text-black text-center leading-relaxed">
            기본 정보를 입력하고,
            <br />
            팝스팝의 모든 기능을 이용해보세요.
          </p>
        </section>

        <section className="flex-[1.2] px-6 md:px-10 py-8 bg-paper">
          <h1 className="text-[20px] font-bold text-text-black mb-4">
            회원가입
          </h1>

          {/* 프로필 사진 (선택) */}
          <div className="rounded-[12px] bg-[#f8f8fc] px-[16px] py-[14px] mb-4">
            <p className="m-0 text-[13px] font-semibold text-text-black mb-1">
              프로필 사진 (선택)
            </p>
            <p className="m-0 text-[12px] text-text-sub mb-2">
              나중에 마이페이지에서도 변경할 수 있어요.
            </p>

            <div className="flex items-center gap-4">
              {form.profileImageUrl ? (
                <img
                  src={form.profileImageUrl}
                  alt="profile"
                  className="w-[60px] h-[60px] rounded-full object-cover border border-secondary bg-secondary-light"
                />
              ) : (
                <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center bg-secondary-light border border-secondary text-[22px] text-text-sub">
                  😊
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <OutlineButton
                  type="button"
                  onClick={handleClickUpload}
                  disabled={uploadingProfile || submitting}
                >
                  {uploadingProfile ? "업로드 중..." : "사진 업로드"}
                </OutlineButton>
                <p className="text-[11px] text-text-sub">
                  5MB 이하의 JPG, PNG 파일을 권장합니다.
                </p>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleProfileChange}
            />
          </div>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            {/* 이메일 */}
            <div className="flex flex-col gap-1">
              <div className="flex gap-2">
                <label className="flex-1 flex flex-col gap-1.5 text-[13px] text-text-sub">
                  이메일
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="이메일 입력"
                    className="w-full px-3 py-2.5 rounded-input border border-secondary text-[14px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    value={form.email}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </label>
                <div className="flex items-end">
                  <OutlineButton
                    type="button"
                    onClick={handleCheckEmail}
                    disabled={submitting}
                  >
                    중복확인
                  </OutlineButton>
                </div>
              </div>
              {emailChecked && form.email && (
                <p className="text-[12px] text-green-600">
                  이메일 중복 확인이 완료되었습니다.
                </p>
              )}
            </div>

            {/* 아이디 */}
            <div className="flex flex-col gap-1">
              <div className="flex gap-2">
                <label className="flex-1 flex flex-col gap-1.5 text-[13px] text-text-sub">
                  아이디
                  <input
                    type="text"
                    name="loginId"
                    required
                    placeholder="아이디 입력"
                    className="w-full px-3 py-2.5 rounded-input border border-secondary text-[14px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    value={form.loginId}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </label>
                <div className="flex items-end">
                  <OutlineButton
                    type="button"
                    onClick={handleCheckLoginId}
                    disabled={submitting}
                  >
                    중복확인
                  </OutlineButton>
                </div>
              </div>
              {loginIdChecked && form.loginId && (
                <p className="text-[12px] text-green-600">
                  아이디 중복 확인이 완료되었습니다.
                </p>
              )}
            </div>

            {/* 이름 */}
            <label className="flex flex-col gap-1.5 text-[13px] text-text-sub">
              이름
              <input
                type="text"
                name="name"
                required
                placeholder="이름 입력"
                className="w-full px-3 py-2.5 rounded-input border border-secondary text-[14px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                value={form.name}
                onChange={handleChange}
                disabled={submitting}
              />
            </label>

            {/* 비밀번호 */}
            <div className="flex flex-col gap-1.5 text-[13px] text-text-sub">
              <label className="flex flex-col gap-1.5">
                비밀번호
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  placeholder="비밀번호 입력"
                  className="w-full px-3 py-2.5 rounded-input border border-secondary text-[14px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  value={form.password}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </label>
              {/* ✅ 비밀번호 조건 표시 */}
              <ul className="mt-1 text-[12px] space-y-0.5">
                <li
                  className={
                    passwordLengthOk ? "text-green-600" : "text-text-sub"
                  }
                >
                  • 8자리 이상
                </li>
                <li
                  className={
                    passwordHasLetter ? "text-green-600" : "text-text-sub"
                  }
                >
                  • 영문자 포함
                </li>
                <li
                  className={
                    passwordHasSpecial ? "text-green-600" : "text-text-sub"
                  }
                >
                  • 특수문자 포함
                </li>
              </ul>
            </div>

            {/* 비밀번호 확인 + 일치 여부 표시 */}
            <div className="flex flex-col gap-1.5 text-[13px] text-text-sub">
              <label className="flex flex-col gap-1.5">
                비밀번호 확인
                <input
                  type="password"
                  name="passwordCheck"
                  required
                  minLength={8}
                  placeholder="비밀번호 재입력"
                  className="w-full px-3 py-2.5 rounded-input border border-secondary text-[14px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  value={form.passwordCheck}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </label>
              {form.passwordCheck.length > 0 && (
                <p
                  className={`text-[12px] mt-0.5 ${
                    passwordsMatch ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {passwordsMatch
                    ? "비밀번호가 일치합니다."
                    : "비밀번호가 일치하지 않습니다."}
                </p>
              )}
            </div>

            {/* 닉네임 */}
            <div className="flex flex-col gap-1">
              <div className="flex gap-2">
                <label className="flex-1 flex flex-col gap-1.5 text-[13px] text-text-sub">
                  닉네임
                  <input
                    type="text"
                    name="nickname"
                    required
                    placeholder="닉네임 입력"
                    className="w-full px-3 py-2.5 rounded-input border border-secondary text-[14px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    value={form.nickname}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </label>
                <div className="flex items-end">
                  <OutlineButton
                    type="button"
                    onClick={handleCheckNickname}
                    disabled={submitting}
                  >
                    중복확인
                  </OutlineButton>
                </div>
              </div>
              {nicknameChecked && form.nickname && (
                <p className="text-[12px] text-green-600">
                  닉네임 중복 확인이 완료되었습니다.
                </p>
              )}
            </div>

            {/* 출생년도 + 성별 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5 text-[13px] text-text-sub">
                출생년도
                <input
                  type="number"
                  name="birthYear"
                  required
                  placeholder="예) 1995"
                  className="w-full px-3 py-2.5 rounded-input border border-secondary text-[14px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  value={form.birthYear}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </label>

              <label className="flex flex-col gap-1.5 text-[13px] text-text-sub">
                성별
                <select
                  name="gender"
                  required
                  value={form.gender}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full px-3 py-2.5 rounded-input border border-secondary text-[14px] outline-none bg-white focus:border-primary focus:ring-1 focus:ring-primary/20"
                >
                  <option value="">성별 선택</option>
                  <option value="MALE">남성</option>
                  <option value="FEMALE">여성</option>
                </select>
              </label>
            </div>

            {/* 휴대폰 + 인증 */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <label className="flex-1 flex flex-col gap-1.5 text-[13px] text-text-sub">
                  휴대폰 번호
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="- 없이 숫자만 입력"
                    className="w-full px-3 py-2.5 rounded-input border border-secondary text-[14px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </label>
                <div className="flex items-end">
                  <OutlineButton
                    type="button"
                    onClick={handleSendPhoneCode}
                    disabled={submitting || phoneSending}
                  >
                    {phoneSending ? "전송 중..." : "인증번호 전송"}
                  </OutlineButton>
                </div>
              </div>

              <div className="flex gap-2 items-end">
                <label className="flex-1 flex flex-col gap-1.5 text-[13px] text-text-sub">
                  인증번호
                  <input
                    type="text"
                    required
                    placeholder="인증번호 입력"
                    className="w-full px-3 py-2.5 rounded-input border border-secondary text-[14px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    disabled={submitting}
                  />
                </label>
                <OutlineButton
                  type="button"
                  onClick={handleVerifyPhoneCode}
                  disabled={submitting || phoneVerifying}
                >
                  {phoneVerifying ? "확인 중..." : "인증 확인"}
                </OutlineButton>
              </div>

              {phoneVerified && (
                <p className="text-[12px] text-green-600 mt-1">
                  휴대폰 인증이 완료되었습니다.
                </p>
              )}
            </div>

            <PrimaryButton
              type="submit"
              fullWidth
              loading={submitting}
              className="mt-3"
            >
              {submitting ? "가입 중..." : "회원가입 완료"}
            </PrimaryButton>
          </form>
        </section>
      </div>
    </main>
  );
}

export default SignupPage;
