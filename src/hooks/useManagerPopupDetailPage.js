import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchManagerPopupDetailApi,
  fetchManagerReservationListApi,
} from "../api/managerApi";
import { useAuthStore } from "../store/authStore";

//상태 라벨 매핑
const STATUS_LABEL = {
  UPCOMING: "오픈 예정",
  ONGOING: "진행 중",
  ENDED: "종료",
};

function formatDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "";
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

const RESERVATION_PAGE_SIZE = 10;

export default function useManagerPopupDetailPage() {
  const navigate = useNavigate();
  const { popupId } = useParams(); // /manager/popup/:popupId
  const { user } = useAuthStore();

  const [popup, setPopup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //예약자 목록
  const [reservationPageData, setReservationPageData] = useState(null);
  const [reservationPage, setReservationPage] = useState(0);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [reservationsError, setReservationsError] = useState(null);

  //삭제/액션 상태
  const [deleting, setDeleting] = useState(false);

  // ---------------------------
  // 1. 상세 로딩
  // ---------------------------
  useEffect(() => {
    if (!popupId) return;

    async function loadDetail() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchManagerPopupDetailApi(popupId);
        setPopup(data);
      } catch (err) {
        console.error(err);
        const status = err?.response?.status;
        const code = err?.response?.data?.code;

        if (status === 404 || code === "POP_003") {
          setError("존재하지 않거나 접근 권한이 없는 팝업입니다.");
        } else {
          setError(
            err?.response?.data?.message ??
              "팝업 정보를 불러오는 중 오류가 발생했습니다."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadDetail();
  }, [popupId]);

  // ---------------------------
  // 2. 예약자 목록 로딩
  // ---------------------------
  const loadReservations = async (page = reservationPage) => {
    if (!popupId) return;
    setReservationsLoading(true);
    setReservationsError(null);
    try {
      const data = await fetchManagerReservationListApi(popupId, {
        page,
        size: RESERVATION_PAGE_SIZE,
      });
      setReservationPageData(data);
    } catch (err) {
      console.error(err);
      setReservationsError(
        err?.response?.data?.message ??
          "예약자 목록을 불러오는 중 오류가 발생했습니다."
      );
    } finally {
      setReservationsLoading(false);
    }
  };

  useEffect(() => {
    if (!popupId) return;
    loadReservations(reservationPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popupId, reservationPage]);

  const handleRetryDetail = () => {
    if (!popupId) return;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const data = await fetchManagerPopupDetailApi(popupId);
        setPopup(data);
      } catch (err) {
        console.error(err);
        const status = err?.response?.status;
        const code = err?.response?.data?.code;
        if (status === 404 || code === "POP_003") {
          setError("존재하지 않거나 접근 권한이 없는 팝업입니다.");
        } else {
          setError(
            err?.response?.data?.message ??
              "팝업 정보를 불러오는 중 오류가 발생했습니다."
          );
        }
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleRetryReservations = () => {
    loadReservations(0);
    setReservationPage(0);
  };

  // ---------------------------
  // 3. 상단 뷰 파생값
  // ---------------------------
  const statusLabel = popup ? STATUS_LABEL[popup.popStatus] ?? "" : "";
  const dateRange = popup
    ? formatDateRange(popup.popStartDate, popup.popEndDate)
    : "";

  const isFree =
    popup?.popPriceType === "FREE" ||
    popup?.popPriceType === "FREE_ENTRY" ||
    popup?.popPriceType === "FREE_EVENT";

  const aiSummaryText =
    popup?.popAiSummary || "팝업 스토어에 대한 요약 정보가 준비 중입니다.";

  // ---------------------------
  // 4. 상단 액션 핸들러
  // ---------------------------
  const handleClickViewUserPage = () => {
    if (!popupId) return;
    navigate(`/popup/${popupId}`);
  };

  const handleClickEdit = () => {
    // TODO: 추후 /manager/popup/:id/edit 또는 동일 페이지에서 편집 모드 진입
    alert("팝업 수정 기능은 추후 연결 예정입니다.");
  };

  const handleClickDelete = async () => {
    if (!popupId) return;
    if (
      !window.confirm(
        "정말 이 팝업을 삭제하시겠습니까?\n삭제 후에는 되돌릴 수 없습니다."
      )
    ) {
      return;
    }
    // TODO: 추후 삭제 API 연동
    setDeleting(true);
    try {
      alert("삭제 API 연동 후 동작하도록 연결 예정입니다.");
      // 삭제 성공 시:
      // navigate("/manager");
    } finally {
      setDeleting(false);
    }
  };

  // ---------------------------
  // 5. 예약자 파생값
  // ---------------------------
  const reservations = reservationPageData?.content ?? [];
  const reservationTotalPages = reservationPageData?.totalPages ?? 0;

  return {
    //기본
    navigate,
    popup,
    loading,
    error,

    //상단 뷰
    statusLabel,
    dateRange,
    aiSummaryText,
    isFree,
    userRole: user?.role,

    //상단 액션
    handleClickViewUserPage,
    handleClickEdit,
    handleClickDelete,
    deleting,

    //예약자 목록
    reservations,
    reservationPage,
    reservationTotalPages,
    reservationsLoading,
    reservationsError,
    setReservationPage,
    handleRetryDetail,
    handleRetryReservations,
  };
}
