import { v4 as uuidv4 } from "uuid";
import { useEffect, useState, useRef } from "react";
import { connectStomp, getStompClient } from "../../../api/socket";
import {
  deleteGroupChatRoom,
  deletePrivateChatRoom,
  updateGroupChatRoom,
  leaveGroupChatRoom,
} from "../../../api/chatApi";
import BlurModal from "../../common/BlurModal";
import MessageItem from "../../chat/common/MessageItem";
import EditRoomForm from "../../chat/rightColumn/EditRoomForm";
import ReportForm from "../../chat/rightColumn/ReportForm";
import GroupRoomInfoPopover from "../../chat/common/GroupRoomInfoPopover";
import UserProfilePopover from "../../chat/common/UserProfilePopover";
import { UserTypingDots, AiTypingDots } from "../common/TypingDots";
import { useChatPopupStore } from "../../../store/chat/chatPopupStore";
import { useChatStore } from "../../../store/chat/chatStore";
import { useAuthStore } from "../../../store/authStore";
import axios from "axios";

/* IMG */
import groupChatIcon from "../../../assets/groupChat.png";
import privateChatIcon from "../../../assets/privateChat.png";
import POPBOT from "../../../assets/POPBOT.png";
/* SVG Icons */
import EmojiIcon from "../../chat/icons/emojiIcon";
import ImageUploadIcon from "../../chat/icons/imageIcon";
import ScheduleIcon from "../../chat/icons/scheduleIcon";
import MoreIcon from "../../chat/icons/MoreIcon";
import { API_BASE } from "../../../utils/env";

/* ------------------------------------------------------------------
 📌 날짜 / 시간 변환 함수 — 안전한 Date 객체 기반
------------------------------------------------------------------ */

// 시간: "오후 7:03"
const formatTime = (dt) => {
  if (!dt) return "";
  const date = new Date(dt);
  if (isNaN(date)) return "";

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours < 12 ? "오전" : "오후";

  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;

  return `${ampm} ${hours}:${minutes}`;
};

// 날짜 라벨: "2025년 12월 09일 화요일"
const formatDateLabel = (dt) => {
  const date = new Date(dt);
  if (isNaN(date)) return "";

  const days = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ];

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const week = days[date.getDay()];

  return `${y}년 ${m}월 ${d}일 ${week}`;
};

// 그룹핑 기준: "19:03" (24시간제)
const toMinuteKey = (dt) => {
  const date = new Date(dt);
  if (isNaN(date)) return "";

  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");

  return `${h}:${m}`;
};

/* =======================================================================
 📌 MAIN COMPONENT
======================================================================= */
export default function MessageChatSection() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [openUserPopover, setOpenUserPopover] = useState(null);
  const [userAnchorRef, setUserAnchorRef] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Map());
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const subRef = useRef(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const isComposingRef = useRef(false);
  const menuRef = useRef(null);
  const roomInfoRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const prevMessageCountRef = useRef(0);

  const currentUserId = useAuthStore((s) => s.user?.userId);
  const activeRoom = useChatStore((s) => s.activeChatRoom);
  const setActiveRoom = useChatStore((s) => s.setActiveChatRoom);
  const removeRoom = useChatStore((s) => s.removeRoom);
  const updateRoomOrder = useChatStore((s) => s.updateRoomOrder);

  const roomId = activeRoom?.gcrId ?? activeRoom?.roomId;
  const roomType = activeRoom?.roomType;
  const otherUserId = activeRoom?.otherUserId;

  const showUnreadButton = !isAtBottom && unreadCount > 0;

  const toggleRoomInfo = () => setShowRoomInfo((prev) => !prev);

  const iconSize =
    roomType === "GROUP"
      ? "w-11 h-9"
      : otherUserId === 20251212
      ? "w-8.5 h-10"
      : "w-9 h-9";

  const roomIcon =
    roomType === "GROUP"
      ? groupChatIcon
      : otherUserId === 20251212
      ? POPBOT
      : privateChatIcon;

  /* Dropdown */
  const toggleMenu = () => {
    if (!menuVisible) {
      setMenuVisible(true);
      setTimeout(() => setMenuOpen(true), 10);
    } else {
      setMenuOpen(false);
      setTimeout(() => setMenuVisible(false), 180);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setTimeout(() => setMenuVisible(false), 180);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* 자동 스크롤 */
  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  const typingUserList = Array.from(typingUsers.entries()).map(
    ([userId, nickname]) => ({ userId, nickname })
  );

  const isAiTyping = typingUserList.some((u) => u.userId === 20251212);

  const inputPlaceholder =
    roomType === "PRIVATE" && isAiTyping
      ? "POPBOT이 생각 중이에요…"
      : "메시지 입력";

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom]);

  useEffect(() => {
    const prevCount = prevMessageCountRef.current;
    const currentCount = messages.length;

    if (!isAtBottom && currentCount > prevCount) {
      const diff = currentCount - prevCount;
      setUnreadCount((c) => c + diff);
    }

    prevMessageCountRef.current = currentCount;
  }, [messages, isAtBottom]);

  /* textarea 자동 높이 (최대 120px) */
  useEffect(() => {
    if (textareaRef.current) {
      const ta = textareaRef.current;

      ta.style.height = "auto";

      const fullHeight = ta.scrollHeight;
      const newHeight = Math.min(fullHeight, 120);
      ta.style.height = newHeight + "px";

      if (fullHeight > 120) {
        ta.style.overflowY = "auto";
      } else {
        ta.style.overflowY = "hidden";
      }
    }
  }, [input]);

  /* WebSocket 메시지 수신 */
  const onMessageReceived = (msg) => {
    const body = JSON.parse(msg.body);

    // 🔹 1) 타이핑 이벤트
    if (body.type === "TYPING_START") {
      if (body.senderId !== currentUserId) {
        setTypingUsers((prev) => {
          const next = new Map(prev);
          next.set(body.senderId, body.senderNickname);
          return next;
        });
      }
      return;
    }

    if (body.type === "TYPING_STOP") {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(body.senderId);
        return next;
      });
      return;
    }

    // 🔹 2) 메시지
    if (body.type === "MESSAGE") {
      const payload = body.payload;
      const isAi = payload.senderId === 20251212;

      // ⭐ AI 메시지 오면 typing 종료
      if (isAi) {
        setTypingUsers((prev) => {
          const next = new Map(prev);
          next.delete(20251212);
          return next;
        });
      }

      updateRoomOrder(payload.roomType, payload.roomId);

      setMessages((prev) => {
        const filtered = prev.filter(
          (m) => m.clientMessageKey !== payload.clientMessageKey
        );

        const next = [
          ...filtered,
          {
            ...payload,
            createdAt: formatTime(payload.createdAt),
            minuteKey: toMinuteKey(payload.createdAt),
            dateLabel: formatDateLabel(payload.createdAt),

            // ⭐ AI 최초 등장 애니메이션
            animateIn: isAi,
          },
        ];

        return next.sort((a, b) => {
          if (typeof a.cmId === "string") return 1;
          if (typeof b.cmId === "string") return -1;
          return a.cmId - b.cmId;
        });
      });
    }
  };

  /* 메시지 전송 */
  const sendMessage = () => {
    if (!input.trim()) return;

    sendTyping("TYPING_STOP");
    isTypingRef.current = false;
    clearTimeout(typingTimeoutRef.current);

    const client = getStompClient();
    if (!client || !client.connected) return;

    // 임시 메시지 생성 (Optimistic UI)
    const clientMessageKey = uuidv4();
    const tempId = `temp-${clientMessageKey}`;

    const optimisticMessage = {
      cmId: tempId, // 임시 ID
      roomId,
      roomType,
      senderId: currentUserId,
      senderNickname: "나",
      senderProfileUrl: useAuthStore.getState().user?.photo ?? "",
      senderStatus: "ACTIVE",
      content: input,
      messageType: "TEXT",
      createdAt: formatTime(new Date()),
      minuteKey: toMinuteKey(new Date()),
      dateLabel: formatDateLabel(new Date()),

      // ⭐ Pending 표시
      isPending: true,
      clientMessageKey,
    };

    // ⭐ 화면에 즉시 추가
    setMessages((prev) => [...prev, optimisticMessage]);

    // 서버 전송
    client.publish({
      destination: "/pub/chat/message",
      body: JSON.stringify({
        roomId,
        roomType,
        content: input,
        senderId: currentUserId,
        messageType: "TEXT",
        clientMessageKey,
      }),
    });

    setInput("");
    setTimeout(scrollToBottom, 20);
  };

  /* 초기 메시지 로드 + WebSocket 연결 */
  useEffect(() => {
    if (!activeRoom || !roomType) return;

    const roomKey = roomType === "GROUP" ? activeRoom.gcrId : activeRoom.roomId;
    if (!roomKey) return;

    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/chat/messages`, {
          params: { roomId: roomKey, roomType, limit: 60 },
          withCredentials: true,
        });

        setMessages(
          res.data.reverse().map((m) => ({
            ...m,
            createdAt: formatTime(m.createdAt),
            minuteKey: toMinuteKey(m.createdAt),
            dateLabel: formatDateLabel(m.createdAt),
          }))
        );
      } catch (e) {
        console.error("❌ fetchMessages:", e);
      }
    };

    load();

    const run = async () => {
      await connectStomp();
      const client = getStompClient();
      if (!client.connected) return;

      const topic = `/sub/chat-room-${roomType}-${roomKey}`;

      if (subRef.current) subRef.current.unsubscribe();
      subRef.current = client.subscribe(topic, onMessageReceived);
    };

    run();

    return () => subRef.current?.unsubscribe();
  }, [activeRoom, roomType]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const threshold = 20;
      const atBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

      setIsAtBottom(atBottom);

      if (atBottom) {
        setUnreadCount(0); // 바닥 도착하면 읽음 처리
      }
    };

    el.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  /* 날짜 구분선 */
  const DateDivider = ({ label }) => (
    <div className="flex justify-center my-4">
      <span className="text-gray-300 text-sm bg-white/10 px-4 py-1 rounded-full">
        {label}
      </span>
    </div>
  );

  const sendTyping = (type) => {
    const client = getStompClient();
    if (!client?.connected) return;

    client.publish({
      destination: "/pub/chat/typing",
      body: JSON.stringify({
        type,
        roomType,
        roomId,
        senderId: currentUserId,
        senderNickname: useAuthStore.getState().user?.nickname,
      }),
    });
  };

  /* =======================================================================
        📌 RENDER
  ======================================================================= */
  return (
    <>
      {(showEditModal || showReportModal) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998]"></div>
      )}

      <div className="w-full h-full flex flex-col justify-start px-8 py-5 relative z-[1]">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-3">
            <div className="w-12 flex items-center justify-center">
              <img src={roomIcon} className={iconSize} />
            </div>

            <div
              className="flex flex-col justify-center h-[48px]"
              ref={roomInfoRef}
            >
              {roomType === "GROUP" ? (
                <div className="flex flex-row items-end gap-3">
                  <button
                    onClick={toggleRoomInfo}
                    className="text-white font-semibold text-lg hover:text-white/80 transition"
                  >
                    {activeRoom?.title}
                  </button>
                  <span className="text-white/60 text-[11px]">
                    인원 {activeRoom?.currentUserCnt} / {activeRoom?.maxUserCnt}
                  </span>
                </div>
              ) : (
                <span className="text-white font-semibold text-lg">
                  {activeRoom?.roomName}
                </span>
              )}
            </div>
          </div>

          {/* More 메뉴 */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={toggleMenu}
              className="p-2 hover:bg-white/10 rounded-full"
            >
              <MoreIcon className="w-6 h-6 text-white" />
            </button>

            {menuVisible && (
              <div
                className={`
                  absolute right-0 top-10 w-[200px]
                  rounded-2xl py-5 px-6 z-50
                  bg-white/40 backdrop-blur-xl
                  shadow-dropdown border border-white/20
                  transition-all duration-200
                  ${
                    menuOpen
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-2"
                  }
                `}
              >
                <div className="flex flex-col gap-4">
                  {/* 수정하기 - GROUP & Owner */}
                  {roomType === "GROUP" &&
                    activeRoom?.ownerId === currentUserId && (
                      <>
                        <button
                          className="mx-2 text-[14px] font-semibold text-left text-text-main hover:text-text-sub transition"
                          onClick={() => {
                            setShowEditModal(true);
                            toggleMenu();
                          }}
                        >
                          수정하기
                        </button>

                        <div className="w-full h-px bg-white/60"></div>
                      </>
                    )}

                  {/* GROUP → Owner는 삭제, 참여자는 나가기 */}
                  {roomType === "GROUP" ? (
                    activeRoom?.ownerId === currentUserId ? (
                      <button
                        className="mx-2 text-accent-pink text-[14px] font-semibold text-left hover:opacity-70 transition"
                        onClick={async () => {
                          await deleteGroupChatRoom(activeRoom.gcrId);
                          removeRoom("GROUP", activeRoom.gcrId);
                          setActiveRoom(null);
                          const { fetchPopupRooms, selectedPopup } =
                            useChatPopupStore.getState();
                          await fetchPopupRooms(selectedPopup.popId);
                        }}
                      >
                        채팅방 삭제하기
                      </button>
                    ) : (
                      <button
                        className="mx-2 text-accent-pink text-[14px] font-semibold text-left hover:opacity-70 transition"
                        onClick={async () => {
                          await leaveGroupChatRoom(activeRoom.gcrId);
                          removeRoom("GROUP", activeRoom.gcrId);
                          setActiveRoom(null);
                        }}
                      >
                        채팅방 나가기
                      </button>
                    )
                  ) : (
                    /* PRIVATE → 항상 삭제 */
                    <button
                      className="mx-2 text-accent-pink text-[14px] font-semibold text-left hover:opacity-70 transition"
                      onClick={async () => {
                        await deletePrivateChatRoom(activeRoom.roomId);
                        removeRoom("PRIVATE", activeRoom.roomId);
                        setActiveRoom(null);
                      }}
                    >
                      채팅방 삭제하기
                    </button>
                  )}

                  <button
                    className="mx-2 text-accent-pink text-[14px] font-semibold text-left hover:opacity-70 transition"
                    onClick={() => {
                      setShowReportModal(true);
                      toggleMenu();
                    }}
                  >
                    채팅방 신고하기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {roomType === "GROUP" && (
          <GroupRoomInfoPopover
            room={activeRoom}
            currentUserId={currentUserId}
            anchorRef={roomInfoRef}
            open={showRoomInfo}
            onClose={() => setShowRoomInfo(false)}
          />
        )}

        {/* 메시지 리스트 */}
        <div
          className="flex flex-col flex-1 overflow-y-auto scrollbar-hide justify-start border-t border-white/20 mb-2 px-1"
          ref={scrollRef}
        >
          {messages.map((msg, i) => {
            const prev = messages[i - 1];
            const next = messages[i + 1];
            const isMine = msg.senderId === currentUserId;

            const showDateDivider =
              i === 0 || prev?.dateLabel !== msg.dateLabel;

            const isGroupWithPrev =
              i > 0 &&
              prev?.senderId === msg.senderId &&
              prev?.minuteKey === msg.minuteKey;

            // 시간 보여 줄지 여부 (마지막 말풍선에만)
            const showTime =
              !next ||
              next.senderId !== msg.senderId ||
              next.minuteKey !== msg.minuteKey;

            return (
              <div key={i} className="mb-1">
                {showDateDivider && <DateDivider label={msg.dateLabel} />}

                <MessageItem
                  msg={msg}
                  isMine={isMine}
                  isGroupWithPrev={isGroupWithPrev}
                  showTime={showTime}
                  onOpenUserPopover={(id, ref) => {
                    setOpenUserPopover(id);
                    setUserAnchorRef(ref);
                  }}
                />
              </div>
            );
          })}

          <UserProfilePopover
            userId={openUserPopover}
            anchorRef={userAnchorRef}
            open={!!openUserPopover}
            onClose={() => {
              setOpenUserPopover(null);
              setUserAnchorRef(null);
            }}
            scrollParentRef={scrollRef}
          />
        </div>

        {/* typing indicator 영역 (스크롤 X) */}
        <div className="h-3 flex items-center ml-3 mb-2">
          {showUnreadButton && (
            <button
              onClick={() => {
                scrollToBottom();
                setUnreadCount(0);
              }}
              className="
      absolute bottom-24 left-1/2 -translate-x-1/2
      px-4 py-2
      bg-primary-soft2/40 text-white text-sm font-semibold
      rounded-full shadow-lg
      backdrop-blur-md
      transition-all duration-300 ease-out
      opacity-100 translate-y-0 scale-100
      hover:bg-primary-dark hover:scale-105
      active:scale-95
      z-20
    "
            >
              ↓ 읽지 않은 메시지 {unreadCount}개
            </button>
          )}

          {typingUserList.length > 0 && (
            <div className="flex items-center text-sm transition-opacity duration-200 text-white/80">
              {/* AI */}
              {isAiTyping && roomType === "PRIVATE" ? (
                <>
                  <AiTypingDots />
                  <span className="ml-1 text-white/60">생각 중 .. </span>
                </>
              ) : (
                <>
                  <UserTypingDots />

                  {/* PRIVATE - USER */}
                  {roomType === "PRIVATE" && typingUserList.length === 1 && (
                    <>
                      <span className="font-semibold text-white">
                        {typingUserList[0].nickname}
                      </span>
                      <span>님이 입력 중</span>
                    </>
                  )}

                  {/* GROUP */}
                  {roomType === "GROUP" && (
                    <>
                      {typingUserList.length === 1 && (
                        <>
                          <span className="font-semibold text-white">
                            {typingUserList[0].nickname}
                          </span>
                          <span>님이 입력 중</span>
                        </>
                      )}

                      {typingUserList.length === 2 && (
                        <>
                          <span className="font-semibold text-white">
                            {typingUserList[0].nickname},{" "}
                            {typingUserList[1].nickname}
                          </span>
                          <span>님이 입력 중</span>
                        </>
                      )}

                      {typingUserList.length >= 3 && (
                        <>
                          <span className="font-semibold text-white">
                            {typingUserList[0].nickname}
                          </span>
                          <span> 외 {typingUserList.length - 1}명 입력 중</span>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* 입력창 */}
        <div className="flex items-end gap-2 border border-white/20 px-5 py-2 rounded-2xl">
          <button className="p-2 hover:bg-white/10 rounded-full">
            <EmojiIcon className="w-6 h-6" fill="#fff" />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            rows={1}
            maxLength={3000}
            disabled={isAiTyping && roomType === "PRIVATE"}
            placeholder={inputPlaceholder}
            className="flex-1  rounded-xl px-2 py-2 
                    text-white placeholder:text-white/60
                    resize-none overflow-y-auto focus:outline-none max-h-[120px]
                    chat-textarea-scroll"
            onCompositionStart={() => (isComposingRef.current = true)}
            onCompositionEnd={() => (isComposingRef.current = false)}
            onChange={(e) => {
              setInput(e.target.value);

              if (!isTypingRef.current) {
                sendTyping("TYPING_START");
                isTypingRef.current = true;
              }

              clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => {
                sendTyping("TYPING_STOP");
                isTypingRef.current = false;
              }, 1200);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (e.shiftKey) return;
                if (isComposingRef.current) return;
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          <button className="p-2 hover:bg-white/10 rounded-full">
            <ImageUploadIcon className="w-6 h-6" fill="#fff" />
          </button>

          <button className="p-2 hover:bg-white/10 rounded-full">
            <ScheduleIcon className="w-6 h-6" fill="#fff" />
          </button>

          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-white text-purple-700  font-semibold rounded-xl hover:bg-white/80 transition"
          >
            전송
          </button>
        </div>
      </div>

      {/* ------------------ MODALS ------------------ */}
      <BlurModal open={showEditModal} onClose={() => setShowEditModal(false)}>
        <EditRoomForm
          room={activeRoom}
          onSubmit={async (data) => {
            await updateGroupChatRoom(activeRoom.gcrId, {
              ...data,
              maxUserCnt: data.maxUserCnt,
            });

            setActiveRoom({
              ...activeRoom,
              title: data.title,
              description: data.description,
              maxUserCnt: data.maxUserCnt,
            });

            setShowEditModal(false);
          }}
        />
      </BlurModal>

      <BlurModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
      >
        <ReportForm
          onSubmit={() => {
            alert("신고가 접수되었습니다.");
            setShowReportModal(false);
          }}
        />
      </BlurModal>
    </>
  );
}
