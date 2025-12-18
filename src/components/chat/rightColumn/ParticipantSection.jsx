import ParticipantItem from "../common/ParticipantItem";
import { X } from "lucide-react";

export default function ParticipantSection({ open, participants, onClose }) {
  return (
    <div
      className={`
    h-full flex-shrink-0 rounded-r-2xl
    bg-white/20 backdrop-blur-xl
    border-l border-white/20
    transition-all duration-300 ease-in-out
    ${open ? "w-[320px] opacity-100" : "w-0 opacity-0"}
    overflow-hidden flex flex-col
  `}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/20">
        <h3 className="text-white font-semibold text-sm">참여자 목록</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/10 transition"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {participants.map((p) => (
          <ParticipantItem key={p.userId} participant={p} />
        ))}
      </div>
    </div>
  );
}
