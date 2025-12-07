// src/components/mypage/Pagination.jsx

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const current = page; // 0-based
  const pages = Array.from({ length: totalPages }, (_, i) => i);

  const handlePrev = () => {
    if (current <= 0) return;
    onChange(current - 1);
  };

  const handleNext = () => {
    if (current >= totalPages - 1) return;
    onChange(current + 1);
  };

  return (
    <div className="mt-6 flex justify-center items-center gap-4 text-[13px] text-text-sub">
      <button
        type="button"
        onClick={handlePrev}
        disabled={current === 0}
        className={`flex items-center gap-1 px-2 py-1 rounded-full ${
          current === 0
            ? "opacity-40 cursor-default"
            : "hover:text-primary-dark"
        }`}
      >
        <span>{"<"}</span>
        <span>이전</span>
      </button>

      <div className="flex items-center gap-2">
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`w-7 h-7 rounded-full text-[13px] flex items-center justify-center ${
              p === current
                ? "bg-primary-light text-primary font-semibold"
                : "text-text-sub hover:text-primary-dark"
            }`}
          >
            {p + 1}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={current === totalPages - 1}
        className={`flex items-center gap-1 px-2 py-1 rounded-full ${
          current === totalPages - 1
            ? "opacity-40 cursor-default"
            : "hover:text-primary-dark"
        }`}
      >
        <span>다음</span>
        <span>{">"}</span>
      </button>
    </div>
  );
}

export default Pagination;
