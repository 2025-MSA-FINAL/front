import LockOpenIcon from "../icons/LockOpenIcon";
import LockClosedIcon from "../icons/LockClosedIcon";
import UserIcon from "../icons/UserIcon";
import HeartIcon from "../icons/HeartIcon";
import { useChatPopupStore } from "../../../store/chat/chatPopupStore";

export default function GroupRoomDetailSection({ room }) {
  const { joinRoom } = useChatPopupStore();

  if (!room) return null;

  const handleJoin = async () => {
    try {
      await joinRoom(room.gcrId); // 참여 처리 + activeChatRoom으로 자동 이동
    } catch (e) {
      alert(e.response?.data?.message || "참여 실패");
    }
  };

  return (
    <div className="w-full h-full p-10 flex flex-col justify-center items-center overflow-y-auto">
      {/* ------------------------------ */}
      {/* 타이틀 */}
      {/* ------------------------------ */}
      <h1 className="text-[24px] font-bold text-text-black mb-3">
        {room.title}
      </h1>

      <p className="text-text-sub text-center text-[15px] leading-relaxed max-w-[600px] mb-10">
        {room.description}
      </p>

      {/* ------------------------------ */}
      {/* 정보 카드 */}
      {/* ------------------------------ */}
      <div
        className="
    w-full max-w-[680px]
    bg-white rounded-2xl shadow-card p-8
    grid grid-cols-2 gap-6
  "
      >
        {/* -------- 인원 수 -------- */}
        <div className="col-span-2 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <UserIcon className="w-5 h-5 text-primary-dark" />
            <span className="text-[15px] text-text-black font-semibold">
              인원
            </span>
          </div>

          <p className="text-[18px] font-bold text-primary-dark">
            {room.currentUserCnt} / {room.maxUserCnt}
          </p>
        </div>

        {/* 위쪽 전체 선 */}
        <div className="col-span-2 border-t border-gray-200"></div>

        {/* -------- 연령 제한 -------- */}
        <div className="flex flex-col items-center pr-6 border-r border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <HeartIcon className="w-5 h-5 text-secondary-dark" />
            <span className="text-[15px] text-text-black font-semibold">
              연령 조건
            </span>
          </div>

          <p className="text-[18px] font-bold text-secondary-dark">
            {room.minAge} ~ {room.maxAge}세
          </p>
        </div>

        {/* -------- 성별 제한 -------- */}
        <div className="flex flex-col items-center pl-6">
          <div className="flex items-center gap-2 mb-2">
            {room.limitGender === "NONE" || room.limitGender === null ? (
              <LockOpenIcon className="w-5 h-5 text-green-500" />
            ) : (
              <LockClosedIcon className="w-5 h-5 text-red-500" />
            )}

            <span className="text-[15px] text-text-black font-semibold">
              성별 조건
            </span>
          </div>

          <p className="text-[18px] font-bold text-gray-700">
            {room.limitGender === "MALE" && "남성만"}
            {room.limitGender === "FEMALE" && "여성만"}
            {(room.limitGender === "NONE" || !room.limitGender) &&
              "성별 제한 없음"}
          </p>
        </div>
      </div>

      {/* ------------------------------ */}
      {/* 입장 버튼 (실제 참여 X, 화면 전환용) */}
      {/* ------------------------------ */}
      <button
        onClick={handleJoin}
        className="
    mt-12 w-[180px] py-3 rounded-full font-bold
    text-text-sub border-2 border-primary-light
    hover:brightness-110 hover:bg-primary-light/50 hover:text-text-black 
    transition-all shadow-brand active:scale-[0.97]
  "
      >
        참여하기
      </button>
    </div>
  );
}
