import { useState } from "react";
import { useParams,useNavigate } from "react-router-dom";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reservationInfo = usePopupReservationStore(
    (state) => state.reservationInfo
  );
  const period = usePopupReservationStore((state) => state.period);
  const timetables = usePopupReservationStore((state) => state.timetables);
  const excludeDates = usePopupReservationStore(
    (state) => state.excludeDates
  );

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
        // 요일별 팝업 운영 시작/종료 시각
        startTime: t.startTime,
        endTime: t.endTime,
        capacity: t.capacity,
      })),
      excludeDates: excludeDates.map((d) => ({ date: d })),
    };

    try {
      setIsSubmitting(true);
      await apiClient.post(`/api/popup/${popupId}/reservation-setting`, payload);
      alert("예약 설정이 저장되었습니다.");
      navigate("/");
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

        {/* 상단: 왼쪽 폼 + 오른쪽 캘린더 (항상 가로 배치) */}
        <div className="flex flex-row gap-8">
          <div className="flex-[7]">
            <ReservationLeftForm />
          </div>
          <div className="flex-[5]">
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
