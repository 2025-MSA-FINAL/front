import { formatDateDisplay } from "../../utils/reservationDateUtils";
import { usePopupReservationStore } from "../../store/popupReservationStore";

const DAY_LABEL = {
  SUN: "일",
  MON: "월",
  TUE: "화",
  WED: "수",
  THU: "목",
  FRI: "금",
  SAT: "토",
};

export function ReservationSummary() {
  const period = usePopupReservationStore((state) => state.period);
  const excludeDates = usePopupReservationStore(
    (state) => state.excludeDates
  );
  const timetables = usePopupReservationStore((state) => state.timetables);
  const resetPeriod = usePopupReservationStore((state) => state.resetPeriod);
  const removeTimetable = usePopupReservationStore(
    (state) => state.removeTimetable
  );

  return (
    <div className="mt-6 rounded-3xl bg-gradient-to-br from-[#FBF4FF] to-[#F7F8FF] px-6 py-5">
      <div className="space-y-4 text-xs text-slate-700">
        {/* 예약 기간 */}
        <div>
          <div className="mb-1 font-semibold flex items-center gap-1">
            <span className="text-[#C65CFF]">●</span> 예약 기간
          </div>
          {period.startDate && period.endDate ? (
            <div className="flex items-center gap-3">
              <span>
                {formatDateDisplay(period.startDate)} ~{" "}
                {formatDateDisplay(period.endDate)}
              </span>
              <button
                type="button"
                onClick={resetPeriod}
                className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] text-slate-500 hover:bg-white"
              >
                기간 초기화
              </button>
            </div>
          ) : (
            <div className="text-slate-400">선택된 기간이 없습니다.</div>
          )}
        </div>

        {/* 제외일 */}
        <div>
          <div className="mb-1 font-semibold flex items-center gap-1">
            <span className="text-[#C65CFF]">●</span> 제외일
          </div>
          {excludeDates.length === 0 ? (
            <div className="text-slate-400">설정된 제외일이 없습니다.</div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {excludeDates
                .slice()
                .sort()
                .map((d) => (
                  <span
                    key={d}
                    className="rounded-full bg-white px-2.5 py-1 text-[11px] text-slate-600 shadow-sm"
                  >
                    {d}
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* 요일별 타임테이블 */}
        <div>
          <div className="mb-1 font-semibold flex items-center gap-1">
            <span className="text-[#C65CFF]">●</span> 요일별 타임테이블
          </div>
          {timetables.length === 0 ? (
            <div className="text-slate-400">
              요일별로 추가된 타임테이블이 없습니다.
            </div>
          ) : (
            <ul className="space-y-1.5">
              {timetables.map((t, idx) => (
                <li
                  key={`${t.dayOfWeek}-${t.startTime}-${t.endTime}-${idx}`}
                  className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-[11px] shadow-sm"
                >
                  <span>
                    {DAY_LABEL[t.dayOfWeek]}요일 · {t.startTime} ~ {t.endTime} ·{" "}
                    최대 {t.capacity}명
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTimetable(idx)}
                    className="text-[11px] text-slate-400 hover:text-red-400"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
