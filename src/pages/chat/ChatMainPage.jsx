import { useState, useEffect } from "react";

import logo from "../../assets/WhiteLogo.png";
import debounce from "../../utils/debounce";
import BackArrowIcon from "../../components/chat/icons/BackArrowIcon";

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
  /* ======================================================
     📱 Device / Width Detection
  ====================================================== */
  const [isMobile, setIsMobile] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const check = () => {
      const width = window.innerWidth;

      // ✅ 실제 모바일(터치 디바이스)
      const mobile = window.matchMedia("(pointer: coarse)").matches;

      setIsMobile(mobile);
      setIsCompact(width < 768);
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ======================================================
     🌐 Global States
  ====================================================== */
  const { activeChatRoom, setActiveChatRoom } = useChatStore();
  const {
    selectedPopup,
    selectedGroupRoom,
    createMode,
    closeCreateForm,
    fetchPopups,
    resetPopup,
  } = useChatPopupStore();

  /* ======================================================
     🔍 Search
  ====================================================== */
  const [keyword, setKeyword] = useState("");

  const debouncedSearch = debounce((value) => {
    resetPopup();
    fetchPopups(value);
  }, 400);

  useEffect(() => {
    debouncedSearch(keyword);
  }, [keyword]);

  /* ======================================================
     📱 Mobile View State (공통)
  ====================================================== */
  const mobileView = createMode
    ? "CREATE"
    : activeChatRoom
    ? "CHAT"
    : selectedGroupRoom
    ? "DETAIL"
    : selectedPopup
    ? "ROOM_LIST"
    : "POPUP_LIST";

  /* ======================================================
     👉 Swipe Back (모바일만)
  ====================================================== */
  useEffect(() => {
    if (!isMobile) return;

    let startX = null;

    const onTouchStart = (e) => {
      startX = e.touches[0].clientX;
    };

    const onTouchEnd = (e) => {
      if (startX == null) return;

      const diff = e.changedTouches[0].clientX - startX;

      if (diff > 80) {
        if (!activeChatRoom && selectedPopup) {
          resetPopup();
        }
      }

      startX = null;
    };

    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isMobile, activeChatRoom, selectedPopup, setActiveChatRoom, resetPopup]);

  /* ======================================================
     👉 BackArrow 표시 조건 (데스크탑 + 좁은 화면)
  ====================================================== */
  const showBackArrow =
    isCompact &&
    !isMobile &&
    (createMode || activeChatRoom || selectedGroupRoom);

  /* ======================================================
     🖥 Desktop (width ≥ 768)
  ====================================================== */
  if (!isCompact && !isMobile) {
    return (
      <div className="w-full h-screen bg-primary-dark flex p-5 gap-5">
        {/* LEFT */}
        <div className="w-[5%] min-w-[140px] h-full flex flex-col items-center">
          <div className="h-[60px] flex items-center">
            <img
              src={logo}
              alt="Popspot Logo"
              className="w-[100px] md:w-[120px] h-[33px] object-contain cursor-pointer"
              onClick={() => (window.location.href = "/")}
            />
          </div>

          <div className="flex-1 min-h-0 w-full flex justify-center mt-4">
            <MyChatRoomSection />
          </div>
        </div>

        {/* MIDDLE */}
        <div className="w-[20%] min-w-[260px] h-full flex flex-col">
          <div className="h-[60px] flex items-center">
            <ChatSearchBar
              keyword={keyword}
              setKeyword={setKeyword}
              onSearch={() => debouncedSearch(keyword)}
            />
          </div>

          <div className="flex-1 min-h-0 w-full mt-4">
            {selectedPopup ? (
              <GroupChatRoomListSection />
            ) : (
              <PopupRoomSection />
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-[75%] min-w-[500px] h-full flex flex-col">
          <div className="h-[60px] flex items-center justify-end mt-4">
            <ChatUserInfo />
          </div>

          <div className="flex-1 min-h-0 w-full shadow-card rounded-2xl bg-white/10 backdrop-blur-xl border border-primary-light">
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

  /* ======================================================
     📱 Mobile UI + Desktop Compact UI (동일 레이아웃)
  ====================================================== */
  return (
    <div className="w-full h-dvh bg-primary-dark flex flex-col p-3">
      {/* HEADER */}
      <div className="h-[60px] flex items-center justify-between">
        {showBackArrow && (
          <button
            onClick={() => {
              if (createMode) {
                closeCreateForm();
              } else {
                setActiveChatRoom(null);

                const { clearSelectedGroupRoom } = useChatPopupStore.getState();
                clearSelectedGroupRoom?.();
              }
            }}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <BackArrowIcon className="w-5 h-5 text-white" />
          </button>
        )}
        <ChatUserInfo />
      </div>

      {/* POPUP LIST */}
      {mobileView === "POPUP_LIST" && (
        <>
          <ChatSearchBar
            keyword={keyword}
            setKeyword={setKeyword}
            onSearch={() => debouncedSearch(keyword)}
          />
          <div className="mt-3 flex-1 min-h-0">
            <PopupRoomSection />
          </div>
        </>
      )}

      {/* ROOM LIST */}
      {mobileView === "ROOM_LIST" && (
        <div className="flex-1 min-h-0">
          <GroupChatRoomListSection />
        </div>
      )}

      {/* CHAT */}
      {mobileView === "CHAT" && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 shadow-card rounded-2xl bg-white/10 backdrop-blur-xl border border-primary-light">
            <MessageChatSection />
          </div>
        </div>
      )}

      {/* DETAIL */}
      {mobileView === "DETAIL" && (
        <div className="flex-1 min-h-0 shadow-card rounded-2xl bg-white/10 backdrop-blur-xl border border-primary-light">
          <GroupRoomDetailSection room={selectedGroupRoom} />
        </div>
      )}

      {/* CREATE */}
      {mobileView === "CREATE" && (
        <div className="flex-1 min-h-0 shadow-card rounded-2xl bg-white/10 backdrop-blur-xl border border-primary-light">
          <GroupRoomCreateForm />
        </div>
      )}
    </div>
  );
}
