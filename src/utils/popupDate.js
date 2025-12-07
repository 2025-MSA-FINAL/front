export function buildStartDateTime(value) {
  if (!value) return null;

  const datePart = value.slice(0, 10); 
  return `${datePart}T00:00:00`;
}

export function buildEndDateTime(value) {
  if (!value) return null;

  const datePart = value.slice(0, 10);
  return `${datePart}T23:59:59`;
}
