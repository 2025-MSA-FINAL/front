import { useState, useEffect, useRef } from "react";
import ghost1 from "../../../assets/ghost1.png";
import { useAuthStore } from "../../../store/authStore";
import { useNavigate } from "react-router-dom";
import MyPageIcon from "../icons/MyPageIcon";
import PopupListIcon from "../icons/PopupListIcon";

export default function ChatUserInfo() {
  const { user, fetchMe, initialized, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialized) fetchMe();
  }, [initialized, fetchMe]);

  const username = user?.nickname || user?.userNickname || "게스트";
  const profileImageUrl = user?.profileImage || ghost1;

  const toggleOpen = () => {
    if (!visible) {
      setVisible(true);
      setTimeout(() => setOpen(true), 10);
    } else {
      setOpen(false);
      setTimeout(() => setVisible(false), 180);
    }
  };

  // 외부 클릭 닫기
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setTimeout(() => setVisible(false), 180);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      className="relative w-full flex justify-end items-center pr-2"
      ref={dropdownRef}
    >
      {/* 버튼 */}
      <div
        onClick={toggleOpen}
        className="
          flex items-center gap-2 px-3 py-2 cursor-pointer
          hover:bg-secondary-light/30 transition rounded-full
        "
      >
        <img
          src={profileImageUrl}
          className="w-9 h-9 rounded-full object-cover shadow-sm bg-white"
        />
        <span className="text-sm font-medium text-text-main truncate max-w-[120px]">
          {username}
        </span>
      </div>

      {/* 드롭다운 메뉴 */}
      {visible && (
        <div
          className={`
            absolute top-[64px] right-2
            w-[250px]
            rounded-[22px]
            py-6 px-5 z-20 flex flex-col

            /* Glass 효과 */
            bg-white/40 backdrop-blur-xl
            shadow-[0_8px_25px_rgba(0,0,0,0.12)]
            border border-white/20

            transition-all duration-200
            ${open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
          `}
        >
          {/* 프로필 */}
          <div className="flex items-end gap-2.5 mb-5">
            <img
              src={profileImageUrl}
              className="w-[48px] h-[48px] rounded-full object-cover shadow-md border-2 border-white"
            />
            <div>
              <p className="text-[15px] font-bold text-text-black leading-tight">
                {username}
              </p>
              {/* 로그아웃 */}
              <p
                onClick={() => {
                  logout?.();
                  toggleOpen();
                  navigate("/");
                }}
                className="text-label-sm text-text-main tracking-wide
              hover:text-text-sub transition self-end cursor-pointer
            "
              >
                로그아웃
              </p>
            </div>
          </div>

          {/* 메뉴 카드 */}
          <div className="relative space-y-1">
            {/* 마이페이지 */}
            <div
              className="
                group relative w-full rounded-xl px-4 py-3 cursor-pointer flex items-center gap-3
                transition
              "
              onClick={() => navigate("/mypage")}
            >
              {/* hover 시 나타나는 Glass 박스 */}
              <div
                className="
                  absolute inset-0 rounded-xl opacity-0 
                  group-hover:opacity-100 transition
                  bg-primary-soft2/20 backdrop-blur-md border border-primary-soft2/10
                "
              ></div>

              <MyPageIcon className="w-5 h-5 text-secondary-dark relative z-10" />
              <span className="text-sm font-medium text-text-black relative z-10">
                마이페이지
              </span>
            </div>

            {/* 전체 팝업리스트 */}
            <div
              className="
                group relative w-full rounded-xl px-4 py-3 cursor-pointer flex items-center gap-3
                transition
              "
              onClick={() => navigate("/pop-up")}
            >
              {/* hover 네모 박스 */}
              <div
                className="
                  absolute inset-0 rounded-xl opacity-0 
                  group-hover:opacity-100 transition
                  bg-primary-soft2/20 backdrop-blur-md border border-primary-soft2/10
                "
              ></div>

              <PopupListIcon className="w-5 h-5 text-primary relative z-10" />
              <span className="text-sm font-medium text-text-black relative z-10">
                전체 팝업리스트
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
