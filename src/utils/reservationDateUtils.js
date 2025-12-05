// src/utils/reservationDateUtils.js

export function formatDateKey(date) {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateDisplay(date) {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${year}.${month}.${day} (${weekday})`;
}

export function toLocalDateTimeStart(date) {
  const key = formatDateKey(date);
  if (!key) return null;
  return `${key}T00:00:00`;
}

export function toLocalDateTimeEnd(date) {
  const key = formatDateKey(date);
  if (!key) return null;
  return `${key}T23:59:59`;
}
