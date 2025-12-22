import { useState } from "react";
import BlurModal from "../../../common/BlurModal";
import privateChat from "../../../../assets/privateChat.png";
import groupChat from "../../../../assets/groupChat.png";
import HiddenChatRoomContextMenu from "./HiddenChatRoomContextMenu";

export default function HiddenChatRoomModal({
  open,
  onClose,
  rooms,
  onRefresh,
}) {
  const [menu, setMenu] = useState(null);
  if (!open) return null;
  return (
    <BlurModal
      open={open}
      onClose={() => {
        setMenu(null);
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
          {rooms.map((room) => (
            <div
              key={`${room.crhType}-${room.crhRoomId}`}
              onContextMenu={(e) => {
                e.preventDefault();
                setMenu({
                  x: e.clientX,
                  y: e.clientY,
                  room,
                });
              }}
              className="
                flex items-center
                gap-4
                px-4 py-3
                rounded-xl border
                hover:bg-gray-50
                cursor-pointer
              "
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
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 py-3 rounded-full bg-primary text-white font-semibold"
        >
          닫기
        </button>
      </div>
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
