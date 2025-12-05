export default function HeartIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx="17.73"
        cy="17.73"
        r="4.77"
        stroke="currentColor"
        strokeWidth="1.91"
      ></circle>

      <line
        x1="17.73"
        y1="3.41"
        x2="17.73"
        y2="12.95"
        stroke="currentColor"
        strokeWidth="1.91"
      ></line>

      <polyline
        points="13.32 6.63 17.73 2.22 22.14 6.63"
        stroke="currentColor"
        strokeWidth="1.91"
        fill="none"
      ></polyline>

      <circle
        cx="6.27"
        cy="6.27"
        r="4.77"
        stroke="currentColor"
        strokeWidth="1.91"
      ></circle>

      <line
        x1="6.27"
        y1="20.59"
        x2="6.27"
        y2="11.05"
        stroke="currentColor"
        strokeWidth="1.91"
      ></line>

      <polyline
        points="10.68 17.37 6.27 21.78 1.86 17.37"
        stroke="currentColor"
        strokeWidth="1.91"
        fill="none"
      ></polyline>
    </svg>
  );
}
