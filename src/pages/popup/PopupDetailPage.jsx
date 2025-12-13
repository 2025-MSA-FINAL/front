import { useState } from "react";
import usePopupDetailPage from "../../hooks/usePopupDetailPage";
import PopupDetailTemplate from "../../components/popup/PopupDetailTemplate";
import PopupDetailPageActions from "../../components/popup/PopupDetailPageActions";
import PopupDetailBottomSection from "../../components/popup/PopupDetailBottomSection";
import Toast from "../../components/common/Toast";
import ShareModal from "../../components/popup/ShareModal";

export default function PopupDetailPage() {
  const vm = usePopupDetailPage();

  // 1. 공유 모달 상태 관리
  const [isShareOpen, setIsShareOpen] = useState(false);

  // 2. 모달 내부 버튼 핸들러들
  const handleCopyLink = () => {
    vm.handleShareClick(); //훅에 있던 링크 복사 기능 호출
    setIsShareOpen(false); //모달 닫기
  };

  const handleKakaoShare = () => {
    vm.handleKakaoShare(); //공유 함수 호출
    setIsShareOpen(false); //모달 닫기
  };

  const handleChatShare = () => {
    alert("채팅 공유 기능 추가할 예정 💬");
    // 여기에 나중에 채팅 로직 연결
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

      {/* 공유 모달 배치 */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onCopyLink={handleCopyLink}
        onKakaoShare={handleKakaoShare}
        onChatShare={handleChatShare}
      />
    </>
  );
}