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

  /* 외부 클릭 감지 */
  useEffect(() => {
    if (!open) return;

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
  }, [open, anchorRef, onClose]);

  if (!room || !open) return null;

  return (
    <div
      ref={popRef}
      className="
        absolute left-20 top-17 z-[200]
        w-[340px] rounded-3xl px-7 py-7
        bg-white shadow-lg backdrop-blur-xl border border-gray-200
        flex flex-col items-center gap-2.5
        animate-kakao-pop
      "
    >
      {/* 신고 버튼 */}
      <button
        className="
          absolute left-5 top-4 
          w-8 h-8 rounded-full 
          flex justify-center items-center 
          text-accent-pink hover:bg-gray-100/70 transition
        "
      >
        <ReportIcon className="w-5 h-5" />
      </button>

      {/* 팝업 이름 (있을 때만) */}
      {room.popName && (
        <p className="text-xs font-bold text-primary text-center mt-3 mb-1">
          {room.popName}
        </p>
      )}

      {/* 아이콘 */}
      <img src={groupChatIcon} className="w-20 h-20 object-contain mt-1" />

      {/* 제목 */}
      <h2 className="text-xl font-extrabold text-text-black text-center">
        {room.title}
      </h2>

      {/* 인원 */}
      <p className="text-sm text-text-sub text-center mt-[-6px]">
        {room.currentUserCnt}/{room.maxUserCnt}
      </p>

      {/* 설명 영역 */}
      <div
        className="
          w-full max-h-[150px] overflow-y-auto custom-scroll
          bg-purple-50/40 border border-purple-200/50
          rounded-2xl px-4 py-4 text-[14px] leading-relaxed
          text-gray-700
        "
      >
        {room.description}
      </div>

      {/* 하단 버튼 */}
      <div className="w-full flex justify-end mt-3">
        {room.ownerId === currentUserId ? (
          <button
            onClick={async () => {
              await deleteGroupChatRoom(room.gcrId);
              removeRoom("GROUP", room.gcrId);
              setActiveRoom(null);
              if (selectedPopup) await fetchPopupRooms(selectedPopup.popId);
            }}
            className="text-[13px] text-text-sub hover:text-accent-pink transition"
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
            className="text-[13px] text-text-sub hover:text-accent-pink transition"
          >
            채팅방 나가기
          </button>
        )}
      </div>
    </div>
  );
}
