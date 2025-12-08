import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { fetchPopupDetailApi, togglePopupWishlistApi } from "../api/popupApi";
import { useAuthStore } from "../store/authStore";

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
    const date = d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\.\s/g, ".").replace(/\.$/, "");
    const time = d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false }).replace(/\.\s/g, ":").replace(/:$/, "");
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

  //카카오 SDK 동적 로드 및 초기화 (index.html 수정 불필요!)
  useEffect(() => {
    // 1. 이미 로드되어 있으면 패스
    if (window.Kakao && window.Kakao.isInitialized()) return;

    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
    script.async = true;

    script.onload = () => {
      // 2. 로드 완료 후 초기화
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


  //찜 토글 핸들러
  const handleToggleWishlist = async () => {
    // 1. 비로그인 처리
    if (!user) {
      if (window.confirm("로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?")) {
        navigate("/login");
      }
      return;
    }

    if (!popup || wishlistLoading) return;

    // 2. 현재 상태 캡처 (에러 시 복구용)
    const prevIsLiked = popup.isLiked;
    //변경될 목표 상태 (true -> false, false -> true)
    const nextIsLiked = !prevIsLiked;

    // 3.낙관적 업데이트
    setPopup((prev) => ({ ...prev, isLiked: nextIsLiked }));

    try {
      setWishlistLoading(true);
      
      // 4. API 호출
      const res = await togglePopupWishlistApi(popup.popId);
      
      // 5. 서버 응답 확인 (데이터 동기화)
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
      // 6. 실패 시 원래대로 롤백
      setPopup((prev) => (prev ? { ...prev, isLiked: prevIsLiked } : prev));
      alert("요청을 처리하지 못했습니다. 다시 시도해주세요.");
    } finally {
      setWishlistLoading(false);
    }
  };

  //예약 버튼
  const handleReservationClick = () => {
    // popupId는 URL 파라미터 기준
    if (popupId) {
      navigate(`/popup/${popupId}/reserve`);
      return;
    }

    // 혹시라도 popupId가 없고 vm.popup만 있는 경우 대비
    if (popup?.popId) {
      navigate(`/popup/${popup.popId}/reserve`);
    }
  };

  //공유하기 버튼 (클립보드 복사)
  const handleShareClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      
      // 토스트 띄우기
      setToastMessage("링크가 복사되었어요! 🔗");
      
      // 3초 뒤에 자동으로 끄기
      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      
    } catch (err) {
      console.error("URL 복사 실패:", err);
      setToastMessage("링크 복사에 실패했어요 😢");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  //카카오톡 공유하기 함수
  const handleKakaoShare = () => {
    // SDK 로드 확인
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      alert("카카오 SDK가 아직 로딩되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (!popup) return;

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: popup.popName,
        description: popup.popAiSummary || "이 팝업스토어 어때요?",
        imageUrl: popup.popThumbnail || "https://via.placeholder.com/800x400?text=No+Image", // 썸네일 필수
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
  const statusLabel = popup ? STATUS_LABEL[popup.popStatus] || "진행 중" : "";
  const dateRange = popup && (popup.popStartDate || popup.popEndDate) ? formatDateRange(popup.popStartDate, popup.popEndDate) : "";
  const isFree = popup?.popPriceType === "FREE";
  const aiSummaryText = popup?.popAiSummary || "AI가 요약을 생성하는 중이에요...";
  const descriptionParagraphs = popup?.popDescription ? popup.popDescription.split("\n").filter(Boolean) : [];
  
  const hasReservation = popup && popup.reservationStatus !== "NONE" && popup.popIsReservation !== false;
  const reservationLabel = popup ? formatReservationLabel(popup.reservationStatus, popup.reservationStartTime) : "";
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
    handleShareClick,
    activeTab,
    setActiveTab,
    userRole: user?.role,
    handleKakaoShare,
  };
}