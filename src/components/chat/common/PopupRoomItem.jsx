import { useRef, useState, useEffect } from "react";
import StoreIcon from "../icons/StoreIcon.jsx";
import { useChatPopupStore } from "../../../store/chat/chatPopupStore.js";

export default function PopupRoomItem({ name, popup }) {
  const { selectPopup } = useChatPopupStore(); // ⭐ 추가

  const textRef = useRef(null);
  const [isEllipsis, setIsEllipsis] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    setIsEllipsis(el.scrollWidth > el.clientWidth);
  }, [name]);

  return (
    <div
      className="w-full h-[70px] bg-white rounded-[16px]
                 flex items-center gap-2 px-4 shadow-card
                 cursor-pointer hover:shadow-hover transition
                 flex-shrink-0 relative group"
      onClick={() => selectPopup(popup)} // ⭐ 팝업 클릭 → 선택 저장
    >
      <StoreIcon className="w-10 h-10 text-accent-lemon shrink-0" />

      <p
        ref={textRef}
        className="
          text-text-sub text-[16px] font-semibold
          whitespace-nowrap overflow-hidden text-ellipsis
          max-w-full
        "
      >
        {name}
      </p>

      {isEllipsis && (
        <div
          className="
            absolute top-full left-1/2
            -translate-x-1/2
            mt-2

            opacity-0 group-hover:opacity-100
            invisible group-hover:visible
            pointer-events-none
            transition-all duration-200 ease-out

            /* fade-down */
            -translate-y-1 group-hover:translate-y-0

            bg-paper-dark text-text-white text-[14px] font-semibold
            px-3 py-2 rounded-xl
            shadow-dropdown

            w-[calc(100%-2rem)]
            max-w-[380px]  
            whitespace-normal break-words
            z-50
          "
        >
          {name}
        </div>
      )}
    </div>
  );
}
