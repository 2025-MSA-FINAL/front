import { create } from "zustand";

const today = new Date();

export const usePopupReservationStore = create((set) => ({
  // 기본 예약 정보 (전역)
  reservationInfo: {
    entryTimeUnit: "ALL_DAY", // ALL_DAY | MIN30 | HOUR1
    maxUserCnt: 1,
    // 전체 예약 오픈 시작/종료 시각 (하나만 존재)
    reservationOpenStartTime: "",
    reservationOpenEndTime: "",
  },

  // 요일 선택 + 시간 폼 (요일별 팝업 운영 시간)
  selectedWeekdays: ["SUN"], // SUN ~ SAT
  timeForm: {
    startTime: "", // 요일별 팝업 시작 시간
    endTime: "",   // 요일별 팝업 종료 시간
    capacity: "",
  },

  // 요일별 타임테이블 (팝업 운영 시간)
  timetables: [], // { dayOfWeek, startTime, endTime, capacity }[]

  // 예약 기간 + 제외일
  period: {
    startDate: null, // Date
    endDate: null,   // Date
  },
  excludeDates: [], // ["YYYY-MM-DD", ...]

  // 캘린더 상태
  calendarYear: today.getFullYear(),
  calendarMonth: today.getMonth(), // 0~11
  calendarMode: "PERIOD", // PERIOD | EXCLUDE

  // ---------------- actions ----------------
  setReservationInfo: (partial) =>
    set((state) => ({
      reservationInfo: { ...state.reservationInfo, ...partial },
    })),

  setTimeForm: (partial) =>
    set((state) => ({
      timeForm: { ...state.timeForm, ...partial },
    })),

  addTimetables: (entries) =>
    set((state) => ({
      timetables: [...state.timetables, ...entries],
    })),

  removeTimetable: (index) =>
    set((state) => ({
      timetables: state.timetables.filter((_, i) => i !== index),
    })),

  // 요일 토글 (최소 1개 유지)
  toggleWeekday: (dayCode) =>
    set((state) => {
      const exists = state.selectedWeekdays.includes(dayCode);
      if (exists) {
        if (state.selectedWeekdays.length === 1) return state; // 최소 1개
        return {
          selectedWeekdays: state.selectedWeekdays.filter(
            (d) => d !== dayCode
          ),
        };
      }
      return {
        selectedWeekdays: [...state.selectedWeekdays, dayCode],
      };
    }),

  setPeriod: (partial) =>
    set((state) => ({
      period: { ...state.period, ...partial },
    })),

  resetPeriod: () =>
    set(() => ({
      period: { startDate: null, endDate: null },
      excludeDates: [],
    })),

  setExcludeDates: (updater) =>
    set((state) => ({
      excludeDates:
        typeof updater === "function"
          ? updater(state.excludeDates)
          : updater,
    })),

  setCalendar: (partial) =>
    set((state) => ({
      calendarYear:
        partial.year !== undefined ? partial.year : state.calendarYear,
      calendarMonth:
        partial.month !== undefined ? partial.month : state.calendarMonth,
    })),

  setCalendarMode: (mode) => set(() => ({ calendarMode: mode })),
}));
