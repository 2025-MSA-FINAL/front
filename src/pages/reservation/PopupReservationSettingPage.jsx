// src/pages/reservation/PopupReservationSettingPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { usePopupReservationStore } from "../../store/popupReservationStore";
import { formatDateKey } from "../../utils/reservationDateUtils";
import { apiClient } from "../../api/authApi";
import PrimaryButton from "../../components/button/PrimaryButton.jsx";
import { ReservationLeftForm } from "../../components/reservation/ReservationLeftForm.jsx";
import { ReservationCalendar } from "../../components/reservation/ReservationCalendar.jsx";
import { ReservationSummary } from "../../components/reservation/ReservationSummary.jsx";

function PopupReservationSettingPage() {
  const { popupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 필드별 selector
  const reservationInfo = usePopupReservationStore(
    (state) => state.reservationInfo
  );
  const period = usePopupReservationStore((state) => state.period);
  const timetables = usePopupReservationStore((state) => state.timetables);
  const excludeDates = usePopupReservationStore(
    (state) => state.excludeDates
  );

  const setPopupPeriod = usePopupReservationStore(
    (state) => state.setPopupPeriod
  );
  const setCalendar = usePopupReservationStore((state) => state.setCalendar);
  const setCalendarMode = usePopupReservationStore(
    (state) => state.setCalendarMode
  );

  // ✅ 새로 추가: 전체 초기화 함수
  const resetReservation = usePopupReservationStore(
    (state) => state.resetReservation
  );

  // ✅ 팝업 등록 페이지에서 넘긴 "팝업 기간"으로 popupPeriod만 세팅
  useEffect(() => {
    const state = location.state;
    if (!state) return;

    const { popupStartDate, popupEndDate } = state;
    if (!popupStartDate || !popupEndDate) return;

    const start = new Date(popupStartDate);
    const end = new Date(popupEndDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return;
    }

    // 팝업 기간 고정
    setPopupPeriod({ startDate: start, endDate: end });

    // 캘린더는 팝업 시작 월로 이동
    setCalendar({
      year: start.getFullYear(),
      month: start.getMonth(),
    });

    // 기본 모드는 예약 기간(PERIOD) 모드
    setCalendarMode("PERIOD");
  }, [location.state, setPopupPeriod, setCalendar, setCalendarMode]);

  const handleSubmit = async () => {
    if (!period.startDate || !period.endDate) {
      alert("예약 기간을 먼저 선택해주세요.");
      return;
    }

    if (!reservationInfo.maxUserCnt) {
      alert("계정당 최대 예약가능 인원을 선택해주세요.");
      return;
    }

    if (
      !reservationInfo.reservationOpenStartTime ||
      !reservationInfo.reservationOpenEndTime
    ) {
      alert("예약 오픈 시작/종료 시각을 설정해주세요.");
      return;
    }

    const startDateKey = formatDateKey(period.startDate); // YYYY-MM-DD
    const endDateKey = formatDateKey(period.endDate); // YYYY-MM-DD

    const payload = {
      reservationInfo: {
        entryTimeUnit: reservationInfo.entryTimeUnit,
        // 예약 시작일 + 예약 오픈 시작 시각
        startDate: `${startDateKey}T${reservationInfo.reservationOpenStartTime}:00`,
        // 예약 종료일 + 예약 오픈 종료 시각
        endDate: `${endDateKey}T${reservationInfo.reservationOpenEndTime}:00`,
        maxUserCnt: reservationInfo.maxUserCnt,
      },
      timetables: timetables.map((t) => ({
        dayOfWeek: t.dayOfWeek,
        startTime: t.startTime,
        endTime: t.endTime,
        capacity: t.capacity,
      })),
      excludeDates: excludeDates.map((d) => ({ date: d })),
    };

    try {
      setIsSubmitting(true);
      await apiClient.post(
        `/api/popup/${popupId}/reservation-setting`,
        payload
      );
      alert("예약 설정이 저장되었습니다.");

      // ✅ 성공 시 전역 예약 상태 초기화
      resetReservation();

      navigate(`/popup/${popupId}`);
    } catch (error) {
      console.error(error);
      alert("예약 설정 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5FF] flex justify-center py-10">
      <div className="w-[1120px] rounded-[32px] bg-white shadow-xl px-10 pt-8 pb-6 flex flex-col">
        <h1 className="text-center text-lg font-semibold mb-6">
          POPUP 예약 등록
        </h1>

        {/* 상단: 왼쪽 폼 + 오른쪽 캘린더 */}
        <div className="flex flex-row gap-8 items-start">
          {/* 왼쪽을 조금 더 넓게 (6 : 5 비율) */}
          <div className="flex-[6] flex flex-col">
            <ReservationLeftForm />
          </div>
          <div className="flex-[5] flex flex-col">
            <ReservationCalendar />
          </div>
        </div>

        {/* 하단 요약 */}
        <ReservationSummary />

        {/* 우하단 등록 완료 버튼 */}
        <div className="mt-4 flex justify-end">
          <PrimaryButton onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "등록 완료"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export default PopupReservationSettingPage;
