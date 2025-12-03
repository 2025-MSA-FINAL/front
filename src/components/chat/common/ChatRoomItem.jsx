export default function ChatRoomItem({ name, img, type }) {
  // type: "private" | "group"
  const sizeClass = type === "group" ? "w-13 h-10" : "w-10 h-10";

  return (
    <div
      className="w-[100px] h-[100px] bg-secondary-light rounded-[20px]
                 flex flex-col items-center justify-center shadow-card
                 cursor-pointer hover:shadow-hover transition
                 flex-shrink-0"
    >
      <img src={img} className={`${sizeClass} mb-1`} />
      <p className="text-text-sub text-[13px] text-center">{name}</p>
    </div>
  );
}
