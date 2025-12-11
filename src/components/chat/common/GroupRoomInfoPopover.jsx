import { useEffect, useRef } from "react";
import groupChatIcon from "../../../assets/groupChat.png";
import ReportIcon from "../icons/ReportIcon";
import { deleteGroupChatRoom, leaveGroupChatRoom } from "../../../api/chatApi";
import { useChatStore } from "../../../store/chat/chatStore";
import { useChatPopupStore } from "../../../store/chat/chatPopupStore";

export default function GroupRoomInfoPopover({
  room,
  currentUserId,
  anchorRef,
  open,
  onClose,
}) {
  const popRef = useRef(null);

  const removeRoom = useChatStore((s) => s.removeRoom);
  const setActiveRoom = useChatStore((s) => s.setActiveChatRoom);
  const { fetchPopupRooms, selectedPopup } = useChatPopupStore();

  useEffect(() => {
    const handler = (e) => {
      if (
        popRef.current &&
        !popRef.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorRef]);

  if (!room || !open) return null;

  return (
    <div
      ref={popRef}
      className="
        absolute left-20 top-17
        w-[350px] rounded-3xl px-7 py-7 z-[200]
        bg-paper-light/90 shadow-[0_4px_20px_rgba(0,0,0,0.15)]
        border border-gray-200 
        flex flex-col items-center
      "
    >
      {/* 신고 버튼 */}
      <button className="absolute left-5 top-4 rounded-full w-8 h-8 flex justify-center items-center text-accent-pink hover:bg-white/50 transition">
        <ReportIcon className="w-5 h-5" />
      </button>

      {/* 아이콘 */}
      <img src={groupChatIcon} className="w-16 h-13 mt-5 mb-2" />

      {/* 제목 */}
      <h2 className="text-[20px] font-extrabold text-gray-900 text-center">
        {room.title}
      </h2>

      {/* 인원 */}
      <p className="text-xs text-text-sub text-center mb-3">
        {room.currentUserCnt}/{room.maxUserCnt}
      </p>

      {/* 설명 박스 */}
      <div
        className="
          w-full rounded-xl border border-purple-200 
          bg-purple-50/30 px-4 py-4 text-[14px]
          text-gray-800 leading-relaxed max-h-[150px] overflow-y-auto custom-scroll
          mt-2
        "
      >
        {room.description}
      </div>

      {/* 하단 버튼 */}
      <div className="w-full flex justify-end mt-4 mr-5">
        {room.ownerId === currentUserId ? (
          <button
            onClick={async () => {
              await deleteGroupChatRoom(room.gcrId);
              removeRoom("GROUP", room.gcrId);
              setActiveRoom(null);
              if (selectedPopup) await fetchPopupRooms(selectedPopup.popId);
            }}
            className="text-[13px] text-text-sub hover:text-accent-pink font-medium transition"
          >
            채팅방 삭제하기
          </button>
        ) : (
          <button
            onClick={async () => {
              await leaveGroupChatRoom(room.gcrId);
              removeRoom("GROUP", room.gcrId);
              setActiveRoom(null);
            }}
            className="text-[13px] text-text-sub hover:text-accent-pink font-medium transition"
          >
            채팅방 나가기
          </button>
        )}
      </div>
    </div>
  );
}
