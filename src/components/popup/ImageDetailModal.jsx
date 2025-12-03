import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ImageDetailModal({ onClose, images, startIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);

  // 1. 마운트 시 스크롤 막기
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  // 2. 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center animate-fade-in backdrop-blur-sm">
      
      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-text-white/70 hover:text-text-white transition p-2 z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      {/* 메인 이미지 영역 */}
      <div className="flex-1 w-full flex items-center justify-between px-4 md:px-10 h-[calc(100vh-140px)]">
        
        {/* 왼쪽 화살표 */}
        <button
          onClick={prevImage}
          className="p-3 rounded-full bg-paper-dark/50 text-text-white hover:bg-paper-dark/80 transition backdrop-blur-md z-40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>

        {/* 큰 이미지 */}
        <img
          src={images[currentIndex]}
          alt={`Detail ${currentIndex}`}
          className="max-h-full max-w-[80vw] object-contain shadow-2xl rounded-lg select-none"
        />

        {/* 오른쪽 화살표 */}
        <button
          onClick={nextImage}
          className="p-3 rounded-full bg-paper-dark/50 text-text-white hover:bg-paper-dark/80 transition backdrop-blur-md z-40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      {/* 하단 썸네일 스트립 */}
      <div className="h-[120px] w-full flex items-center justify-center gap-3 px-4 pb-6 overflow-x-auto scrollbar-hide">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`
              relative w-[70px] h-[70px] flex-shrink-0 rounded-md overflow-hidden transition-all duration-300
              ${idx === currentIndex 
                ? "ring-2 ring-primary scale-110 opacity-100" 
                : "opacity-40 hover:opacity-80 hover:scale-105"}
            `}
          >
            <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}