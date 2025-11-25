// src/components/ui/OutlineButton.jsx
import clsx from "clsx";

export default function OutlineButton({
  children,
  type = "button",
  onClick,
  fullWidth = false,
  className,
  disabled,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "inline-flex items-center justify-center",
        "rounded-[10px] border border-secondary bg-paper",
        "text-text-sub text-[14px] px-[14px] py-[10px]",
        "hover:bg-secondary-light transition-colors",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        fullWidth && "w-full",
        className
      )}
    >
      {children}
    </button>
  );
}
