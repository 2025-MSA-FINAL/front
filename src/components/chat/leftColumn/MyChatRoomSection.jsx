import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../../store/chat/chatStore";
import { getGroupChatRoomDetail } from "../../../api/chatApi";
import groupChat from "../../../assets/groupChat.png";
import privateChat from "../../../assets/privateChat.png";
import ExpandDownDouble from "../icons/ExpandDownDouble";
import ChatRoomItem from "../common/ChatRoomItem";

export default function MyChatRoomSection() {
  const scrollRef = useRef(null);
  const [needsScroll, setNeedsScroll] = useState(false);

  const { rooms, fetchRooms, selectRoom } = useChatStore();

  useEffect(() => {
    fetchRooms();
  }, []);

  // 스크롤 체크
  const checkScrollNeeded = () => {
    const el = scrollRef.current;
    if (!el) return;
    setNeedsScroll(el.scrollHeight > el.clientHeight);
  };

  useEffect(() => {
    checkScrollNeeded();
    window.addEventListener("resize", checkScrollNeeded);
    return () => window.removeEventListener("resize", checkScrollNeeded);
  }, [rooms]);

  // ⭐ 방 클릭: 상세조회 후 selectRoom
  const handleRoomClick = async (room) => {
    try {
      const detail =
        room.roomType === "GROUP"
          ? await getGroupChatRoomDetail(room.roomId)
          : room; // 1:1 채팅은 추후 detail API 따로 만들면 교체

      selectRoom(detail); // 🔥 상세정보를 messageChatSection으로 전달
    } catch (e) {
      console.error("채팅방 상세 데이터 불러오기 실패:", e);
    }
  };

  return (
    <section className="w-full flex-1 min-h-0 rounded-[40px] flex flex-col items-center">
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 w-full overflow-y-auto scrollbar-hide flex flex-col items-center gap-3 p-4"
      >
        {rooms.map((room) => (
          <div
            key={`${room.roomId}-${room.roomType}`}
            onClick={() => handleRoomClick(room)}
          >
            <ChatRoomItem
              name={room.roomName}
              img={room.roomType === "GROUP" ? groupChat : privateChat}
              type={room.roomType}
            />
          </div>
        ))}

        {!needsScroll && (
          <div className="w-[100px] h-[40px] flex items-center justify-center pointer-events-none mt-2">
            <ExpandDownDouble
              size={28}
              className="text-secondary-dark animate-float-down"
            />
          </div>
        )}
      </div>

      {needsScroll && (
        <div className="w-[100px] h-[40px] flex items-center justify-center mt-2 pointer-events-none shrink-0">
          <ExpandDownDouble
            size={28}
            className="text-secondary-light animate-float-down"
          />
        </div>
      )}
    </section>
  );
}
