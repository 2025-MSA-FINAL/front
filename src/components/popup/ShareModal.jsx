import { createPortal } from "react-dom";

// 아이콘 (SVG)
const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>
);

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
  </svg>
);

const KakaoIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 fill-current">
    <path d="M16 4C8.82 4 3 8.98 3 15.13c0 3.89 2.33 7.26 5.85 9.16-.27 1.03-1.07 3.73-1.22 4.27-.19.67.25.66.52.48.21-.14 3.4-2.26 4.75-3.17.69.1 1.39.15 2.1.15 7.18 0 13-4.98 13-11.13S22.18 4 16 4z" />
  </svg>
);

export default function ShareModal({ isOpen, onClose, onCopyLink, onKakaoShare, onChatShare }) {
  const handleContainerClick = (e) => e.stopPropagation();

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center animate-fade-in backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-[320px] bg-white rounded-[24px] p-6 shadow-dropdown flex flex-col items-center gap-6 animate-fade-up"
        onClick={handleContainerClick}
      >
        {/* 헤더 */}
        <div className="relative w-full text-center">
          <h3 className="text-[18px] font-bold text-text-black">공유하기</h3>
          <button 
            onClick={onClose}
            className="absolute right-0 top-0 text-text-sub hover:text-text-black p-1"
          >
            ✕
          </button>
        </div>

        {/* 공유 버튼 그리드 */}
        <div className="flex gap-6 justify-center w-full">
          
          {/* 1. 링크 복사 */}
          <ShareButton 
            icon={<LinkIcon />} 
            label="링크 복사" 
            onClick={onCopyLink} 
            colorClass="bg-gray-100 text-gray-700 hover:bg-gray-200"
          />

          {/* 2. 채팅 공유 */}
          <ShareButton 
            icon={<ChatIcon />} 
            label="채팅 공유" 
            onClick={onChatShare} 
            colorClass="bg-primary-light text-primary hover:bg-primary/20"
          />

          {/* 3. 카카오톡 */}
          <ShareButton 
            icon={<KakaoIcon />} 
            label="카카오톡" 
            onClick={onKakaoShare} 
            colorClass="bg-[#FEE500] text-[#3c1e1e] hover:bg-[#ebd400]"
          />

        </div>
      </div>
    </div>,
    document.body
  );
}

// 버튼 서브 컴포넌트
function ShareButton({ icon, label, onClick, colorClass }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-2 group"
    >
      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${colorClass}`}>
        {icon}
      </div>
      <span className="text-[12px] font-medium text-text-sub group-hover:text-text-black">{label}</span>
    </button>
  );
}