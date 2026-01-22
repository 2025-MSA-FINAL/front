import { useState } from "react";
import usePopupDetailPage from "../../hooks/usePopupDetailPage";
import PopupDetailTemplate from "../../components/popup/PopupDetailTemplate";
import PopupDetailPageActions from "../../components/popup/PopupDetailPageActions";
import PopupDetailBottomSection from "../../components/popup/PopupDetailBottomSection";
import Toast from "../../components/common/Toast";
import ShareModal from "../../components/popup/ShareModal";

import ChatRoomSelectModal from "../../components/popup/ChatRoomSelectModal";

export default function PopupDetailPage() {
  const vm = usePopupDetailPage();

  //공유 모달 상태 관리
  const [isShareOpen, setIsShareOpen] = useState(false);

  //채팅방 선택 모달 상태 관리
  const [isChatSelectOpen, setIsChatSelectOpen] = useState(false);

  //모달 내부 버튼 핸들러들
  const handleCopyLink = () => {
    vm.handleShareClick();
    setIsShareOpen(false);
  };

  const handleKakaoShare = () => {
    vm.handleKakaoShare();
    setIsShareOpen(false);
  };

  const handleChatShare = () => {
    if (!vm.isLoggedIn) {
      vm.showToast("로그인이 필요한 서비스입니다.", "error");
      return;
    }
    setIsShareOpen(false);
    setIsChatSelectOpen(true);
  };

  //채팅방 선택 완료 후 전송 로직
  const handleSelectRoom = async (room) => {
    const ok = await vm.sharePopupToChatRoom(room);
    if (ok) setIsChatSelectOpen(false);
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
      <PopupDetailTemplate {...vm} actions={actions} bottomSection={bottomSection} />

      {/* 토스트 컴포넌트 (훅이 단일 관리) */}
      <Toast
        message={vm.toastMessage}
        visible={!!vm.toastMessage}
        variant={vm.toastVariant}
        actionLabel={vm.toastActionLabel || undefined}
        onAction={vm.toastOnAction || undefined}
      />

      {/* 공유 메뉴 모달(링크/카카오/채팅 선택) */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onCopyLink={handleCopyLink}
        onKakaoShare={handleKakaoShare}
        onChatShare={handleChatShare}
      />

      {/* 채팅방 선택 모달 */}
      <ChatRoomSelectModal
        isOpen={isChatSelectOpen}
        onClose={() => setIsChatSelectOpen(false)}
        onSelectRoom={handleSelectRoom}
      />
    </>
  );
}
