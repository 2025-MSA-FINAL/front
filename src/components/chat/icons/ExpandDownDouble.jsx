export default function ExpandDownDouble({ size = 30, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 7l6 6 6-6" />
      <path d="M6 13l6 6 6-6" />
    </svg>
  );
}
