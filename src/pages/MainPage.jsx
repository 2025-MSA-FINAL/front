// src/pages/MainPage.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";
import { useNavigate } from "react-router-dom";
import ghost1 from "../assets/ghost2.png";
import { apiClient } from "../api/authApi";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chat/chatStore";

// =========================
// ✅ 반응형 레이아웃 값 계산
// (사용되는 cfg만 리턴)
// =========================
function useHeroLayout() {
  const [w, setW] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const bp = w < 640 ? "m" : w < 1024 ? "t" : "d";

  const cfg =
    bp === "m"
      ? {
          cardW: 268,
          step1: 244,
          step2: 400,
          step3: 515,
          heroVH: 63,
          heroMin: 565,
          heroMax: 720,
          indicatorSafeSpace: 82,
          indicatorBottom: 28,
          centerNudge: 10,
          padY: "py-6",
        }
      : bp === "t"
      ? {
          cardW: 325,
          step1: 315,
          step2: 520,
          step3: 675,
          heroVH: 65,
          heroMin: 615,
          heroMax: 805,
          indicatorSafeSpace: 90,
          indicatorBottom: 30,
          centerNudge: 12,
          padY: "py-7",
        }
      : {
          cardW: 380,
          step1: 360,
          step2: 610,
          step3: 780,
          heroVH: 68,
          heroMin: 665,
          heroMax: 870,
          indicatorSafeSpace: 98,
          indicatorBottom: 32,
          centerNudge: 14,
          padY: "py-8",
        };

  return { cfg };
}

function formatDateRange(start, end) {
  if (!start || !end) return "";
  const s = new Date(start);
  const e = new Date(end);
  const yy = String(s.getFullYear()).slice(2);
  const mm = String(s.getMonth() + 1).padStart(2, "0");
  const dd = String(s.getDate()).padStart(2, "0");
  const yy2 = String(e.getFullYear()).slice(2);
  const mm2 = String(e.getMonth() + 1).padStart(2, "0");
  const dd2 = String(e.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd} ~ ${yy2}.${mm2}.${dd2}`;
}

function priceLabel(priceType) {
  if (!priceType) return "";
  const t = String(priceType).toUpperCase();
  if (
    t.includes("FREE") ||
    t.includes("NO") ||
    t.includes("ZERO") ||
    t === "FREE"
  )
    return "무료";
  return "유료";
}

// ✅ 강한 퍼플 팔레트(이 파일 내부에서만 사용)
const PURPLE = {
  neon: "#9B2CFF",
  deep: "#5A00B8",
  glowSoft: "rgba(155,44,255,0.35)",
  glowMid: "rgba(155,44,255,0.55)",
};

// =========================
// ✅ 분리 + memo: 하단 리렌더 차단용
// =========================
const CardGridSection = memo(function CardGridSection({
  title,
  items,
  onAllClick,
  mainLoading,
}) {
  const navigate = useNavigate();

  // ✅ 드래그 슬라이드용
  const trackRef = useRef(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const movedRef = useRef(false); // 드래그 중 클릭 방지용

  // ✅ (수정) 클릭을 살리기 위해 "드래그로 판단될 때만" 포인터 캡처
  const capturedRef = useRef(false);
  const pointerIdRef = useRef(null);

  const onPointerDown = useCallback((e) => {
    const el = trackRef.current;
    if (!el) return;

    isDownRef.current = true;
    movedRef.current = false;

    // ✅ (수정) 여기서 바로 setPointerCapture 하지 않음 (클릭이 먹통되는 원인)
    capturedRef.current = false;
    pointerIdRef.current = e.pointerId;

    startXRef.current = e.clientX;
    startScrollLeftRef.current = el.scrollLeft;
  }, []);

  const onPointerMove = useCallback((e) => {
    const el = trackRef.current;
    if (!el || !isDownRef.current) return;

    const dx = e.clientX - startXRef.current;

    // 약간 움직였으면 드래그로 간주 → 클릭 방지
    if (Math.abs(dx) > 6) {
      movedRef.current = true;

      // ✅ (수정) 드래그로 확정된 순간에만 포인터 캡처(드래그 안정화)
      if (!capturedRef.current) {
        try {
          el.setPointerCapture?.(pointerIdRef.current ?? e.pointerId);
          capturedRef.current = true;
        } catch {}
      }
    }

    el.scrollLeft = startScrollLeftRef.current - dx;
  }, []);

  const endDrag = useCallback((e) => {
    const el = trackRef.current;
    if (!el) return;

    isDownRef.current = false;

    // ✅ (수정) 캡처한 경우에만 해제
    if (capturedRef.current) {
      try {
        el.releasePointerCapture?.(pointerIdRef.current ?? e.pointerId);
      } catch {}
      capturedRef.current = false;
    }
  }, []);

  return (
    <div className="mt-8 md:mt-10 flex justify-center">
      <div className="w-full max-w-[1400px] px-4 sm:px-6">
        <div
          className="bg-paper rounded-card px-6 sm:px-8 py-7 sm:py-8"
          style={{
            boxShadow: `0 10px 40px rgba(155,44,255,0.08)`,
            border: "1px solid rgba(155,44,255,0.10)",
          }}
        >
          <div className="flex justify-between items-center mb-5 sm:mb-6">
           <h2 className="flex items-end">
  {(() => {
    const t = String(title || "").trim();

    // 월 분리 (예: "... 12월")
    const m = t.match(/(.*?)(\d{1,2}월)\s*$/);
    const baseTitle = m ? m[1].trim() : t;
    const month = m ? m[2].trim() : null;

    const isSoon =
      baseTitle.includes("오픈예정") || baseTitle.includes("곧 오픈");
    const isHot =
      baseTitle.includes("따끈따끈") || baseTitle.includes("인기팝업");
    const isDeadline =
      baseTitle.includes("마감") || baseTitle.includes("임박");

    let label = "FEATURED";
    let main = baseTitle;
    let point = null;
    let pointColor = "rgba(0,0,0,0.6)";

    if (isSoon) {
      label = "COMING SOON";
      main = "오픈예정";
      point = month;
      pointColor = "rgba(155,44,255,0.95)"; // 💜 보라
    } else if (isHot) {
      label = "JUST IN";
      main = "최신 팝업";
      point = "NOW";
      pointColor = "rgba(236, 72, 153, 0.95)";
    } else if (isDeadline) {
      label = "FINAL DAYS";
      main = "마감 임박";
      point = "FINAL";
      pointColor = "rgba(229,57,53,0.95)"; 
    }

    return (
      <div className="flex flex-col items-start leading-[1.08]">
        {/* 라벨 */}
        <span
          className="text-[12px] font-medium tracking-wide uppercase"
          style={{ color: "rgba(0,0,0,0.45)" }}
        >
          {label}
        </span>

        {/* 메인 */}
        <div className="flex items-baseline gap-2">
          <span className="text-[30px] font-extrabold text-text-black">
            {main}
          </span>

          {point && (
            <span
              className="font-extrabold leading-none"
              style={{
                fontSize: "36px",
                color: pointColor,
                letterSpacing: "-0.4px",
              }}
            >
              {point}
            </span>
          )}
        </div>
      </div>
    );
  })()}
</h2>



            <span
              className="text-[13px] transition-colors cursor-pointer font-medium"
              style={{ color: PURPLE.neon }}
              onClick={onAllClick}
            >
              전체보기 &gt;
            </span>
          </div>

          {/* ✅ 드래그 전용 트랙 (휠 스크롤 막음 + 스크롤바 숨김) */}
          <style>
            {`
              .hide-scrollbar::-webkit-scrollbar { display: none; }
            `}
          </style>

          <div
            ref={trackRef}
            className="
              hide-scrollbar
              flex gap-5 sm:gap-6
              overflow-x-auto
              select-none
              cursor-grab
              active:cursor-grabbing
            "
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              touchAction: "pan-y",

              // ✅ (수정) hover scale이 잘리는 문제 해결: 세로는 visible로
              overflowY: "visible",
              paddingTop: "10px",
              paddingBottom: "14px",
              paddingLeft: "24px",
              paddingRight: "24px",
            }}
            onWheelCapture={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerLeave={(e) => {
              if (isDownRef.current) endDrag(e);
            }}
          >
            {(items || []).map((p) => {
              const badge = priceLabel(p?.popPriceType);

              return (
                <div
                  key={p.popId}
                  className="
                    shrink-0
                    w-[240px] sm:w-[260px] lg:w-[280px]
                    group
                    cursor-pointer
                    transition-transform
                    hover:scale-105
                  "
                  onClick={() => {
                    // ✅ 드래그로 움직인 경우 클릭(상세이동) 방지
                    if (movedRef.current) return;
                    navigate(`/popup/${p.popId}`);
                  }}
                >
                  <div
                    className="w-full aspect-[3/4] rounded-[18px] overflow-hidden transition-all group-hover:ring-2 group-hover:ring-primary relative"
                    style={{
                      boxShadow: `0 10px 30px rgba(155,44,255,0.08)`,
                      border: "1px solid rgba(155,44,255,0.10)",
                      background: "#fff",
                    }}
                  >
                    <img
                      src={
                        p.popThumbnail ||
                        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=600&fit=crop"
                      }
                      alt={p.popName || "popup"}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[14px] font-semibold text-text-black truncate">
                        {p.popName}
                      </p>

                      {badge && (
                        <span
                          className="shrink-0 px-3 py-[4px] rounded-full text-[12px] font-semibold"
                          style={{
                            backgroundColor:
                              badge === "무료"
                                ? "var(--color-primary-soft2)"
                                : "var(--color-primary-soft)",
                            color: "var(--color-primary)",
                          }}
                        >
                          {badge}
                        </span>
                      )}
                    </div>

                    <p className="text-[12px] text-text-sub mt-1 truncate">
                      {p.popLocation}
                    </p>

                    <p className="text-[13px] text-text-black mt-2">
                      {formatDateRange(p.popStartDate, p.popEndDate)}
                    </p>
                  </div>
                </div>
              );
            })}

            {mainLoading &&
              (!items || items.length === 0) &&
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="shrink-0 w-[240px] sm:w-[260px] lg:w-[280px] animate-pulse"
                >
                  <div
                    className="w-full aspect-[3/4] rounded-[18px]"
                    style={{ background: "rgba(0,0,0,0.06)" }}
                  />
                  <div
                    className="mt-3 h-4 w-3/4 rounded"
                    style={{ background: "rgba(0,0,0,0.06)" }}
                  />
                  <div
                    className="mt-2 h-3 w-1/2 rounded"
                    style={{ background: "rgba(0,0,0,0.06)" }}
                  />
                  <div
                    className="mt-2 h-4 w-2/3 rounded"
                    style={{ background: "rgba(0,0,0,0.06)" }}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
});

const MenuItem = memo(function MenuItem({ label }) {
  return (
    <div className="flex flex-col items-center gap-2 group cursor-pointer">
      <div className="w-12 h-12 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg">
        {label === "마이페이지" ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12"
          >
            <path
              d="M17 21C17 18.2386 14.7614 16 12 16C9.23858 16 7 18.2386 7 21M17 21H17.8031C18.921 21 19.48 21 19.9074 20.7822C20.2837 20.5905 20.5905 20.2837 20.7822 19.9074C21 19.48 21 18.921 21 17.8031V6.19691C21 5.07899 21 4.5192 20.7822 4.0918C20.5905 3.71547 20.2837 3.40973 19.9074 3.21799C19.4796 3 18.9203 3 17.8002 3H6.2002C5.08009 3 4.51962 3 4.0918 3.21799C3.71547 3.40973 3.40973 3.71547 3.21799 4.0918C3 4.51962 3 5.08009 3 6.2002V17.8002C3 18.9203 3 19.4796 3.21799 19.9074C3.40973 20.2837 3.71547 20.5905 4.0918 20.7822C4.5192 21 5.07899 21 6.19691 21H7M17 21H7M12 13C10.3431 13 9 11.6569 9 10C9 8.34315 10.3431 7 12 7C13.6569 7 15 8.34315 15 10C15 11.6569 13.6569 13 12 13Z"
              stroke="#FF2A7E"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : label === "AI 챗봇" ? (
          <svg
            viewBox="0 0 24 24"
            data-name="025_SCIENCE"
            id="_025_SCIENCE"
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12"
          >
            <defs>
              <style>{`.cls-1{fill:#B7F731;}`}</style>
            </defs>
            <path
              className="cls-1"
              d="M16,13H8a3,3,0,0,1-3-3V6A3,3,0,0,1,8,3h8a3,3,0,0,1,3,3v4A3,3,0,0,1,16,13ZM8,5A1,1,0,0,0,7,6v4a1,1,0,0,0,1,1h8a1,1,0,0,0,1-1V6a1,1,0,0,0-1-1Z"
            />
            <path
              className="cls-1"
              d="M10,9a1.05,1.05,0,0,1-.71-.29A1,1,0,0,1,10.19,7a.6.6,0,0,1,.19.06.56.56,0,0,1,.17.09l.16.12A1,1,0,0,1,10,9Z"
            />
            <path
              className="cls-1"
              d="M14,9a1,1,0,0,1-.71-1.71,1,1,0,0,1,1.42,1.42,1,1,0,0,1-.16.12.56.56,0,0,1-.17.09.6.6,0,0,1-.19.06Z"
            />
            <path
              className="cls-1"
              d="M12,4a1,1,0,0,1-1-1V2a1,1,0,0,1,2,0V3A1,1,0,0,1,12,4Z"
            />
            <path
              className="cls-1"
              d="M9,22a1,1,0,0,1-1-1V18a1,1,0,0,1,2,0v3A1,1,0,0,1,9,22Z"
            />
            <path
              className="cls-1"
              d="M15,22a.93.93,0,0,1-.45-.11l-4-2a1,1,0,1,1,.9-1.78l4,2a1,1,0,0,1,.44,1.34A1,1,0,0,1,15,22Z"
            />
            <path
              className="cls-1"
              d="M15,19H9a1,1,0,0,1-1-1V12a1,1,0,0,1,1-1h6a1,1,0,0,1,1,1v6A1,1,0,0,1,15,19Zm-5-2h4V13H10Z"
            />
            <path
              className="cls-1"
              d="M5,17a1,1,0,0,1-.89-.55,1,1,0,0,1,.44-1.34l4-2a1,1,0,1,1,.9,1.78l-4,2A.93.93,0,0,1,5,17Z"
            />
            <path
              className="cls-1"
              d="M19,17a.93.93,0,0,1-.45-.11l-4-2a1,1,0,1,1,.9-1.78l4,2a1,1,0,0,1,.44,1.34A1,1,0,0,1,19,17Z"
            />
          </svg>
        ) : label === "팝업등록" ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.87617 3.75H19.1238L21 8.86683V10.5C21 11.2516 20.7177 11.9465 20.25 12.4667V21H3.75V12.4667C3.28234 11.9465 3 11.2516 3 10.5V8.86683L4.87617 3.75ZM18.1875 13.3929C18.3807 13.3929 18.5688 13.3731 18.75 13.3355V19.5H15V15H9L9 19.5H5.25V13.3355C5.43122 13.3731 5.61926 13.3929 5.8125 13.3929C6.63629 13.3929 7.36559 13.0334 7.875 12.4667C8.38441 13.0334 9.11371 13.3929 9.9375 13.3929C10.7613 13.3929 11.4906 13.0334 12 12.4667C12.5094 13.0334 13.2387 13.3929 14.0625 13.3929C14.8863 13.3929 15.6156 13.0334 16.125 12.4667C16.6344 13.0334 17.3637 13.3929 18.1875 13.3929ZM10.5 19.5H13.5V16.5H10.5L10.5 19.5ZM19.5 9.75V10.5C19.5 11.2965 18.8856 11.8929 18.1875 11.8929C17.4894 11.8929 16.875 11.2965 16.875 10.5V9.75H19.5ZM19.1762 8.25L18.0762 5.25H5.92383L4.82383 8.25H19.1762ZM4.5 9.75V10.5C4.5 11.2965 5.11439 11.8929 5.8125 11.8929C6.51061 11.8929 7.125 11.2965 7.125 10.5V9.75H4.5ZM8.625 9.75V10.5C8.625 11.2965 9.23939 11.8929 9.9375 11.8929C10.6356 11.8929 11.25 11.2965 11.25 10.5V9.75H8.625ZM12.75 9.75V10.5C12.75 11.2965 13.3644 11.8929 14.0625 11.8929C14.7606 11.8929 15.375 11.2965 15.375 10.5V9.75H12.75Z"
              fill="#45DFD3"
            />
          </svg>
        ) : label === "팝업리스트" ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12"
          >
            <path
              d="M9 11.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm2-1a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1zm1 2a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2h-3zm0 3a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2h-3zm-2-2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
              fill="#FFD93D"
            />
            <path
              d="M9 2a1 1 0 0 0-1 1H6a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2a1 1 0 0 0-1-1H9zm7 3h2v15H6V5h2v1a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V5zm-6 0V4h4v1h-4z"
              fill="#FFD93D"
            />
          </svg>
        ) : (
          <span className="text-[11px] text-text-sub">SVG</span>
        )}
      </div>

      <span className="text-[13px] text-text-black group-hover:text-primary transition-colors font-medium">
        {label}
      </span>
    </div>
  );
});

// =========================
// ✅ HERO만 상태를 갖도록 분리 (핵심)
// -> active 변화가 MainPage(하단) 리렌더를 유발하지 않음
// =========================
const HeroCarousel = memo(function HeroCarousel({ posters, cfg, navigate }) {
  const [active, setActive] = useState(0);
  const [isHeroCenterHovered, setIsHeroCenterHovered] = useState(false);

  // ✅ HERO를 화면 중앙으로 스크롤하기 위한 ref
  const heroScrollRef = useRef(null);

  const go = useCallback((idx) => setActive(idx), []);

  // ✅ 데이터 변경으로 active가 범위를 벗어나면 보정
  useEffect(() => {
    if (!posters || posters.length === 0) {
      if (active !== 0) setActive(0);
      return;
    }
    if (active >= posters.length) setActive(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posters?.length]);

  // ✅ HERO 자동 슬라이드 (1초 간격) - 데이터 없을 때 가드 + 중앙 hover 시 멈춤
  useEffect(() => {
    if (!posters || posters.length <= 1) return;
    if (isHeroCenterHovered) return;

    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % posters.length);
    }, 1000);

    return () => clearInterval(id);
  }, [posters?.length, isHeroCenterHovered, posters]);

  const getOffset = useCallback(
    (index) => {
      const n = posters.length;
      if (n === 0) return 0;
      let diff = index - active;
      if (diff > n / 2) diff -= n;
      if (diff < -n / 2) diff += n;
      return diff;
    },
    [active, posters.length]
  );

  // ✅ 카드 세로 중심 보정
  const baseCardY = -Math.round(cfg.indicatorSafeSpace / 2) + cfg.centerNudge;

  return (
    <section className="relative w-full">
      <div
        className="w-full relative overflow-hidden"
        style={{
          background: `linear-gradient(180deg, #1a0628 0%, #2b0a3d 38%, #12031d 100%)`,
        }}
      >
        <div className="absolute inset-0">
          <img
            src={posters[active]?.img}
            alt=""
            className="w-full h-full object-cover scale-110 blur-3xl opacity-[0.14]"
            draggable={false}
          />

          <div
            className="absolute inset-0 opacity-[0.40]"
            style={{
              backgroundImage: `
                radial-gradient(circle at 15% 20%, rgba(155,44,255,0.10) 0.6px, transparent 0.6px),
                radial-gradient(circle at 70% 35%, rgba(155,44,255,0.08) 0.7px, transparent 0.7px),
                radial-gradient(circle at 40% 75%, rgba(255,255,255,0.06) 0.6px, transparent 0.6px)
              `,
              backgroundSize: "180px 180px, 220px 220px, 200px 200px",
              backgroundPosition: "0 0, 40px 60px, 90px 30px",
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(1200px 560px at 50% 12%, rgba(155,44,255,0.28) 0%, rgba(155,44,255,0.12) 40%, rgba(0,0,0,0.15) 72%, transparent 100%)
              `,
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.22)_55%,rgba(0,0,0,0.46)_100%)]" />
        </div>

        <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black/[0.25] to-transparent" />

        <div
          className={`relative mx-auto w-full max-w-[1200px] px-4 sm:px-6 ${cfg.padY}`}
        >
          <div
            ref={heroScrollRef}
            className="relative touch-pan-y"
            style={{
              height: `${cfg.heroVH}vh`,
              minHeight: `${cfg.heroMin}px`,
              maxHeight: `${cfg.heroMax}px`,
              paddingBottom: `${cfg.indicatorSafeSpace}px`,
            }}
          >
            {posters.map((p, idx) => {
              const d = getOffset(idx);
              const absD = Math.abs(d);
              const isVisible = absD <= 3;
              const isActive = d === 0;

              const translateX =
                d === 0
                  ? 0
                  : d === -1
                  ? -cfg.step1
                  : d === 1
                  ? cfg.step1
                  : d === -2
                  ? -cfg.step2
                  : d === 2
                  ? cfg.step2
                  : d === -3
                  ? -cfg.step3
                  : cfg.step3;

              const scale =
                d === 0 ? 1.1 : absD === 1 ? 0.92 : absD === 2 ? 0.78 : 0.68;
              const z = d === 0 ? 40 : absD === 1 ? 30 : absD === 2 ? 20 : 10;
              const darkAlpha = absD === 1 ? 0.58 : absD === 2 ? 0.74 : 0.86;

              return (
                <div
                  key={p.id}
                  className={`absolute transition-all duration-700 ease-in-out ${
                    isVisible ? "block" : "hidden"
                  } cursor-pointer`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") go(idx);
                  }}
                  onMouseEnter={() => {
                    if (isActive) setIsHeroCenterHovered(true);
                  }}
                  onMouseLeave={() => {
                    if (isActive) setIsHeroCenterHovered(false);
                  }}
                  onClick={() => {
                    // ✅ 중앙(활성) 카드 클릭 시 상세 이동
                    if (isActive) {
                      navigate(`/popup/${p.id}`);
                      return;
                    }

                    // ✅ 그 외는 기존처럼 중앙으로 가져오기
                    heroScrollRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                      inline: "nearest",
                    });
                    go(idx);
                  }}
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: `translate(-50%, -50%) translateX(${translateX}px) translateY(${baseCardY}px) scale(${scale})`,
                    opacity: 1,
                    zIndex: z,
                  }}
                >
                  {isActive && (
                    <>
                      <div
                        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
                        style={{
                          top: -210,
                          width: `${Math.round(cfg.cardW * 1.4)}px`,
                          height: "360px",
                          background:
                            "radial-gradient(ellipse at 50% 0%, rgba(155,44,255,0.45) 0%, rgba(155,44,255,0.22) 34%, rgba(155,44,255,0.10) 56%, transparent 78%)",
                          filter: "blur(2px)",
                          opacity: 0.95,
                        }}
                      />

                      <div
                        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
                        style={{
                          bottom: -30,
                          width: `${Math.round(cfg.cardW * 1.32)}px`,
                          height: "86px",
                          background: `radial-gradient(ellipse at center, ${PURPLE.glowMid} 0%, rgba(155,44,255,0.20) 35%, rgba(0,0,0,0.10) 52%, transparent 72%)`,
                          filter: "blur(14px)",
                          opacity: 0.62,
                        }}
                      />
                    </>
                  )}

                  <div
                    className="relative aspect-[3/4] rounded-[22px] overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1"
                    style={{
                      width: `${cfg.cardW}px`,
                      background: "#ffffff",
                      boxShadow: isActive
                        ? `0 26px 90px rgba(0,0,0,0.34),
     0 0 30px rgba(155,44,255,0.8),
     0 0 0 1px rgba(255,255,255,0.22),
     0 0 0 2px rgba(155,44,255,0.22)`
                        : `0 16px 54px rgba(0,0,0,0.26),
     0 0 22px rgba(155,44,255,0.26),
     0 0 0 1px rgba(255,255,255,0.16)`,
                    }}
                  >
                    {!isActive && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `rgba(0,0,0,${darkAlpha})`,
                          borderRadius: "22px",
                          zIndex: 30,
                        }}
                      />
                    )}

                    <div
                      className="absolute inset-0"
                      style={{
                        padding: isActive ? "10px" : "9px",
                        zIndex: 10,
                      }}
                    >
                      <div className="w-full h-full rounded-[16px] overflow-hidden relative">
                        <img
                          src={p.img}
                          alt={p.title}
                          className="w-full h-full object-cover"
                          draggable={false}
                          style={{
                            filter: "none",
                            transform: isActive ? "none" : "scale(1.02)",
                          }}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/12 to-transparent" />

                        {isActive && (
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_12%,rgba(255,255,255,0.16)_0%,transparent_55%)]" />
                        )}

                        <div className="absolute left-5 right-5 bottom-5">
                          <p className="text-white text-[15px] sm:text-[16px] font-bold drop-shadow-lg">
                            {p.title}
                          </p>
                          <p className="text-white/90 text-[12px] sm:text-[13px] mt-1.5 font-medium">
                            {p.date}
                          </p>
                          <p className="text-white/85 text-[12px] sm:text-[13px] mt-1">
                            {p.place}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ✅ 인디케이터 */}
            <div
              className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 z-50 px-4 py-2.5 rounded-full border"
              style={{
                bottom: `${cfg.indicatorBottom}px`,
                background: "rgba(255,255,255,0.12)",
                borderColor: "rgba(255,255,255,0.20)",
                backdropFilter: "blur(14px)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
              }}
            >
              {posters.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`slide-${i}`}
                  onClick={() => go(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active ? "w-7" : "w-2"
                  }`}
                  style={{
                    background:
                      i === active ? PURPLE.neon : "rgba(255,255,255,0.32)",
                    boxShadow:
                      i === active ? `0 0 10px ${PURPLE.glowSoft}` : "none",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 퀵슬롯 (HERO 아래 그대로 유지) */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[62%] md:translate-y-[76%] w-full px-4 sm:px-6 z-50">
          <div
            className="mx-auto w-full max-w-[1400px] md:max-w-[1100px] bg-paper rounded-card ring-2"
            style={{
              boxShadow:
                "0 22px 60px rgba(0,0,0,0.16), 0 6px 16px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.95)",
              borderColor: "rgba(0,0,0,0.08)",
              ringColor: "rgba(0,0,0,0.06)",
            }}
          >
            {/* 실제 클릭 로직은 MainPage에서 주입해야 해서 여기서는 빈 슬롯 */}
            {/* 퀵슬롯 자체는 MainPage에서 그대로 렌더링할 거라, 여기선 보관만 하고 사용 안 함 */}
          </div>
        </div>
      </div>
    </section>
  );
});

// =========================
// ✅ 하단 섹션 memo: HERO active로 리렌더 안 되게
// =========================
const MainBottom = memo(function MainBottom({
  mainKeyword,
  setMainKeyword,
  goPopupSearch,

  // ✅ 기존
  latestPopups,
  endingSoonPopups,

  // ✅ 추가
  openingSoonPopups,
  openingSoonTitle,

  onAllClick,
  mainLoading,
}) {
  return (
    <section className="pt-24 md:pt-30 pb-10">
      <div className="flex justify-center mt-6 md:mt-8">
        <div className="w-full max-w-[980px] px-4 sm:px-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={mainKeyword}
            onChange={(e) => setMainKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && goPopupSearch()}
            placeholder="팝업스토어를 검색해보세요."
            className="flex-1 h-[48px] bg-paper rounded-full px-6 text-[14px] text-text-black placeholder:text-text-sub outline-none ring-2 ring-secondary-light focus:ring-2 focus:ring-primary transition-all"
            style={{
              boxShadow: `0 10px 30px rgba(155,44,255,0.08)`,
            }}
          />

          <button
            type="button"
            aria-label="search"
            onClick={goPopupSearch}
            className="
              w-full sm:w-[48px] h-[48px]
              rounded-full
              flex items-center justify-center
              transition-all duration-200
              hover:scale-105
              active:scale-95
            "
            style={{
              background: `linear-gradient(135deg, ${PURPLE.neon} 0%, ${PURPLE.deep} 100%)`,
              boxShadow: `0 10px 34px rgba(155,44,255,0.40)`,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
            >
              <path
                d="M16.6725 16.6412L21 21M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ✅ NEW: 두근두근 곧 오픈예정 섹션 */}
      <CardGridSection
        title={openingSoonTitle || "두근 두근 곧 오픈예정"}
        items={openingSoonPopups}
        onAllClick={onAllClick}
        mainLoading={mainLoading}
      />

      <CardGridSection
        title="따끈따끈 팝업"
        items={latestPopups}
        onAllClick={onAllClick}
        mainLoading={mainLoading}
      />

      <CardGridSection
        title="팝업 마감 임박"
        items={endingSoonPopups}
        onAllClick={onAllClick}
        mainLoading={mainLoading}
      />

      <div className="h-10 md:h-0" />
    </section>
  );
});

function MainPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role; // USER | MANAGER | ADMIN

  const { cfg } = useHeroLayout();

  // =========================
  // ✅ 메인 섹션 데이터 (apiClient)
  // =========================
  const [heroPopups, setHeroPopups] = useState([]);
  const [latestPopups, setLatestPopups] = useState([]);
  const [endingSoonPopups, setEndingSoonPopups] = useState([]);

  // ✅ 추가
  const [openingSoonPopups, setOpeningSoonPopups] = useState([]);

  const [mainLoading, setMainLoading] = useState(false);

  const MAIN_CARD_LIMIT = 10; // ✅ 프론트에서 원하는 만큼 조절

  // ✅ (추가) 현재 달 타이틀: "12월"
  const openingSoonTitle = useMemo(() => {
    const now = new Date();
    const mm = now.getMonth() + 1;
    return `두근 두근 곧 오픈예정 ${mm}월`;
  }, []);

  // ✅ HERO에서 기존 posters 형태 유지하기 위한 변환 (JSX/스타일 건드리지 않기)
  const posters = useMemo(() => {
    const list = Array.isArray(heroPopups) ? heroPopups : [];
    return list.map((p) => ({
      id: p?.popId,
      img:
        p?.popThumbnail ||
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=800&fit=crop",
      title: p?.popName || "팝업",
      date: formatDateRange(p?.popStartDate, p?.popEndDate),
      place: p?.popLocation || "",
    }));
  }, [heroPopups]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setMainLoading(true);

        const mainRes = await apiClient.get("/api/main/popups", {
          params: { limit: MAIN_CARD_LIMIT },
          headers: { "Content-Type": "application/json" },
        });

        const mainData = mainRes?.data;

        if (!alive) return;

        setHeroPopups(Array.isArray(mainData?.hero) ? mainData.hero : []);
        setLatestPopups(Array.isArray(mainData?.latest) ? mainData.latest : []);
        setEndingSoonPopups(
          Array.isArray(mainData?.endingSoon) ? mainData.endingSoon : []
        );

        // ✅ 추가: openingSoon
        setOpeningSoonPopups(
          Array.isArray(mainData?.openingSoon) ? mainData.openingSoon : []
        );
      } catch (e) {
        if (!alive) return;
        setHeroPopups([]);
        setLatestPopups([]);
        setEndingSoonPopups([]);

        // ✅ 추가
        setOpeningSoonPopups([]);
      } finally {
        if (!alive) return;
        setMainLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // ✅ 퀵슬롯 navigate + role 체크
  // =========================
  const canAccessUserArea =
    role === "USER" || role === "MANAGER" || role === "ADMIN";

  const goTopAndNavigate = useCallback(
    (path) => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      navigate(path);
    },
    [navigate]
  );

  const onQuickSlotClick = useCallback(
    (label) => {
      if (label === "팝업리스트") {
        goTopAndNavigate("/pop-up");
        return;
      }

      if (label === "마이페이지") {
        if (!canAccessUserArea) {
          alert("마이페이지 권한이 없습니다");
          return;
        }
        goTopAndNavigate("/mypage");
        return;
      }

      if (label === "AI 챗봇") {
        if (!canAccessUserArea) {
          alert("AI 챗봇 권한이 없습니다");
          return;
        }

        (async () => {
          const AI_USER_ID = 20251212;

          const store = useChatStore.getState();

          // 1) rooms 없으면 먼저 로딩
          if (!store.rooms || store.rooms.length === 0) {
            await store.fetchRooms();
          }

          // 2) 챗봇 PRIVATE 방 찾기 (실제 roomId 있는 방)
          const { rooms } = useChatStore.getState();
          const botRoom = (rooms || []).find(
            (r) => r.roomType === "PRIVATE" && r.otherUserId === AI_USER_ID
          );

          if (!botRoom) {
            alert("챗봇 채팅방을 찾을 수 없습니다.");
            return;
          }

          // 3) ChatMainPage가 이해하는 실제 방으로 선택
          useChatStore.getState().selectRoom(botRoom);

          // 4) 이동
          goTopAndNavigate("/chat");
        })();

        return;
      }

      if (label === "팝업등록") {
        if (role !== "MANAGER") {
          alert("팝업등록 권한이 없습니다");
          return;
        }
        goTopAndNavigate("/popup/register");
        return;
      }
    },
    [canAccessUserArea, goTopAndNavigate, role]
  );

  // =========================
  // ✅ 메인 검색 → 팝업리스트 검색결과로 이동
  // =========================
  const [mainKeyword, setMainKeyword] = useState("");

  const goPopupSearch = useCallback(() => {
    const q = (mainKeyword || "").trim();
    if (!q) {
      goTopAndNavigate("/pop-up");
      return;
    }
    goTopAndNavigate(`/pop-up?search=${encodeURIComponent(q)}`);
  }, [goTopAndNavigate, mainKeyword]);

  const onAllClick = useCallback(() => {
    goTopAndNavigate("/pop-up");
  }, [goTopAndNavigate]);

  return (
    <main className="min-h-[calc(100vh-88px)] bg-secondary-light pb-16">
      {/* =========================
          HERO (분리됨) + 퀵슬롯(기존 위치 유지)
         ========================= */}
      <section className="relative w-full">
        {/* HERO만 별도 컴포넌트: active 변화가 하단을 흔들지 않음 */}
        <HeroCarousel posters={posters} cfg={cfg} navigate={navigate} />

        {/* ✅ 퀵슬롯 (기존 그대로 MainPage에서 렌더) */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[62%] md:translate-y-[76%] w-full px-4 sm:px-6 z-50">
          <div
            className="mx-auto w-full max-w-[1400px] md:max-w-[1100px] bg-paper rounded-card ring-2"
            style={{
              boxShadow:
                "0 22px 60px rgba(0,0,0,0.16), 0 6px 16px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.95)",
              borderColor: "rgba(0,0,0,0.08)",
              ringColor: "rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center px-5 sm:px-8 md:px-12 py-4 sm:py-6 md:py-6 gap-5 md:gap-0">
              <div className="flex items-center gap-4 min-w-0 md:min-w-[200px] md:ml-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shrink-0 overflow-visible">
                  <img
                    src={ghost1}
                    alt="ghost"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="leading-tight">
                  <p className="text-[15px] sm:text-[16px] font-semibold text-text-black">
                    팝업스토어 안내
                  </p>
                  <p className="text-[13px] sm:text-[14px] text-text-sub">
                    팝스팟 도우미
                  </p>
                </div>
              </div>

              <div className="hidden md:block h-12 w-[1px] bg-gradient-to-b from-transparent via-secondary to-transparent mx-5" />

              <div className="flex-1">
                <div className="grid grid-cols-2 gap-6 sm:gap-8 md:flex md:justify-center md:gap-30">
                  <div onClick={() => onQuickSlotClick("팝업리스트")}>
                    <MenuItem label="팝업리스트" />
                  </div>
                  <div onClick={() => onQuickSlotClick("AI 챗봇")}>
                    <MenuItem label="AI 챗봇" />
                  </div>
                  <div onClick={() => onQuickSlotClick("팝업등록")}>
                    <MenuItem label="팝업등록" />
                  </div>
                  <div onClick={() => onQuickSlotClick("마이페이지")}>
                    <MenuItem label="마이페이지" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          SEARCH BAR + 하단 리스트 (memo)
         ========================= */}
      <MainBottom
        mainKeyword={mainKeyword}
        setMainKeyword={setMainKeyword}
        goPopupSearch={goPopupSearch}
        latestPopups={latestPopups}
        endingSoonPopups={endingSoonPopups}
        openingSoonPopups={openingSoonPopups}
        openingSoonTitle={openingSoonTitle}
        onAllClick={onAllClick}
        mainLoading={mainLoading}
      />
    </main>
  );
}

export default MainPage;
