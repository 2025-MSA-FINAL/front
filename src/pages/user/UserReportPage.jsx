// src/pages/user/UserPersonaReportPage.jsx
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../../api/authApi";
import { useAuthStore } from "../../store/authStore";

// =========================
// 유틸 컴포넌트들
// =========================

function StatCard({ label, value, sub }) {
  const isTextValue = typeof value === "string";

  const isMainCounter =
    label === "총 조회 수" ||
    label === "총 찜한 팝업" ||
    label === "총 예약 횟수";

  // 메인 카드용 아이콘 매핑
  const iconMap = {
    "총 조회 수": "👀",
    "총 찜한 팝업": "❤️",
    "총 예약 횟수": "📅",
  };
  const icon = iconMap[label];

  let displayValue;
  if (!isTextValue) {
    displayValue = value?.toLocaleString?.("ko-KR") ?? value;
  } else if (value && value.includes("~")) {
    const [before, after] = value.split("~");
    displayValue = (
      <>
        {before.trim()} ~
        <br />
        {after.trim()}
      </>
    );
  } else {
    displayValue = value;
  }

  const containerBase =
    "rounded-[18px] border border-secondary-light px-5 py-4 shadow-card flex flex-col gap-1.5 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg/60";
  const containerClass = isMainCounter
    ? `${containerBase} items-center text-center bg-gradient-to-b from-primary-soft2/15 to-white`
    : `${containerBase} bg-paper`;

  return (
    <div className={containerClass}>
      {isMainCounter && icon && (
        <span className="text-[18px] mb-1" aria-hidden="true">
          {icon}
        </span>
      )}
      <span
        className={
          "text-[13px] text-gray-700" + (isMainCounter ? " text-center" : "")
        }
      >
        {label}
      </span>
      <span
        className={
          (isTextValue
            ? "text-[15px] font-semibold text-black leading-snug break-keep"
            : "text-[22px] font-semibold text-black") +
          (isMainCounter ? " text-center" : "")
        }
      >
        {displayValue}
      </span>
      {!isMainCounter && sub && (
        <span className="text-[12px] text-gray-700">{sub}</span>
      )}
    </div>
  );
}

function AxisItem({ axis }) {
  const rawScore = axis?.score ?? 0;

  const clampScore = (s) => {
    const num = typeof s === "number" ? s : 0;
    return Math.min(Math.max(num, 0), 100);
  };

  const targetScore = clampScore(rawScore);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // targetScore가 바뀔 때마다 0에서 targetScore까지 차오르는 애니메이션
    const id = setTimeout(() => {
      setAnimatedScore(targetScore);
    }, 80);

    return () => clearTimeout(id);
  }, [targetScore]);

  return (
    <div className="bg-paper rounded-[14px] border border-secondary-light px-4 py-3 shadow-card flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] font-medium text-black">
            {axis.axisLabel}
          </span>
          <span className="text-[12px] text-gray-700">({axis.axisKey})</span>
        </div>
        <span className="text-[14px] font-semibold text-primary">
          {targetScore} / 100
        </span>
      </div>

      {/* Progress Bar (게이지 차오르는 애니메이션) */}
      <div className="w-full h-[6px] rounded-full bg-secondary-light overflow-hidden">
        <div
          className="h-full rounded-full bg-primary"
          style={{
            width: `${animatedScore}%`,
            transition: "width 0.8s ease-out",
          }}
        />
      </div>

      {axis.description && (
        <p className="text-[12px] text-gray-700 leading-relaxed">
          {axis.description}
        </p>
      )}
    </div>
  );
}


// 육각형 레이더 차트 (행동 성향)
function AxisRadarChart({ axes }) {
  const displayedAxes = (axes || []).slice(0, 6); // 최대 6개까지
  if (displayedAxes.length < 3) return null;

  const count = 6; // 육각형 기준
  const centerX = 100;
  const centerY = 100;
  const radius = 70;
  const angleStep = (2 * Math.PI) / count;

  const clampScore = (score) => {
    const s = typeof score === "number" ? score : 0;
    return Math.min(Math.max(s, 0), 100);
  };

  const getPoint = (score, index, r = radius) => {
    const angle = -Math.PI / 2 + angleStep * index;
    const scaledR = (r * clampScore(score)) / 100;
    const x = centerX + scaledR * Math.cos(angle);
    const y = centerY + scaledR * Math.sin(angle);
    return { x, y };
  };

  const makeRingPoints = (ratio) =>
    Array.from({ length: count })
      .map((_, idx) => {
        const angle = -Math.PI / 2 + angleStep * idx;
        const r = radius * ratio;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(" ");


  const dataPoints = displayedAxes
    .map((axis, idx) => {
      const { x, y } = getPoint(axis.score ?? 0, idx);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="mb-6 flex items-center justify-center bg-gradient-to-br from-primary-soft2/5 via-white to-primary-soft2/10 rounded-[24px] py-8 px-4 border border-primary-soft2/30 shadow-lg">
      <svg viewBox="0 0 200 200" className="max-w-[600px] h-auto" style={{ filter: 'drop-shadow(0 4px 20px rgba(139, 92, 246, 0.08))' }}>
        {/* 그래디언트 정의 */}
        <defs>
          {/* 메인 데이터 영역 그래디언트 */}
          <linearGradient id="radar-fill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
          </linearGradient>
          
          {/* 배경 원형 그래디언트 */}
          <radialGradient id="bg-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f5f3ff" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#ede9fe" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0.1" />
          </radialGradient>

          {/* 데이터 영역 그림자 */}
          <filter id="data-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.4" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 점 글로우 효과 */}
          <filter id="point-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* 배경 원형 */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 18}
          fill="url(#bg-gradient)"
          opacity="0.8"
        />

        {/* 격자 링 (육각형 5단계) */}
        <polygon
          points={makeRingPoints(1)}
          fill="none"
          stroke="#c4b5fd"
          strokeWidth="2"
          opacity="0.4"
        />
        <polygon
          points={makeRingPoints(0.75)}
          fill="none"
          stroke="#c4b5fd"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.35"
        />
        <polygon
          points={makeRingPoints(0.5)}
          fill="none"
          stroke="#ddd6fe"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          opacity="0.3"
        />
        <polygon
          points={makeRingPoints(0.25)}
          fill="none"
          stroke="#e9d5ff"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.25"
        />

        {/* 축선 */}
        {Array.from({ length: count }).map((_, idx) => {
          const angle = -Math.PI / 2 + angleStep * idx;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          return (
            <line
              key={`axis-line-${idx}`}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke="#c4b5fd"
              strokeWidth="1"
              opacity="0.4"
            />
          );
        })}

        {/* 데이터 영역 (메인) */}
        <polygon
          points={dataPoints}
          fill="url(#radar-fill)"
          stroke="#8b5cf6"
          strokeWidth="2.5"
          strokeLinejoin="round"
          filter="url(#data-glow)"
        />

        {/* 각 축의 데이터 포인트와 라벨 */}
        {displayedAxes.map((axis, idx) => {
          const score = clampScore(axis.score ?? 0);
          const scorePoint = getPoint(score, idx);
          const labelPoint = getPoint(115, idx);
          const angle = -Math.PI / 2 + angleStep * idx;
          const cos = Math.cos(angle);
          const anchor =
            Math.abs(cos) < 0.3 ? "middle" : cos > 0 ? "start" : "end";

          return (
            <g key={axis.axisKey}>
              {/* 포인트 외곽 글로우 */}
              <circle
                cx={scorePoint.x}
                cy={scorePoint.y}
                r="8"
                fill="#8b5cf6"
                opacity="0.2"
              />
              <circle
                cx={scorePoint.x}
                cy={scorePoint.y}
                r="5"
                fill="#8b5cf6"
                opacity="0.3"
              />
              
              {/* 메인 포인트 */}
              <circle
                cx={scorePoint.x}
                cy={scorePoint.y}
                r="4"
                fill="white"
                stroke="#8b5cf6"
                strokeWidth="2.5"
                filter="url(#point-glow)"
              />

              {/* 라벨 배경 */}
              <rect
                x={labelPoint.x - (anchor === "middle" ? 35 : anchor === "start" ? 0 : 70)}
                y={labelPoint.y - 20}
                width="70"
                height="36"
                rx="8"
                fill="white"
                opacity="0.95"
                stroke="#e9d5ff"
                strokeWidth="1"
              />

              {/* 라벨 텍스트 */}
              <text
                x={labelPoint.x}
                y={labelPoint.y - 8}
                textAnchor={anchor}
                className="fill-gray-900"
              >
                <tspan className="text-[11px] font-semibold">
                  {axis.axisLabel}
                </tspan>
              </text>
              <text
                x={labelPoint.x}
                y={labelPoint.y + 6}
                textAnchor={anchor}
                className="fill-primary"
              >
                <tspan className="text-[13px] font-bold">
                  {score}점
                </tspan>
              </text>
            </g>
          );
        })}

        {/* 중심 포인트 */}
        <circle
          cx={centerX}
          cy={centerY}
          r="6"
          fill="white"
          stroke="#a78bfa"
          strokeWidth="2"
          opacity="0.9"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r="3"
          fill="#8b5cf6"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}

// 해시태그 / 지역 칩: 화면에 보일 때 아래에서 올라오는 애니메이션
function TagChip({ label, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const chipRef = useRef(null);

  useEffect(() => {
    const el = chipRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // 실제 화면에 보이기 시작할 때부터 딜레이 후에 등장
          const id = setTimeout(() => {
            setVisible(true);
          }, delay);

          observer.unobserve(entry.target);

          return () => clearTimeout(id);
        }
      },
      {
        threshold: 0.2, // 칩의 20% 정도가 보이기 시작하면 트리거
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [delay]);

  return (
    <div
      ref={chipRef}
      className={
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-soft2/40 border border-primary-soft2 text-[12px] text-black transform transition-all duration-500 ease-out" +
        (visible ? " opacity-100 translate-y-0" : " opacity-0 translate-y-5")
      }
    >
      <span className="truncate max-w-[120px]">{label}</span>
    </div>
  );
}

function PopupSuggestionCard({ popup }) {
  const isFree = popup.priceType === "FREE" || popup.price === 0;
  const priceLabel = isFree
    ? "무료"
    : popup.price != null
    ? `${popup.price.toLocaleString("ko-KR")}원`
    : "가격 정보 없음";

  const statusLabel = {
    UPCOMING: "오픈 예정",
    ONGOING: "진행 중",
    ENDED: "종료",
  }[popup.status] ?? "알 수 없음";

  return (
    <Link
      to={`/popup/${popup.popId}`}
      className="group flex gap-3 items-stretch bg-paper rounded-[16px] border border-secondary-light shadow-card overflow-hidden hover:border-primary/70 transition-colors"
    >
      {/* 썸네일 */}
      <div className="relative w-[96px] h-[120px] bg-secondary-light flex-shrink-0 overflow-hidden">
        {popup.thumbnailUrl ? (
          <img
            src={popup.thumbnailUrl}
            alt={popup.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[12px] text-gray-700">
            이미지 없음
          </div>
        )}

        <span className="absolute left-2 top-2 inline-flex items-center px-1.5 py-[2px] rounded-full bg-primary-soft2/80 text-[11px] text-primary-dark">
          {statusLabel}
        </span>
      </div>

      {/* 텍스트 영역 */}
      <div className="flex-1 py-3 pr-3 flex flex-col justify-between">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-[15px] font-semibold text-black line-clamp-2">
            {popup.title}
          </h3>
          {popup.location && (
            <p className="text-[12px] text-gray-700 flex items-center gap-1">
              <span>📍</span>
              <span className="truncate">{popup.location}</span>
            </p>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-[14px] font-medium text-primary">
            {priceLabel}
          </span>
          <span className="text-[12px] text-gray-700 group-hover:text-primary-dark transition-colors">
            자세히 보기 →
          </span>
        </div>
      </div>
    </Link>
  );
}

// =========================
// 메인 페이지 컴포넌트
// =========================

function UserPersonaReportPage() {
  const authUser = useAuthStore((s) => s.user);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePopupTab, setActivePopupTab] = useState("similar"); // similar | demographic

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/api/users/report");
      setReport(res.data);
    } catch (e) {
      console.error(e);
      setError(
        e.response?.data?.message ||
          "개인화 리포트를 불러오는 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchReport();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.userId]);

  // 로그인 안 된 경우
  if (!authUser) {
    return (
      <main className="min-h-[calc(100vh-88px)] bg-white px-4 py-10 flex flex-col items-center">
        <div className="w-full max-w-[960px] bg-paper rounded-[18px] border border-secondary-light shadow-card px-6 py-8 text-center">
          <h1 className="text-[22px] font-semibold text-black mb-2">
            개인화 리포트는 로그인 후 확인할 수 있어요
          </h1>
          <p className="text-[14px] text-gray-700">
            나의 팝업 탐험 패턴을 보고 싶다면 먼저 로그인해주세요.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-88px)] bg-white px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-[960px] flex flex-col gap-6">
        {/* 헤더 */}
        <header className="flex flex-col gap-2">
          <h1 className="text-[24px] font-semibold text-black">
            {authUser.nickname
              ? `${authUser.nickname}님의 팝업 취향 리포트`
              : "내 팝업 취향 리포트"}
          </h1>
          <p className="text-[13px] text-gray-700">
            {report?.periodLabel
              ? `${report.periodLabel} 기준 활동 데이터`
              : "최근 팝업 조회 · 찜 · 예약 기록을 바탕으로 분석했어요."}
          </p>
        </header>

        {/* 로딩 / 에러 */}
        {loading && (
          <div className="bg-paper rounded-[18px] border border-secondary-light shadow-card px-6 py-8 text-center text-[14px] text-gray-700">
            나의 팝업 취향을 분석하는 중입니다... ✨
          </div>
        )}

        {error && !loading && (
          <div className="bg-paper rounded-[18px] border border-primary-soft px-6 py-4 text-[14px] text-danger">
            {error}
          </div>
        )}

        {/* 실제 리포트 */}
        {report && !loading && !error && (
          <>
            {/* 상단 요약 / 기본 정보 */}
            <section className="grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4">
              {/* 요약 카드 */}
              <div className="bg-paper rounded-[18px] border border-secondary-light px-6 py-5 shadow-card flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex flex-col">
                    <span className="text-[14px] text-gray-700">
                      한 줄로 보는 나의 팝업 페르소나
                    </span>
                    <span className="text-[18px] font-semibold text-black mt-1">
                      {report.ageGroupLabel
                        ? `${report.ageGroupLabel} · ${
                            report.gender === "MALE"
                              ? "남성"
                              : report.gender === "FEMALE"
                              ? "여성"
                              : "성별 정보 없음"
                          }`
                        : "연령/성별 정보 없음"}
                    </span>
                  </div>
                  {report.age && (
                    <span className="text-[13px] text-gray-700">
                      만 {report.age}세 (출생년도{" "}
                      {report.birthYear ?? "알 수 없음"})
                    </span>
                  )}
                </div>

                {report.summary && (
                  <p className="mt-1 text-[14px] text-gray-800 leading-relaxed whitespace-pre-line">
                    {report.summary}
                  </p>
                )}
              </div>

              {/* 집계 카드 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatCard
                  label="총 조회 수"
                  value={report.totalViewCount}
                  sub="팝업 상세 페이지를 본 횟수"
                />
                <StatCard
                  label="총 찜한 팝업"
                  value={report.totalWishlistCount}
                  sub="하트(❤️)를 눌러 저장한 팝업"
                />
                <StatCard
                  label="총 예약 횟수"
                  value={report.totalReservationCount}
                  sub="실제 방문을 위해 예약까지 완료한 횟수"
                />
              </div>
            </section>

            {/* 행동 축 (Axis) */}
            <section className="mt-2 gap-4">
              <h2 className="text-[16px] font-semibold text-black mb-2">
                나의 팝업 행동 성향
              </h2>
              <p className="text-[13px] text-gray-700 mb-3">
                팝업을 얼마나 자주, 어떻게 탐색하고 예약하는지 0~100 스코어로
                표현했어요.
              </p>

              {/* 육각형 레이더 차트 */}
              <AxisRadarChart axes={report.axes} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.axes?.map((axis) => (
                  <AxisItem key={axis.axisKey} axis={axis} />
                ))}
              </div>
            </section>

            {/* 해시태그 / 지역 */}
            <section className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h2 className="text-[15px] font-semibold text-black mb-2">
                  내가 자주 보는 해시태그
                </h2>
                {(!report.topHashtags || report.topHashtags.length === 0) && (
                  <p className="text-[13px] text-gray-700 bg-paper rounded-[14px] border border-secondary-light px-4 py-3">
                    아직 충분한 데이터가 없어요. 조금만 더 탐험해볼까요? 🙂
                  </p>
                )}
                {report.topHashtags && report.topHashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {report.topHashtags.map((tagStat, idx) => (
                      <TagChip
                        key={tagStat.tag}
                        label={`#${tagStat.tag}`}
                        delay={idx * 70}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-[15px] font-semibold text-black mb-2">
                  내가 자주 가는 지역
                </h2>
                {(!report.topRegions || report.topRegions.length === 0) && (
                  <p className="text-[13px] text-gray-700 bg-paper rounded-[14px] border border-secondary-light px-4 py-3">
                    아직 지역 패턴이 뚜렷하지 않아요. 새로운 동네도 탐험해봐요!
                  </p>
                )}
                {report.topRegions && report.topRegions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {report.topRegions.map((regionStat, idx) => (
                      <TagChip
                        key={regionStat.region}
                        label={regionStat.region}
                        delay={idx * 70}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 추천 팝업: 탭 전환 */}
            <section className="mt-6 mb-8">
              <div className="flex flex-col gap-2">
                <h2 className="text-[16px] font-semibold text-black">
                  추천 팝업
                </h2>

                <div className="inline-flex items-center rounded-full bg-primary-soft2/20 p-1 w-fit">
                  <button
                    type="button"
                    onClick={() => setActivePopupTab("similar")}
                    className={`px-3 py-1.5 text-[13px] rounded-full transition-colors ${
                      activePopupTab === "similar"
                        ? "bg-primary-soft2 text-primary-dark shadow-card"
                        : "text-gray-700 hover:text-primary"
                    }`}
                  >
                    비슷한 취향
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePopupTab("demographic")}
                    className={`px-3 py-1.5 text-[13px] rounded-full transition-colors ${
                      activePopupTab === "demographic"
                        ? "bg-primary-soft2 text-primary-dark shadow-card"
                        : "text-gray-700 hover:text-primary"
                    }`}
                  >
                    성별 · 연령대
                  </button>
                </div>
              </div>

              <div className="mt-4">
                {activePopupTab === "similar" && (
                  <>
                    <p className="text-[13px] text-gray-700 mb-3">
                      나와 유사한 행동 패턴을 가진 유저들이 많이 본/찜한
                      팝업이에요.
                    </p>

                    {(!report.similarTastePopups ||
                      report.similarTastePopups.length === 0) && (
                      <div className="bg-paper rounded-[16px] border border-secondary-light px-4 py-4 text-[13px] text-gray-700">
                        아직 추천할 만한 팝업이 없어요. 찜과 예약을 조금 더
                        쌓으면 더 정교한 추천을 받을 수 있어요.
                      </div>
                    )}

                    {report.similarTastePopups &&
                      report.similarTastePopups.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {report.similarTastePopups.map((popup) => (
                            <PopupSuggestionCard
                              key={popup.popId}
                              popup={popup}
                            />
                          ))}
                        </div>
                      )}
                  </>
                )}

                {activePopupTab === "demographic" && (
                  <>
                    <p className="text-[13px] text-gray-700 mb-3">
                      {report.ageGroupLabel
                        ? `${report.ageGroupLabel} ${
                            report.gender === "MALE"
                              ? "남성"
                              : report.gender === "FEMALE"
                              ? "여성"
                              : ""
                          } 유저 기준 추천이에요.`
                        : "비슷한 연령대 유저들이 많이 본 팝업이에요."}
                    </p>

                    {(!report.demographicPopups ||
                      report.demographicPopups.length === 0) && (
                      <div className="bg-paper rounded-[16px] border border-secondary-light px-4 py-4 text-[13px] text-gray-700">
                        이 연령대/성별 그룹의 데이터가 아직 많지 않아요. 전체
                        활동이 조금 더 쌓이면 보여드릴게요.
                      </div>
                    )}

                    {report.demographicPopups &&
                      report.demographicPopups.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {report.demographicPopups.map((popup) => (
                            <PopupSuggestionCard
                              key={popup.popId}
                              popup={popup}
                            />
                          ))}
                        </div>
                      )}
                  </>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default UserPersonaReportPage;
