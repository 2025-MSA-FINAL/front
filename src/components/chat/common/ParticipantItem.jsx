import Crown from "../icons/CrownIcon";

export default function ParticipantItem({ participant }) {
  const { nickName, photoUrl, isOwner, isMe, online } = participant;

  return (
    <div
      className="
        flex items-center gap-3 px-3 py-2 rounded-xl
        hover:bg-white/10 transition cursor-pointer
      "
    >
      {/* 프로필 */}
      <div className="relative">
        <img
          src={photoUrl || "/default-profile.png"}
          onError={(e) => {
            e.currentTarget.src = "/default-profile.png";
          }}
          className="w-9 h-9 rounded-full object-cover"
        />
        {/* 온라인 점 */}
        <span
          className={`
            absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full
            ${online ? "bg-green-400" : "bg-gray-400"}
            border-2 border-black
          `}
        />
      </div>

      {/* 텍스트 */}
      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-1">
          <span className="text-white text-sm font-semibold">{nickName}</span>
          {/* 👑 방장 */}
          {isOwner && <Crown size={22} />}

          {/* (나) */}
          {isMe && (
            <span
              className="
      px-2.5 py-1
      text-[9px] font-bold
      text-white/80
      bg-white/10
      border border-white/15
      rounded-full
      leading-none
    "
            >
              나
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
