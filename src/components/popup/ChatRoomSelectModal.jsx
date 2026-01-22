import { useEffect, useMemo, useRef, useState } from "react";
import BlurModal from "../common/BlurModal";
import { getMyChatRooms } from "../../api/chatApi";

import privateChatIcon from "../../assets/privateChat.png";
import groupChatIcon from "../../assets/groupChat.png";
import popbotIcon from "../../assets/POPBOT.png";

export default function ChatRoomSelectModal({ isOpen, onClose, onSelectRoom }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const searchInputRef = useRef(null);

  const normalizeRoom = (room) => {
    if (!room) return null;

    let roomType = room.roomType ?? room.type;
    if (roomType === "GROUP_CHAT" || roomType === "GROUPCHAT") roomType = "GROUP";
    if (roomType === "PRIVATE_CHAT" || roomType === "PRIVATECHAT") roomType = "PRIVATE";

    const roomId = room.roomId ?? room.gcrId ?? room.pcrId ?? room.id;

    return {
      ...room,
      roomType,
      roomId,
      roomName: room.roomName ?? room.name,
    };
  };

  const formatTimeLabel = (value) => {
    if (!value || typeof value !== "string") return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";

    const now = new Date();
    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();

    if (isToday) {
      return d.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }

    return d
      .toLocaleDateString("ko-KR", { year: "2-digit", month: "2-digit", day: "2-digit" })
      .replaceAll(". ", ".")
      .replaceAll(".", "."); 
  };

  const getRoomIcon = (room) => {
    const name = (room?.roomName || "").toUpperCase();
    if (name.includes("POPBOT")) return popbotIcon;
    return room?.roomType === "PRIVATE" ? privateChatIcon : groupChatIcon;
  };

  useEffect(() => {
    if (!isOpen) return;
    setQuery("");
    loadRooms();
    setTimeout(() => searchInputRef.current?.focus(), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await getMyChatRooms();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.rooms)
        ? data.rooms
        : Array.isArray(data?.data)
        ? data.data
        : [];

      const normalized = list
        .map(normalizeRoom)
        .filter((r) => r && r.roomType && r.roomId);

      setRooms(normalized);
    } catch (e) {
      console.error(e);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = useMemo(() => {
    const q = query.trim().toLowerCase();

    const sorted = [...rooms].sort((a, b) => {
      const ta = new Date(a?.latestMessageTime || a?.updatedAt || a?.createdAt || 0).getTime();
      const tb = new Date(b?.latestMessageTime || b?.updatedAt || b?.createdAt || 0).getTime();
      return tb - ta;
    });

    if (!q) return sorted;
    return sorted.filter((r) => (r?.roomName || "").toLowerCase().includes(q));
  }, [rooms, query]);

  return (
    <BlurModal open={isOpen} onClose={onClose}>
      <style>{`
        @media (max-width: 360px) {
          .crsm-wrap { width: 96vw !important; }
          .crsm-pad { padding-left: 12px !important; padding-right: 12px !important; }
          .crsm-title { font-size: 16px !important; }
          .crsm-desc { font-size: 12px !important; }
          .crsm-input { height: 40px !important; font-size: 13px !important; }
          .crsm-row { padding: 10px !important; border-radius: 16px !important; }
          .crsm-icon { width: 36px !important; height: 36px !important; }
          .crsm-name { font-size: 13px !important; }
          .crsm-time { font-size: 11px !important; }
          .crsm-line { flex-direction: column !important; align-items: flex-start !important; gap: 2px !important; }
        }

        .crsm-scroll {
          scrollbar-width: thin;
          scrollbar-color: var(--color-primary) var(--color-paper);
        }
        .crsm-scroll::-webkit-scrollbar { width: 10px; }
        .crsm-scroll::-webkit-scrollbar-track { background: var(--color-paper); }
        .crsm-scroll::-webkit-scrollbar-thumb {
          background: var(--color-primary);
          border-radius: 999px;
          border: 3px solid var(--color-paper);
        }
        .crsm-scroll::-webkit-scrollbar-thumb:hover { background: var(--color-primary-dark); }
      `}</style>

      <div
        className="
          crsm-wrap
          flex flex-col overflow-hidden
          w-[92vw] max-w-[420px]
          h-[72svh] sm:h-[60vh]
          rounded-[var(--radius-card)]
          bg-[var(--color-paper)]
        "
      >
        {/* Header */}
        <div className="crsm-pad px-4 sm:px-6 pt-5 sm:pt-6 pb-4 shrink-0">
          <h2 className="crsm-title text-[18px] sm:text-xl font-bold text-[var(--color-text-black)]">
            채팅방 선택
          </h2>
          <p className="crsm-desc text-xs sm:text-sm mt-1 text-[var(--color-text-sub)]">
            팝업을 공유할 채팅방을 선택하세요.
          </p>

          {/* Search */}
          <div className="mt-3 sm:mt-4 relative">
            <input
              ref={searchInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setQuery("");
              }}
              placeholder="채팅방 검색"
              aria-label="채팅방 검색"
              className="
                crsm-input
                w-full h-11 px-4 pr-10
                rounded-[var(--radius-input)]
                border border-[var(--color-secondary-light)]
                bg-[var(--color-paper)]
                text-sm text-[var(--color-text-black)]
                placeholder:text-[var(--color-text-sub)]
                outline-none
                focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]
                focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-paper)]
              "
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  searchInputRef.current?.focus();
                }}
                className="
                  absolute right-3 top-1/2 -translate-y-1/2
                  text-[var(--color-text-sub)]
                  hover:text-[var(--color-text-black)]
                  text-lg leading-none
                  focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]
                  focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-paper)]
                  rounded-full
                "
                aria-label="검색어 지우기"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div
            className="h-full overflow-y-auto overflow-x-hidden crsm-scroll"
            style={{ scrollbarGutter: "stable" }}
          >
            <div className="crsm-pad px-4 sm:px-6 pb-4 flex flex-col gap-2 sm:gap-3">
              {loading ? (
                <p className="text-center py-10 text-[var(--color-text-sub)]">
                  목록을 불러오는 중...
                </p>
              ) : filteredRooms.length === 0 ? (
                <p className="text-center py-10 text-[var(--color-text-sub)]">
                  {query ? "검색 결과가 없어요." : "참여 중인 채팅방이 없어요."}
                </p>
              ) : (
                filteredRooms.map((room) => (
                  <button
                    key={`${room.roomType}-${room.roomId}`}
                    onClick={() => onSelectRoom(room)}
                    aria-label={`${room.roomName || "이름 없는 채팅방"} 선택`}
                    className="
                      crsm-row
                      w-full flex items-center gap-3
                      p-3 rounded-2xl
                      bg-[var(--color-paper)]
                      border border-[var(--color-secondary-light)]
                      text-left
                      transition
                      hover:bg-[var(--color-primary-soft2)]
                      hover:border-[var(--color-primary)]
                      focus-visible:outline-none
                      focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]
                      focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-paper)]
                    "
                  >
                    {/* Icon */}
                    <div
                      className="
                        crsm-icon
                        w-11 h-11 rounded-full overflow-hidden shrink-0
                        bg-[var(--color-paper-light)]
                        border border-[var(--color-secondary-light)]
                      "
                    >
                      <img
                        src={getRoomIcon(room)}
                        alt={room.roomType === "PRIVATE" ? "1:1 채팅" : "그룹 채팅"}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="crsm-line flex items-center justify-between gap-2">
                        <span className="crsm-name font-semibold text-[var(--color-text-black)] truncate text-sm sm:text-base">
                          {room.roomName || "이름 없는 채팅방"}
                        </span>
                        <span className="crsm-time text-xs text-[var(--color-text-sub)] shrink-0">
                          {formatTimeLabel(room.latestMessageTime)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="crsm-pad px-4 sm:px-6 py-3 sm:py-4 shrink-0 border-t border-[var(--color-secondary-light)] bg-[var(--color-paper)]">
          <button
            onClick={onClose}
            className="
              w-full py-2
              text-[var(--color-text-sub)]
              hover:text-[var(--color-text-black)]
              transition
              focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]
              focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-paper)]
              rounded-[var(--radius-btn)]
            "
          >
            취소
          </button>
        </div>
      </div>
    </BlurModal>
  );
}
