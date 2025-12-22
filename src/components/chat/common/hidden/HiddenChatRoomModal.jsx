import { useState, useRef, useEffect } from "react";
import BlurModal from "../../../common/BlurModal";
import privateChat from "../../../../assets/privateChat.png";
import groupChat from "../../../../assets/groupChat.png";
import HiddenChatRoomContextMenu from "./HiddenChatRoomContextMenu";
import { unhideChatRoom } from "../../../../api/chatApi";

export default function HiddenChatRoomModal({
  open,
  onClose,
  rooms,
  onRefresh,
}) {
  const [menu, setMenu] = useState(null);
  const [swipedRoomId, setSwipedRoomId] = useState(null);
  const touchStartXRef = useRef(0);

  // 다른 곳 터치 시 스와이프 닫기
  useEffect(() => {
    const closeSwipe = () => setSwipedRoomId(null);
    window.addEventListener("touchstart", closeSwipe);
    return () => window.removeEventListener("touchstart", closeSwipe);
  }, []);

  if (!open) return null;

  return (
    <BlurModal
      open={open}
      onClose={() => {
        setMenu(null);
        setSwipedRoomId(null);
        onClose();
      }}
      width="420px"
    >
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">숨김 채팅방</h2>

        {rooms.length === 0 && (
          <p className="text-sm text-gray-500">
            숨김 처리된 채팅방이 없습니다.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {rooms.map((room) => {
            const roomKey = `${room.crhType}-${room.crhRoomId}`;
            const isSwiped = swipedRoomId === roomKey;

            return (
              <div
                key={roomKey}
                className="relative overflow-hidden rounded-xl border"
                onContextMenu={(e) => {
                  e.preventDefault();
                  setMenu({
                    x: e.clientX,
                    y: e.clientY,
                    room,
                  });
                }}
                onTouchStart={(e) => {
                  touchStartXRef.current = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  const diff =
                    touchStartXRef.current - e.changedTouches[0].clientX;

                  if (diff > 60) {
                    setSwipedRoomId(roomKey);
                  } else {
                    setSwipedRoomId(null);
                  }
                }}
              >
                {/* 🔴 숨김 해제 버튼 (뒤 레이어) */}
                <div
                  className="
                    absolute inset-y-0 right-0
                    w-24
                    flex items-center justify-center
                    bg-primary text-white
                    text-sm font-semibold
                  "
                  onClick={async () => {
                    await unhideChatRoom(room.crhType, room.crhRoomId);
                    await onRefresh();
                    setSwipedRoomId(null);
                  }}
                >
                  숨김 해제
                </div>

                {/* 🟢 실제 채팅방 카드 (앞 레이어) */}
                <div
                  className={`
                    flex items-center gap-4
                    px-4 py-3
                    bg-white
                    transition-transform duration-200
                    ${isSwiped ? "-translate-x-24" : "translate-x-0"}
                  `}
                >
                  {/* 아이콘 */}
                  <div className="flex items-center justify-center w-12 h-12 shrink-0">
                    <img
                      src={room.crhType === "GROUP" ? groupChat : privateChat}
                      className={
                        room.crhType === "GROUP" ? "w-11 h-9" : "w-10 h-10"
                      }
                      alt="chat icon"
                    />
                  </div>

                  {/* 텍스트 */}
                  <div className="flex flex-col justify-center min-w-0 flex-1">
                    <span className="font-medium text-sm text-gray-900 truncate">
                      {room.nickName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {room.crhType === "GROUP" ? "그룹 채팅" : "1:1 채팅"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="mt-4 py-3 rounded-full bg-primary text-white font-semibold"
        >
          닫기
        </button>
      </div>

      {/* 🖱 데스크탑 우클릭 메뉴 */}
      {menu && (
        <HiddenChatRoomContextMenu
          x={menu.x}
          y={menu.y}
          room={menu.room}
          onClose={() => setMenu(null)}
          onUnhidden={async () => {
            await onRefresh();
            setMenu(null);
          }}
        />
      )}
    </BlurModal>
  );
}
