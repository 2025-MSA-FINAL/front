// src/components/chat/leftColumn/MyChatRoomSection.jsx
import { useEffect, useRef, useState } from "react";
import groupChat from "../../../assets/groupChat.png";
import privateChat from "../../../assets/privateChat.png";
import ExpandDownDouble from "../icons/ExpandDownDouble";
import ChatRoomItem from "../common/ChatRoomItem";

export default function MyChatRoomSection() {
  const mockRooms = [
    { id: 1, name: "동숙이", img: privateChat, type: "private" },
    { id: 2, name: "동숙이", img: privateChat, type: "private" },
    { id: 3, name: "짱구는 못말•••", img: groupChat, type: "group" },
    { id: 4, name: "동숙이", img: privateChat, type: "private" },
    { id: 5, name: "동숙이", img: privateChat, type: "private" },
    { id: 6, name: "동숙이", img: privateChat, type: "private" },
    { id: 7, name: "동숙이", img: privateChat, type: "private" },
    { id: 8, name: "동숙이", img: privateChat, type: "private" },
    { id: 9, name: "짱구는 못말•••", img: groupChat, type: "group" },
  ];

  const scrollRef = useRef(null);
  const [needsScroll, setNeedsScroll] = useState(false);

  const checkScrollNeeded = () => {
    const el = scrollRef.current;
    if (!el) return;
    setNeedsScroll(el.scrollHeight > el.clientHeight);
  };

  useEffect(() => {
    checkScrollNeeded();
    window.addEventListener("resize", checkScrollNeeded);

    return () => window.removeEventListener("resize", checkScrollNeeded);
  }, [mockRooms.length]);

  return (
    <section className="w-full flex-1 min-h-0 rounded-[40px] flex flex-col items-center">
      {/* 🔽 스크롤 영역 */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 w-full overflow-y-auto scrollbar-hide
                   flex flex-col items-center gap-3 p-4"
      >
        {mockRooms.map((room) => (
          <ChatRoomItem
            key={room.id}
            name={room.name}
            img={room.img}
            type={room.type} // ⭐ props 전달
          />
        ))}

        {/* 스크롤이 필요 없는 경우 안쪽에 표시 */}
        {!needsScroll && (
          <div className="w-[100px] h-[40px] flex items-center justify-center pointer-events-none mt-2">
            <ExpandDownDouble
              size={28}
              className="text-secondary-dark animate-float-down"
            />
          </div>
        )}
      </div>

      {/* 스크롤 필요하면 아래 고정 */}
      {needsScroll && (
        <div className="w-[100px] h-[40px] flex items-center justify-center mt-2 pointer-events-none shrink-0">
          <ExpandDownDouble
            size={28}
            className="text-secondary-dark animate-float-down"
          />
        </div>
      )}
    </section>
  );
}
