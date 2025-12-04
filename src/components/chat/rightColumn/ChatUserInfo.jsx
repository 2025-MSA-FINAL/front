import ghost1 from "../../../assets/ghost1.png";
import { useAuthStore } from "../../../store/authStore";
import { useEffect } from "react";

export default function ChatUserInfo() {
  const { user, fetchMe, initialized } = useAuthStore();

  useEffect(() => {
    if (!initialized) fetchMe();
  }, [initialized, fetchMe]);

  const username = user?.nickname || user?.userNickname || "게스트";

  const profileImageUrl = user?.profileImage || ghost1;

  return (
    <div className="w-full flex justify-end items-center pr-2">
      <div
        className="
          flex items-end gap-3 px-3 py-2 rounded-btn cursor-pointer
        "
      >
        {/* 유저 이름 */}
        <span className="text-md font-bold text-black truncate max-w-[150px]">
          {username}
        </span>

        {/* 프로필 이미지 */}
        <img
          src={profileImageUrl}
          alt="profile"
          className="w-10 h-10 rounded-full object-cover bg-white"
        />
      </div>
    </div>
  );
}
