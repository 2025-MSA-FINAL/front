import { useEffect, useState } from "react";
import BlurModal from "../common/BlurModal";
import { getMyChatRooms } from "../../api/chatApi";

export default function ChatRoomSelectModal({ isOpen, onClose, onSelectRoom }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  //roomType/roomId 정규화
  const normalizeRoom = (room) => {
    if (!room) return null;

    const rawType = room.roomType ?? room.type;
    let roomType = rawType;

    if (roomType === "GROUP_CHAT" || roomType === "GROUPCHAT") roomType = "GROUP";
    if (roomType === "PRIVATE_CHAT" || roomType === "PRIVATECHAT") roomType = "PRIVATE";

    const roomId = room.roomId ?? room.gcrId ?? room.pcrId ?? room.id;

    return {
      ...room,
      roomType,
      roomId,
      roomName: room.roomName ?? room.name,
    };
  };

  useEffect(() => {
    if (isOpen) {
      loadRooms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await getMyChatRooms();

      //data가 배열이 아닐 가능성까지 방어
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.rooms)
        ? data.rooms
        : Array.isArray(data?.data)
        ? data.data
        : [];

      //roomId/roomType 정규화 + 유효한 방만
      const normalized = list
        .map(normalizeRoom)
        .filter((r) => r && r.roomType && r.roomId);

      setRooms(normalized);
    } catch (err) {
      console.error(err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BlurModal open={isOpen} onClose={onClose}>
      <div className="flex flex-col w-[350px] max-h-[60vh]">
        <h2 className="text-xl font-bold text-gray-800 mb-4 px-2">채팅방 선택</h2>

        <div className="flex-1 overflow-y-auto custom-scroll flex flex-col gap-2 p-1">
          {loading ? (
            <p className="text-center text-gray-400 py-10">목록을 불러오는 중...</p>
          ) : rooms.length === 0 ? (
            <p className="text-center text-gray-400 py-10">참여 중인 채팅방이 없어요.</p>
          ) : (
            rooms.map((room) => (
              <button
                //key를 정규화된 roomType/roomId 기준으로 안전하게
                key={`${room.roomType}-${room.roomId}`}
                //onSelectRoom에 "정규화된 room"을 넘김 (PopupDetailPage에서 바로 사용 가능)
                onClick={() => onSelectRoom(room)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition border border-transparent hover:border-purple-100 text-left group"
              >
                {/* 아이콘 (1:1 또는 그룹) */}
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-white transition">
                  {/* 정규화된 room.roomType 기준 */}
                  <span className="text-lg">
                    {room.roomType === "PRIVATE" ? "👤" : "👨‍👩‍👧‍👦"}
                  </span>
                </div>

                <div className="flex flex-col overflow-hidden">
                  <span className="font-semibold text-gray-800 truncate">
                    {room.roomName || "이름 없는 채팅방"}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {/* 값이 문자열이 아닐 때도 방어 */}
                    {typeof room.latestMessageTime === "string"
                      ? room.latestMessageTime.split("T")[0]
                      : "대화 기록 없음"}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-3 text-gray-500 hover:text-gray-800 transition"
        >
          취소
        </button>
      </div>
    </BlurModal>
  );
}
