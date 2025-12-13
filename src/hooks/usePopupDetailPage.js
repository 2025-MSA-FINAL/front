import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { fetchPopupDetailApi, togglePopupWishlistApi } from "../api/popupApi";
import { useAuthStore } from "../store/authStore";
import { getGroupChatRoomList, joinGroupChatRoom } from "../api/chatApi";

//상태 라벨 매핑
const STATUS_LABEL = {
  UPCOMING: "오픈 예정",
  ONGOING: "진행 중",
  ENDED: "종료",
};

//날짜 포맷터
function formatDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\.\s/g, ".")
    .replace(/\.$/, "");
}

function formatDateRange(start, end) {
  if (!start && !end) return "";
  if (!start || !end) return formatDate(start || end);
  return `${formatDate(start)} ~ ${formatDate(end)}`;
}

//예약 버튼 라벨 포맷터
function formatReservationLabel(status, reservationStartTime) {
  if (status === "UPCOMING" && reservationStartTime) {
    const d = new Date(reservationStartTime);
    const date = d
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\.\s/g, ".")
      .replace(/\.$/, "");
    const time = d
      .toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(/\.\s/g, ":")
      .replace(/:$/, "");
    return `${date} ${time} 예약 오픈`;
  }
  if (status === "UPCOMING") return "예약 오픈 예정";
  if (status === "OPEN") return "예약하기";
  if (status === "CLOSED") return "예약 마감";
  return "";
}

export default function usePopupDetailPage() {
  const { popupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [popup, setPopup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("DESCRIPTION");

  const [toastMessage, setToastMessage] = useState(null);
  const [toastVariant, setToastVariant] = useState("success");
  const toastTimerRef = useRef(null);

  //채팅 관련 상태
  const [chatRooms, setChatRooms] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  const isLoggedIn = !!user;

  const showToast = (message, variant = "success", duration = 3000) => {
    if (!message) return;

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }

    setToastVariant(variant);
    setToastMessage(message);

    if (duration > 0) {
      toastTimerRef.current = setTimeout(() => {
        setToastMessage(null);
        toastTimerRef.current = null;
      }, duration);
    }
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  //상세 데이터 패칭
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchPopupDetailApi(popupId);
        setPopup(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("팝업 정보를 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    }

    if (popupId) load();
    else {
      setError("잘못된 접근입니다.");
      setLoading(false);
    }
  }, [popupId, user]); //user 변경 시(로그인 직후 등) 데이터 갱신

  //카카오 SDK 동적 로드 및 초기화
  useEffect(() => {
    //이미 로드되어 있으면 패스
    if (window.Kakao && window.Kakao.isInitialized()) return;

    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
    script.async = true;

    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        const apiKey = import.meta.env.VITE_KAKAO_MAP_KEY;

        try {
          window.Kakao.init(apiKey);
          console.log("카카오 SDK 초기화 성공! 🎉");
        } catch (e) {
          console.error("카카오 SDK 초기화 실패:", e);
        }
      }
    };

    script.onerror = () => {
      console.error("카카오 SDK 스크립트 로드 실패 (차단됨)");
    };

    document.head.appendChild(script);
  }, []);

  //채팅방 목록 로드
  const loadChatRooms = async (popId) => {
    if (!isLoggedIn || !popId) return;

    try {
      setChatLoading(true);
      setChatError(null);

      const rooms = await getGroupChatRoomList(popId);
      setChatRooms(rooms ?? []);
    } catch (err) {
      console.error("채팅방 목록 조회 실패:", err);
      setChatError(err);
      showToast(
        "채팅방 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
        "error"
      );
    } finally {
      setChatLoading(false);
    }
  };

  //채팅 탭 진입 시 채팅방 목록 조회 (로그인 전용)
  useEffect(() => {
    if (activeTab !== "CHAT") return;
    if (!popup) return;
    if (!isLoggedIn) return;

    loadChatRooms(popup.popId);
  }, [activeTab, popup, isLoggedIn]);

  //찜 토글 핸들러
  const handleToggleWishlist = async () => {
    //비로그인 처리
    if (!user) {
      if (
        window.confirm(
          "로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?"
        )
      ) {
        navigate("/login");
      }
      return;
    }

    if (!popup || wishlistLoading) return;

    //현재 상태 캡처 (에러 시 복구용)
    const prevIsLiked = popup.isLiked;
    const nextIsLiked = !prevIsLiked;

    //낙관적 업데이트
    setPopup((prev) => ({ ...prev, isLiked: nextIsLiked }));

    try {
      setWishlistLoading(true);

      //API 호출
      const res = await togglePopupWishlistApi(popup.popId);

      //서버 응답 확인 (데이터 동기화)
      let finalState = nextIsLiked;

      if (res && typeof res.liked === "boolean") {
        finalState = res.liked;
      } else if (res && typeof res.isLiked === "boolean") {
        finalState = res.isLiked;
      }

      //상태 확정
      setPopup((prev) => (prev ? { ...prev, isLiked: finalState } : prev));
    } catch (err) {
      console.error("찜 토글 에러:", err);
      //실패 시 원래대로 롤백
      setPopup((prev) => (prev ? { ...prev, isLiked: prevIsLiked } : prev));
      alert("요청을 처리하지 못했습니다. 다시 시도해주세요.");
    } finally {
      setWishlistLoading(false);
    }
  };

  //예약 버튼
  const handleReservationClick = () => {
    //popupId는 URL 파라미터 기준
    if (popupId) {
      navigate(`/popup/${popupId}/reserve`);
      return;
    }

    if (popup?.popId) {
      navigate(`/popup/${popup.popId}/reserve`);
    }
  };

  //공유하기 버튼 (클립보드 복사)
  const handleShareClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("링크가 복사되었어요! 🔗", "success");
    } catch (err) {
      console.error("URL 복사 실패:", err);
      showToast("링크 복사에 실패했어요 😢", "error");
    }
  };

  //채팅방 참여하기
  const handleJoinChatRoom = async (gcrId, options = {}) => {
    const { alreadyJoined } = options || {};

    //비로그인 처리
    if (!user) {
      if (
        window.confirm(
          "로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?"
        )
      ) {
        navigate("/login");
      }
      return;
    }

    //이미 참여 중인 방이면 join API 안 쏘고 바로 채팅 페이지로
    if (alreadyJoined) {
      showToast(
        "이미 참여 중인 채팅방이에요. 채팅 페이지에서 확인해 보세요! 💬"
      );
      navigate("/chat");
      return;
    }

    try {
      await joinGroupChatRoom({ gcrId });

      showToast("채팅방에 참여했어요! 채팅 페이지에서 대화를 시작해보세요 🙌");

      if (popup?.popId) {
        await loadChatRooms(popup.popId);
      }

      navigate("/chat");
    } catch (error) {
      console.error("채팅방 참여 실패:", error);

      const code = error?.response?.data?.code;
      const message = error?.response?.data?.message;

      //이미 참여중 (CHAT_001)
      if (code === "CHAT_001") {
        showToast(
          message ||
          "이미 참여 중인 채팅방이에요. 채팅 페이지에서 확인해 보세요! 💬"
        );
        navigate("/chat");
        return;
      }

      //방 정원 초과 (CHAT_003)
      if (code === "CHAT_003") {
        showToast(message || "이미 정원이 꽉 찬 방이에요 🥲", "error");
        return;
      }

      //성별 제한 (CHAT_014)
      if (code === "CHAT_014") {
        showToast(
          message || "이 채팅방은 성별 제한 때문에 입장할 수 없어요.",
          "error"
        );
        return;
      }

      //나이 제한 (CHAT_015)
      if (code === "CHAT_015") {
        showToast(
          message || "연령 조건에 맞지 않아 입장할 수 없어요.",
          "error"
        );
        return;
      }

      //그 외 기타 에러 (방 삭제, 없음 등)
      showToast(
        message ||
        "채팅방에 참여할 수 없어요. 조건 불일치 또는 정원 초과일 수 있어요.",
        "error"
      );
    }
  };

  //카카오톡 공유하기 함수
  const handleKakaoShare = () => {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      alert(
        "카카오 SDK가 아직 로딩되지 않았습니다. 잠시 후 다시 시도해주세요."
      );
      return;
    }

    if (!popup) return;

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: popup.popName,
        description: popup.popAiSummary || "이 팝업스토어 어때요?",
        imageUrl:
          popup.popThumbnail ||
          "https://via.placeholder.com/800x400?text=No+Image",
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href,
        },
      },
      buttons: [
        {
          title: "자세히 보기",
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
      ],
    });
  };

  //파생 데이터들
  const statusLabel = popup
    ? STATUS_LABEL[popup.popStatus] || "진행 중"
    : "";
  const dateRange =
    popup && (popup.popStartDate || popup.popEndDate)
      ? formatDateRange(popup.popStartDate, popup.popEndDate)
      : "";
  const isFree = popup?.popPriceType === "FREE";
  const aiSummaryText = popup?.popAiSummary || "AI가 요약을 생성하는 중이에요...";
  const descriptionParagraphs = popup?.popDescription
    ? popup.popDescription.split("\n").filter(Boolean)
    : [];

  const hasReservation =
    popup &&
    popup.reservationStatus !== "NONE" &&
    popup.popIsReservation !== false;
  const reservationLabel = popup
    ? formatReservationLabel(popup.reservationStatus, popup.reservationStartTime)
    : "";
  const reservationDisabled = !popup || popup.reservationStatus !== "OPEN";

  return {
    loading,
    error,
    popup,
    navigate,
    statusLabel,
    dateRange,
    isFree,
    aiSummaryText,
    descriptionParagraphs,
    hasReservation,
    reservationLabel,
    reservationDisabled,
    wishlistLoading,
    handleToggleWishlist,
    handleReservationClick,
    toastMessage,
    toastVariant,
    handleShareClick,
    activeTab,
    setActiveTab,
    userRole: user?.role,
    handleKakaoShare,

    // 채팅 관련
    isLoggedIn,
    chatRooms,
    chatLoading,
    chatError,
    handleJoinChatRoom,
  };
}
