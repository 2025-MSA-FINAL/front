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
  // ❗ 필드별 selector (객체 리턴 X)
  const reservationInfo = usePopupReservationStore(
    (state) => state.reservationInfo
  );
  const selectedWeekdays = usePopupReservationStore(
    (state) => state.selectedWeekdays
  );
  const timeForm = usePopupReservationStore((state) => state.timeForm);
  const timetables = usePopupReservationStore((state) => state.timetables);

  const setReservationInfo = usePopupReservationStore(
    (state) => state.setReservationInfo
  );
  const setTimeForm = usePopupReservationStore(
    (state) => state.setTimeForm
  );
  const addTimetables = usePopupReservationStore(
    (state) => state.addTimetables
  );
  const toggleWeekday = usePopupReservationStore(
    (state) => state.toggleWeekday
  );
  const removeTimetable = usePopupReservationStore(
    (state) => state.removeTimetable
  );

  const handleMaxUserChange = (e) => {
    const value = Number(e.target.value);
    setReservationInfo({ maxUserCnt: value });
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
      alert("팝업 시작·종료 시간과 일별 최대 인원을 모두 입력해주세요.");
      return;
    }

    if (timeForm.endTime <= timeForm.startTime) {
      alert("팝업 종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    const capacity = Number(timeForm.capacity);
    if (Number.isNaN(capacity) || capacity <= 0) {
      alert("일별 최대 인원은 1명 이상이어야 합니다.");
      return;
    }

    // ✅ 한 요일에는 하나의 시간대만 유지
    if (timetables && timetables.length > 0) {
      const toRemove = [];
      timetables.forEach((t, idx) => {
        if (selectedWeekdays.includes(t.dayOfWeek)) {
          toRemove.push(idx);
        }
      });
      toRemove
        .sort((a, b) => b - a)
        .forEach((idx) => removeTimetable(idx));
    }

    const entries = selectedWeekdays.map((code) => ({
      dayOfWeek: code,
      startTime: timeForm.startTime, // 요일별 팝업 시작 시간
      endTime: timeForm.endTime,     // 요일별 팝업 종료 시간
      capacity,
    }));

    addTimetables(entries);
    setTimeForm({ startTime: "", endTime: "", capacity: "" });
  };

  return (
    <div className="rounded-3xl bg-[#F8F5FF] px-6 py-5 flex flex-col gap-4">
      {/* 계정당 최대 인원 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700">
          계정당 최대 예약가능 인원
        </label>
        <select
          className="w-full rounded-full border border-[#E2D7FF] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#C65CFF] focus:ring-2 focus:ring-[#C65CFF]/20"
          value={reservationInfo.maxUserCnt ?? ""}
          onChange={handleMaxUserChange}
        >
          <option value="" disabled>
            선택
          </option>
          {Array.from({ length: 10 }).map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}명
            </option>
          ))}
        </select>
      </div>

      {/* 입장 단위 시간 */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-slate-700">
          입장 단위 시간
        </span>
        <div className="flex items-center gap-4 text-xs">
          {Object.entries(ENTRY_TIME_UNIT).map(([code, label]) => (
            <label key={code} className="inline-flex items-center gap-1.5">
              <input
                type="radio"
                name="entryTimeUnit"
                value={code}
                checked={reservationInfo.entryTimeUnit === code}
                onChange={handleEntryTimeUnitChange}
                className="h-3 w-3 accent-[#C65CFF]"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 전역 예약 오픈 시작/종료 시각 (기간과 합쳐서 DTO로 보냄) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-700">
            예약 오픈 시작 시각
          </span>
          <input
            type="time"
            value={reservationInfo.reservationOpenStartTime || ""}
            onChange={(e) =>
              setReservationInfo({
                reservationOpenStartTime: e.target.value,
              })
            }
            className="w-full rounded-full border border-[#E2D7FF] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#C65CFF] focus:ring-2 focus:ring-[#C65CFF]/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-700">
            예약 오픈 종료 시각
          </span>
          <input
            type="time"
            value={reservationInfo.reservationOpenEndTime || ""}
            onChange={(e) =>
              setReservationInfo({
                reservationOpenEndTime: e.target.value,
              })
            }
            className="w-full rounded-full border border-[#E2D7FF] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#C65CFF] focus:ring-2 focus:ring-[#C65CFF]/20"
          />
        </div>
      </div>

      {/* 요일 선택 */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-slate-700">요일 선택</span>
        <div className="flex gap-2 flex-wrap">
          {WEEKDAYS.map((d) => {
            const active = selectedWeekdays.includes(d.code);
            return (
              <button
                key={d.code}
                type="button"
                onClick={() => toggleWeekday(d.code)}
                className={`min-w-[32px] rounded-full border px-2.5 py-1 text-xs ${
                  active
                    ? "border-[#D173FF] bg-[#F6E6FF] font-semibold text-[#BA3BFF]"
                    : "border-[#E2D7FF] bg-white text-slate-700"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 요일별 팝업 시작/종료 시간 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-700">
            팝업 시작 시간
          </span>
          <input
            type="time"
            name="startTime"
            value={timeForm.startTime}
            onChange={handleTimeFormChange}
            className="w-full rounded-full border border-[#E2D7FF] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#C65CFF] focus:ring-2 focus:ring-[#C65CFF]/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-700">
            팝업 종료 시간
          </span>
          <input
            type="time"
            name="endTime"
            value={timeForm.endTime}
            onChange={handleTimeFormChange}
            className="w-full rounded-full border border-[#E2D7FF] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#C65CFF] focus:ring-2 focus:ring-[#C65CFF]/20"
          />
        </div>
      </div>

      {/* 인원 + 시간 추가 */}
      <div className="mt-1 flex items-end justify-between gap-3">
        <div className="flex-1 flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-700">
            일별 최대 인원
          </span>
          <input
            type="number"
            min={1}
            name="capacity"
            value={timeForm.capacity}
            onChange={handleTimeFormChange}
            placeholder="인원"
            className="w-full rounded-full border border-[#E2D7FF] bg-white px-4 py-2.5 text-sm outline-none placeholder:text-slate-300 focus:border-[#C65CFF] focus:ring-2 focus:ring-[#C65CFF]/20"
          />
        </div>
        <button
          type="button"
          onClick={handleAddTime}
          className="rounded-full border border-[#D173FF] bg-white px-4 py-2 text-xs font-semibold text-[#BA3BFF] hover:bg-[#F6E6FF]"
        >
          + 시간 추가
        </button>
      </div>
    </div>
  );
}
