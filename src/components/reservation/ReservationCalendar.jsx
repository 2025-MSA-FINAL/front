// src/components/reservation/ReservationCalendar.jsx
import { formatDateKey } from "../../utils/reservationDateUtils";
import { usePopupReservationStore } from "../../store/popupReservationStore";

export function ReservationCalendar() {
  // 예약 기간(period)은 이제 LeftForm에서 날짜/시간과 함께 입력받고,
  // 이 달력은 "제외일"만 설정하는 용도로 사용합니다.
  const popupPeriod = usePopupReservationStore((state) => state.popupPeriod);
  const excludeDates = usePopupReservationStore((state) => state.excludeDates);
  const calendarYear = usePopupReservationStore((state) => state.calendarYear);
  const calendarMonth = usePopupReservationStore(
    (state) => state.calendarMonth
  );
  const setExcludeDates = usePopupReservationStore(
    (state) => state.setExcludeDates
  );
  const setCalendar = usePopupReservationStore((state) => state.setCalendar);

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay(); // 0~6

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
            <div className="flex items-center gap-1 rounded-full bg-[#F4F0FF] px-2 py-0.5 text-[11px] text-slate-600">
              <span className="px-2 py-0.5 rounded-full bg-white text-[#BA3BFF] shadow-sm">
                제외일 설정
              </span>
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

            const inPopupPeriod = isInPopupPeriod(date);
            const isExcluded = excludeDates.includes(key);

            let base =
              "relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs transition-colors";
            let bg = "bg-transparent text-slate-400";

            if (inPopupPeriod) {
              bg = "bg-[#F5EBFF] text-slate-800";
            }
            if (isExcluded) {
              bg = "bg-[#FFE5EC] text-[#F97373]";
            }

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleDayClick(date)}
                className={`${base} ${bg} ${
                  !inPopupPeriod ? "cursor-default opacity-40" : ""
                }`}
                disabled={!inPopupPeriod}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* 안내 텍스트 */}
        <div className="mt-3 text-[11px] text-slate-400 text-center">
          팝업 운영 기간 안에서만 제외일을 선택할 수 있습니다.
        </div>
      </div>
    </div>
  );
}
