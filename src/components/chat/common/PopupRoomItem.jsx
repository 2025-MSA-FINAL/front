import StoreIcon from "../icons/StoreIcon.jsx";

export default function PopupRoomItem({ name }) {
  return (
    <div
      className="w-full h-[70px] bg-white rounded-[16px]
                 flex items-center gap-2 px-4 shadow-card
                 cursor-pointer hover:shadow-hover transition
                 flex-shrink-0"
    >
      {/* SVG 아이콘 */}
      <StoreIcon className="w-10 h-10 text-accent-lemon" />

      <p className="text-text-sub text-[16px] font-semibold">{name}</p>
    </div>
  );
}
