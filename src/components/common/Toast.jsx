// 체크 아이콘 (SVG)
// 프로젝트 포인트 컬러인 accent-lime 사용
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5 text-accent-lime" 
  >
    <path
      fillRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
      clipRule="evenodd"
    />
  </svg>
);

export default function Toast({ message, visible }) {
  if (!visible) return null;

  return (
    <div
      className="
        fixed bottom-10 left-1/2 transform -translate-x-1/2 
        z-50 flex items-center justify-center gap-3
        px-6 py-3.5
        bg-paper-dark/95 text-text-white text-[15px] font-bold tracking-tight
        rounded-full shadow-dropdown backdrop-blur-sm
        animate-fade-up
      "
    >
      <CheckIcon />
      <span>{message}</span>
    </div>
  );
}