export default function MyPageIcon({ className = "w-5 h-5 text-gray-700" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      strokeWidth="5"
      stroke="currentColor"
      fill="none"
    >
      <circle cx="32" cy="18.14" r="11.14"></circle>
      <path d="M54.55,56.85A22.55,22.55,0,0,0,32,34.3h0A22.55,22.55,0,0,0,9.45,56.85Z"></path>
    </svg>
  );
}
