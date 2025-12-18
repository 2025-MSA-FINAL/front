import LockOpenIcon from "../icons/LockOpenIcon";
import LockClosedIcon from "../icons/LockClosedIcon";
import UserIcon from "../icons/UserIcon";
import HeartIcon from "../icons/HeartIcon";
import { useChatPopupStore } from "../../../store/chat/chatPopupStore";

export default function GroupRoomDetailSection({ room }) {
  const { joinRoom } = useChatPopupStore();
  if (!room) return null;

  const handleJoin = async () => {
    console.log("JOIN gcrId =", room.gcrId, typeof room.gcrId);
    try {
      await joinRoom(room.gcrId);
    } catch (e) {
      alert(e.response?.data?.message || "참여 실패");
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center text-center overflow-y-auto px-10 gap-3">
      {/* 타이틀 */}
      <h1 className="text-[36px] font-extrabold text-white drop-shadow-xl mb-5 tracking-tight">
        {room.title}
      </h1>

      {/* 설명 */}
      <p className="text-white/80 text-[17px] max-w-[700px] leading-relaxed mb-14">
        {room.description}
      </p>

      {/* 카드들 */}
      <div className="flex gap-10 mb-16 flex-wrap justify-center text-white">
        {/* 카드 공통 클래스 */}
        {[
          {
            icon: <UserIcon className="w-7 h-7 text-white/95" />,
            label: "인원",
            value: `${room.currentUserCnt} / ${room.maxUserCnt}`,
          },
          {
            icon: <HeartIcon className="w-7 h-7 text-white/95" />,
            label: "연령 조건",
            value: `${room.minAge} ~ ${room.maxAge}세`,
          },
          {
            icon:
              room.limitGender === "NONE" || !room.limitGender ? (
                <LockOpenIcon className="w-7 h-7 text-green-300" />
              ) : (
                <LockClosedIcon className="w-7 h-7 text-red-300" />
              ),
            label: "성별 조건",
            value:
              room.limitGender === "MALE"
                ? "남성만"
                : room.limitGender === "FEMALE"
                ? "여성만"
                : "제한 없음",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="
              min-w-[210px] px-7 py-6
              bg-white/12 backdrop-blur-2xl
              border border-white/20 rounded-2xl 
              shadow-[0_4px_24px_rgba(0,0,0,0.25)]
              flex flex-col items-center gap-3
              transition-transform duration-200 hover:scale-[1.04]
            "
          >
            {item.icon}
            <span className="text-sm">{item.label}</span>
            <p className="text-[22px] font-extrabold tracking-wide">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* 참여 버튼 */}
      <button
        onClick={handleJoin}
        className="
    w-[230px] py-4 rounded-full font-bold
    text-white backdrop-blur-xl
    bg-white/20 border border-white/30
    shadow-[0_4px_20px_rgba(180,140,255,0.25)]

    transition-all duration-200 ease-out
    active:scale-[0.97]

    hover:bg-accent-lemon-soft hover:text-[#363636]
    hover:shadow-[0_10px_32px_rgba(255,241,200,0.45)]
    hover:-translate-y-0.5
  "
      >
        참여하기
      </button>
    </div>
  );
}
