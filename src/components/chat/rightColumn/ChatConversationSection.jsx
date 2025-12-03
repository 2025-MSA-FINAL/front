import ghost2 from "../../../assets/ghost2.png";

export default function ChatConversationSection() {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <div className="flex flex-row items-center justify-center gap-2">
        <img src={ghost2} className="w-10 h-10 object-cover" />

        <p className="text-secondary-dark font-semibold text-title-lg">
          채팅에 참가해보세요
        </p>
      </div>
    </div>
  );
}
