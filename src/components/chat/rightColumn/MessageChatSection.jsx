import { v4 as uuidv4 } from "uuid";
import heic2any from "heic2any";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useState, useRef } from "react";
import { connectStomp, getStompClient } from "../../../api/socket";
import {
  deleteGroupChatRoom,
  deletePrivateChatRoom,
  updateGroupChatRoom,
  leaveGroupChatRoom,
  uploadChatImages,
  uploadReportImages,
  createChatReport,
  pureLlmReply,
  hideChatRoom,
} from "../../../api/chatApi";
import BlurModal from "../../common/BlurModal";
import MessageItem from "../../chat/common/MessageItem";
import CreateScheduleModal from "../common/schedule/CreateScheduleModal";
import EditRoomForm from "../../chat/rightColumn/EditRoomForm";
import ReportForm from "../../chat/rightColumn/ReportForm";
import GroupRoomInfoPopover from "../../chat/common/GroupRoomInfoPopover";
import UserProfilePopover from "../../chat/common/UserProfilePopover";
import { UserTypingDots, AiTypingDots } from "../common/TypingDots";
import { useChatPopupStore } from "../../../store/chat/chatPopupStore";
import { useChatMessageStore } from "../../../store/chat/chatMessageStore";
import { useChatStore } from "../../../store/chat/chatStore";
import { useAuthStore } from "../../../store/authStore";
import { useChatUIStore } from "../../../store/chat/chatUIStore";
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
import ParticipantSection from "./ParticipantSection";
import { ParticipantBottomSheet } from "./ParticipantBottomSheet";

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

/* ------------------------------------------------------------------
 📌 JSON 안전 파싱 유틸
------------------------------------------------------------------ */
const tryParseJson = (value) => {
  if (!value) return null;

  // 이미 객체면 그대로 반환
  if (typeof value === "object") return value;

  if (typeof value !== "string") return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
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
  const [isSendingImage, setIsSendingImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [reportContext, setReportContext] = useState(null);
  const [aiMode, setAiMode] = useState("RAG");
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const subRef = useRef(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const isComposingRef = useRef(false);
  const menuRef = useRef(null);
  const roomInfoRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const prevMessageCountRef = useRef(0);
  const fileInputRef = useRef(null);
  const isSendingImageRef = useRef(false);
  const bottomRef = useRef(null);
  const pendingUploadMapRef = useRef(new Map());
  const emojiRef = useRef(null);
  const swipeStartXRef = useRef(null);
  const lastUserQuestionRef = useRef(null);

  const currentUserId = useAuthStore((s) => s.user?.userId);
  const activeRoom = useChatStore((s) => s.activeChatRoom);
  const setActiveRoom = useChatStore((s) => s.setActiveChatRoom);
  const removeRoom = useChatStore((s) => s.removeRoom);
  const updateRoomOrder = useChatStore((s) => s.updateRoomOrder);
  const showParticipants = useChatUIStore((s) => s.showParticipants);
  const toggleParticipants = useChatUIStore((s) => s.toggleParticipants);
  const closeParticipants = useChatUIStore((s) => s.closeParticipants);
  const clearSelectedGroupRoom = useChatPopupStore(
    (s) => s.clearSelectedGroupRoom
  );

  const AI_USER_ID = 20251212;

  const roomId = activeRoom?.gcrId ?? activeRoom?.roomId;
  const roomType = activeRoom?.roomType;
  const otherUserId = activeRoom?.otherUserId;
  const isAiChat = roomType === "PRIVATE" && otherUserId === AI_USER_ID;

  const showUnreadButton = !isAtBottom && unreadCount > 0;

  const toggleRoomInfo = () => setShowRoomInfo((prev) => !prev);

  const roomKey = activeRoom
    ? `${roomType}-${
        roomType === "GROUP" ? activeRoom.gcrId : activeRoom.roomId
      }`
    : null;

  const roomState = useChatMessageStore((s) =>
    roomKey ? s.roomState[roomKey] : null
  );

  const initRoomReadState = useChatMessageStore((s) => s.initRoomReadState);
  const applyReadEvent = useChatMessageStore((s) => s.applyReadEvent);

  const myLastReadMessageId = roomState?.myLastReadMessageId ?? 0;
  const otherLastReadMessageId = roomState?.otherLastReadMessageId ?? 0;
  const participants = roomState?.participants ?? [];
  const initialUnreadMessageId = roomState?.initialUnreadMessageId ?? null;

  const iconSize =
    roomType === "GROUP"
      ? "w-9 h-7 md:w-11 md:h-9"
      : otherUserId === AI_USER_ID
      ? "w-7 h-9 md:w-8.5 md:h-10"
      : "w-8 h-8 md:w-9 md:h-9";

  const roomIcon =
    roomType === "GROUP"
      ? groupChatIcon
      : otherUserId === AI_USER_ID
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
  const scrollToBottom = (behavior = "auto") => {
    bottomRef.current?.scrollIntoView({ block: "end", behavior });
  };

  const typingUserList = Array.from(typingUsers.entries()).map(
    ([userId, nickname]) => ({ userId, nickname })
  );

  const isAiTyping = typingUserList.some((u) => u.userId === AI_USER_ID);
  const isEmojiDisabled =
    roomType === "PRIVATE" && otherUserId === AI_USER_ID && isAiTyping;

  const inputPlaceholder =
    roomType === "PRIVATE" && isAiTyping
      ? "POPBOT이 생각 중이에요…"
      : "메시지 입력";

  useEffect(() => {
    if (isAtBottom) scrollToBottom("auto");
  }, [messages, isAtBottom]);

  useEffect(() => {
    const prevCount = prevMessageCountRef.current;
    const currentCount = messages.length;

    if (!isAtBottom && currentCount > prevCount) {
      const newMessages = messages.slice(prevCount);

      const unreadIncrement = newMessages.filter((m) => {
        const isMine = m.senderId === currentUserId;
        const isAi = m.senderId === AI_USER_ID;
        return !isMine && !isAi;
      }).length;

      if (unreadIncrement > 0) {
        setUnreadCount((c) => c + unreadIncrement);
      }
    }

    prevMessageCountRef.current = currentCount;
  }, [messages, isAtBottom, currentUserId]);

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
    console.log("📩 WS recv:", body.type, body);

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

    // 🔹 PARTICIPANT 이벤트
    if (body.type?.startsWith("PARTICIPANT_")) {
      if (body.roomType !== roomType || body.roomId !== roomId) return;

      const store = useChatMessageStore.getState();
      const { userId } = body.payload;

      switch (body.type) {
        case "PARTICIPANT_JOIN": {
          const p = body.payload;

          const normalized = {
            userId: p.userId,
            nickName: p.nickName ?? p.nickname ?? "",
            photoUrl: p.photoUrl ?? p.photo ?? "",
            lastReadMessageId: p.lastReadMessageId ?? 0,
            isOwner: Number(p.userId) === Number(activeRoom?.ownerId),
            online: p.online ?? true,
            isMe: Number(p.userId) === Number(currentUserId),
          };

          store.addParticipant({ roomType, roomId, participant: normalized });
          break;
        }

        case "PARTICIPANT_LEAVE":
          store.removeParticipant({
            roomType,
            roomId,
            userId,
          });
          break;

        case "PARTICIPANT_ONLINE":
          store.updateParticipantOnline({
            roomType,
            roomId,
            userId,
            online: true,
          });
          break;

        case "PARTICIPANT_OFFLINE":
          store.updateParticipantOnline({
            roomType,
            roomId,
            userId,
            online: false,
          });
          break;
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

    // 🔹 3) 읽음 이벤트
    if (body.type === "READ") {
      applyReadEvent({
        roomType,
        roomId,
        readerUserId: body.readerUserId,
        lastReadMessageId: body.lastReadMessageId,
        currentUserId,
      });
      return;
    }

    // 🔹 2) 메시지
    if (body.type === "MESSAGE") {
      const payload = body.payload;
      const isAi = payload.senderId === AI_USER_ID;
      console.log("🟣 MESSAGE payload raw =", body.payload);
      console.log("🟣 payload.content =", body.payload?.content);

      if (
        payload.senderId === AI_USER_ID &&
        typeof payload.content === "string"
      ) {
        const parsed = tryParseJson(payload.content); // 위 유틸 재사용 추천
        if (parsed?.type === "NEED_CONFIRM") {
          payload._needConfirm = parsed;
        }
      }

      // ⭐ AI 메시지 오면 typing 종료
      if (isAi) {
        setTypingUsers((prev) => {
          const next = new Map(prev);
          next.delete(AI_USER_ID);
          return next;
        });
      }

      updateRoomOrder(payload.roomType, payload.roomId);

      setMessages((prev) => {
        const filtered = prev.filter(
          (m) => m.clientMessageKey !== payload.clientMessageKey
        );

        const key = payload.clientMessageKey;

        if (key && pendingUploadMapRef.current.has(key)) {
          const entry = pendingUploadMapRef.current.get(key);
          if (entry?.previewUrls?.length) {
            entry.previewUrls.forEach((u) => URL.revokeObjectURL(u));
          }
          pendingUploadMapRef.current.delete(key);
        }

        const next = [
          ...filtered,
          {
            ...payload,
            aiMode: payload.aiMode,
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
    lastUserQuestionRef.current = input;
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
      aiMode,
      createdAt: formatTime(new Date()),
      minuteKey: toMinuteKey(new Date()),
      dateLabel: formatDateLabel(new Date()),
      // ⭐ Pending 표시
      isPending: true,
      clientMessageKey,
    };

    useChatMessageStore.getState().resetInitialUnreadMessageId({
      roomType,
      roomId,
    });

    // ⭐ 화면에 즉시 추가
    setMessages((prev) => [...prev, optimisticMessage]);

    setTimeout(() => scrollToBottom("auto"), 0);

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
        aiMode,
      }),
    });

    setInput("");
    setTimeout(() => scrollToBottom("auto"), 0);
  };

  const sendRead = (messageId) => {
    if (roomType === "PRIVATE" && otherUserId === AI_USER_ID) return;
    if (messageId <= myLastReadMessageId) return;

    const client = getStompClient();
    if (!client?.connected) return;

    client.publish({
      destination: "/pub/chat/read",
      body: JSON.stringify({
        roomType,
        roomId,
        lastReadMessageId: messageId,
        senderId: currentUserId,
      }),
    });
  };

  /* 초기 메시지 로드 + WebSocket 연결 */
  useEffect(() => {
    if (!activeRoom || !roomType) return;

    const roomKey = roomType === "GROUP" ? activeRoom.gcrId : activeRoom.roomId;
    if (!roomKey) return;

    const load = async () => {
      const res = await axios.get(`${API_BASE}/api/chat/messages`, {
        params: { roomId: roomKey, roomType, limit: 60 },
        withCredentials: true,
      });

      const {
        messages,
        lastReadMessageId,
        otherLastReadMessageId,
        participants,
      } = res.data;

      const formattedMessages = messages.reverse().map((m) => ({
        ...m,
        createdAt: formatTime(m.createdAt),
        minuteKey: toMinuteKey(m.createdAt),
        dateLabel: formatDateLabel(m.createdAt),
      }));

      setMessages(formattedMessages);

      const normalizedParticipants = (participants ?? []).map((p) => ({
        ...p,
        isMe: Number(p.userId) === Number(currentUserId),
        isOwner: Number(p.userId) === Number(activeRoom?.ownerId),
      }));

      // 여기까지읽음 위치 계산 (입장 시 1회)
      // ✅ 입장 기준 읽음 고정 + divider index 계산은 store가 함
      const idx = initRoomReadState({
        roomType,
        roomId,
        entryReadMessageId: lastReadMessageId ?? 0, // 🔒 여기까지읽음 기준
        myLastReadMessageId: lastReadMessageId ?? 0, // 내 실시간 읽음 초기값
        otherLastReadMessageId: otherLastReadMessageId ?? 0, // 상대 실시간 읽음 초기값
        participants: normalizedParticipants,
        formattedMessages,
        currentUserId,
      });

      // ✅ 스크롤도 딱 1번만
      setTimeout(() => {
        const el = scrollRef.current;
        if (!el || idx == null) return;
        const target = el.querySelector(
          `[data-cmid="${formattedMessages[idx].cmId}"]`
        );

        if (target) target.scrollIntoView({ block: "center" });
      }, 50);
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

      if (atBottom && messages.length > 0) {
        const lastUnreadFromOther = [...messages]
          .reverse()
          .find(
            (m) => typeof m.cmId === "number" && m.senderId !== currentUserId
          );

        if (
          lastUnreadFromOther &&
          lastUnreadFromOther.cmId > myLastReadMessageId
        ) {
          setUnreadCount(0);
          sendRead(lastUnreadFromOther.cmId);
        }
      }
    };

    el.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => el.removeEventListener("scroll", handleScroll);
  }, [messages, myLastReadMessageId]);

  useEffect(() => {
    if (!messages.length) return;
    if (!isAtBottom) return;

    const lastMsg = [...messages]
      .reverse()
      .find((m) => typeof m.cmId === "number");

    if (!lastMsg) return;
    if (lastMsg.cmId <= myLastReadMessageId) return;

    sendRead(lastMsg.cmId);
  }, [messages, isAtBottom, myLastReadMessageId]);

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

  const retryImageUpload = async (clientMessageKey) => {
    const entry = pendingUploadMapRef.current.get(clientMessageKey);
    if (!entry) return;

    const { files, roomType: rt, roomId: rid } = entry;

    setMessages((prev) =>
      prev.map((m) =>
        m.clientMessageKey === clientMessageKey
          ? { ...m, uploadStatus: "UPLOADING", isPending: true }
          : m
      )
    );

    try {
      await uploadChatImages({
        roomType: rt,
        roomId: rid,
        files,
        clientMessageKey,
      });
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.clientMessageKey === clientMessageKey
            ? { ...m, uploadStatus: "FAILED", isPending: false }
            : m
        )
      );
    }
  };

  const cancelImageUpload = (clientMessageKey) => {
    const entry = pendingUploadMapRef.current.get(clientMessageKey);
    if (entry?.previewUrls?.length) {
      entry.previewUrls.forEach((u) => URL.revokeObjectURL(u));
    }
    pendingUploadMapRef.current.delete(clientMessageKey);

    // ✅ temp 메시지 제거
    setMessages((prev) =>
      prev.filter((m) => m.clientMessageKey !== clientMessageKey)
    );
  };

  const convertHeicToJpgIfNeeded = async (file) => {
    if (!file) return file;

    const name = (file.name || "").toLowerCase();
    const type = (file.type || "").toLowerCase();

    // 🔒 iOS Safari 대비: type 비어 있어도 확장자로 판별
    const looksHeic =
      type.includes("heic") ||
      type.includes("heif") ||
      name.endsWith(".heic") ||
      name.endsWith(".heif");

    if (!looksHeic) return file;

    try {
      const result = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.9,
      });

      const blob = Array.isArray(result) ? result[0] : result;

      if (!(blob instanceof Blob)) {
        throw new Error("heic2any returned non-Blob");
      }

      const safeName =
        file.name?.replace(/\.(heic|heif)$/i, ".jpg") ??
        `image-${Date.now()}.jpg`;

      return new File([blob], safeName, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
    } catch (err) {
      // ❗ 절대 throw 하지 말 것
      console.warn(`⚠️ HEIC 변환 실패 → 원본 업로드 (${file.name})`, err);
      return file;
    }
  };

  const handleImageFiles = async (rawFiles) => {
    if (isSendingImageRef.current) return;
    isSendingImageRef.current = true;
    setIsSendingImage(true);

    if (!rawFiles || rawFiles.length === 0) {
      isSendingImageRef.current = false;
      setIsSendingImage(false);
      return;
    }

    const clientMessageKey = uuidv4();
    const tempId = `temp-${clientMessageKey}`;

    try {
      // 1️⃣ HEIC → JPG 변환
      const convertedFiles = await Promise.all(
        rawFiles.map((raw) => convertHeicToJpgIfNeeded(raw))
      );

      const files = [];
      const previewUrls = [];

      for (const file of convertedFiles) {
        files.push(file);
        previewUrls.push(URL.createObjectURL(file));
      }

      // retry / cancel용 저장
      pendingUploadMapRef.current.set(clientMessageKey, {
        files,
        previewUrls,
        roomType,
        roomId,
      });

      // 2️⃣ Optimistic UI
      setMessages((prev) => [
        ...prev,
        {
          cmId: tempId,
          roomId,
          roomType,
          senderId: currentUserId,
          senderNickname: "나",
          senderProfileUrl: useAuthStore.getState().user?.photo ?? "",
          senderStatus: "ACTIVE",
          content: null,
          imageUrls: previewUrls,
          messageType: "IMAGE",
          createdAt: formatTime(new Date()),
          minuteKey: toMinuteKey(new Date()),
          dateLabel: formatDateLabel(new Date()),
          clientMessageKey,
          uploadStatus: "UPLOADING",
          isPending: true,
        },
      ]);

      // 3️⃣ 서버 업로드
      await uploadChatImages({
        roomType,
        roomId,
        files,
        clientMessageKey,
      });
    } catch (err) {
      console.error("이미지 업로드 실패:", err);

      setMessages((prev) =>
        prev.map((m) =>
          m.clientMessageKey === clientMessageKey
            ? { ...m, uploadStatus: "FAILED", isPending: false }
            : m
        )
      );
    } finally {
      isSendingImageRef.current = false;
      setIsSendingImage(false);
    }
  };

  const handleEmojiClick = (emojiData) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newValue = input.slice(0, start) + emojiData.emoji + input.slice(end);

    setInput(newValue);

    // 커서 위치 복구
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + emojiData.emoji.length,
        start + emojiData.emoji.length
      );
    }, 0);
  };

  useEffect(() => {
    const handler = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // 🔥 방이 바뀌면 메시지 & unread UI 완전 초기화
  useEffect(() => {
    if (!activeRoom) {
      setMessages([]);
      setUnreadCount(0);
      return;
    }

    // 방 전환 시 무조건 초기화
    setMessages([]);
    setUnreadCount(0);
    useChatUIStore.getState().resetChatUI();
  }, [activeRoom]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        useChatUIStore.getState().closeParticipants();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    const onTouchStart = (e) => {
      swipeStartXRef.current = e.touches[0].clientX;
    };

    const onTouchEnd = (e) => {
      if (swipeStartXRef.current == null) return;

      const diff = e.changedTouches[0].clientX - swipeStartXRef.current;

      if (diff > 80) {
        // ✅ CHAT → ROOM_LIST
        setActiveRoom(null);
        clearSelectedGroupRoom(); // ⭐ 이게 없어서 DETAIL로 간 거임
      }

      swipeStartXRef.current = null;
    };

    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isMobile, setActiveRoom, clearSelectedGroupRoom]);

  const handleSubmitReport = async ({ categoryId, files }) => {
    try {
      if (!reportContext) return;
      if (!reportContext?.reportType || !reportContext?.targetId) {
        alert("신고 대상 정보가 없습니다.");
        return;
      }

      //이미지 업로드
      const imageUrls = await uploadReportImages(files);

      //신고 생성
      await createChatReport({
        reportType: reportContext.reportType,
        targetId: reportContext.targetId,
        categoryId,
        imageUrls,
      });

      alert("신고가 접수되었습니다.");
      setShowReportModal(false);
      setReportContext(null);
    } catch (e) {
      const data = e.response?.data;

      if (data?.code === "CHAT_020" || data?.message?.includes("이미 신고")) {
        alert("이미 신고한 대상입니다.");
      } else {
        alert("신고 처리 중 오류가 발생했습니다.");
      }

      setShowReportModal(false);
      setReportContext(null);
    }
  };

  const openReportModal = (context) => {
    setReportContext(context); // { reportType, targetId }
    setShowReportModal(true);
  };

  const resendPureLlm = async () => {
    if (!lastUserQuestionRef.current) return;

    await pureLlmReply({
      roomId,
      roomType,
      content: lastUserQuestionRef.current,
      aiMode: "PURE_LLM",
    });
  };

  /* =======================================================================
        📌 RENDER
  ======================================================================= */
  return (
    <>
      {(showEditModal || showReportModal) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998]" />
      )}

      {/* LEFT */}
      <div className="w-full h-full flex min-h-0 ">
        {/* LEFT: 채팅 영역 */}
        <div
          className={`
          h-full min-h-0 flex flex-col 
          transition-all duration-300 ease-in-out
          ${showParticipants ? "w-[calc(100%-320px)]" : "w-full"}
        `}
        >
          <div className="w-full h-full flex flex-col px-4 py-4 md:px-8 md:py-5 relative z-[1]">
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-2 px-1">
              {/* LEFT: 아이콘 (고정) */}
              <div className="w-12 h-12 flex items-center justify-center shrink-0">
                <img src={roomIcon} className={iconSize} />
              </div>

              <div
                className="flex flex-col justify-center flex-1 min-w-0"
                ref={roomInfoRef}
              >
                {roomType === "GROUP" ? (
                  <div className="flex items-end gap-2 min-w-0">
                    {/* 제목 */}
                    <button
                      onClick={toggleRoomInfo}
                      className="
                      text-white font-semibold
                      text-base md:text-lg
                      truncate
                      min-w-0
                      max-w-full
                      hover:text-white/80
                      transition
                    "
                    >
                      {activeRoom?.title}
                    </button>

                    {/* 인원 (고정) */}
                    <span
                      className="
                      shrink-0
                      text-white/60
                      text-[10px] md:text-[11px]
                      cursor-pointer
                      hover:text-white
                      transition
                      whitespace-nowrap
                    "
                      onClick={toggleParticipants}
                    >
                      인원 {participants.length} / {activeRoom?.maxUserCnt}
                    </span>
                  </div>
                ) : (
                  <span
                    className="
                  text-white font-semibold
                  text-base md:text-lg
                  truncate
                  min-w-0
                "
                  >
                    {activeRoom?.roomName}
                  </span>
                )}
              </div>
              {/* More 메뉴 */}
              <div className="relative shrink-0" ref={menuRef}>
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
                      <button
                        className="mx-2 text-[14px] font-semibold text-left text-text-main hover:text-text-sub transition"
                        onClick={async () => {
                          try {
                            await hideChatRoom(
                              roomType,
                              roomType === "GROUP"
                                ? activeRoom.gcrId
                                : activeRoom.roomId
                            );

                            // 1️⃣ 채팅방 목록 갱신
                            const chatStore = useChatStore.getState();
                            await chatStore.fetchRooms();

                            // 2️⃣ 모바일 / 작은 화면이면 목록으로 이동
                            if (isMobile) {
                              chatStore.setActiveChatRoom(null);
                              clearSelectedGroupRoom(); // ⭐ 중요 (PopupRoomSection으로 확실히)
                            } else {
                              // 데스크탑에서는 그냥 현재 방 닫기
                              chatStore.setActiveChatRoom(null);
                            }

                            // 3️⃣ 메뉴 닫기
                            toggleMenu();
                          } catch (e) {
                            alert("채팅방 숨김에 실패했습니다.");
                            console.error(e);
                          }
                        }}
                      >
                        채팅방 숨기기
                      </button>

                      {/* 수정하기 - GROUP & Owner */}
                      {roomType === "GROUP" &&
                        activeRoom?.ownerId === currentUserId && (
                          <>
                            <button
                              className="mx-2 text-[14px] font-semibold text-left text-text-main hover:text-text-sub transition"
                              onClick={() => {
                                toggleMenu();
                                setShowEditModal(true);
                              }}
                            >
                              수정하기
                            </button>
                          </>
                        )}

                      <div className="w-full h-px bg-white/60"></div>

                      {/* GROUP → Owner는 삭제, 참여자는 나가기 */}
                      {roomType === "GROUP" ? (
                        activeRoom?.ownerId === currentUserId ? (
                          <button
                            className="mx-2 text-accent-pink text-[14px] font-semibold text-left hover:opacity-70 transition"
                            onClick={async () => {
                              await deleteGroupChatRoom(activeRoom.gcrId);

                              useChatMessageStore.getState().clearRoomState({
                                roomType: "GROUP",
                                roomId: activeRoom.gcrId,
                              });

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

                              // 🔥 popupRooms 즉시 반영
                              useChatPopupStore
                                .getState()
                                .updatePopupRoomJoined(activeRoom.gcrId, false);

                              useChatMessageStore.getState().clearRoomState({
                                roomType: "GROUP",
                                roomId: activeRoom.gcrId,
                              });
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

                            useChatMessageStore.getState().clearRoomState({
                              roomType: "PRIVATE",
                              roomId: activeRoom.roomId,
                            });
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
                          toggleMenu();

                          setTimeout(() => {
                            openReportModal({
                              reportType: "CHAT",
                              targetId:
                                roomType === "GROUP"
                                  ? activeRoom.gcrId
                                  : activeRoom.roomId,
                            });
                          }, 180);
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
                openReportModal={openReportModal}
              />
            )}
            {/* 메시지 리스트 */}
            <div
              className="
            flex flex-col flex-1 min-h-0 overflow-y-auto scrollbar-hide
            border-t border-white/20 mb-2 px-1 justify-start"
              ref={scrollRef}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={async (e) => {
                e.preventDefault();
                setIsDragOver(false);

                const files = Array.from(e.dataTransfer.files || []).filter(
                  (f) => f.type.startsWith("image/")
                );

                if (files.length === 0) return;

                await handleImageFiles(files);
              }}
            >
              {messages.map((msg, i) => {
                const prev = messages[i - 1];
                const next = messages[i + 1];
                const isMine = msg.senderId === currentUserId;

                const key =
                  typeof msg.cmId === "number"
                    ? `msg-${msg.cmId}`
                    : `temp-${msg.clientMessageKey}`;

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

                const showUnreadDivider =
                  initialUnreadMessageId !== null &&
                  msg.cmId === initialUnreadMessageId;

                return (
                  <div key={key} className="mb-1" data-cmid={msg.cmId}>
                    {showDateDivider && <DateDivider label={msg.dateLabel} />}

                    {showUnreadDivider && (
                      <div className="flex justify-center my-3">
                        <span
                          className="
                      text-xs font-semibold
                      text-primary-light
                      bg-primary-soft2/30
                      px-4 py-1 rounded-full
                    "
                        >
                          여기까지 읽음
                        </span>
                      </div>
                    )}

                    <MessageItem
                      msg={msg}
                      isMine={isMine}
                      isGroupWithPrev={isGroupWithPrev}
                      showTime={showTime}
                      otherLastReadMessageId={otherLastReadMessageId}
                      participants={participants}
                      roomType={roomType}
                      currentUserId={currentUserId}
                      otherUserId={otherUserId}
                      onResendPureLlm={resendPureLlm}
                      onOpenUserPopover={(id, ref) => {
                        setOpenUserPopover(id);
                        setUserAnchorRef(ref);
                      }}
                      onImageLoad={() => {
                        if (msg.senderId === currentUserId)
                          scrollToBottom("auto");
                        else if (isAtBottom) scrollToBottom("auto");
                      }}
                      onRetryImage={() =>
                        retryImageUpload(msg.clientMessageKey)
                      }
                      onCancelImage={() =>
                        cancelImageUpload(msg.clientMessageKey)
                      }
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
                openReportModal={openReportModal}
              />
              <div ref={bottomRef} />
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
                      {roomType === "PRIVATE" &&
                        typingUserList.length === 1 && (
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
                              <span>
                                {" "}
                                외 {typingUserList.length - 1}명 입력 중
                              </span>
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 🤖 AI 모드 선택 (PRIVATE + POPBOT일 때만) */}
            {roomType === "PRIVATE" && otherUserId === AI_USER_ID && (
              <div className="flex gap-2 mb-2 ml-2">
                <button
                  onClick={() => setAiMode("RAG")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${
                      aiMode === "RAG"
                        ? "bg-primary-soft2 text-white"
                        : "bg-white/10 text-white/60"
                    }
                  `}
                >
                  팝스팟 AI
                </button>

                <button
                  onClick={() => setAiMode("PURE_LLM")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${
                      aiMode === "PURE_LLM"
                        ? "bg-primary-soft2 text-white"
                        : "bg-white/10 text-white/60"
                    }
                  `}
                >
                  일반 AI
                </button>
              </div>
            )}

            {/* 입력창 */}
            <div className="flex items-end gap-2 border border-white/20 px-5 py-2 rounded-2xl">
              <div className="relative" ref={emojiRef}>
                <button
                  disabled={isEmojiDisabled}
                  className={`
              p-2 rounded-full transition
              ${
                isEmojiDisabled
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-white/10"
              }
            `}
                  onClick={() => {
                    if (isEmojiDisabled) return;
                    setShowEmojiPicker(true);
                  }}
                >
                  <EmojiIcon className="w-5 h-5 md:w-6 md:h-6" fill="#fff" />
                </button>

                {/* 📱 Mobile Emoji Bottom Sheet */}
                {isMobile && showEmojiPicker && (
                  <div className="fixed inset-0 z-[999] flex items-end">
                    {/* backdrop */}
                    <div
                      className="absolute inset-0 bg-black/40"
                      onClick={() => setShowEmojiPicker(false)}
                    />

                    {/* sheet */}
                    <div
                      className="
                  relative w-full
                  bg-white/90 backdrop-blur-xl
                  rounded-t-3xl
                  p-4
                  animate-slide-up
                "
                    >
                      {/* drag bar */}
                      <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3" />

                      <EmojiPicker
                        onEmojiClick={(e) => {
                          handleEmojiClick(e);
                          setShowEmojiPicker(false);
                        }}
                        theme="light"
                        height={360}
                        width="100%"
                      />
                    </div>
                  </div>
                )}

                {!isMobile && showEmojiPicker && !isEmojiDisabled && (
                  <div
                    className="
                absolute bottom-14 left-0 z-50
                rounded-2xl
                bg-white/35 backdrop-blur-xl
                border border-white/20
                shadow-[0_12px_40px_rgba(0,0,0,0.25)]
                overflow-hidden
                animate-scale-in
              "
                  >
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      theme="auto"
                      SkinTones="neutral"
                      height={360}
                      width={350}
                      searchDisabled={false}
                    />
                  </div>
                )}
              </div>

              <textarea
                ref={textareaRef}
                value={input}
                rows={1}
                maxLength={3000}
                disabled={isAiTyping && roomType === "PRIVATE"}
                placeholder={inputPlaceholder}
                className="flex-1  rounded-xl px-2 py-2 text-sm md:text-base
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif"
                multiple
                hidden
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  await handleImageFiles(files);
                  e.target.value = "";
                }}
              />

              {isDragOver && (
                <div
                  className="
                absolute inset-0 z-50
                flex items-center justify-center
                pointer-events-none
              "
                >
                  {/* 전체 영역 반응 레이어 */}
                  <div
                    className="
                  absolute inset-0
                  border-5 border-dashed border-white/60
                  rounded-2xl
                  bg-white/40
                "
                  />

                  {/* 중앙 가이드 */}
                  <div className="flex items-center gap-4">
                    <ImageUploadIcon
                      className="w-12 h-12 text-white"
                      fill="white"
                    />

                    <div className="flex flex-col">
                      <p className="text-white text-[20px] font-semibold">
                        이미지 업로드
                      </p>
                      <p className="text-white/60 text-sm">
                        드래그해서 놓아주세요
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                disabled={isSendingImage}
                className="p-2 hover:bg-white/10 rounded-full disabled:opacity-40"
                onClick={() => {
                  if (!isSendingImageRef.current) fileInputRef.current?.click();
                }}
              >
                <ImageUploadIcon
                  className="w-5 h-5 md:w-6 md:h-6"
                  fill="#fff"
                />
              </button>

              {!isAiChat && (
                <button
                  className="p-2 hover:bg-white/10 rounded-full"
                  onClick={() => setShowScheduleModal(true)}
                >
                  <ScheduleIcon className="w-5 h-5 md:w-6 md:h-6" fill="#fff" />
                </button>
              )}

              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-white text-purple-700  font-semibold rounded-xl hover:bg-white/80 transition"
              >
                전송
              </button>
            </div>
          </div>
        </div>
        {/* RIGHT: 참여자 목록 */}
        {!isMobile && (
          <ParticipantSection
            open={showParticipants}
            participants={participants}
            onClose={closeParticipants}
          />
        )}
      </div>
      {isMobile && showParticipants && (
        <ParticipantBottomSheet
          participants={participants}
          onClose={closeParticipants}
        />
      )}

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

            // 🔥 왼쪽 채팅 리스트 즉시 반영
            useChatStore.getState().updateRoomMeta({
              roomType: "GROUP",
              roomId: activeRoom.gcrId,
              patch: {
                roomName: data.title,
              },
            });

            setShowEditModal(false);
          }}
        />
      </BlurModal>

      <BlurModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
      >
        <ReportForm onSubmit={handleSubmitReport} />
      </BlurModal>

      <CreateScheduleModal
        open={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        roomId={roomId}
        roomType={roomType}
      />
    </>
  );
}
