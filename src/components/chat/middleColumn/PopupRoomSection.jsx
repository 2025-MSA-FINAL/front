import { useEffect } from "react";
import PopupRoomItem from "../common/PopupRoomItem";
import { useChatPopupStore } from "../../../store/chat/chatPopupStore";
import LoadingSpinner from "../../common/LoadingSpinner";

export default function PopupRoomSection() {
  const { popups, fetchPopups, loading, selectedPopup } = useChatPopupStore();

  useEffect(() => {
    if (!selectedPopup) fetchPopups();
  }, [selectedPopup]);

  return (
    <section
      className="
        w-full h-full 
        bg-primary-soft2   /* 플랫 연보라 */
        rounded-[24px] 
        p-4 
        flex flex-col
        border border-primary-soft
        shadow-[0_2px_8px_rgba(0,0,0,0.06)]
      "
    >
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col gap-3">
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
      </div>
    </section>
  );
}
