import { useEffect } from "react";
import "./AdminToast.css";

export default function AdminToast({ message, onClose, type = "info" }) {
  // 색상 타입 선택
  const COLORS = {
    info:    "bg-[#242424] text-white border-[#C33DFF]/40",
    success: "bg-[#1E2A1F] text-[#8DFF99] border-green-400/30",
    error:   "bg-[#2A1E1E] text-[#FF7A7A] border-red-400/30",
  };

  useEffect(() => {
    const timer = setTimeout(() => onClose(), 2200);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`
        fixed top-6 right-6 z-50
        px-4 py-3 rounded-xl shadow-lg border 
        text-sm font-medium
        admin-toast-animation
        ${COLORS[type] || COLORS.info}
      `}
    >
      {message}
    </div>
  );
}
