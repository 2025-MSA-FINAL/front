import { createPortal } from "react-dom";
import { hideChatRoom } from "../../../../api/chatApi";

export default function ChatRoomContextMenu({ x, y, room, onClose, onHidden }) {
  return createPortal(
    <div
      className="
        fixed z-[9999]
        bg-white rounded-xl shadow-lg
        border border-gray-200
        text-sm font-medium
        w-[180px]
        overflow-hidden
      "
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="
          w-full px-4 py-3 text-left
          hover:bg-gray-100
          transition
        "
        onClick={async () => {
          try {
            await hideChatRoom(room.roomType, room.roomId);
            onHidden();
            onClose();
          } catch (e) {
            alert("채팅방 숨김에 실패했습니다.");
            console.error(e);
          }
        }}
      >
        채팅방 잠시 보관
      </button>
    </div>,
    document.body
  );
}
