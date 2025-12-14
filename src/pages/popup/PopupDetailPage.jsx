import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePopupDetailPage from "../../hooks/usePopupDetailPage";
import PopupDetailTemplate from "../../components/popup/PopupDetailTemplate";
import PopupDetailPageActions from "../../components/popup/PopupDetailPageActions";
import PopupDetailBottomSection from "../../components/popup/PopupDetailBottomSection";
import Toast from "../../components/common/Toast";
import ShareModal from "../../components/popup/ShareModal";

import ChatRoomSelectModal from "../../components/popup/ChatRoomSelectModal";
import { useAuthStore } from "../../store/authStore";
import { useChatStore } from "../../store/chat/chatStore";
import { getGroupChatRoomDetail } from "../../api/chatApi";
import { publishPopupShare, connectStomp, isStompConnected } from "../../api/socket";

export default function PopupDetailPage() {
  const vm = usePopupDetailPage();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // 1. 공유 모달 상태 관리
  const [isShareOpen, setIsShareOpen] = useState(false);

  //채팅방 선택 모달 상태 관리
  const [isChatSelectOpen, setIsChatSelectOpen] = useState(false);

  //userId 안전 추출(스토어 구조가 userId / id 둘 중 무엇이든 대응)
  const userId = user?.userId ?? user?.id;

  //이 페이지에서 alert 대신 쓸 로컬 토스트
  const [localToastMessage, setLocalToastMessage] = useState("");
  const [localToastVariant, setLocalToastVariant] = useState("success");

  //Toast 액션용 상태
  const [localToastActionLabel, setLocalToastActionLabel] = useState("");
  const [localToastOnAction, setLocalToastOnAction] = useState(null);

  const toastTimerRef = useRef(null);

  //Toast helper: action/duration 지원
  const showToast = (message, variant = "success", options = {}) => {
    const { actionLabel = "", onAction = null, duration } = options || {};

    setLocalToastMessage(message);
    setLocalToastVariant(variant);
    setLocalToastActionLabel(actionLabel);
    setLocalToastOnAction(() => (typeof onAction === "function" ? onAction : null));

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    const ttl =
      typeof duration === "number"
        ? duration
        : actionLabel
        ? 5000
        : 2200;

    toastTimerRef.current = setTimeout(() => {
      setLocalToastMessage("");
      setLocalToastVariant("success");
      setLocalToastActionLabel("");
      setLocalToastOnAction(null);
    }, ttl);
  };

  //unmount 시 타이머 정리
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  //roomType/roomId 안전 추출(room 응답 키가 달라도 대응)
  const getRoomType = (room) => {
    const rt = room?.roomType ?? room?.type;
    if (rt === "GROUP_CHAT" || rt === "GROUPCHAT") return "GROUP";
    if (rt === "PRIVATE_CHAT" || rt === "PRIVATECHAT") return "PRIVATE";
    return rt; // "GROUP" | "PRIVATE" 기대
  };

  const getRoomId = (room) => {
    return room?.roomId ?? room?.gcrId ?? room?.pcrId ?? room?.id;
  };

  //해당 채팅방 열기 + /chat 이동
  const openRoomAndGoChat = async (normalizedRoom) => {
    try {
      const { selectRoom, fetchRooms } = useChatStore.getState();

      if (normalizedRoom.roomType === "GROUP") {
        try {
          const detail = await getGroupChatRoomDetail(normalizedRoom.roomId);
          selectRoom(detail);
        } catch (e) {
          console.warn("⚠️ 그룹 채팅방 상세 로드 실패, fallback으로 room 사용:", e);
          selectRoom(normalizedRoom);
        }
      } else {
        selectRoom(normalizedRoom);
      }

      //목록 갱신
      fetchRooms();

      navigate("/chat");
    } catch (e) {
      console.error("❌ 채팅방 열기 실패:", e);
      navigate("/chat");
    }
  };

  // 2. 모달 내부 버튼 핸들러들
  const handleCopyLink = () => {
    vm.handleShareClick();
    setIsShareOpen(false);
  };

  const handleKakaoShare = () => {
    vm.handleKakaoShare();
    setIsShareOpen(false);
  };

  //채팅 공유 버튼 클릭 시 동작
  const handleChatShare = () => {
    if (!userId) {
      showToast("로그인이 필요한 서비스입니다.", "error");
      return;
    }
    setIsShareOpen(false);
    setIsChatSelectOpen(true);
  };

  //채팅방 선택 완료 후 전송 로직
  const handleSelectRoom = async (room) => {
    if (!vm.popup) return;

    const roomType = getRoomType(room);
    const roomId = getRoomId(room);

    if (!roomType || !roomId) {
      console.warn("⚠️ 채팅방 정보가 불완전합니다:", room);
      showToast("채팅방 정보를 불러오지 못해 공유할 수 없습니다.", "error");
      return;
    }

    //전송 전에 STOMP 연결 보장
    try {
      if (!isStompConnected()) {
        await connectStomp();
      }
    } catch (e) {
      console.error("❌ STOMP 연결 실패:", e);
      showToast("채팅 연결에 실패해서 공유할 수 없습니다.", "error");
      return;
    }

    //공유할 데이터 구성
    const popupData = {
      popId: vm.popup.popId ?? vm.popup.id,
      popName: vm.popup.popName ?? vm.popup.name,
      popThumbnail: vm.popup.popThumbnail ?? vm.popup.thumbnailUrl ?? vm.popup.thumbnail,
      popLocation: vm.popup.popLocation ?? vm.popup.location,
    };

    if (!popupData.popId) {
      console.warn("⚠️ popId가 없어 팝업 공유를 중단합니다:", vm.popup);
      showToast("팝업 정보가 올바르지 않아 공유할 수 없습니다.", "error");
      return;
    }

    //소켓으로 전송
    publishPopupShare(roomType, roomId, userId, popupData);

    setIsChatSelectOpen(false);

    //성공 토스트 + [채팅으로 이동] 액션
    const normalizedRoom = { ...room, roomType, roomId };

    showToast("팝업을 공유했어요 📤", "success", {
      actionLabel: "채팅으로 이동",
      onAction: () => {
        // 토스트 즉시 닫기(선택)
        setLocalToastMessage("");
        setLocalToastVariant("success");
        setLocalToastActionLabel("");
        setLocalToastOnAction(null);

        void openRoomAndGoChat(normalizedRoom);
      },
      duration: 5000,
    });
  };

  const actions = vm.popup && (
    <PopupDetailPageActions
      isLiked={vm.popup.isLiked}
      wishlistLoading={vm.wishlistLoading}
      onToggleWishlist={vm.handleToggleWishlist}
      homepageUrl={vm.popup.popInstaUrl}
      hasReservation={vm.hasReservation}
      reservationLabel={vm.reservationLabel}
      reservationDisabled={vm.reservationDisabled}
      onReservationClick={vm.handleReservationClick}
      onShareClick={() => setIsShareOpen(true)}
      userRole={vm.userRole}
    />
  );

  const bottomSection = vm.popup && (
    <PopupDetailBottomSection
      activeTab={vm.activeTab}
      onChangeTab={vm.setActiveTab}
      descriptionParagraphs={vm.descriptionParagraphs}
      images={vm.popup.images}
      location={vm.popup.popLocation}
      popName={vm.popup.popName}
      isLoggedIn={vm.isLoggedIn}
      chatRooms={vm.chatRooms}
      chatLoading={vm.chatLoading}
      onJoinChatRoom={vm.handleJoinChatRoom}
    />
  );

  //vm 토스트 + 로컬 토스트 병합(로컬 우선)
  const mergedToastMessage = localToastMessage || vm.toastMessage;
  const mergedToastVariant = localToastMessage ? localToastVariant : vm.toastVariant;

  return (
    <>
      <PopupDetailTemplate {...vm} actions={actions} bottomSection={bottomSection} />

      <Toast
        message={mergedToastMessage}
        visible={!!mergedToastMessage}
        variant={mergedToastVariant}
        actionLabel={localToastMessage ? localToastActionLabel : undefined}
        onAction={localToastMessage ? localToastOnAction : undefined}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onCopyLink={handleCopyLink}
        onKakaoShare={handleKakaoShare}
        onChatShare={handleChatShare}
      />

      <ChatRoomSelectModal
        isOpen={isChatSelectOpen}
        onClose={() => setIsChatSelectOpen(false)}
        onSelectRoom={handleSelectRoom}
      />
    </>
  );
}
