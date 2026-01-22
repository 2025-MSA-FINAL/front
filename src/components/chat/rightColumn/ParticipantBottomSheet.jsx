import { useRef, useState, useEffect } from "react";
import ParticipantItem from "../common/ParticipantItem";

export function ParticipantBottomSheet({ participants, onClose }) {
  const sheetRef = useRef(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);

  const [dragging, setDragging] = useState(false);
  const [translateY, setTranslateY] = useState(0);

  const CLOSE_THRESHOLD = 120; // px

  /* ------------------------------
     ESC 키 대응 (태블릿 포함)
  ------------------------------ */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* ------------------------------
     Touch Start
  ------------------------------ */
  const handleTouchStart = (e) => {
    setDragging(true);
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = translateY;
  };

  /* ------------------------------
     Touch Move
  ------------------------------ */
  const handleTouchMove = (e) => {
    if (!dragging) return;

    const delta =
      e.touches[0].clientY - startYRef.current + currentYRef.current;

    // 위로는 못 올리게
    if (delta < 0) return;

    setTranslateY(delta);
  };

  /* ------------------------------
     Touch End
  ------------------------------ */
  const handleTouchEnd = () => {
    setDragging(false);

    if (translateY > CLOSE_THRESHOLD) {
      onClose();
    } else {
      // 원래 위치로 스냅
      setTranslateY(0);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-end">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* sheet */}
      <div
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`
          relative w-full h-[70%]
          bg-white/90 backdrop-blur-xl
          rounded-t-3xl
          flex flex-col
          ${dragging ? "" : "transition-transform duration-300 ease-out"}
        `}
        style={{
          transform: `translateY(${translateY}px)`,
        }}
      >
        {/* drag bar */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-3" />

        {/* header */}
        <div className="flex items-center justify-between px-4 pb-2">
          <h3 className="font-semibold text-sm">참여자 목록</h3>
          <button onClick={onClose}>✕</button>
        </div>

        {/* list */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {participants.map((p) => (
            <ParticipantItem key={p.userId} participant={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
