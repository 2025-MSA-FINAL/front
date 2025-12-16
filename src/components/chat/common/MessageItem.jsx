import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; //팝업 상세 페이지 이동을 위해 추가
import BlurModal from "../../common/BlurModal";
import { RotateCcw, X } from "lucide-react";
import privateChatIcon from "../../../assets/privateChat.png";

const MAX_PREVIEW_CHARS = 600; // 긴 메시지 기준
const AI_USER_ID = 20251212;

//팝업 카드 컴포넌트
//클릭 시 해당 팝업 상세 페이지(/popup/:id)로 이동
const PopupCardBubble = ({ popupData, onClick }) => (
  <div
    className="flex flex-col w-[240px] bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 cursor-pointer transition hover:shadow-md active:scale-95"
    onClick={onClick}
  >
    {/* 썸네일 영역 */}
    <div className="w-full h-[140px] bg-gray-100">
      <img
        src={popupData?.popThumbnail || "/assets/dummy/image1.jpg"}
        alt="popup thumbnail"
        className="w-full h-full object-cover"
      />
    </div>

    {/* 텍스트 정보 영역 */}
    <div className="p-3 flex flex-col gap-1 text-left">
      {/* 뱃지 */}
      <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-1.5 py-0.5 rounded w-fit">
        팝업 공유
      </span>
      {/* 팝업 이름 */}
      <h4 className="font-bold text-gray-800 text-sm line-clamp-1">
        {popupData?.popName || "알 수 없는 팝업"}
      </h4>
      {/* 장소 */}
      <p className="text-xs text-gray-500 line-clamp-1">
        📍 {popupData?.popLocation || "장소 정보 없음"}
      </p>
      {/* 바로가기 버튼 모양 */}
      <button className="mt-2 w-full py-1.5 text-xs font-semibold text-white bg-primary-dark rounded-md hover:bg-primary-main transition">
        보러가기
      </button>
    </div>
  </div>
);

const ImageBubble = ({
  src,
  pending,
  failed,
  onClick,
  onLoad,
  onRetry,
  onCancel,
}) => (
  <div className="relative block leading-none">
    <img
      src={src}
      onClick={failed || pending ? undefined : onClick}
      onLoad={onLoad}
      alt="chat-image"
      className={`
        max-w-[420px] w-full h-auto rounded-2xl object-cover transition
        ${pending ? "blur-sm opacity-80" : ""}
        ${failed ? "opacity-70" : "cursor-pointer"}
      `}
    />

    {/* ⏳ 업로드 중 */}
    {pending && (
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
        <svg
          className="animate-spin"
          width="34"
          height="34"
          viewBox="0 0 50 50"
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="90 150"
          />
        </svg>
      </div>
    )}

    {/* ❌ 실패 오버레이 */}
    {failed && (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-3
                      bg-black/35 rounded-2xl backdrop-blur-sm"
      >
        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex items-center gap-1 px-3 py-3
                       rounded-full bg-white/20 text-white 
                       text-xs font-semibold hover:bg-white/30 transition"
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={onCancel}
            className="flex items-center gap-1 px-3 py-3
                       rounded-full bg-black/20 text-primary-soft
                       text-xs hover:bg-black/40 transition"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    )}
  </div>
);

export default function MessageItem({
  msg,
  isMine,
  isGroupWithPrev,
  showTime,
  otherLastReadMessageId,
  roomType,
  participants,
  currentUserId,
  otherUserId,
  onOpenUserPopover,
  onImageLoad,
  onRetryImage,
  onCancelImage,
}) {
  const [openFullModal, setOpenFullModal] = useState(false);
  const avatarRef = useRef(null);

  const isImage = msg.messageType === "IMAGE";
  const isAiMessage = msg.senderId === AI_USER_ID;

  // =========================================================================
  // 팝업 공유 메시지 처리 로직
  // 설명: 메시지 타입이 'POPUP'일 경우, 텍스트 대신 카드 UI를 보여주기 위한 준비 단계
  // =========================================================================

  const navigate = useNavigate(); // 페이지 이동 훅

  //content가 객체일 수도 있어서 안전하게 문자열로 변환 (모달/프리뷰 안정화)
  const safeContentString =
    typeof msg.content === "string"
      ? msg.content
      : msg.content
      ? JSON.stringify(msg.content)
      : "";

  //팝업 데이터 키 정규화 함수(서버/소켓에서 키가 달라도 카드가 뜨게)
  const normalizePopupData = (raw) => {
    if (!raw || typeof raw !== "object") return null;

    const popId = raw.popId ?? raw.popupId ?? raw.id;
    const popName = raw.popName ?? raw.name;
    const popThumbnail = raw.popThumbnail ?? raw.thumbnailUrl ?? raw.thumbnail;
    const popLocation = raw.popLocation ?? raw.location;

    //id나 name 같은 최소 필드라도 있어야 카드로 취급
    if (!popId && !popName && !popThumbnail && !popLocation) return null;

    return { popId, popName, popThumbnail, popLocation };
  };

  // 1. 현재 메시지가 '팝업 공유' 타입인지 확인
  //백엔드나 소켓에서 messageType: "POPUP"으로 보낸 경우
  const isPopupMessage =
    msg.messageType === "POPUP" || msg.contentType === "POPUP";

  let popupData = null;

  // 2. 팝업 데이터 파싱
  //content에 JSON 문자열(팝업 ID, 이름, 썸네일 등)이 들어있으므로 객체로 변환
  if (isPopupMessage) {
    try {
      //이미 객체라면 그대로 쓰고, 문자열이라면 JSON.parse 시도
      const raw =
        typeof msg.content === "string" ? JSON.parse(msg.content) : msg.content;

      //파싱한 raw를 pop* 형태로 정규화
      popupData = normalizePopupData(raw);
    } catch (e) {
      console.error("[MessageItem] 팝업 데이터 파싱 실패:", e);
      //파싱 실패 시 일반 텍스트로 보여주거나 에러 처리가 될 수 있도록 null 유지
      popupData = null;
    }
  }

  //msg.content가 객체여도 길이/프리뷰 계산이 깨지지 않게 safeContentString 사용
  const isLong =
    !isImage && (safeContentString?.length || 0) > MAX_PREVIEW_CHARS;

  //POPUP인데 파싱 실패하면 JSON 그대로 보여주기보다 안내 텍스트로 fallback
  const previewText =
    isPopupMessage && !popupData
      ? "[팝업 공유 메시지]"
      : isLong
      ? safeContentString.slice(0, MAX_PREVIEW_CHARS) + "..."
      : safeContentString;

  const isDeletedUser = msg.senderStatus === "DELETED";
  const computedProfileImg = isDeletedUser
    ? privateChatIcon
    : msg.senderProfileUrl;

  const computedNickname = isDeletedUser ? "알 수 없음" : msg.senderNickname;

  const bubbleAnimationClass =
    isAiMessage && msg.animateIn ? "animate-ai-bubble" : "";
  const isUploading = msg.uploadStatus === "UPLOADING";
  const isFailed = msg.uploadStatus === "FAILED";

  console.log("🟡 MessageItem debug");
  console.log("msg.cmId =", msg.cmId);
  console.log("participants =", participants);

  const unread = (() => {
    const isAiRoom = roomType === "PRIVATE" && otherUserId === AI_USER_ID;

    if (isAiRoom) return 0;
    if (typeof msg.cmId !== "number") return 0;
    if (isAiMessage) return 0;

    // PRIVATE
    if (roomType === "PRIVATE") {
      // 내가 보낸 메시지만 unread 대상
      if (msg.senderId !== currentUserId) return 0;

      const otherLastRead = otherLastReadMessageId ?? 0;
      return msg.cmId > otherLastRead ? 1 : 0;
    }

    // GROUP but 2 users → PRIVATE처럼
    if (roomType === "GROUP" && participants.length === 2) {
      // 내가 보낸 메시지만 unread 표시
      if (msg.senderId !== currentUserId) return 0;

      // 상대방 participant 찾기
      const other = participants.find(
        (p) => Number(p.userId) !== Number(currentUserId)
      );

      const otherLastRead = other?.lastReadMessageId ?? 0;

      return msg.cmId > otherLastRead ? 1 : 0;
    }

    // GROUP (3명 이상)
    if (roomType === "GROUP") {
      if (!participants || participants.length <= 1) return 0;

      const others = participants.filter(
        (p) => p.userId !== msg.senderId && p.userId !== currentUserId
      );

      const readers = others.filter(
        (p) => (p.lastReadMessageId ?? 0) >= msg.cmId
      ).length;

      const unreadCount = others.length - readers;
      return unreadCount > 0 ? unreadCount : 0;
    }

    return 0;
  })();

  return (
    <>
      {/* LEFT (상대방 메시지) */}
      {!isMine && (
        <div className="flex w-full justify-start mb-0.5">
          <img
            src={computedProfileImg}
            ref={avatarRef}
            onClick={() =>
              !isDeletedUser && onOpenUserPopover(msg.senderId, avatarRef)
            }
            className={`w-10 h-10 rounded-full object-cover ${
              isDeletedUser ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            } ${isGroupWithPrev ? "invisible" : ""}`}
          />

          <div className="flex flex-col ml-2 items-start">
            {!isGroupWithPrev && (
              <span className="text-white font-semibold text-[15px] ml-1">
                {computedNickname}
              </span>
            )}

            <div className="flex items-end gap-2 mt-1">
              {/* 말풍선 */}
              {/* ========================================================= */}
              {/* 팝업 메시지인지 일반 텍스트인지 구분하여 렌더링 */}
              {/* ========================================================= */}
              {isPopupMessage && popupData ? (
                // (A) 팝업 공유 메시지인 경우 -> 카드 컴포넌트 표시 (props 전달)
                <PopupCardBubble
                  popupData={popupData}
                  //popId가 없을 때 대비
                  onClick={() => navigate(`/popup/${popupData?.popId ?? ""}`)}
                />
              ) : (
                <div
                  className={`relative rounded-2xl whitespace-pre-wrap break-words 
                  bg-white/20 text-white max-w-[500px] overflow-hidden
                  ${isImage ? "" : "px-4 py-2"}
                  ${msg.isPending ? "opacity-50" : ""}
                  ${bubbleAnimationClass}
                `}
                >
                  {isImage ? (
                    <ImageBubble
                      src={msg.content}
                      pending={isUploading}
                      failed={isFailed}
                      onClick={() => setOpenFullModal(true)}
                      onLoad={onImageLoad}
                      onRetry={onRetryImage}
                      onCancel={onCancelImage}
                    />
                  ) : (
                    previewText
                  )}

                  {/* 🔽 페이드아웃 + 전체보기 버튼 (카카오톡 스타일) */}
                  {isLong && (
                    <div
                      className="absolute bottom-0 left-0 w-full h-20 flex items-end justify-end pr-4
                    bg-gradient-to-t from-primary-soft2/40 to-transparent rounded-b-2xl"
                    >
                      <button
                        className="mb-2 px-3 py-1 text-[12px] font-medium 
                          rounded-full text-whitehover:bg-white/50 hover:text-primary-dark transition"
                        onClick={() => setOpenFullModal(true)}
                      >
                        전체보기
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col">
                {/* ✅ 읽음 숫자 표시 (카톡 방식) */}
                {!isAiMessage && unread > 0 && (
                  <span className="text-[11px] text-accent-lemon">
                    {unread}
                  </span>
                )}

                {/* 시간 (기존 위치 유지) */}
                {showTime && (
                  <span className="text-white/50 text-xs mb-1 shrink-0">
                    {msg.createdAt}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT (내 메시지) */}
      {isMine && (
        <div className="flex w-full justify-end mb-1">
          <div className="flex flex-col items-end">
            <div className="flex justify-end items-end gap-2">
              <div className="flex flex-col items-end">
                {/* ✅ 읽음 숫자 표시 (카톡 방식) */}
                {!isAiMessage && unread > 0 && (
                  <span className="text-[11px] text-accent-lemon">
                    {unread}
                  </span>
                )}
                {/* 시간 (기존 위치 유지) */}
                {showTime && (
                  <span className="text-white/50 text-xs mb-1 shrink-0">
                    {msg.createdAt}
                  </span>
                )}
              </div>

              {/* ========================================================= */}
              {/* 내 메시지 팝업 여부 체크 */}
              {/* ========================================================= */}
              {isPopupMessage && popupData ? (
                // (A) 팝업 공유 메시지 -> 카드 표시 (props 전달)
                <PopupCardBubble
                  popupData={popupData}
                  //popId가 없을 때 대비
                  onClick={() => navigate(`/popup/${popupData?.popId ?? ""}`)}
                />
              ) : (
                <div
                  className={`relative rounded-2xl whitespace-pre-wrap break-words 
                bg-white text-purple-700 max-w-[500px] overflow-hidden
                ${isImage ? "" : "px-4 py-2"}
                ${msg.isPending ? "opacity-50" : ""}
              `}
                >
                  {isImage ? (
                    <ImageBubble
                      src={msg.content}
                      pending={isUploading}
                      failed={isFailed}
                      onClick={() => setOpenFullModal(true)}
                      onLoad={onImageLoad}
                      onRetry={onRetryImage}
                      onCancel={onCancelImage}
                    />
                  ) : (
                    previewText
                  )}

                  {/* 🔽 페이드아웃 + 전체보기 버튼 */}
                  {isLong && !isImage && (
                    <div
                      className="absolute bottom-0 left-0 w-full h-20 flex items-end justify-end pr-4
                  bg-gradient-to-t from-gray-200/90 to-transparent rounded-b-2xl"
                    >
                      <button
                        className="mb-2 px-3 py-1 text-[12px] font-medium
                  rounded-full text-purple-700 hover:bg-purple-300 transition"
                        onClick={() => setOpenFullModal(true)}
                      >
                        전체보기
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🔍 전체 내용 모달 */}
      <BlurModal open={openFullModal} onClose={() => setOpenFullModal(false)}>
        <div className="flex flex-col gap-1 max-h-[70vh]">
          <p className="text-lg text-gray-500 ml-2">
            {computedNickname || (isMine ? "나" : "")}
          </p>
          <div className="mt-2 p-3 rounded-xl bg-gray-50 border border-gray-200 max-h-[55vh] overflow-y-auto custom-scroll">
            {isImage ? (
              <img
                src={msg.content}
                alt="full-image"
                className="max-w-full max-h-[60vh] rounded-xl mx-auto"
              />
            ) : (
              <p className="whitespace-pre-wrap break-words text-gray-900 text-sm align-o">
                {/* 객체 content여도 깨지지 않게 safeContentString 사용 */}
                {safeContentString}
              </p>
            )}
          </div>

          <p className="text-xs text-gray-400 text-right mr-2">
            {msg.createdAt}
          </p>
        </div>
      </BlurModal>
    </>
  );
}
