import logo from "../../assets/logo.png";
import MyChatRoomSection from "../../components/chat/leftColumn/MyChatRoomSection";
import ChatSearchBar from "../../components/chat/middleColumn/ChatSearchBar";
import PopupRoomSection from "../../components/chat/middleColumn/PopupRoomSection";
import ChatConversationSection from "../../components/chat/rightColumn/ChatConversationSection";

import ChatUserInfo from "../../components/chat/RightColumn/ChatUserInfo";

export default function ChatMainPage() {
  return (
    <div className="w-full h-screen flex p-5 gap-5">
      {/* LEFT COLUMN */}
      <div className="w-[10%] min-w-[140px] h-full flex flex-col items-center">
        {/* 상단 로고 - 고정 높이 */}
        <div className="h-[60px] flex items-center justify-center">
          <img
            src={logo}
            alt="Popspot Logo"
            className="w-[100px] md:w-[120px] h-[33px] object-contain cursor-pointer"
            onClick={() => (window.location.href = "/")}
          />
        </div>

        {/* 아래 영역 */}
        <div className="flex-1 min-h-0 w-full flex justify-center mt-4">
          <MyChatRoomSection />
        </div>
      </div>

      {/* MIDDLE COLUMN */}
      <div className="w-[20%] min-w-[260px] h-full flex flex-col">
        {/* 상단 SearchBar - 고정 높이 */}
        <div className="h-[60px] flex items-center">
          <ChatSearchBar />
        </div>

        {/* 아래 영역 */}
        <div className="flex-1 min-h-0 w-full mt-4 ">
          <PopupRoomSection />
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="w-[70%] min-w-[500px] h-full flex flex-col">
        {/* 상단 UserInfo - 고정 높이 */}
        <div className="h-[60px] flex items-center justify-end mt-4">
          <ChatUserInfo />
        </div>

        {/* 아래 영역 */}
        <div className="flex-1 min-h-0 w-full bg-paper shadow-card  border-primary-light border-3 rounded-2xl ">
          <ChatConversationSection />
        </div>
      </div>
    </div>
  );
}
