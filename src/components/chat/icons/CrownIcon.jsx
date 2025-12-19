export default function CrownIcon({ size }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 투명 영역 */}
      <rect width="48" height="48" fill="transparent" />

      {/* 바깥 원 — 글래스 화이트 */}
      <circle
        cx="24"
        cy="24"
        r="20"
        fill="rgba(255,255,255,0.12)" // ← bg-white/10 느낌
        stroke="rgba(255,255,255,0.25)" // ← border-white/15~20
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 왕관 — 화이트 아이콘 */}
      <path
        d="M13 29V19L19 22L24 15L29 22L35 19V29H13Z"
        fill="var(--color-accent-lemon-soft)" // 아이콘 본체
        stroke="var(--color-accent-lemon-soft)" // 아이콘 라인
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
