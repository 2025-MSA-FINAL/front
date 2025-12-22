// 날짜 + 시간 선택
// src/components/chat/common/schedule/ScheduleDateTimePicker.jsx
import { useRef, useState } from "react";

function wrap(value, min, max) {
  if (value > max) return min;
  if (value < min) return max;
  return value;
}

function useTouchWheel(onStep) {
  const startY = useRef(null);

  const onTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e) => {
    if (startY.current == null) return;

    const delta = startY.current - e.touches[0].clientY;

    if (Math.abs(delta) > 15) {
      onStep(delta > 0 ? 1 : -1);
      startY.current = e.touches[0].clientY;
    }
  };

  const onTouchEnd = () => {
    startY.current = null;
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
}

export default function ScheduleDateTimePicker({
  value,
  onConfirm,
  onCancel,
  minDateTime,
}) {
  const initial = value ? new Date(value) : new Date();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(initial.getFullYear(), initial.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(initial);
  const [hour, setHour] = useState(initial.getHours());
  const [minute, setMinute] = useState(initial.getMinutes());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const prevLastDate = new Date(year, month, 0).getDate();

  const days = [];
  const now = new Date();
  now.setSeconds(0);
  now.setMilliseconds(0);

  // 기본 최소 시간
  let minAllowedTime = new Date(now);
  minAllowedTime.setMinutes(now.getMinutes() + 1);

  // ⭐ edit 모드에서 더 늦은 시간을 최소값으로
  if (minDateTime && minDateTime > minAllowedTime) {
    minAllowedTime = minDateTime;
  }

  const selectedDateTime = new Date(selectedDate);
  selectedDateTime.setHours(hour);
  selectedDateTime.setMinutes(minute);
  selectedDateTime.setSeconds(0);

  const isInvalidTime = selectedDateTime < minAllowedTime;

  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: prevLastDate - i, disabled: true });
  }
  for (let d = 1; d <= lastDate; d++) {
    days.push({ day: d, disabled: false });
  }
  while (days.length % 7 !== 0) {
    days.push({ day: null, disabled: true });
  }

  const confirm = () => {
    const d = new Date(selectedDate);
    d.setHours(hour);
    d.setMinutes(minute);
    d.setSeconds(0);

    const iso =
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0") +
      "T" +
      String(d.getHours()).padStart(2, "0") +
      ":" +
      String(d.getMinutes()).padStart(2, "0") +
      ":00";
    onConfirm(iso);
  };

  const handleHourWheel = (e) => {
    const delta = e.deltaY > 0 ? -1 : 1;
    setHour((h) => wrap(h + delta, 0, 23));
  };

  const handleMinuteWheel = (e) => {
    const delta = e.deltaY > 0 ? -1 : 1;
    setMinute((m) => wrap(m + delta, 0, 59));
  };

  const hourTouch = useTouchWheel((step) =>
    setHour((h) => wrap(h + step, 0, 23))
  );

  const minuteTouch = useTouchWheel((step) =>
    setMinute((m) => wrap(m + step, 0, 59))
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40 rounded-2xl"
        onClick={onCancel}
      />

      {/* iOS card */}
      <div
        className="
          relative w-[340px]
          bg-white/90 backdrop-blur-xl
          rounded-3xl p-5
          shadow-2xl
          animate-scale-in
        "
      >
        {/* header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="text-xl text-gray-500"
          >
            ‹
          </button>

          <h3 className="font-semibold text-base">
            {currentMonth.toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h3>

          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="text-xl text-gray-500"
          >
            ›
          </button>
        </div>

        {/* weekdays */}
        <div className="grid grid-cols-7 text-[11px] text-gray-400 mb-1">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="text-center">
              {d}
            </div>
          ))}
        </div>

        {/* calendar */}
        <div className="grid grid-cols-7 gap-1 text-sm mb-4">
          {days.map((d, idx) => {
            const cellDate =
              d.day != null ? new Date(year, month, d.day) : null;

            const isPastDate =
              cellDate &&
              cellDate <
                new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const isSelected =
              cellDate &&
              selectedDate.getFullYear() === cellDate.getFullYear() &&
              selectedDate.getMonth() === cellDate.getMonth() &&
              selectedDate.getDate() === cellDate.getDate();

            const isDisabled = d.disabled || d.day == null || isPastDate;

            return (
              <button
                key={idx}
                disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) setSelectedDate(cellDate);
                }}
                className={`
                    h-9 w-9 mx-auto rounded-full
                    transition-all cursor-pointer
                    ${
                      isSelected
                        ? "bg-[#5856D6] text-white scale-105"
                        : "hover:bg-gray-100"
                    }
                    ${
                      isDisabled
                        ? "text-gray-300 cursor-not-allowed pointer-events-none hover:bg-transparent"
                        : "text-gray-900"
                    }
                    `}
              >
                {d.day}
              </button>
            );
          })}
        </div>

        {/* time wheel */}
        <div className="flex items-center justify-center gap-8 py-4 border-t">
          {/* Hour */}
          <div
            onWheel={handleHourWheel}
            {...hourTouch}
            className="
                flex flex-col items-center
                select-none cursor-pointer
                "
          >
            <span className="text-[11px] text-gray-400 mb-1">Hour</span>
            <div className="text-3xl font-semibold w-12 text-center">
              {String(hour).padStart(2, "0")}
            </div>
          </div>

          <span className="text-3xl font-semibold text-gray-400">:</span>

          {/* Minute */}
          <div
            onWheel={handleMinuteWheel}
            {...minuteTouch}
            className="
                flex flex-col items-center
                select-none cursor-pointer
                "
          >
            <span className="text-[11px] text-gray-400 mb-1">Min</span>
            <div className="text-3xl font-semibold w-12 text-center">
              {String(minute).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="flex justify-between mt-4">
          <button
            onClick={onCancel}
            className="text-[#5856D6] font-semibold cursor-pointer"
          >
            취소
          </button>

          <button
            onClick={confirm}
            disabled={isInvalidTime}
            className="
                px-4 py-2 rounded-full
                bg-[#5856D6] text-white
                font-semibold
                disabled:opacity-40 cursor-pointer
            "
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
