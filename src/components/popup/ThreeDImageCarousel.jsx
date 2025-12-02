import { useState, useEffect } from "react";
import ImageDetailModal from "./ImageDetailModal"; 

export default function ThreeDImageCarousel({ images, autoplay = true, interval = 3000 }) {
  const [active, setActive] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!autoplay || images.length <= 1 || isModalOpen) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoplay, interval, images.length, isModalOpen]);

  const handlePrev = () => setActive((prev) => (prev - 1 + images.length) % images.length);
  const handleNext = () => setActive((prev) => (prev + 1) % images.length);

  const getStyles = (index) => {
    if (images.length === 0) return {};
    const offset = (index - active + images.length) % images.length;
    
    // 중앙
    if (offset === 0) {
      return {
        opacity: 1,
        transform: "translateX(0px) scale(1) translateZ(0px)",
        zIndex: 10,
        filter: "brightness(1)",
        pointerEvents: "auto",
      };
    } 
    // 오른쪽
    if (offset === 1) {
      return {
        opacity: 0.7,
        transform: "translateX(160px) scale(0.8) translateZ(-100px)",
        zIndex: 5,
        filter: "brightness(0.6)",
        pointerEvents: "none",
      };
    }
    // 왼쪽
    if (offset === images.length - 1) {
      return {
        opacity: 0.7,
        transform: "translateX(-160px) scale(0.8) translateZ(-100px)",
        zIndex: 5,
        filter: "brightness(0.6)",
        pointerEvents: "none",
      };
    }
    // 그 외
    return {
      opacity: 0,
      transform: "translateX(0px) scale(0.5) translateZ(-200px)",
      zIndex: 1,
      pointerEvents: "none",
    };
  };

  const handleImageClick = (index) => {
    if (active === index) setIsModalOpen(true);
    else setActive(index);
  };

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="relative w-full max-w-[800px] mx-auto h-[450px] flex items-center justify-center perspective-1000 overflow-hidden">
        
        {images.map((img, i) => (
          <div
            key={i}
            className="
              absolute w-[300px] md:w-[350px] aspect-[3/4] 
              rounded-[24px] overflow-hidden shadow-2xl
              transition-all duration-500 ease-in-out cursor-pointer
              border-4 border-paper  
            "
            style={getStyles(i)}
            onClick={() => handleImageClick(i)}
          >
            <img src={img} alt={`slide-${i}`} className="w-full h-full object-cover" />
            
            {active === i && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
              </div>
            )}
          </div>
        ))}

        {/* 네비게이션 버튼 */}
        <div className="absolute inset-0 flex items-center justify-between px-4 md:px-10 pointer-events-none">
          <button
            onClick={handlePrev}
            className="
              w-12 h-12 flex items-center justify-center 
              rounded-full bg-paper/80 backdrop-blur-sm shadow-md  
              text-text-black hover:bg-paper pointer-events-auto transition
              z-20
            "
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <button
            onClick={handleNext}
            className="
              w-12 h-12 flex items-center justify-center 
              rounded-full bg-paper/80 backdrop-blur-sm shadow-md 
              text-text-black hover:bg-paper pointer-events-auto transition
              z-20
            "
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>
        </div>
        
        {/* 인디케이터 (점) */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${active === i 
                  ? "w-6 bg-primary" 
                  : "bg-secondary hover:bg-secondary-dark"} 
              `}
            />
          ))}
        </div>
      </div>

      {isModalOpen && (
        <ImageDetailModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          images={images}
          startIndex={active}
        />
      )}
    </>
  );
}