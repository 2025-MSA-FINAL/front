import { useEffect } from "react";
import PopupRoomItem from "../common/PopupRoomItem";
import { useChatPopupStore } from "../../../store/chat/chatPopupStore";
import LoadingSpinner from "../../common/LoadingSpinner";

export default function PopupRoomSection() {
  const { popups, fetchPopups, loading, selectedPopup } = useChatPopupStore();

  useEffect(() => {
    if (!selectedPopup) {
      fetchPopups();
    }
  }, [selectedPopup]);

  return (
    <section
      className="
        w-full h-full 
       bg-primary-soft2/80
        rounded-[30px] 
        p-4 
        flex flex-col
        shadow-card
      "
    >
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col gap-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          popups.map((popup) => (
            <PopupRoomItem
              key={popup.popId}
              name={popup.popName}
              popup={popup}
            />
          ))
        )}

        {!loading &&
          popups.map((popup) => (
            <PopupRoomItem
              key={popup.popId}
              name={popup.popName}
              popup={popup}
            />
          ))}
      </div>
    </section>
  );
}
