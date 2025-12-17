// src/components/reservation/ReservationLeftForm.jsx
import { usePopupReservationStore } from "../../store/popupReservationStore";

const ENTRY_TIME_UNIT = {
  ALL_DAY: "상시",
  MIN30: "30분",
  HOUR1: "1시간",
};

const WEEKDAYS = [
  { code: "SUN", label: "일" },
  { code: "MON", label: "월" },
  { code: "TUE", label: "화" },
  { code: "WED", label: "수" },
  { code: "THU", label: "목" },
  { code: "FRI", label: "금" },
  { code: "SAT", label: "토" },
];

export function ReservationLeftForm() {
  const reservationInfo = usePopupReservationStore(
    (state) => state.reservationInfo
  );
  const selectedWeekdays = usePopupReservationStore(
    (state) => state.selectedWeekdays
  );
  const timeForm = usePopupReservationStore((state) => state.timeForm);
  const timetables = usePopupReservationStore((state) => state.timetables);
  const period = usePopupReservationStore((state) => state.period);
  const popupPeriod = usePopupReservationStore((state) => state.popupPeriod);

  const setReservationInfo = usePopupReservationStore(
    (state) => state.setReservationInfo
  );
  const setTimeForm = usePopupReservationStore((state) => state.setTimeForm);
  const addTimetables = usePopupReservationStore(
    (state) => state.addTimetables
  );
  const toggleWeekday = usePopupReservationStore(
    (state) => state.toggleWeekday
  );
  const setPeriod = usePopupReservationStore((state) => state.setPeriod);

  const handleMaxUserChange = (e) => {
    const raw = e.target.value;

    // ✅ 지우는 중(빈 값)에는 0으로 바꾸지 말고 비워두기
    if (raw === "") {
      setReservationInfo({ maxUserCnt: null });
      return;
    }

    // ✅ 숫자만 반영 + 1 이상 보장
    const value = parseInt(raw, 10);
    if (Number.isNaN(value)) {
      setReservationInfo({ maxUserCnt: null });
      return;
    }

    setReservationInfo({ maxUserCnt: Math.max(1, value) });
  };

  const handleEntryTimeUnitChange = (e) => {
    setReservationInfo({ entryTimeUnit: e.target.value });
  };

  const handleTimeFormChange = (e) => {
    const { name, value } = e.target;
    setTimeForm({ [name]: value });
  };

  const handleAddTime = () => {
    if (!timeForm.startTime || !timeForm.endTime || !timeForm.capacity) {
      alert("시작시간, 종료시간, 일별 최대 인원을 모두 입력해주세요.");
      return;
    }

    if (timeForm.endTime <= timeForm.startTime) {
      alert("종료시간은 시작시간보다 늦어야 합니다.");
      return;
    }

    const capacity = Number(timeForm.capacity);
    if (Number.isNaN(capacity) || capacity <= 0) {
      alert("일별 최대 인원은 1명 이상이어야 합니다.");
      return;
    }

    const hasConflict = selectedWeekdays.some((code) =>
      timetables.some((t) => t.dayOfWeek === code)
    );

    if (hasConflict) {
      alert(
        "선택한 요일 중 이미 시간대가 설정된 요일이 있습니다.\n요약 영역에서 기존 시간대를 삭제하고 다시 추가해주세요."
      );
      return;
    }

    const entries = selectedWeekdays.map((code) => ({
      dayOfWeek: code,
      startTime: timeForm.startTime,
      endTime: timeForm.endTime,
      capacity,
    }));

    addTimetables(entries);
    setTimeForm({ startTime: "", endTime: "", capacity: "" });
  };

  const buildDateTimeValue = (date, time) => {
    if (!date || !time) return "";
    const d = date instanceof Date ? date : new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${time}`;
  };

  const handleReservationStartDateTimeChange = (e) => {
    const value = e.target.value;
    if (!value) {
      setReservationInfo({ reservationOpenStartTime: "" });
      setPeriod({
        startDate: null,
        endDate: period?.endDate ?? null,
      });
      return;
    }
    const [datePart, timePart] = value.split("T");
    const startDate = new Date(`${datePart}T00:00:00`);

    if (popupPeriod?.endDate) {
      const popupEnd =
        popupPeriod.endDate instanceof Date
          ? popupPeriod.endDate
          : new Date(popupPeriod.endDate);
      if (startDate > popupEnd) {
        alert("예약 시작일은 팝업 운영 종료일보다 늦을 수 없습니다.");
        return;
      }
    }

    setReservationInfo({ reservationOpenStartTime: timePart });
    setPeriod({
      startDate,
      endDate: period?.endDate ?? null,
    });
  };

  const handleReservationEndDateTimeChange = (e) => {
    const value = e.target.value;
    if (!value) {
      setReservationInfo({ reservationOpenEndTime: "" });
      setPeriod({
        startDate: period?.startDate ?? null,
        endDate: null,
      });
      return;
    }
    const [datePart, timePart] = value.split("T");
    const endDate = new Date(`${datePart}T00:00:00`);

    if (popupPeriod?.endDate) {
      const popupEnd =
        popupPeriod.endDate instanceof Date
          ? popupPeriod.endDate
          : new Date(popupPeriod.endDate);
      if (endDate > popupEnd) {
        alert("예약 종료일은 팝업 운영 종료일보다 늦을 수 없습니다.");
        return;
      }
    }

    setReservationInfo({ reservationOpenEndTime: timePart });
    setPeriod({
      startDate: period?.startDate ?? null,
      endDate,
    });
  };

  const reservationStartDateTimeValue = buildDateTimeValue(
    period?.startDate,
    reservationInfo.reservationOpenStartTime
  );
  const reservationEndDateTimeValue = buildDateTimeValue(
    period?.endDate,
    reservationInfo.reservationOpenEndTime
  );

  const popupEndDateTimeMax = popupPeriod?.endDate
    ? buildDateTimeValue(popupPeriod.endDate, "23:59")
    : "";

  return (
    <div className="flex flex-col gap-4">
      {/* 영역 1: 계정당 최대 인원 + 예약 시작/종료 일시 */}
      <div className="rounded-2xl bg-[#F8F5FF] px-5 py-4 flex flex-col gap-4">
        {/* 계정당 최대 인원 */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-700">
            계정당 최대 인원
          </label>
          <div className="rounded-2xl border-2 border-[#D173FF] bg-white px-4 py-3 flex items-center justify-center gap-2 shadow-sm">
            <input
              type="number"
              min={1}
              step={1}
              value={reservationInfo.maxUserCnt ?? ""}
              onChange={handleMaxUserChange}
              placeholder="0"
              className="w-16 bg-transparent border-none text-xl text-center font-bold text-[#BA3BFF] outline-none
                         [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                         placeholder:text-slate-300"
            />
            <span className="text-base font-semibold text-slate-600">명</span>
          </div>
        </div>

        {/* 예약 시작/종료 일시 */}
        <div className="flex flex-col gap-2 rounded-xl bg-white/70 px-4 py-3 border border-[#E2D7FF]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              예약 기간
            </span>
            <span className="rounded-full bg-[#F4F0FF] px-2.5 py-1 text-[10px] text-slate-500">
              예약 받을 기간
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="w-9 text-xs font-medium text-slate-600">
                시작
              </span>
              <input
                type="datetime-local"
                value={reservationStartDateTimeValue}
                onChange={handleReservationStartDateTimeChange}
                max={popupEndDateTimeMax}
                className="flex-1 h-9 rounded-lg border border-[#E2D7FF] bg-white 
                           px-3 py-2 text-[11px] text-center leading-none outline-none 
                           focus:border-[#C65CFF] focus:ring-2 focus:ring-[#C65CFF]/15"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="w-9 text-xs font-medium text-slate-600">
                종료
              </span>
              <input
                type="datetime-local"
                value={reservationEndDateTimeValue}
                onChange={handleReservationEndDateTimeChange}
                max={popupEndDateTimeMax}
                className="flex-1 h-9 rounded-lg border border-[#E2D7FF] bg-white 
                           px-3 py-2 text-[11px] text-center leading-none outline-none 
                           focus:border-[#C65CFF] focus:ring-2 focus:ring-[#C65CFF]/15"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 영역 2: 나머지 설정들 */}
      <div className="rounded-2xl bg-[#F8F5FF] px-5 py-4 flex flex-col gap-4">
        {/* 입장 단위 시간 */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-700">
            입장 단위 시간
          </span>
          <div className="flex items-center gap-3">
            {Object.entries(ENTRY_TIME_UNIT).map(([code, label]) => (
              <label key={code} className="inline-flex items-center gap-1.5">
                <input
                  type="radio"
                  name="entryTimeUnit"
                  value={code}
                  checked={reservationInfo.entryTimeUnit === code}
                  onChange={handleEntryTimeUnitChange}
                  className="h-3.5 w-3.5 accent-[#C65CFF]"
                />
                <span className="text-xs">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 요일 선택 */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-700">
            요일 선택
          </span>
          <div className="flex gap-2">
            {WEEKDAYS.map((d) => {
              const active = selectedWeekdays.includes(d.code);
              return (
                <button
                  key={d.code}
                  type="button"
                  onClick={() => toggleWeekday(d.code)}
                  className={`min-w-[32px] rounded-lg border px-2.5 py-1.5 text-xs transition-all ${
                    active
                      ? "border-[#D173FF] bg-[#F6E6FF] font-semibold text-[#BA3BFF]"
                      : "border-[#E2D7FF] bg-white text-slate-700 hover:border-[#D173FF]/50"
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 팝업 운영 시간 */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-700">
            팝업 운영 시간
          </span>
          <div className="flex items-center gap-2">
            <input
              type="time"
              name="startTime"
              value={timeForm.startTime}
              onChange={handleTimeFormChange}
              className="flex-1 h-9 rounded-lg border border-[#E2D7FF] bg-white 
                         px-3 py-2 text-xs text-center leading-none outline-none 
                         focus:border-[#C65CFF] focus:ring-2 focus:ring-[#C65CFF]/20"
            />
            <span className="text-xs text-slate-400 font-medium">~</span>
            <input
              type="time"
              name="endTime"
              value={timeForm.endTime}
              onChange={handleTimeFormChange}
              className="flex-1 h-9 rounded-lg border border-[#E2D7FF] bg-white 
                         px-3 py-2 text-xs text-center leading-none outline-none 
                         focus:border-[#C65CFF] focus:ring-2 focus:ring-[#C65CFF]/20"
            />
          </div>
        </div>

        {/* 일별 최대 인원 + 시간 추가 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              일별 최대 인원
            </span>
            <div className="flex items-center gap-2">
              <div className="rounded-lg border-2 border-[#D173FF] bg-white px-3 py-1.5 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  name="capacity"
                  value={timeForm.capacity}
                  onChange={handleTimeFormChange}
                  placeholder="0"
                  className="w-12 bg-transparent border-none text-base text-center font-bold text-[#BA3BFF] outline-none 
                             [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                             placeholder:text-slate-300"
                />
                <span className="text-sm font-semibold text-slate-600">명</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddTime}
            className="w-full rounded-lg border-2 border-[#D173FF] bg-white py-2.5 
                       text-sm font-semibold text-[#BA3BFF] hover:bg-[#F6E6FF] transition-colors"
          >
            + 시간 추가
          </button>
        </div>
      </div>
    </div>
  );
}