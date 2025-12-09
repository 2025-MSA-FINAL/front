// src/pages/reservation/PopupUserReservationPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PrimaryButton from "../../components/button/PrimaryButton.jsx";
import { fetchPopupDetailApi } from "../../api/popupApi.js";
import {
  fetchReservationCalendarApi,
  fetchTimeSlotsByDateApi,
  createReservationHoldApi,
} from "../../api/reservationApi.js";

/**
 * 날짜 -> 'YYYY-MM-DD'
 */
function formatDateKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * 날짜 셀
 */
function DayCell({ date, isAvailable, isSelected, onClick }) {
  if (!date) return <div />;

  const base =
    "flex items-center justify-center w-9 h-9 mx-auto text-[13px] rounded-full transition-all";

  const disabled = "text-secondary-dark/40 cursor-default";
  const available =
    "cursor-pointer text-text-black hover:bg-primary-light hover:text-primary-dark";
  const selected =
    "bg-primary text-text-white shadow-card font-semibold";

  const className = [
    base,
    !isAvailable && disabled,
    isAvailable && available,
    isSelected && selected,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      disabled={!isAvailable}
      onClick={isAvailable ? onClick : undefined}
      className={className}
    >
      {date.getDate()}
    </button>
  );
}

/**
 * 달력
 */
function UserReservationCalendar({
  startDate,
  endDate,
  availableDateKeys,
  selectedDate,
  onChangeDate,
}) {
  const baseDate = useMemo(() => {
    if (selectedDate) return new Date(selectedDate);
    if (startDate) return new Date(startDate);
    return new Date();
  }, [selectedDate, startDate]);

  const baseTime = baseDate.getTime();

  const [monthOffset, setMonthOffset] = useState(0);

  const currentMonth = useMemo(() => {
    const d = new Date(baseTime);
    d.setDate(1);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [baseTime, monthOffset]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const firstWeekday = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthLabel = `${year}년 ${(month + 1)
    .toString()
    .padStart(2, "0")}월`;

  const goPrevMonth = () => setMonthOffset((prev) => prev - 1);
  const goNextMonth = () => setMonthOffset((prev) => prev + 1);

  const isInRange = (d) => {
    if (!startDate || !endDate) return true;
    const t = d.getTime();
    return (
      t >= new Date(startDate).setHours(0, 0, 0, 0) &&
      t <= new Date(endDate).setHours(23, 59, 59, 999)
    );
  };

  return (
    <div className="bg-paper rounded-[24px] shadow-card p-6 md:p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goPrevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-secondary-light bg-paper-light hover:bg-secondary-light active:scale-95"
        >
          ‹
        </button>
        <div className="text-[16px] md:text-[18px] font-semibold text-text-black">
          {monthLabel}
        </div>
        <button
          type="button"
          onClick={goNextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-secondary-light bg-paper-light hover:bg-secondary-light active:scale-95"
        >
          ›
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 text-center text-[11px] text-text-black">
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-sm flex-1">
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const date = new Date(year, month, idx + 1);
          const key = formatDateKey(date);
          const isAvailable =
            isInRange(date) && availableDateKeys?.has(key);
          const isSelected =
            selectedDate && key === formatDateKey(selectedDate);

          return (
            <DayCell
              key={key}
              date={date}
              isAvailable={!!isAvailable}
              isSelected={!!isSelected}
              onClick={() => onChangeDate(date)}
            />
          );
        })}
      </div>

      <p className="mt-4 text-[11px] text-text-black text-center">
        이용 가능한 날짜만 선택할 수 있어요.
      </p>
    </div>
  );
}

/**
 * ⭐ 타임슬롯 버튼 — 요청한 부분만 수정됨
 */
function TimeSlotButton({ slot, selected, onClick }) {
  const disabled =
    slot.remainingCount !== undefined && slot.remainingCount <= 0;

  const base =
    "w-full flex items-center justify-between gap-3 rounded-full px-4 py-2 text-[13px] md:text-[14px] transition-all";
  const active = "bg-primary text-text-white shadow-card";
  const normal =
    "bg-primary-light text-primary-dark hover:bg-primary hover:text-text-white";
  const disabledCls =
    "bg-secondary-light text-text-sub cursor-not-allowed";

  const className = [
    base,
    disabled && disabledCls,
    !disabled && (selected ? active : normal),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      <div className="font-semibold flex items-center gap-1">
        {/* 시작 시간 */}
        <span>{slot.startTime}</span>

        {/* (3명) 형태로 표시 — "잔여" 글자 제거 */}
        {slot.remainingCount != null && (
          <span className="text-[12px]">({slot.remainingCount}명)</span>
        )}
      </div>
    </button>
  );
}

/**
 * 메인 페이지
 */
export default function PopupUserReservationPage() {
  const { popupId } = useParams();
  const navigate = useNavigate();

  const [popup, setPopup] = useState(null);
  const [calendar, setCalendar] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(false);
  const [holdLoading, setHoldLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ 추가: 예약 인원 상태
  const [peopleCount, setPeopleCount] = useState(1);

  // 전체 API 호출 로직 그대로 유지
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const [popupRes, calendarRes] = await Promise.all([
          fetchPopupDetailApi(popupId),
          fetchReservationCalendarApi(popupId),
        ]);

        if (cancelled) return;

        setPopup(popupRes);
        setCalendar(calendarRes);

        if (calendarRes?.availableDates?.length > 0) {
          const first = new Date(calendarRes.availableDates[0]);
          setSelectedDate(first);
        }
      } catch {
        if (!cancelled) {
          setError("예약 정보를 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (popupId) load();
    return () => (cancelled = true);
  }, [popupId]);

  useEffect(() => {
    async function loadSlots() {
      if (!selectedDate || !popupId) return;
      try {
        setSlotLoading(true);
        setTimeSlots([]);
        setSelectedSlotId(null);
        const key = formatDateKey(selectedDate);
        const res = await fetchTimeSlotsByDateApi(popupId, key);
        setTimeSlots(res.timeSlots || []);
      } finally {
        setSlotLoading(false);
      }
    }

    loadSlots();
  }, [popupId, selectedDate]);

  const availableDateKeys = useMemo(() => {
    if (!calendar?.availableDates) return new Set();
    return new Set(calendar.availableDates);
  }, [calendar]);

  const selectedSlot = useMemo(
    () => timeSlots.find((s) => s.slotId === selectedSlotId),
    [timeSlots, selectedSlotId]
  );

  // ✅ 예약 설정 기반 최대 인원 / 금액 계산
  // TODO: 아래 필드명은 백엔드 DTO에 맞게 조정해줘.
  const maxPeoplePerReservation =
    popup?.maxPeoplePerReservation ??
    popup?.reservationMaxPeople ??
    4; // 기본값 4명

  const pricePerPerson =
    popup?.popPrice ??
    0;

  const peopleOptions = useMemo(() => {
    const max = Math.max(1, maxPeoplePerReservation || 1);
    return Array.from({ length: max }, (_, i) => i + 1);
  }, [maxPeoplePerReservation]);

  const totalPrice = pricePerPerson * peopleCount;

  const handleSubmit = async () => {
    if (!selectedSlot) {
      alert("예약할 시간을 먼저 선택해주세요.");
      return;
    }

    if (!peopleCount || peopleCount <= 0) {
      alert("예약 인원을 선택해주세요.");
      return;
    }

    try {
      setHoldLoading(true);
      // ✅ 인원 수까지 함께 전달 (백엔드/Api 함수에서 두 번째 파라미터 받도록 수정 필요)
      const res = await createReservationHoldApi(
        selectedSlot.slotId,
        peopleCount
      );
      navigate(`/reservation/checkout/${res.reservationId}`, {
        state: {
          popupId,
          reservationId: res.reservationId,
          sessionUuid: res.sessionUuid,
          slot: selectedSlot,
          date: formatDateKey(selectedDate),
          peopleCount,
          pricePerPerson,
          totalPrice,
        },
      });
    } catch (e) {
      if (e?.response?.status === 409) {
        alert(
          "방금 사이에 자리가 모두 마감되었어요. 다른 시간대를 선택해주세요."
        );
      } else if (e?.response?.status === 400) {
        alert(
          e?.response?.data?.message ||
            "선택하신 인원 수로는 예약이 불가능합니다."
        );
      } else {
        alert("예약 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setHoldLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-light flex items-center justify-center">
        <div className="text-text-black text-sm">
          예약 정보를 불러오는 중입니다...
        </div>
      </div>
    );
  }

  if (error || !popup) {
    return (
      <div className="min-h-screen bg-secondary-light flex items-center justify-center">
        <div className="bg-paper rounded-[20px] shadow-card px-6 py-5 text-sm text-text-black">
          {error || "팝업 정보를 찾을 수 없습니다."}
        </div>
      </div>
    );
  }

  const dateRangeLabel =
    popup.popStartDate || popup.popEndDate
      ? `${popup.popStartDate?.slice(0, 10)} ~ ${popup.popEndDate?.slice(
          0,
          10
        )}`
      : "";

  const thumbnailUrl =
    popup.popThumbnailUrl ||
    popup.popThumbnail ||
    popup.images?.[0] ||
    "";

  const selectedDateLabel = selectedDate
    ? formatDateKey(selectedDate)
    : "-";

  const selectedTimeLabel = selectedSlot?.startTime || "-";

  return (
    <div className="min-h-screen bg-secondary-light">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pb-28 pt-6 md:pt-8">
        <h1 className="text-[18px] md:text-[22px] font-semibold text-text-black mb-5 md:mb-6">
          예약 정보 확인
        </h1>

        {/* 4개 영역 — 원본 유지 */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-7">
          <div className="bg-paper rounded-[24px] shadow-card p-4 md:p-5 flex items-center justify-center">
            <div className="w-full aspect-[3/2] rounded-[20px] overflow-hidden bg-secondary-light border border-secondary/40 flex items-center justify-center">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={popup.popName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-text-black text-sm">
                  썸네일 이미지가 없습니다.
                </span>
              )}
            </div>
          </div>

          <div className="bg-paper rounded-[24px] shadow-card p-5 md:p-6 flex flex-col gap-4">
            <div>
              <h2 className="text-[20px] md:text-[22px] font-semibold text-text-black mb-2">
                {popup.popName}
              </h2>

              {dateRangeLabel && (
                <p className="text-[13px] text-text-black mb-1">
                  <span className="font-medium mr-1">운영 기간</span>
                  {dateRangeLabel}
                </p>
              )}

              {popup.popOpenTime && popup.popCloseTime && (
                <p className="text-[13px] text-text-black mb-1">
                  <span className="font-medium mr-1">운영 시간</span>
                  {popup.popOpenTime} ~ {popup.popCloseTime}
                </p>
              )}

              {popup.popLocation && (
                <p className="text-[13px] text-text-black">
                  <span className="font-medium mr-1">운영 장소</span>
                  {popup.popLocation}
                </p>
              )}
            </div>

            {popup.popDescription && (
              <p className="mt-1 text-[13px] leading-relaxed text-text-black whitespace-pre-line">
                {popup.popDescription}
              </p>
            )}

            <div className="mt-auto text-[11px] text-primary-dark">
              예약 완료 후에 자세한 입장 안내가 제공됩니다.
            </div>
          </div>

          <UserReservationCalendar
            startDate={calendar?.startDate}
            endDate={calendar?.endDate}
            availableDateKeys={availableDateKeys}
            selectedDate={selectedDate}
            onChangeDate={setSelectedDate}
          />

          <div className="bg-paper rounded-[24px] shadow-card p-6 md:p-7 flex flex-col">
            <div className="mb-3">
              <h2 className="text-[16px] md:text-[18px] font-semibold text-text-black mb-1">
                예약 시간 선택
              </h2>
              <p className="text-[12px] md:text-[13px] text-text-black">
                날짜를 먼저 선택한 후, 예약 가능한 시간대를 골라주세요.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {!slotLoading && timeSlots.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <TimeSlotButton
                      key={slot.slotId}
                      slot={slot}
                      selected={slot.slotId === selectedSlotId}
                      onClick={() => setSelectedSlotId(slot.slotId)}
                    />
                  ))}
                </div>
              )}
            </div>

            <p className="mt-3 text-[11px] text-primary-dark">
              * 결제 단계에서 다시 한 번 잔여 자리를 확인한 후, 선착순으로 예약이
              확정됩니다.
            </p>
          </div>
        </section>

               {/* ✅ 맨 하단 추가 영역: 예약 인원 + 결제수단/요약 */}
        <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-7">
          {/* 왼쪽: 예약 인원 + 총 가격 */}
          <div className="bg-paper rounded-[24px] shadow-card p-6 md:p-7 flex flex-col gap-5">
            <div>
              <h2 className="text-[16px] md:text-[18px] font-semibold text-text-black mb-3">
                예약 인원
              </h2>
              <div className="w-full">
                <select
                  className="w-full h-11 md:h-12 px-4 rounded-full border border-secondary-light bg-paper-light text-[14px] text-text-black focus:outline-none focus:ring-2 focus:ring-primary/60"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(Number(e.target.value))}
                >
                  {peopleOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}명
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-1">
              <h3 className="text-[14px] md:text-[15px] font-semibold text-text-black mb-2">
                총 가격
              </h3>
              <div className="rounded-[18px] border border-primary-light bg-primary-light/20 px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="text-[13px] text-text-black">
                  예상 결제 금액
                </div>
                <div className="text-[20px] md:text-[22px] font-semibold text-primary-dark">
                  {totalPrice.toLocaleString("ko-KR")}원
                </div>
              </div>
              <p className="mt-2 text-[11px] text-text-black">
                날짜, 시간, 인원을 선택하면 금액이 계산됩니다.
              </p>
            </div>
          </div>

          {/* 오른쪽: 결제수단 + 선택한 예약 정보 */}
          <div className="bg-paper rounded-[24px] shadow-card p-6 md:p-7 flex flex-col gap-4">
            <div>
              <h2 className="text-[16px] md:text-[18px] font-semibold text-text-black mb-3">
                결제수단
              </h2>

              {/* 토스페이 고정 카드 (단일 선택) */}
              <button
                type="button"
                className="w-full flex items-center justify-between rounded-[18px] border border-primary bg-primary-light/30 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-[12px] font-semibold text-white">
                    TOSS
                  </div>
                  <div className="text-left">
                    <div className="text-[14px] font-semibold text-text-black">
                      토스페이
                    </div>
                    <div className="text-[11px] text-text-black">
                      간편결제 · 카드 등록 시 한 번에 결제
                    </div>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border border-secondary-dark flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
              </button>
            </div>

            <div className="mt-1">
              <h3 className="text-[14px] md:text-[15px] font-semibold text-text-black mb-2">
                선택한 예약 정보
              </h3>
              <div className="rounded-[18px] bg-secondary-light/40 px-5 py-4 text-[13px] text-text-black flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span>날짜</span>
                  <span>{selectedDateLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>시간</span>
                  <span>{selectedTimeLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>인원</span>
                  <span>{peopleCount}명</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>결제수단</span>
                  <span>토스페이</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 하단 버튼 */}
        <div className="mt-6 mb-10 flex justify-end">
          <PrimaryButton
            size="lg"
            onClick={handleSubmit}
            loading={holdLoading}
            disabled={!selectedSlot || holdLoading}
            className="rounded-full px-8 shadow-card text-[15px]"
          >
            결제하러가기
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

