export default function ChatRoomItem({ name, img, type }) {
  const sizeClass =
    type === "GROUP" ? "w-[55px] h-[45px]" : "w-[42px] h-[42px]";

  return (
    <div
      className="
        relative
        w-[100px] h-[100px]
        rounded-3xl
        flex flex-col items-center justify-center
        cursor-pointer shrink-0
        transition-all duration-200 ease-out

        /* ★ 밝고 귀여운 파스텔 글라스 */
        bg-secondary-light
        backdrop-blur-xl
        border border-white
        shadow-[0_4px_14px_rgba(255,220,150,0.35)] hover:shadow-[0_10px_28px_rgba(255,245,180,0.40)]
        hover:bg-accent-lemon-soft
        hover:-translate-y-0.5
        active:scale-[0.97]

        /* 내부 부드러운 그림자 → 입체감 */
        before:content-['']
        before:absolute before:inset-0
        before:rounded-3xl
        before:shadow-[inset_0_0_12px_rgba(255,255,255,0.5)]
        before:pointer-events-none
      "
    >
      {/* ★ 통일된 파스텔 Glow (옐로우 계열) */}
      <div
        className="
          absolute inset-0 rounded-3xl -z-10
          bg-[radial-gradient(
            circle_at_50%_0%,
            rgba(255,250,210,0.8),
            rgba(255,240,180,0.32),
            rgba(255,255,255,0)
          )]
          blur-2xl
        "
      ></div>

      {/* 아이콘 */}
      <img
        src={img}
        className={`
          ${sizeClass} mb-2
          drop-shadow-[0_3px_4px_rgba(0,0,0,0.22)]
          transition-transform duration-200
          hover:scale-[1.08]
        `}
      />

      {/* 텍스트 */}
      <p
        className="
          text-[14px] font-semibold max-w-[90px] text-center
          whitespace-nowrap overflow-hidden text-ellipsis
          text-[#363636]
        "
      >
        {name}
      </p>
    </div>
  );
}
