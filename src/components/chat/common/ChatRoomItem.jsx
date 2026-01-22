export default function ChatRoomItem({ name, img, type, otherUserId }) {
  const sizeClass =
    type === "GROUP"
      ? "w-[46px] h-[38px] xl:w-[55px] xl:h-[45px]"
      : otherUserId === 20251212
      ? "w-[34px] h-[40px]"
      : "w-[40px] h-[40px]";

  return (
    <div
      className="
        relative
        w-[84px] h-[84px]
        xl:w-[100px] xl:h-[100px]
        rounded-3xl
        flex flex-col items-center justify-center
        cursor-pointer shrink-0
        transition-all duration-200 ease-out

        bg-white/90
        backdrop-blur-xl
        border border-white/60
        shadow-[0_4px_14px_rgba(0,0,0,0.12)]
        hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)]
        hover:-translate-y-0.5
        active:scale-[0.97]
      "
    >
      {/* 은은한 글로우 */}
      <div
        className="
          absolute inset-0 rounded-3xl -z-10
          bg-[radial-gradient(
            circle_at_50%_0%,
            rgba(255,255,255,0.9),
            rgba(255,255,255,0.25),
            rgba(255,255,255,0)
          )]
          blur-xl
        "
      />

      {/* 아이콘 */}
      <img
        src={img}
        className={`
          ${sizeClass} mb-2
          drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]
          transition-transform duration-200
          hover:scale-[1.06]
        `}
      />

      {/* 이름 */}
      <p
        className="
          text-[12px] xl:text-[14px]
          font-semibold max-w-[80px] xl:max-w-[90px]
          text-center whitespace-nowrap overflow-hidden text-ellipsis
          text-[#2f2f2f]
        "
      >
        {name}
      </p>
    </div>
  );
}
