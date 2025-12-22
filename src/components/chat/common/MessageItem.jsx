import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; //팝업 상세 페이지 이동을 위해 추가
import BlurModal from "../../common/BlurModal";
import { ChevronLeft, ChevronRight, RotateCcw, X } from "lucide-react";
import privateChatIcon from "../../../assets/privateChat.png";
import DownloadIcon from "../icons/DownloadIcon";

const MAX_PREVIEW_CHARS = 600; // 긴 메시지 기준
const AI_USER_ID = 20251212;

const stripCodeFence = (text = "") => {
  const s = String(text).trim();

  // ```json ... ``` 또는 ``` ... ```
  if (s.startsWith("```")) {
    return s
      .replace(/^```[a-zA-Z]*\n?/, "") // 시작 ```json 제거
      .replace(/```$/, "") // 끝 ``` 제거
      .trim();
  }
  return s;
};

const tryParseJson = (content) => {
  if (!content) return null;

  if (typeof content === "object") return content;

  const cleaned = stripCodeFence(content);

  if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) return null;

  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

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

//이미지 그리드
const ImageGrid = ({
  urls,
  pending,
  failed,
  onOpen,
  onRetry,
  onCancel,
  onLoad,
}) => {
  const count = urls.length;

  // row 정의 함수
  const buildRows = (urls) => {
    switch (count) {
      case 1:
        return [[urls[0]]];

      case 2:
        return [[urls[0], urls[1]]];

      case 3:
        // 1 + 2 (왼쪽 큰 이미지 느낌)
        return [[urls[0]], [urls[1], urls[2]]];

      case 4:
        return [
          [urls[0], urls[1]],
          [urls[2], urls[3]],
        ];

      case 5:
        return [
          [urls[0], urls[1], urls[2]],
          [urls[3], urls[4]],
        ];

      case 6:
        return [
          [urls[0], urls[1], urls[2]],
          [urls[3], urls[4], urls[5]],
        ];

      case 7:
        return [
          [urls[0], urls[1], urls[2]],
          [urls[3], urls[4]],
          [urls[5], urls[6]],
        ];

      case 8:
        return [
          [urls[0], urls[1], urls[2]],
          [urls[3], urls[4], urls[5]],
          [urls[6], urls[7]],
        ];

      case 9:
        return [
          [urls[0], urls[1], urls[2]],
          [urls[3], urls[4], urls[5]],
          [urls[6], urls[7], urls[8]],
        ];

      case 10:
        return [
          [urls[0], urls[1], urls[2]],
          [urls[3], urls[4], urls[5]],
          [urls[6], urls[7]],
          [urls[8], urls[9]],
        ];

      case 11:
        return [
          [urls[0], urls[1], urls[2]],
          [urls[3], urls[4], urls[5]],
          [urls[6], urls[7], urls[8]],
          [urls[9], urls[10]],
        ];

      case 12:
      default:
        return [
          [urls[0], urls[1], urls[2]],
          [urls[3], urls[4], urls[5]],
          [urls[6], urls[7], urls[8]],
          [urls[9], urls[10], urls[11]],
        ];
    }
  };

  const rows = buildRows(urls);

  return (
    <div className="flex flex-col gap-0.5 max-w-[260px] sm:max-w-[340px] md:max-w-[420px]">
      {rows.map((row, rowIdx) => {
        const cols =
          row.length === 1
            ? "grid-cols-1"
            : row.length === 2
            ? "grid-cols-2"
            : "grid-cols-3";

        return (
          <div key={rowIdx} className={`grid ${cols} gap-0.5`}>
            {row.map((url, idx) => (
              <ImageBubble
                key={`${rowIdx}-${idx}`}
                src={url}
                pending={pending}
                failed={failed}
                onClick={() => onOpen(idx)}
                onRetry={onRetry}
                onCancel={onCancel}
                onLoad={onLoad}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

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
      onClick={() => !failed && !pending && onClick()}
      onLoad={onLoad}
      alt="chat-image"
      className={`
        max-w-full w-full h-auto rounded-2xl object-cover aspect-square transition
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
  onResendPureLlm,
  onOpenUserPopover,
  onImageLoad,
  onRetryImage,
  onCancelImage,
}) {
  const [openFullModal, setOpenFullModal] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const avatarRef = useRef(null);

  const isImage =
    msg.messageType === "IMAGE" &&
    Array.isArray(msg.imageUrls) &&
    msg.imageUrls.length > 0;
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
  const rawPopup =
    typeof msg.content === "object" ? msg.content : tryParseJson(msg.content);

  const popupData =
    rawPopup && rawPopup.type === "POPUP" ? normalizePopupData(rawPopup) : null;

  const isPopupMessage =
    msg.messageType === "POPUP" ||
    msg.contentType === "POPUP" ||
    popupData !== null;

  const isPopupRecommend =
    rawPopup?.type === "POPUP_RECOMMEND" && Array.isArray(rawPopup?.items);

  const popupRecommendItems = isPopupRecommend
    ? rawPopup.items.map(normalizePopupData).filter(Boolean)
    : [];

  // 2. 팝업 데이터 파싱
  //content에 JSON 문자열(팝업 ID, 이름, 썸네일 등)이 들어있으므로 객체로 변환
  // if (isPopupMessage) {
  //   try {
  //     //이미 객체라면 그대로 쓰고, 문자열이라면 JSON.parse 시도
  //     const raw =
  //       typeof msg.content === "string" ? JSON.parse(msg.content) : msg.content;

  //     //파싱한 raw를 pop* 형태로 정규화
  //     popupData = normalizePopupData(raw);
  //   } catch (e) {
  //     console.error("[MessageItem] 팝업 데이터 파싱 실패:", e);
  //     //파싱 실패 시 일반 텍스트로 보여주거나 에러 처리가 될 수 있도록 null 유지
  //     popupData = null;
  //   }
  // }

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

  const isIOS = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  const getFilenameFromResponse = (response, fallbackUrl, index) => {
    // Content-Disposition 헤더
    const disposition = response.headers.get("Content-Disposition");
    if (disposition) {
      const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)/i);
      if (match?.[1]) {
        return decodeURIComponent(match[1]);
      }
    }

    //  URL에서 파일명

    const pathname = new URL(fallbackUrl).pathname;
    const name = pathname.split("/").pop();
    if (name) return name;

    //  fallback
    return `image_${index + 1}`;
  };

  // 🔹 SYSTEM 메시지 (중앙 알림)
  if (msg.messageType === "SYSTEM") {
    return (
      <div className="flex items-center justify-center gap-3 my-2 px-6">
        <span className="text-xs text-white/60 whitespace-nowrap">
          {msg.content}
        </span>
      </div>
    );
  }

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
            className={`w-8 h-8 md:w-10 md:h-10 rounded-full object-cover ${
              isDeletedUser ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            } ${isGroupWithPrev ? "invisible" : ""}`}
          />

          <div className="flex flex-col ml-2 items-start">
            {!isGroupWithPrev && (
              <span className="text-white font-semibold text-sm md:text-[15px] ml-1">
                {computedNickname}
              </span>
            )}

            <div className="flex items-end gap-2 mt-1 text-sm md:text-base">
              {/* 말풍선 */}
              {/* ========================================================= */}
              {/* 팝업 메시지인지 일반 텍스트인지 구분하여 렌더링 */}
              {/* ========================================================= */}
              {isPopupRecommend ? (
                <div className="flex gap-3 overflow-x-auto max-w-[90vw] pb-2">
                  {popupRecommendItems.map((item) => (
                    <PopupCardBubble
                      key={item.popId ?? item.popName}
                      popupData={item}
                      onClick={() => navigate(`/popup/${item.popId}`)}
                    />
                  ))}
                </div>
              ) : isPopupMessage && popupData ? (
                // (A) 팝업 공유 메시지인 경우 -> 카드 컴포넌트 표시 (props 전달)
                <PopupCardBubble
                  popupData={popupData}
                  //popId가 없을 때 대비
                  onClick={() => navigate(`/popup/${popupData?.popId ?? ""}`)}
                />
              ) : (
                <div
                  className={`relative rounded-2xl whitespace-pre-wrap break-words 
                  bg-white/20 text-white max-w-[260px] sm:max-w-[340px] md:max-w-[500px] overflow-hidden  cursor-pointer
                  ${isImage ? "" : "px-3 py-1.5 md:px-4 md:py-2"}
                  ${msg.isPending ? "opacity-50" : ""}
                  ${bubbleAnimationClass}
                `}
                >
                  {isImage ? (
                    <ImageGrid
                      urls={msg.imageUrls}
                      pending={isUploading}
                      failed={isFailed}
                      onOpen={(idx = 0) => {
                        setViewerIndex(idx);
                        setImageViewerOpen(true);
                      }}
                      onLoad={onImageLoad}
                      onRetry={() => onRetryImage(msg.clientMessageKey)}
                      onCancel={() => onCancelImage(msg.clientMessageKey)}
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
                  {msg._needConfirm && (
                    <NeedConfirmCard
                      data={msg._needConfirm}
                      onResend={() => onResendPureLlm(msg)}
                    />
                  )}
                </div>
              )}

              <div className="flex flex-col">
                {/* ✅ 읽음 숫자 표시 (카톡 방식) */}
                {!isAiMessage && unread > 0 && (
                  <span className="text-[10px] md:text-[11px] text-accent-lemon">
                    {unread}
                  </span>
                )}

                {/* 시간 (기존 위치 유지) */}
                {showTime && (
                  <span className="text-white/50 text-[10px] md:text-xs shrink-0">
                    {msg.createdAt}
                  </span>
                )}
              </div>
            </div>

            {isAiMessage && msg.aiMode === "RAG" && (
              <span className="text-[10px] text-text-main ml-2 mt-2">
                👻 팝스팟 정보 기준
              </span>
            )}

            {isAiMessage && msg.aiMode === "PURE_LLM" && (
              <span className="text-[10px] text-text-main ml-2 mt-2">
                🤖 일반 AI
              </span>
            )}

            {isAiMessage && msg.aiMode === "RAG_RECOMMEND" && (
              <span className="text-[10px] text-primary-soft ml-2 mt-1">
                ⭐️ 팝업 추천
              </span>
            )}
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
                  <span className="text-[10px] md:text-[11px] text-accent-lemon">
                    {unread}
                  </span>
                )}
                {/* 시간 (기존 위치 유지) */}
                {showTime && (
                  <span className="text-white/50 text-[10px] md:text-xs shrink-0">
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
                    <ImageGrid
                      urls={msg.imageUrls}
                      pending={isUploading}
                      failed={isFailed}
                      onOpen={(idx = 0) => {
                        setViewerIndex(idx);
                        setImageViewerOpen(true);
                      }}
                      onLoad={onImageLoad}
                      onRetry={() => onRetryImage(msg.clientMessageKey)}
                      onCancel={() => onCancelImage(msg.clientMessageKey)}
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

      <ImageViewerModal
        open={imageViewerOpen}
        urls={msg.imageUrls || []}
        startIndex={viewerIndex}
        onClose={() => setImageViewerOpen(false)}
      />

      {/* 🔍 전체 내용 모달 */}
      <BlurModal open={openFullModal} onClose={() => setOpenFullModal(false)}>
        <div className="flex flex-col gap-1 max-h-[70vh]">
          <p className="text-lg text-gray-500 ml-2">
            {computedNickname || (isMine ? "나" : "")}
          </p>
          <div className="mt-2 p-3 rounded-xl bg-gray-50 border border-gray-200 max-h-[55vh] overflow-y-auto custom-scroll">
            {isImage ? (
              <div className="flex flex-col gap-3">
                {msg.imageUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`full-image-${idx}`}
                    className="max-w-full max-h-[60vh] rounded-xl mx-auto"
                  />
                ))}
              </div>
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

  function NeedConfirmCard({ data, onResend }) {
    return (
      <div
        className="
        mt-3 p-3 rounded-xl
        bg-white/30 backdrop-blur-md
        border border-white/30
        shadow-sm
        max-w-[260px] sm:max-w-[320px]
      "
      >
        <p className="text-xs text-white/80 leading-relaxed">
          {data?.message ?? "현재 팝스팟 정보만으로는 정확한 답변이 어려워요."}
        </p>

        <button
          onClick={onResend}
          className="
          mt-3 w-full
          py-2 text-xs font-semibold
          rounded-lg
          bg-primary-soft2 text-white
          hover:bg-primary-soft2/80
          transition
        "
        >
          🤖 일반 AI로 질문하기
        </button>
      </div>
    );
  }

  function ImageViewerModal({ open, urls, startIndex = 0, onClose }) {
    const [index, setIndex] = useState(startIndex);
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const dragStart = useRef(null);
    const isDragging = useRef(false);
    const lastTapRef = useRef(0);
    const pinchStartDist = useRef(null);

    // 최초 오픈 시만 초기화
    useEffect(() => {
      if (open) {
        setIndex(startIndex);
        setScale(1);
      }
    }, [open, startIndex]);

    // ⌨️ 키보드
    useEffect(() => {
      if (!open) return;

      const handleKey = (e) => {
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowLeft" && index > 0) setIndex((i) => i - 1);
        if (e.key === "ArrowRight" && index < urls.length - 1)
          setIndex((i) => i + 1);
      };

      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }, [open, index, urls.length, onClose]);

    if (!open) return null;

    // 🔍 더블탭 / 더블클릭
    const handleDoubleTap = () => {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        setScale((s) => {
          const next = s === 1 ? 2 : 1;
          if (next === 1) {
            setOffset({ x: 0, y: 0 });
            dragStart.current = null;
          }
          return next;
        });
      }
      lastTapRef.current = now;
    };

    // 🖱️ 마우스 휠 줌
    const handleWheel = (e) => {
      e.preventDefault();
      setScale((s) => {
        const next = s - e.deltaY * 0.001;
        return Math.min(Math.max(1, next), 4);
      });
    };

    // 🤏 모바일 핀치 줌
    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (!pinchStartDist.current) {
          pinchStartDist.current = dist;
        } else {
          const diff = dist - pinchStartDist.current;
          setScale((s) => Math.min(Math.max(1, s + diff * 0.005), 4));
        }
      }

      // 🖐️ 한 손가락 드래그
      if (e.touches.length === 1 && scale > 1) {
        const touch = e.touches[0];
        if (!dragStart.current) {
          dragStart.current = {
            x: touch.clientX,
            y: touch.clientY,
            ox: offset.x,
            oy: offset.y,
          };
        } else {
          setOffset({
            x: dragStart.current.ox + (touch.clientX - dragStart.current.x),
            y: dragStart.current.oy + (touch.clientY - dragStart.current.y),
          });
        }
      }
    };

    const handleTouchEnd = () => {
      dragStart.current = null;
      pinchStartDist.current = null;
    };
    const handleMouseDown = (e) => {
      if (scale <= 1) return;

      isDragging.current = false;

      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        ox: offset.x,
        oy: offset.y,
      };
    };
    const handleMouseMove = (e) => {
      if (!dragStart.current) return;

      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        isDragging.current = true;
      }

      setOffset({
        x: dragStart.current.ox + dx,
        y: dragStart.current.oy + dy,
      });
    };
    const handleMouseUp = () => {
      dragStart.current = null;
      isDragging.current = false;
    };
    //  다운로드 (CORS-safe)
    const handleDownload = async () => {
      const url = urls[index];

      //  iOS Safari → 새 탭 열어서 저장 유도
      if (isIOS()) {
        window.open(url, "_blank");
        return;
      }

      //  PC / Android
      try {
        const response = await fetch(url);
        const blob = await response.blob();

        const filename = getFilenameFromResponse(response, url, index);

        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      } catch (err) {
        console.error("다운로드 실패:", err);
        alert("이미지 다운로드에 실패했습니다.");
      }
    };

    const showIndex = urls.length > 1;

    return (
      <div className="fixed inset-0 z-[9999] rounded-2xl bg-black/60 backdrop-blur-lg flex items-center justify-center overflow-hidden">
        {/* 닫기 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center z-10 w-10 h-10 rounded-full  text-white hover:bg-white/10 cursor-pointer"
        >
          <X size={22} />
        </button>

        {/* 다운로드 */}
        <button
          onClick={handleDownload}
          className="absolute top-4 right-16 flex items-center justify-center z-10 w-10 h-10 rounded-full text-white hover:bg-white/10 cursor-pointer"
        >
          <DownloadIcon />
        </button>

        {isIOS() && (
          <div className="absolute top-16 right-4 text-xs text-white/60">
            길게 눌러 사진 저장
          </div>
        )}

        {/* 이미지 */}
        <div
          className="w-full h-full object-contain flex items-center justify-center overflow-visible"
          onDoubleClick={handleDoubleTap}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={urls[index]}
            alt={`viewer-${index}`}
            draggable={false}
            className="max-w-[95vw] max-h-[85vh] object-contain transition-transform duration-100 "
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              cursor:
                scale > 1
                  ? dragStart.current
                    ? "grabbing"
                    : "grab"
                  : "default",
            }}
          />
        </div>

        {/* 인덱스 */}
        {showIndex && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 text-white text-xs">
            {index + 1} / {urls.length}
          </div>
        )}

        {/* 좌우 */}
        {index > 0 && (
          <button
            onClick={() => setIndex((i) => i - 1)}
            className="hidden md:flex items-center justify-center absolute left-4 w-12 h-12 rounded-full bg-black/30 text-white hover:bg-black/50 cursor-pointer"
          >
            <ChevronLeft size={32} />
          </button>
        )}
        {index < urls.length - 1 && (
          <button
            onClick={() => setIndex((i) => i + 1)}
            className="hidden md:flex  items-center justify-center absolute right-4 w-12 h-12 rounded-full bg-black/30 text-white hover:bg-black/50 cursor-pointer"
          >
            <ChevronRight size={32} />
          </button>
        )}
      </div>
    );
  }
}
