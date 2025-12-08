import { useEffect, useState, useRef } from "react";
import { connectStomp, getStompClient } from "../../../api/socket";
import { useAuthStore } from "../../../store/authStore";
import axios from "axios";

// === createdAt → 시간/분만 추출 ===
const extractHourMinute = (str) => {
  if (!str) return null;
  const [ampm, hm] = str.split(" ");
  const [h, m] = hm.split(":");

  let hour = Number(h);
  if (ampm === "오후" && hour !== 12) hour += 12;
  if (ampm === "오전" && hour === 12) hour = 0;

  return `${hour}:${m}`;
};

export default function MessageChatSection({ roomId, roomType }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const subRef = useRef(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  // 한글 입력 중 여부 확인용
  const isComposingRef = useRef(false);

  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.userId;

  // === 스크롤 맨 아래로 ===
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // === textarea 자동 높이 조절 ===
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  // === 메시지 불러오기 ===
  const fetchMessages = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/chat/messages", {
        params: { roomId, roomType, limit: 60 },
        withCredentials: true,
      });
      setMessages(res.data.reverse());
    } catch (err) {
      console.error("❌ fetchMessages 실패:", err);
    }
  };

  // === WebSocket 수신 ===
  const onMessageReceived = (msg) => {
    const body = JSON.parse(msg.body);
    setMessages((prev) => [...prev, body]);
  };

  // === 메시지 전송 ===
  const sendMessage = () => {
    if (!input.trim()) return;
    const client = getStompClient();
    if (!client || !client.connected) return;

    const payload = {
      roomId,
      roomType,
      content: input,
      senderId: currentUserId,
      messageType: "TEXT",
    };

    client.publish({
      destination: "/pub/chat/message",
      body: JSON.stringify(payload),
    });

    setInput("");

    // 전송 후 즉시 스크롤 내려가기
    setTimeout(scrollToBottom, 30);
  };

  // === 방 변경 시 초기화 + 구독 ===
  useEffect(() => {
    if (!roomId || !roomType) return;

    setMessages([]);
    fetchMessages();

    const setup = async () => {
      await connectStomp();
      const client = getStompClient();
      if (!client.connected) return;

      const topic = `/sub/chat-room-${roomType}-${roomId}`;
      if (subRef.current) subRef.current.unsubscribe();

      subRef.current = client.subscribe(topic, onMessageReceived);
    };

    setup();
    return () => subRef.current?.unsubscribe();
  }, [roomId, roomType]);

  return (
    <div className="w-full h-full flex flex-col justify-between px-8 py-6">
      {/* === 메시지 리스트 === */}
      <div
        className="flex flex-col gap-6 overflow-y-auto no-scrollbar"
        ref={scrollRef}
      >
        {/* 스크롤바 숨기기 위한 Tailwind 커스텀 */}
        <style>
          {`
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `}
        </style>

        {messages.map((msg, i) => {
          const prev = messages[i - 1];

          const isMine = msg.senderId === currentUserId;

          const isSameSender = prev?.senderId === msg.senderId;
          const isSameMinute =
            extractHourMinute(prev?.createdAt) ===
            extractHourMinute(msg.createdAt);

          const isGrouped = isSameSender && isSameMinute;

          return (
            <div key={i} className="w-full">
              <div
                className={`flex ${
                  isMine ? "justify-end" : "justify-start"
                } w-full`}
              >
                <div className="flex flex-col max-w-[75%]">
                  {!isGrouped && (
                    <div
                      className={`flex items-center gap-3 ${
                        isMine ? "flex-row-reverse" : ""
                      }`}
                    >
                      {!isMine && (
                        <img
                          src={msg.senderProfileUrl}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}

                      <div
                        className={`flex flex-col ${
                          isMine ? "items-end" : "items-start"
                        }`}
                      >
                        {!isMine && (
                          <span className="text-white text-[15px] font-semibold">
                            {msg.senderNickname}
                          </span>
                        )}
                        <span className="text-white/60 text-xs">
                          {msg.createdAt}
                        </span>
                      </div>
                    </div>
                  )}

                  <div
                    className={`mt-2 text-[16px] leading-relaxed whitespace-pre-line ${
                      isMine
                        ? "text-white font-medium text-right"
                        : "text-white/90"
                    } ${isGrouped ? "mt-1" : ""}`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* === 입력창 === */}
      <div className="flex items-end gap-3 border-t border-white/20 pt-4 mt-4">
        <textarea
          ref={textareaRef}
          value={input}
          rows={1}
          onCompositionStart={() => (isComposingRef.current = true)}
          onCompositionEnd={() => (isComposingRef.current = false)}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요…"
          className="flex-1 bg-white/10 border border-white/30 rounded-xl px-4 py-2 text-white placeholder:text-white/60 resize-none overflow-hidden focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (e.shiftKey) return; // Shift+Enter 줄바꿈

              if (isComposingRef.current) return; // ⛔ 한글 조합 중에는 전송 금지

              e.preventDefault();
              sendMessage();
            }
          }}
        />

        <button
          onClick={sendMessage}
          className="px-5 py-2 bg-white/90 hover:bg-white text-purple-600 font-semibold rounded-xl"
        >
          전송
        </button>
      </div>
    </div>
  );
}
