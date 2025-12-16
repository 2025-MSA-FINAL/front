// src/components/common/Toast.jsx

// ✅ 성공 아이콘 (초록 체크)
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
      clipRule="evenodd"
    />
  </svg>
);

// ✅ 실패 아이콘 (빨간 X)
const ErrorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 
         9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-3.53 
         6.72a.75.75 0 0 1 1.06 0L12 10.44l2.47-2.47a.75.75 0 1 1 
         1.06 1.06L13.06 11.5l2.47 2.47a.75.75 0 0 1-1.06 1.06L12 
         12.56l-2.47 2.47a.75.75 0 0 1-1.06-1.06l2.47-2.47-2.47-2.47a.75.75 
         0 0 1 0-1.06Z"
      clipRule="evenodd"
    />
  </svg>
);


export default function Toast({
  message,
  visible,
  variant = "success",
  actionLabel,
  onAction,
}) {
  if (!visible) return null;

  const isError = variant === "error";
  const hasAction = !!actionLabel && typeof onAction === "function";

  return (
    <div
      className={`
        fixed bottom-10 left-1/2 transform -translate-x-1/2 
        z-50 flex items-center justify-center gap-3
        px-6 py-3.5
        rounded-full shadow-dropdown backdrop-blur-sm
        text-[15px] font-bold tracking-tight
        animate-fade-up
        ${isError ? "bg-red-600 text-white" : "bg-paper-dark/95 text-text-white"}
      `}
    >
      <span className={isError ? "text-white" : "text-accent-lime"}>
        {isError ? <ErrorIcon /> : <CheckIcon />}
      </span>

      <span>{message}</span>

      {/* 액션 버튼 */}
      {hasAction && (
        <button
          type="button"
          onClick={onAction}
          className={`
            ml-1 px-3 py-1 rounded-full text-[13px] font-semibold
            ${isError ? "bg-white/15 hover:bg-white/25 text-white" : "bg-white/10 hover:bg-white/20 text-text-white"}
            transition
          `}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
