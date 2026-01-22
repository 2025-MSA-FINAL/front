export default function DownloadIcon({ size = 22, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      width={size}
      height={size}
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 5v8.5m0 0l3-3m-3 3l-3-3M5 15v2a2 2 0 002 2h10a2 2 0 002-2v-2"
      />
    </svg>
  );
}
