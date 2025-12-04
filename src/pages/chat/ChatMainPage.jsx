import logo from "../../assets/logo.png";

import MyChatRoomSection from "../../components/chat/leftColumn/MyChatRoomSection";
import ChatSearchBar from "../../components/chat/middleColumn/ChatSearchBar";
import PopupRoomSection from "../../components/chat/middleColumn/PopupRoomSection";
import GroupChatRoomListSection from "../../components/chat/middleColumn/GroupChatRoomListSection";
import GroupRoomDetailSection from "../../components/chat/rightColumn/GroupRoomDetailSection";
import GroupRoomCreateForm from "../../components/chat/rightColumn/GroupRoomCreateForm";
import ChatConversationSection from "../../components/chat/rightColumn/ChatConversationSection";

import ChatUserInfo from "../../components/chat/RightColumn/ChatUserInfo";
import MessageChatSection from "../../components/chat/rightColumn/MessageChatSection";

import { useChatStore } from "../../store/chat/chatStore";
import { useChatPopupStore } from "../../store/chat/chatPopupStore";

export default function ChatMainPage() {
  const { activeChatRoom } = useChatStore();
  const { selectedPopup, selectedGroupRoom, createMode } = useChatPopupStore();

  return (
    <div className="w-full h-screen flex p-5 gap-5">
      {/* LEFT COLUMN */}
      <div className="w-[5%] min-w-[140px] h-full flex flex-col items-center">
        {/* 상단 로고 */}
        <div className="h-[60px] flex items-center justify-center">
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
          <ChatSearchBar />
        </div>

        {/* 팝업 리스트 or 그룹채팅방 리스트 */}
        <div className="flex-1 min-h-0 w-full mt-4">
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
        <div className="flex-1 min-h-0 w-full bg-paper shadow-card border-white border-5 rounded-2xl">
          {createMode ? (
            <GroupRoomCreateForm />
          ) : activeChatRoom ? (
            <MessageChatSection room={activeChatRoom} />
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
