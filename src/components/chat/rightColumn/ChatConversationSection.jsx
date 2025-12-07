import ghost2 from "../../../assets/ghost2.png";

export default function ChatConversationSection() {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <div
        className="
        flex flex-row items-center justify-center gap-3
        px-6 py-4 rounded-2xl
        bg-white/15 backdrop-blur-xl border border-white/30
        shadow-[0_8px_32px_rgba(0,0,0,0.25)]
        animate-fade-in
      "
      >
        <img src={ghost2} className="w-10 h-10 opacity-80" />

        <p className="text-white font-semibold text-[18px] tracking-tight">
          채팅에 참가해보세요!
        </p>
      </div>
    </div>
  );
}
