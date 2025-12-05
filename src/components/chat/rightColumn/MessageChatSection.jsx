// 잠시 만들어준 디자인

import { useEffect, useRef } from "react";
import MoreIcon from "../icons/MoreIcon";

export default function MessageChatSection({ room }) {
  const messagesEndRef = useRef(null);

  // 메시지 불러오는 API가 있다면 여기서 fetch
  // const { fetchMessages } = useChatMessageStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="flex flex-col w-full h-full">
      {/* ----------------------------- */}
      {/* 🔥 HEADER (방 제목 / 참여자 수 / 옵션) */}
      {/* ----------------------------- */}
      <div className="px-6 h-[60px] min-h-[60px] flex items-center justify-between border-b border-gray-200">
        <div>
          <h2 className="font-bold text-[18px] text-gray-900">{room.title}</h2>
          <p className="text-sm text-gray-500">
            {room.currentUserCnt}명 참여중
          </p>
        </div>

        <button>
          <MoreIcon className="w-6 h-6 text-gray-500" />
        </button>
      </div>

      {/* ----------------------------- */}
      {/* 🔥 공지 영역 */}
      {/* ----------------------------- */}
      <div className="px-6 py-3 bg-[#faf5ff] text-[#7e4cff] text-sm border-b border-purple-200">
        들어오시면 자기소개 먼저 부탁드립니다. 안하시면 강퇴
      </div>

      {/* ----------------------------- */}
      {/* 🔥 메시지 영역 */}
      {/* ----------------------------- */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-10">
        {/* 날짜 라벨 */}
        <div className="flex justify-center">
          <div className="text-xs text-gray-500 bg-gray-100 px-4 py-1 rounded-full">
            2025년 11월 21일 금요일
          </div>
        </div>

        {/* ---------------- 메시지 1 ---------------- */}
        <MessageItem
          name="희정"
          time="오전 10:40"
          avatar="https://i.pravatar.cc/300?img=1"
          text="오늘 술마시러 갈건데 빠지면 죽음."
        />

        {/* ---------------- 메시지 2 ---------------- */}
        <MessageItem
          name="재건"
          time="오전 11:40"
          avatar="https://i.pravatar.cc/300?img=8"
          text="저는 오늘 스파이 패밀리 본방 사수 해야합니다만?"
        />

        {/* ---------------- 메시지 3 ---------------- */}
        <MessageItem
          name="기현"
          time="오전 11:42"
          avatar="https://i.pravatar.cc/300?img=32"
          text="스파이 패밀리 재밌나요? 소고기 시켜도 되나요?"
        />

        <div ref={messagesEndRef}></div>
      </div>

      {/* ----------------------------- */}
      {/* 🔥 입력창 */}
      {/* ----------------------------- */}
      <div className="h-[90px] min-h-[90px] border-t border-gray-200 p-4 flex items-center gap-3">
        {/* 이모지 버튼 */}
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
          😊
        </button>

        {/* 입력 박스 */}
        <input
          type="text"
          className="
            flex-1 p-3 rounded-xl border border-gray-300 
            bg-white text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-purple-400
          "
          placeholder="메시지를 입력하세요"
        />

        {/* 이미지 업로드 */}
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
          📷
        </button>

        {/* 보내기 버튼 */}
        <button
          className="
            px-5 py-2 bg-purple-500 rounded-xl text-white font-semibold
            hover:bg-purple-600 transition
          "
        >
          전송
        </button>
      </div>
    </div>
  );
}

/* ----------------------------- */
/* 🔥 메시지 아이템 컴포넌트 */
/* ----------------------------- */
function MessageItem({ name, time, avatar, text }) {
  return (
    <div className="flex items-start gap-3">
      {/* 프로필 이미지 */}
      <img src={avatar} className="w-10 h-10 rounded-full object-cover" />

      <div className="flex flex-col">
        {/* 닉네임 + 시간 */}
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900">{name}</p>
          <span className="text-xs text-gray-500">{time}</span>
        </div>

        {/* 말풍선 */}
        <div
          className="
            mt-1 p-3 max-w-[600px]
            bg-gray-100 rounded-2xl text-gray-900 
            leading-relaxed
          "
        >
          {text}
        </div>
      </div>
    </div>
  );
}
