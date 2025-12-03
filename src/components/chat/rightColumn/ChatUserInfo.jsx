import ghost1 from "../../../assets/ghost1.png";

export default function ChatUserInfo() {
  return (
    <div className="w-full flex justify-end items-center pr-2">
      {/* 프로필 박스 전체 */}
      <div
        className="
          flex items-end gap-3
          px-3 py-2 
          rounded-btn
          cursor-pointer
        "
      >
        {/* 유저 이름 */}
        <span className="text-title-md font-bold text-text-black">히정</span>
        {/* 프로필 이미지 */}
        <img
          src={ghost1}
          alt="profile"
          className="w-10 h-10 rounded-full object-contain bg-white"
        />
      </div>
    </div>
  );
}
