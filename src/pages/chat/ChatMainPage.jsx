import { useState, useEffect } from "react";

import logo from "../../assets/WhiteLogo.png";
import debounce from "../../utils/debounce";

import MyChatRoomSection from "../../components/chat/leftColumn/MyChatRoomSection";
import ChatSearchBar from "../../components/chat/middleColumn/ChatSearchBar";
import PopupRoomSection from "../../components/chat/middleColumn/PopupRoomSection";
import GroupChatRoomListSection from "../../components/chat/middleColumn/GroupChatRoomListSection";
import GroupRoomDetailSection from "../../components/chat/rightColumn/GroupRoomDetailSection";
import GroupRoomCreateForm from "../../components/chat/rightColumn/GroupRoomCreateForm";
import ChatConversationSection from "../../components/chat/rightColumn/ChatConversationSection";
import ChatUserInfo from "../../components/chat/rightColumn/ChatUserInfo";
import MessageChatSection from "../../components/chat/rightColumn/MessageChatSection";

import { useChatStore } from "../../store/chat/chatStore";
import { useChatPopupStore } from "../../store/chat/chatPopupStore";

export default function ChatMainPage() {
  const { activeChatRoom } = useChatStore();
  const {
    selectedPopup,
    selectedGroupRoom,
    createMode,
    fetchPopups,
    resetPopup,
  } = useChatPopupStore();

  const [keyword, setKeyword] = useState("");

  const debouncedSearch = debounce((value) => {
    resetPopup();
    fetchPopups(value);
  }, 400); // 0.4초 뒤 자동 검색

  useEffect(() => {
    debouncedSearch(keyword);
  }, [keyword]);

  console.log("[ChatMainPage] activeChatRoom >>>", activeChatRoom);
  return (
    <div className="w-full h-screen bg-primary-dark flex p-5 gap-5">
      {/* LEFT COLUMN */}
      <div className="w-[5%] min-w-[140px] h-full flex flex-col items-center">
        {/* 상단 로고 */}
        <div className="h-[60px] flex items-center">
          <img
            src={logo}
            alt="Popspot Logo"
            className="w-[100px] md:w-[120px] h-[33px] object-contain cursor-pointer"
            onClick={() => (window.location.href = "/")}
          />
        </div>

        {/* 채팅방 목록 */}
        <div className="flex-1 min-h-0 w-full flex justify-center mt-4">
          <MyChatRoomSection />
        </div>
      </div>

      {/* MIDDLE COLUMN */}
      <div className="w-[20%] min-w-[260px] h-full flex flex-col">
        {/* Search Bar */}
        <div className="h-[60px] flex items-center">
          <ChatSearchBar
            keyword={keyword}
            setKeyword={setKeyword}
            onSearch={() => debouncedSearch(keyword)} // 버튼 눌러도 검색되게
          />
        </div>

        {/* 팝업 리스트 or 그룹채팅방 리스트 */}
        <div className="flex-1 min-h-0 w-full mt-4 ">
          {selectedPopup ? <GroupChatRoomListSection /> : <PopupRoomSection />}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="w-[75%] min-w-[500px] h-full flex flex-col">
        {/* User Info */}
        <div className="h-[60px] flex items-center justify-end mt-4">
          <ChatUserInfo />
        </div>

        {/* 채팅창 */}
        <div className="flex-1 min-h-0 w-full shadow-card rounded-2xl bg-white/10 backdrop-blur-xl border border-primary-light">
          {createMode ? (
            <GroupRoomCreateForm />
          ) : activeChatRoom ? (
            <MessageChatSection
              roomId={activeChatRoom.gcrId ?? activeChatRoom.roomId}
              roomType={activeChatRoom.roomType}
            />
          ) : selectedGroupRoom ? (
            <GroupRoomDetailSection room={selectedGroupRoom} />
          ) : (
            <ChatConversationSection />
          )}
        </div>
      </div>
    </div>
  );
}
