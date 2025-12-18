// src/api/reservationApi.js
import { apiClient } from "./authApi";

/**
 * 달력/일자 정보 조회
 * GET /api/popup/{popupId}/reservation/calendar
 * 응답 예:
 * {
 *   startDate: "2025-09-01",
 *   endDate: "2025-09-30",
 *   availableDates: ["2025-09-01", "2025-09-02", ...] // 예약 가능한 날짜들
 * }
 */
export async function fetchReservationCalendarApi(popupId) {
  if (!popupId) throw new Error("popupId가 없습니다.");
  const res = await apiClient.get(`/api/popup/${popupId}/reservation/calendar`);
  return res.data;
}

/**
 * 특정 날짜의 타임슬롯 목록 조회
 * GET /api/popup/{popupId}/reservation/slots?date=YYYY-MM-DD
 * 응답 예:
 * {
 *   date: "2025-09-15",
 *   timeSlots: [
 *     { slotId: 1, startTime: "11:00", endTime: "11:30", remainingCount: 3 },
 *     ...
 *   ]
 * }
 */
export async function fetchTimeSlotsByDateApi(popupId, dateKey) {
  if (!popupId) throw new Error("popupId가 없습니다.");
  if (!dateKey) throw new Error("date가 없습니다.");
  const res = await apiClient.get(`/api/popup/${popupId}/reservation/slots`, {
    params: { date: dateKey },
  });
  return res.data;
}

/**
 * 예약 생성 (HOLD 생성: 결제 연동용)
 * ✅ 백엔드: POST /api/reservations/hold
 */
export async function createReservationHoldApi(popupId, slotId, date, people) {
  const response = await apiClient.post("/api/reservations/hold", {
    popupId,
    slotId,
    date,
    people,
  });
  return response.data; // { reservationId, paymentId?, merchantUid?, amount? ... }
}


/**
 * ✅ 결제 성공 후 서버에 결제검증/예약확정 요청 (웹훅 미수신 대비)
 * POST /api/payments/portone/complete
 */
export async function completePortOnePaymentApi(paymentId) {
  if (!paymentId) throw new Error("paymentId가 없습니다.");
  const res = await apiClient.post("/api/payments/portone/complete", { paymentId });
  return res.data; // { paymentId, status }
}