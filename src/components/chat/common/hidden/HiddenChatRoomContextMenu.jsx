import { createPortal } from "react-dom";
import { unhideChatRoom } from "../../../../api/chatApi";

export default function HiddenChatRoomContextMenu({
  x,
  y,
  room,
  onClose,
  onUnhidden,
}) {
  return createPortal(
    <div
      className="fixed z-[9999] bg-white rounded-xl shadow-lg
                 border border-gray-200 text-sm w-[160px]"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="w-full px-4 py-3 text-left hover:bg-gray-100 transition"
        onClick={async () => {
          try {
            await unhideChatRoom(room.crhType, room.crhRoomId);
            onUnhidden();
            onClose();
          } catch (e) {
            alert("숨김 해제 실패");
            console.error(e);
          }
        }}
      >
        숨김 해제
      </button>
    </div>,
    document.body
  );
}
