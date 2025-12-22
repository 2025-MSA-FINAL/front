import { createPortal } from "react-dom";

export default function BlurModal({
  open,
  onClose,
  children,
  width = "480px",
  showCloseButton = true,
}) {
  if (!open) return null;

  return createPortal(
    <div
      className="
        fixed inset-0 z-[9999]
        bg-black/20 backdrop-blur-md
        flex items-center justify-center
      "
      onClick={onClose}
    >
      <div
        className="
          bg-white rounded-2xl shadow-xl
          p-8 relative animate-pop-in
        "
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ✅ 조건부 렌더링 */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-gray-500 hover:text-black text-xl"
          >
            ✕
          </button>
        )}

        {children}
      </div>
    </div>,
    document.body // ★ Portal: 항상 페이지 최상단에 렌더링됨
  );
}
