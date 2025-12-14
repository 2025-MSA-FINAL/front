import { useState } from "react";
import usePopupDetailPage from "../../hooks/usePopupDetailPage";
import PopupDetailTemplate from "../../components/popup/PopupDetailTemplate";
import PopupDetailPageActions from "../../components/popup/PopupDetailPageActions";
import PopupDetailBottomSection from "../../components/popup/PopupDetailBottomSection";
import Toast from "../../components/common/Toast";
import ShareModal from "../../components/popup/ShareModal";

import ChatRoomSelectModal from "../../components/popup/ChatRoomSelectModal";
import { useAuthStore } from "../../store/authStore";
import { publishPopupShare, connectStomp, isStompConnected } from "../../api/socket"; 

export default function PopupDetailPage() {
  const vm = usePopupDetailPage();
  const { user } = useAuthStore();

  // 1. 공유 모달 상태 관리
  const [isShareOpen, setIsShareOpen] = useState(false);

  //채팅방 선택 모달 상태 관리
  const [isChatSelectOpen, setIsChatSelectOpen] = useState(false);

  //userId 안전 추출(스토어 구조가 userId / id 둘 중 무엇이든 대응)
  const userId = user?.userId ?? user?.id;

  //roomType/roomId 안전 추출(room 응답 키가 달라도 대응)
  const getRoomType = (room) => {
    const rt = room?.roomType ?? room?.type;
    if (rt === "GROUP_CHAT" || rt === "GROUPCHAT") return "GROUP";
    if (rt === "PRIVATE_CHAT" || rt === "PRIVATECHAT") return "PRIVATE";
    return rt;
  };

  const getRoomId = (room) => {
    return room?.roomId ?? room?.gcrId ?? room?.pcrId ?? room?.id;
  };

  // 2. 모달 내부 버튼 핸들러들
  const handleCopyLink = () => {
    vm.handleShareClick(); //훅에 있던 링크 복사 기능 호출
    setIsShareOpen(false); //모달 닫기
  };

  const handleKakaoShare = () => {
    vm.handleKakaoShare(); //공유 함수 호출
    setIsShareOpen(false); //모달 닫기
  };

  //채팅 공유 버튼 클릭 시 동작
  const handleChatShare = () => {
    //user 존재뿐 아니라 userId까지 체크
    if (!userId) {
      alert("로그인이 필요한 서비스입니다.");
      return;
    }
    setIsShareOpen(false);     // 1. 기존 공유 모달 닫고
    setIsChatSelectOpen(true); // 2. 채팅방 선택 모달 열기
  };

  //채팅방 선택 완료 후 전송 로직 
  const handleSelectRoom = async (room) => {
    if (!vm.popup) return;

    //roomType/roomId 안전 추출
    const roomType = getRoomType(room);
    const roomId = getRoomId(room);

    //방 정보가 부족하면 전송 중단
    if (!roomType || !roomId) {
      console.warn("⚠️ 채팅방 정보가 불완전합니다:", room);
      alert("채팅방 정보를 불러오지 못해 공유할 수 없습니다.");
      return;
    }

    //전송 전에 STOMP 연결 보장
    try {
      if (!isStompConnected()) {
        await connectStomp();
      }
    } catch (e) {
      console.error("❌ STOMP 연결 실패:", e);
      alert("채팅 연결에 실패해서 공유할 수 없습니다.");
      return;
    }

    // 공유할 데이터 구성
    const popupData = {
      popId: vm.popup.popId ?? vm.popup.id,
      popName: vm.popup.popName ?? vm.popup.name,
      popThumbnail: vm.popup.popThumbnail ?? vm.popup.thumbnailUrl ?? vm.popup.thumbnail,
      popLocation: vm.popup.popLocation ?? vm.popup.location,
    };

    if (!popupData.popId) {
      console.warn("⚠️ popId가 없어 팝업 공유를 중단합니다:", vm.popup);
      alert("팝업 정보가 올바르지 않아 공유할 수 없습니다.");
      return;
    }

    //소켓으로 전송
    publishPopupShare(roomType, roomId, userId, popupData);

    setIsChatSelectOpen(false);
    alert(`${room.roomName || "채팅방"}에 팝업을 공유했습니다! 📤`);
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

  return (
    <>
      <PopupDetailTemplate
        {...vm}
        actions={actions}
        bottomSection={bottomSection}
      />

      {/* 토스트 컴포넌트 */}
      <Toast
        message={vm.toastMessage}
        visible={!!vm.toastMessage}
        variant={vm.toastVariant}
      />

      {/* 1. 공유 메뉴 모달(링크/카카오/채팅 선택) */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onCopyLink={handleCopyLink}
        onKakaoShare={handleKakaoShare}
        onChatShare={handleChatShare}
      />

      {/* 2. 채팅방 선택 모달 */}
      <ChatRoomSelectModal
        isOpen={isChatSelectOpen}
        onClose={() => setIsChatSelectOpen(false)}
        onSelectRoom={handleSelectRoom}
      />
    </>
  );
}
