export default function PopupRoomItem({ name, img }) {
  return (
    <div
      className="w-full h-[70px] bg-secondary-light rounded-[16px]
                 flex items-center gap-3 px-4 shadow-card
                 cursor-pointer hover:shadow-hover transition
                 flex-shrink-0"
    >
      <img src={img} alt="" className="w-10 h-10" />
      <p className="text-text-sub text-[14px] font-medium ">{name}</p>
    </div>
  );
}
