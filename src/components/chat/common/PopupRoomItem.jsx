import { useRef, useState, useEffect } from "react";
import StoreIcon from "../icons/StoreIcon.jsx";
import { useChatPopupStore } from "../../../store/chat/chatPopupStore.js";

export default function PopupRoomItem({ name, popup }) {
  const { selectPopup } = useChatPopupStore();

  const textRef = useRef(null);
  const [isEllipsis, setIsEllipsis] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    setIsEllipsis(el.scrollWidth > el.clientWidth);
  }, [name]);

  return (
    <div
      className="
    group relative w-full h-19
    rounded-2xl px-4 py-4
    flex items-center gap-3
    cursor-pointer flex-shrink-0
    transition-all duration-200 ease-out

    /* Glass 스타일 (stacking context 제거됨) */
    bg-white/95       /* opacity 제거 */
    border border-primary-soft2/80
    shadow-[0_4px_12px_rgba(180,140,255,0.18)]
    hover:shadow-[0_10px_24px_rgba(180,140,255,0.26)]
  "
      onClick={() => selectPopup(popup)}
    >
      {/* hover glass highlight */}
      <div
        className="
      absolute inset-0 rounded-2xl opacity-0
      group-hover:opacity-100
      bg-white/40
      border border-white/30
      transition-all duration-200
    "
      />

      <StoreIcon
        className="
      w-10 h-10 shrink-0 relative z-10
      text-primary
    "
      />

      <p
        ref={textRef}
        className="
      text-text-black text-[16px] font-semibold
      whitespace-nowrap overflow-hidden text-ellipsis
      max-w-full relative z-10
    "
      >
        {name}
      </p>

      {isEllipsis && (
        <div
          className="
        absolute top-full left-1/2 -translate-x-1/2
        mt-2 z-[9999]    /* 이제 정상 동작 */

        opacity-0 group-hover:opacity-100
        invisible group-hover:visible
        pointer-events-none
        transition-all duration-200 ease-out
        -translate-y-1 group-hover:translate-y-0

        bg-paper-dark text-text-white
        text-[14px] font-semibold px-3 py-2
        rounded-xl shadow-dropdown
        w-[calc(100%-2rem)] max-w-[380px]
        whitespace-normal break-words
      "
        >
          {name}
        </div>
      )}
    </div>
  );
}
