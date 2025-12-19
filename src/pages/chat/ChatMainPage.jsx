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

  return (
    <div
      className="
      w-full h-dvh
      bg-primary-dark
      flex flex-col lg:flex-row
      p-3 lg:p-5 gap-3 lg:gap-5
      "
    >
      {/* LEFT COLUMN — 모바일 숨김 */}
      <div
        className="
          hidden lg:flex
          w-[5%] min-w-[140px]
          h-full flex-col items-center
        "
      >
        <div className="h-[60px] flex items-center">
          <img
            src={logo}
            alt="Popspot Logo"
            className="w-[100px] xl:w-[120px] h-[33px] object-contain cursor-pointer"
            onClick={() => (window.location.href = "/")}
          />
        </div>

        <div className="flex-1 min-h-0 w-full flex justify-center mt-4">
          <MyChatRoomSection />
        </div>
      </div>

      {/* MIDDLE COLUMN */}
      <div
        className="
          w-full lg:w-[20%]
          min-w-0 lg:min-w-[260px]
          h-full flex flex-col
        "
      >
        <div className="h-[60px] flex items-center">
          <ChatSearchBar
            keyword={keyword}
            setKeyword={setKeyword}
            onSearch={() => debouncedSearch(keyword)}
          />
        </div>

        <div className="flex-1 min-h-0 w-full mt-3">
          {selectedPopup ? <GroupChatRoomListSection /> : <PopupRoomSection />}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div
        className={`
          w-full lg:w-[75%]
          min-w-0 lg:min-w-[500px]
            min-h-0 flex flex-col
          ${
            activeChatRoom || selectedGroupRoom || createMode
              ? "flex"
              : "hidden lg:flex"
          }
        `}
      >
        <div className="h-[60px] shrink-0 flex items-center justify-end mt-2 lg:mt-4">
          <ChatUserInfo />
        </div>

        <div
          className="
          flex-1 min-h-0 w-full
          shadow-card rounded-2xl
          bg-white/10 backdrop-blur-xl
          border border-primary-light overflow-hidden
          "
        >
          {createMode ? (
            <GroupRoomCreateForm />
          ) : activeChatRoom ? (
            <MessageChatSection />
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
