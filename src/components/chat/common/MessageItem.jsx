import { useState, useRef } from "react";
import BlurModal from "../../common/BlurModal";
import privateChatIcon from "../../../assets/privateChat.png";

const MAX_PREVIEW_CHARS = 600; // 긴 메시지 기준
const AI_USER_ID = 20251212;

export default function MessageItem({
  msg,
  isMine,
  isGroupWithPrev,
  showTime,
  lastReadMessageId,
  otherLastReadMessageId,
  roomType,
  participants,
  currentUserId,
  onOpenUserPopover,
}) {
  const [openFullModal, setOpenFullModal] = useState(false);
  const avatarRef = useRef(null);

  const isLong = (msg.content?.length || 0) > MAX_PREVIEW_CHARS;
  const previewText = isLong
    ? msg.content.slice(0, MAX_PREVIEW_CHARS) + "..."
    : msg.content;

  const isDeletedUser = msg.senderStatus === "DELETED";
  const computedProfileImg = isDeletedUser
    ? privateChatIcon
    : msg.senderProfileUrl;

  const computedNickname = isDeletedUser ? "알 수 없음" : msg.senderNickname;

  const isAiMessage = msg.senderId === AI_USER_ID;

  const bubbleAnimationClass =
    isAiMessage && msg.animateIn ? "animate-ai-bubble" : "";

  console.log("🟡 MessageItem debug");
  console.log("msg.cmId =", msg.cmId);
  console.log("participants =", participants);

  const unread = (() => {
    if (typeof msg.cmId !== "number") return 0;
    if (isAiMessage) return 0;

    // PRIVATE
    if (roomType === "PRIVATE") {
      // 내가 보낸 메시지만 unread 대상
      if (msg.senderId !== currentUserId) return 0;

      const otherLastRead = otherLastReadMessageId ?? 0;
      return msg.cmId > otherLastRead ? 1 : 0;
    }

    // GROUP but 2 users → PRIVATE처럼
    if (roomType === "GROUP" && participants.length === 2) {
      const lastRead = lastReadMessageId ?? 0;
      return msg.cmId > lastRead ? 1 : 0;
    }

    // GROUP (3명 이상)
    if (roomType === "GROUP") {
      if (!participants || participants.length <= 1) return 0;

      const others = participants.filter(
        (p) => p.userId !== msg.senderId && p.userId !== currentUserId
      );

      const readers = others.filter(
        (p) => (p.lastReadMessageId ?? 0) >= msg.cmId
      ).length;

      const unreadCount = others.length - readers;
      return unreadCount > 0 ? unreadCount : 0;
    }

    return 0;
  })();

  return (
    <>
      {/* LEFT (상대방 메시지) */}
      {!isMine && (
        <div className="flex w-full justify-start mb-0.5">
          <img
            src={computedProfileImg}
            ref={avatarRef}
            onClick={() =>
              !isDeletedUser && onOpenUserPopover(msg.senderId, avatarRef)
            }
            className={`w-10 h-10 rounded-full object-cover ${
              isDeletedUser ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            } ${isGroupWithPrev ? "invisible" : ""}`}
          />

          <div className="flex flex-col ml-2 items-start">
            {!isGroupWithPrev && (
              <span className="text-white font-semibold text-[15px] ml-1">
                {computedNickname}
              </span>
            )}

            <div className="flex items-end gap-2 mt-1">
              {/* 말풍선 */}
              <div
                className={`relative px-4 py-2 rounded-2xl whitespace-pre-wrap break-words 
                  bg-white/20 text-white max-w-[500px] overflow-hidden
                  ${msg.isPending ? "opacity-50" : ""}
                  ${bubbleAnimationClass}
                `}
              >
                {previewText}

                {/* 🔽 페이드아웃 + 전체보기 버튼 (카카오톡 스타일) */}
                {isLong && (
                  <div
                    className="absolute bottom-0 left-0 w-full h-20 flex items-end justify-end pr-4
                    bg-gradient-to-t from-primary-soft2/40 to-transparent rounded-b-2xl"
                  >
                    <button
                      className="mb-2 px-3 py-1 text-[12px] font-medium 
             rounded-full
             text-white
             hover:bg-white/50 hover:text-primary-dark transition"
                      onClick={() => setOpenFullModal(true)}
                    >
                      전체보기
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                {/* ✅ 읽음 숫자 표시 (카톡 방식) */}
                {!isAiMessage && unread > 0 && (
                  <span className="text-[11px] text-accent-lemon">
                    {unread}
                  </span>
                )}

                {/* 시간 (기존 위치 유지) */}
                {showTime && (
                  <span className="text-white/50 text-xs mb-1 shrink-0">
                    {msg.createdAt}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT (내 메시지) */}
      {isMine && (
        <div className="flex w-full justify-end mb-1">
          <div className="flex flex-col items-end">
            <div className="flex justify-end items-end gap-2">
              <div className="flex flex-col items-end">
                {/* ✅ 읽음 숫자 표시 (카톡 방식) */}
                {!isAiMessage && unread > 0 && (
                  <span className="text-[11px] text-accent-lemon">
                    {unread}
                  </span>
                )}
                {/* 시간 (기존 위치 유지) */}
                {showTime && (
                  <span className="text-white/50 text-xs mb-1 shrink-0">
                    {msg.createdAt}
                  </span>
                )}
              </div>

              {/* 말풍선 */}
              <div
                className={`relative px-4 py-2 rounded-2xl whitespace-pre-wrap break-words 
                bg-white text-purple-700 max-w-[500px] overflow-hidden
                ${msg.isPending ? "opacity-50" : ""}
              `}
              >
                {previewText}

                {/* 🔽 페이드아웃 + 전체보기 버튼 */}
                {isLong && (
                  <div
                    className="absolute bottom-0 left-0 w-full h-20 flex items-end justify-end pr-4
                    bg-gradient-to-t from-gray-200/90 to-transparent rounded-b-2xl"
                  >
                    <button
                      className="mb-2 px-3 py-1 text-[12px] font-medium
                        rounded-full
                        text-purple-700 
                        hover:bg-purple-300 transition"
                      onClick={() => setOpenFullModal(true)}
                    >
                      전체보기
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 전체 내용 모달 */}
      <BlurModal open={openFullModal} onClose={() => setOpenFullModal(false)}>
        <div className="flex flex-col gap-1 max-h-[70vh]">
          <p className="text-lg text-gray-500 ml-2">
            {computedNickname || (isMine ? "나" : "")}
          </p>
          <div className="mt-2 p-3 rounded-xl bg-gray-50 border border-gray-200 max-h-[55vh] overflow-y-auto custom-scroll">
            <p className="whitespace-pre-wrap break-words text-gray-900 text-sm align-o">
              {msg.content}
            </p>
          </div>

          <p className="text-xs text-gray-400 text-right mr-2">
            {msg.createdAt}
          </p>
        </div>
      </BlurModal>
    </>
  );
}
