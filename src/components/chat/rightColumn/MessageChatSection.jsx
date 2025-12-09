import { useEffect, useState, useRef } from "react";
import { connectStomp, getStompClient } from "../../../api/socket";
import {
  deleteGroupChatRoom,
  deletePrivateChatRoom,
  updateGroupChatRoom,
} from "../../../api/chatApi";
import BlurModal from "../../common/BlurModal";
import EditRoomForm from "../../chat/rightColumn/EditRoomForm";
import ReportForm from "../../chat/rightColumn/ReportForm";
import { useChatStore } from "../../../store/chat/chatStore";
import { useAuthStore } from "../../../store/authStore";
import axios from "axios";

/* SVG Icons */
import groupChatIcon from "../../../assets/groupChat.png";
import privateChatIcon from "../../../assets/privateChat.png";
import EmojiIcon from "../../chat/icons/emojiIcon";
import ImageUploadIcon from "../../chat/icons/imageIcon";
import ScheduleIcon from "../../chat/icons/scheduleIcon";
import MoreIcon from "../../chat/icons/MoreIcon";

/* 날짜 라벨 영어 → 한국어 변환 */
const convertDateLabel = (label) => {
  if (!label) return label;

  const map = {
    Monday: "월요일",
    Tuesday: "화요일",
    Wednesday: "수요일",
    Thursday: "목요일",
    Friday: "금요일",
    Saturday: "토요일",
    Sunday: "일요일",
  };
  const parts = label.split(" ");
  const eng = parts.pop();
  return [...parts, map[eng] || eng].join(" ");
};

/* createdAt 한국식 변환 */
const normalizeCreatedAt = (str) => {
  if (!str) return str;
  if (str.includes("오전") || str.includes("오후")) return str;

  let [ampm, hm] = str.split(" ");
  let [h, m] = hm.split(":");
  h = Number(h);

  const isAM = ampm.toUpperCase() === "AM";
  const korAmpm = isAM ? "오전" : "오후";

  if (h === 0) h = 12;
  else if (h > 12) h -= 12;

  return `${korAmpm} ${h}:${m}`;
};

/* createdAt → 분 단위 key */
const toMinuteKey = (str) => {
  if (!str) return "";
  str = normalizeCreatedAt(str);
  const [ampm, hm] = str.split(" ");
  let [h, m] = hm.split(":");
  h = Number(h);

  if (ampm === "오후" && h !== 12) h += 12;
  if (ampm === "오전" && h === 12) h = 0;

  return `${h}:${m}`;
};

/* =======================================================================
 📌 MAIN COMPONENT
======================================================================= */
export default function MessageChatSection() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  /* 모달 */
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  /* Dropdown */
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const menuRef = useRef(null);

  const subRef = useRef(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const isComposingRef = useRef(false);

  const currentUserId = useAuthStore((s) => s.user?.userId);

  const activeRoom = useChatStore((s) => s.activeChatRoom);
  const setActiveRoom = useChatStore((s) => s.setActiveChatRoom);

  const roomId = activeRoom?.gcrId ?? activeRoom?.roomId;
  const roomType = activeRoom?.roomType;

  const removeRoom = useChatStore((s) => s.removeRoom);

  const iconSize = roomType === "GROUP" ? "w-11 h-9" : "w-9 h-9";

  /* Dropdown 토글 */
  const toggleMenu = () => {
    if (!menuVisible) {
      setMenuVisible(true);
      setTimeout(() => setMenuOpen(true), 10);
    } else {
      setMenuOpen(false);
      setTimeout(() => setMenuVisible(false), 180);
    }
  };

  /* Dropdown 바깥 클릭 */
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

  /* 삭제 기능 */
  const handleDeleteRoom = async () => {
    if (
      !window.confirm(
        `정말 이 ${activeRoom.roomName} 채팅방을(를) 삭제하시겠습니까?`
      )
    )
      return;
    try {
      if (roomType === "GROUP") {
        await deleteGroupChatRoom(activeRoom.gcrId);
        removeRoom("GROUP", activeRoom.gcrId);
      } else {
        await deletePrivateChatRoom(activeRoom.roomId);
        removeRoom("PRIVATE", activeRoom.roomId);
      }

      setActiveRoom(null);
    } catch (e) {
      console.error(e);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  /* 스크롤 ↓ */
  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };
  useEffect(() => scrollToBottom(), [messages]);

  /* textarea 높이 자동 */
  useEffect(() => {
    if (textareaRef.current) {
      const ta = textareaRef.current;
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    }
  }, [input]);

  /* WebSocket 메시지 수신 */
  const onMessageReceived = (msg) => {
    const body = JSON.parse(msg.body);
    const createdAt = normalizeCreatedAt(body.createdAt);

    setMessages((prev) => [
      ...prev,
      { ...body, createdAt, minuteKey: toMinuteKey(createdAt) },
    ]);
  };

  /* 메시지 전송 */
  const sendMessage = () => {
    if (!input.trim()) return;
    const client = getStompClient();
    if (!client || !client.connected) return;

    client.publish({
      destination: "/pub/chat/message",
      body: JSON.stringify({
        roomId,
        roomType,
        content: input,
        senderId: currentUserId,
        messageType: "TEXT",
      }),
    });

    setInput("");
    setTimeout(scrollToBottom, 20);
  };

  /* 초기 메시지 로드 + WebSocket 연결 */
  useEffect(() => {
    if (!activeRoom?.gcrId || !roomType) return;

    const load = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/chat/messages", {
          params: { roomId: activeRoom?.gcrId ?? roomId, roomType, limit: 60 },
          withCredentials: true,
        });

        setMessages(
          res.data.reverse().map((m) => ({
            ...m,
            createdAt: normalizeCreatedAt(m.createdAt),
            minuteKey: toMinuteKey(m.createdAt),
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

      const topic = `/sub/chat-room-${roomType}-${activeRoom.gcrId}`;

      if (subRef.current) subRef.current.unsubscribe();
      subRef.current = client.subscribe(topic, onMessageReceived);
    };

    run();

    return () => subRef.current?.unsubscribe();
  }, [activeRoom, roomType]);

  /* 날짜 구분선 */
  const DateDivider = ({ label }) => (
    <div className="flex justify-center my-4">
      <span className="text-gray-300 text-sm bg-white/10 px-4 py-1 rounded-full">
        {label}
      </span>
    </div>
  );

  /* =======================================================================
        📌 RENDER
  ======================================================================= */
  return (
    <>
      {/* 배경 dim 처리 */}
      {(showEditModal || showReportModal) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998]"></div>
      )}

      <div className="w-full h-full flex flex-col justify-start px-8 py-6 relative z-[1]">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 flex items-center justify-center">
              <img
                src={roomType === "GROUP" ? groupChatIcon : privateChatIcon}
                className={iconSize}
              />
            </div>

            <div className="flex flex-col justify-center h-[48px]">
              {roomType === "GROUP" ? (
                <div className="flex flex-row items-end gap-3">
                  <span className="text-white font-semibold text-lg">
                    {activeRoom?.title}
                  </span>
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
                  {roomType === "GROUP" &&
                    activeRoom?.ownerId === currentUserId && (
                      <button
                        className="mx-2 text-[14px] font-semibold text-left text-text-main hover:text-text-sub transition"
                        onClick={() => {
                          setShowEditModal(true);
                          toggleMenu();
                        }}
                      >
                        수정하기
                      </button>
                    )}

                  {roomType === "GROUP" &&
                    activeRoom?.ownerId === currentUserId && (
                      <div className="w-full h-px bg-white/60"></div>
                    )}

                  <button
                    className="mx-2 text-accent-pink text-[14px] font-semibold text-left hover:opacity-70 transition"
                    onClick={handleDeleteRoom}
                  >
                    채팅방 삭제하기
                  </button>

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

        {/* 메시지 리스트 */}
        <div
          className="flex flex-col flex-1 overflow-y-auto scrollbar-hide justify-start border-t border-white/20"
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

            return (
              <div key={i} className="mb-1">
                {showDateDivider && (
                  <DateDivider label={convertDateLabel(msg.dateLabel)} />
                )}

                <div
                  className={`flex w-full ${
                    isMine ? "justify-end" : "justify-start"
                  } mb-1`}
                >
                  {/* LEFT */}
                  {!isMine && (
                    <div className="flex gap-2 w-full max-w-[75%]">
                      {!isGroupWithPrev ? (
                        <img
                          src={msg.senderProfileUrl}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10"></div>
                      )}

                      <div className="flex flex-col">
                        {!isGroupWithPrev && (
                          <span className="text-white font-semibold text-[15px] ml-1">
                            {msg.senderNickname}
                          </span>
                        )}

                        <div className="flex items-end gap-2">
                          <div
                            className={`
                              px-4 py-2 rounded-2xl whitespace-pre-line
                              bg-white/20 text-white
                              ${isGroupWithPrev ? "mt-1" : "mt-2"}
                            `}
                          >
                            {msg.content}
                          </div>

                          {(!next ||
                            next.senderId !== msg.senderId ||
                            next.minuteKey !== msg.minuteKey) && (
                            <span className="text-white/50 text-xs mb-1">
                              {msg.createdAt}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* RIGHT */}
                  {isMine && (
                    <div className="flex gap-2 w-full max-w-[75%] justify-end items-end">
                      {(!next ||
                        next.senderId !== msg.senderId ||
                        next.minuteKey !== msg.minuteKey) && (
                        <span className="text-white/50 text-xs mb-1">
                          {msg.createdAt}
                        </span>
                      )}

                      <div
                        className={`
                          px-4 py-2 rounded-2xl whitespace-pre-line
                          bg-white text-purple-700
                          ${isGroupWithPrev ? "mt-1" : "mt-2"}
                        `}
                      >
                        {msg.content}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 입력창 */}
        <div className="flex items-end gap-4 border-t border-white/20 pt-4 mt-4">
          <button className="p-2 hover:bg-white/10 rounded-full">
            <EmojiIcon className="w-6 h-6" fill="#fff" />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            rows={1}
            placeholder="메시지 입력"
            className="flex-1 bg-white/10 border border-white/30 rounded-xl px-4 py-2 text-white placeholder:text-white/60 resize-none overflow-hidden focus:outline-none"
            onCompositionStart={() => (isComposingRef.current = true)}
            onCompositionEnd={() => (isComposingRef.current = false)}
            onChange={(e) => setInput(e.target.value)}
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
            className="px-5 py-2 bg-white text-purple-700 font-semibold rounded-xl hover:bg-white/80 transition"
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
            // Zustand 상태 갱신
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
          onSubmit={(data) => {
            console.log("신고 내용:", data);
            alert("신고가 접수되었습니다.");
            setShowReportModal(false);
          }}
        />
      </BlurModal>
    </>
  );
}
