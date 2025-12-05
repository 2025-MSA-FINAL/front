// src/components/reservation/ReservationCalendar.jsx
import { formatDateKey } from "../../utils/reservationDateUtils";
import { usePopupReservationStore } from "../../store/popupReservationStore";

export function ReservationCalendar() {
  const period = usePopupReservationStore((state) => state.period);
  const popupPeriod = usePopupReservationStore((state) => state.popupPeriod);
  const excludeDates = usePopupReservationStore((state) => state.excludeDates);
  const calendarYear = usePopupReservationStore((state) => state.calendarYear);
  const calendarMonth = usePopupReservationStore(
    (state) => state.calendarMonth
  );
  const calendarMode = usePopupReservationStore(
    (state) => state.calendarMode
  );
  const setPeriod = usePopupReservationStore((state) => state.setPeriod);
  const setExcludeDates = usePopupReservationStore(
    (state) => state.setExcludeDates
  );
  const setCalendar = usePopupReservationStore((state) => state.setCalendar);
  const setCalendarMode = usePopupReservationStore(
    (state) => state.setCalendarMode
  );

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay(); // 0~6

  const isSameDate = (a, b) => {
    if (!a || !b) return false;
    return formatDateKey(a) === formatDateKey(b);
  };

  const isInReservationPeriod = (date) => {
    if (!period.startDate || !period.endDate) return false;
    const key = formatDateKey(date);
    const startKey = formatDateKey(period.startDate);
    const endKey = formatDateKey(period.endDate);
    return startKey <= key && key <= endKey;
  };

  const isInPopupPeriod = (date) => {
    if (!popupPeriod.startDate || !popupPeriod.endDate) return false;
    const key = formatDateKey(date);
    const startKey = formatDateKey(popupPeriod.startDate);
    const endKey = formatDateKey(popupPeriod.endDate);
    return startKey <= key && key <= endKey;
  };

  const goPrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendar({ year: calendarYear - 1, month: 11 });
    } else {
      setCalendar({ year: calendarYear, month: calendarMonth - 1 });
    }
  };

  const goNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendar({ year: calendarYear + 1, month: 0 });
    } else {
      setCalendar({ year: calendarYear, month: calendarMonth + 1 });
    }
  };

  const handleDayClick = (date) => {
    if (calendarMode === "PERIOD") {
      // 예약 기간 설정
      if (!period.startDate || (period.startDate && period.endDate)) {
        // 새 시작일
        setPeriod({ startDate: date, endDate: null });
        // ❌ 더 이상 제외일 초기화 안 함
        return;
      }

      if (period.startDate && !period.endDate) {
        // 종료일 선택
        let start = period.startDate;
        let end = date;
        if (new Date(end) < new Date(start)) {
          [start, end] = [end, start];
        }
        setPeriod({ startDate: start, endDate: end });
        // ❌ 여기서도 제외일 초기화 안 함
        return;
      }
    }

    if (calendarMode === "EXCLUDE") {
      // 제외일은 "팝업 기간" 안에서만 허용
      if (!popupPeriod.startDate || !popupPeriod.endDate) return;
      if (!isInPopupPeriod(date)) return;

      const key = formatDateKey(date);
      setExcludeDates((prev) => {
        if (prev.includes(key)) {
          return prev.filter((d) => d !== key);
        }
        return [...prev, key];
      });
    }
  };

  return (
    <div className="h-full rounded-3xl bg-[#F8F5FF] px-4 py-4 flex items-center justify-center">
      <div className="w-full max-w-[520px] rounded-3xl bg-white px-5 py-4 shadow-lg">
        {/* 상단 헤더 */}
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={goPrevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F4F0FF] text-sm text-slate-600"
          >
            ‹
          </button>

          <div className="flex flex-col items-center gap-1">
            <div className="text-sm font-semibold text-slate-800">
              {calendarYear}년 {calendarMonth + 1}월
            </div>
            <div className="flex items-center gap-1 rounded-full bg-[#F4F0FF] px-1 py-0.5 text-[11px]">
              <button
                type="button"
                className={`px-2 py-0.5 rounded-full ${
                  calendarMode === "PERIOD"
                    ? "bg-white text-[#BA3BFF] shadow-sm"
                    : "text-slate-500"
                }`}
                onClick={() => setCalendarMode("PERIOD")}
              >
                예약 기간
              </button>
              <button
                type="button"
                disabled={!popupPeriod.startDate || !popupPeriod.endDate}
                className={`px-2 py-0.5 rounded-full ${
                  calendarMode === "EXCLUDE"
                    ? "bg-white text-[#BA3BFF] shadow-sm"
                    : "text-slate-500"
                } ${
                  !popupPeriod.startDate || !popupPeriod.endDate
                    ? "opacity-40"
                    : ""
                }`}
                onClick={() => setCalendarMode("EXCLUDE")}
              >
                제외일
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={goNextMonth}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F4F0FF] text-sm text-slate-600"
          >
            ›
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="mb-1 grid grid-cols-7 text-center text-[11px] text-slate-500">
          {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* 날짜 셀 */}
        <div className="grid grid-cols-7 gap-y-1 text-sm">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(calendarYear, calendarMonth, day);
            const key = formatDateKey(date);

            const inRange =
              calendarMode === "PERIOD"
                ? isInReservationPeriod(date)
                : isInPopupPeriod(date);

            const isStart =
              calendarMode === "PERIOD" &&
              period.startDate &&
              isSameDate(date, period.startDate);
            const isEnd =
              calendarMode === "PERIOD" &&
              period.endDate &&
              isSameDate(date, period.endDate);

            // EXCLUDE 모드에서만 제외일 하이라이트
            const isExcluded =
              calendarMode === "EXCLUDE" && excludeDates.includes(key);

            let base =
              "relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs transition-colors";
            let bg = "bg-transparent text-slate-700";

            if (inRange) bg = "bg-[#F5EBFF] text-slate-800";
            if (isExcluded) bg = "bg-[#FFE5EC] text-[#F97373]";
            if (isStart || isEnd) bg = "bg-[#C65CFF] text-white";

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleDayClick(date)}
                className={`${base} ${bg}`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* 안내 텍스트 */}
        <div className="mt-3 text-[11px] text-slate-400 text-center">
          예약 기간 모드: 첫 클릭 시작일 / 두 번째 클릭 종료일 (다시 클릭 시 새 기간 시작)
          <br />
          제외일 모드: 팝업 운영 기간 안의 날짜만 제외일로 설정할 수 있습니다.
        </div>
      </div>
    </div>
  );
}
