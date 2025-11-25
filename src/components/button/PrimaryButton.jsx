// src/components/ui/PrimaryButton.jsx
import clsx from "clsx";

export default function PrimaryButton({
  children,
  type = "button",
  onClick,
  loading = false,
  fullWidth = false,
  size = "md", // "md" | "lg"
  className,
  disabled,
}) {
  const sizeClasses =
    size === "lg"
      ? "text-[15px] py-[12px] px-[26px]"
      : "text-[14px] py-[10px] px-[18px]";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={clsx(
        "inline-flex items-center justify-center",
        "bg-primary text-text-white rounded-[10px]",
        "hover:bg-primary-dark transition-colors",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        sizeClasses,
        fullWidth && "w-full",
        className
      )}
    >
      {loading ? "처리 중..." : children}
    </button>
  );
}
