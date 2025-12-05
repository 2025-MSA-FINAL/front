import { useEffect } from "react";
import PopupRoomItem from "../common/PopupRoomItem";
import { useChatPopupStore } from "../../../store/chat/chatPopupStore";

export default function PopupRoomSection() {
  const { popups, fetchPopups, loading } = useChatPopupStore();

  useEffect(() => {
    fetchPopups();
  }, []);

  return (
    <section
      className="
        w-full h-full 
       bg-primary-soft2/80
        rounded-[30px] 
        p-4 
        flex flex-col
      "
    >
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col gap-4">
        {loading && (
          <div className="text-center text-gray-500">불러오는 중...</div>
        )}

        {!loading &&
          popups.map((popup) => (
            <PopupRoomItem
              key={popup.popId}
              name={popup.popName}
              popup={popup} // ⭐ popup 객체 자체 전달
            />
          ))}
      </div>
    </section>
  );
}
