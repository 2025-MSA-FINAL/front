// src/pages/user/UserPersonaReportPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../../api/authApi";
import { useAuthStore } from "../../store/authStore";

// ------------------------------------------------------
// 유틸
// ------------------------------------------------------
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

function toKoreanGender(g) {
  // 프로젝트마다 gender 값이 "MALE/FEMALE" or "M/F" or null 등 섞일 수 있어서 대응
  if (!g) return "정보 없음";
  const gg = String(g).toUpperCase();
  if (gg === "MALE" || gg === "M") return "남성";
  if (gg === "FEMALE" || gg === "F") return "여성";
  return "정보 없음";
}

function statusLabel(status) {
  const s = String(status || "").toUpperCase();
  return (
    {
      UPCOMING: "오픈 예정",
      ONGOING: "진행 중",
      ENDED: "종료",
    }[s] || "알 수 없음"
  );
}

function priceLabel(popup) {
  const isFree =
    popup?.priceType === "FREE" ||
    popup?.priceType === "free" ||
    popup?.price === 0 ||
    popup?.price === "0";

  if (isFree) return "무료";
  if (popup?.price != null && popup?.price !== "") {
    const n = typeof popup.price === "number" ? popup.price : Number(popup.price);
    if (!Number.isNaN(n)) return `${n.toLocaleString("ko-KR")}원`;
  }
  return "가격 정보 없음";
}

// ------------------------------------------------------
// 작은 UI 컴포넌트들
// ------------------------------------------------------
function SectionTitle({ title, desc }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-[16px] font-semibold text-black">{title}</h2>
      {desc ? <p className="text-[13px] text-gray-700">{desc}</p> : null}
    </div>
  );
}

function Chip({ children, variant = "default" }) {
  const base =
    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[12px] leading-none";
  const style =
    variant === "soft"
      ? "bg-primary-soft2/35 border-primary-soft2 text-black"
      : variant === "dark"
      ? "bg-gray-900 border-gray-900 text-white"
      : "bg-paper border-secondary-light text-black";

  return <span className={cn(base, style)}>{children}</span>;
}

function EmptyBox({ children }) {
  return (
    <div className="bg-paper rounded-[16px] border border-secondary-light shadow-card px-4 py-4 text-[13px] text-gray-700">
      {children}
    </div>
  );
}

// ------------------------------------------------------
// 성향(페르소나) 카드
// ------------------------------------------------------
function PersonaCard({ report }) {
  // 백엔드가 어떤 필드명을 쓰든 최대한 대응
  const headline =
    report?.personaHeadline ||
    report?.personaTitle ||
    report?.persona?.headline ||
    report?.persona?.title ||
    report?.personaOneLiner ||
    report?.summaryHeadline ||
    null;

  const detail =
    report?.personaDetail ||
    report?.personaDescription ||
    report?.persona?.detail ||
    report?.persona?.description ||
    report?.summary ||
    report?.personaSummary ||
    null;

  const gender = toKoreanGender(report?.gender);
  const ageGroup = report?.ageGroupLabel || report?.ageGroup || null;

  return (
    <section className="bg-paper rounded-[18px] border border-secondary-light px-6 py-5 shadow-card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-gray-700">AI가 분석한 나의 성향</span>
          <div className="flex flex-wrap items-center gap-2 mt-0.5">
            {ageGroup ? <Chip variant="soft">{ageGroup}</Chip> : null}
            <Chip variant="soft">{gender}</Chip>
            {report?.periodLabel ? (
              <Chip>{String(report.periodLabel)}</Chip>
            ) : null}
          </div>
        </div>
        <span className="text-[12px] text-gray-700 select-none">✨</span>
      </div>

      {headline ? (
        <div className="rounded-[14px] bg-primary-soft2/20 border border-primary-soft2 px-4 py-3">
          <p className="text-[15px] font-semibold text-black leading-snug break-keep">
            {headline}
          </p>
        </div>
      ) : null}

      {detail ? (
        <p className="text-[14px] text-gray-800 leading-relaxed whitespace-pre-line">
          {detail}
        </p>
      ) : (
        <p className="text-[13px] text-gray-700">
          아직 충분한 활동 데이터가 없어 성향 분석이 간단하게 제공돼요. 🙂
        </p>
      )}

      {/* 근거 라벨(선택) */}
      {safeArray(report?.evidenceLabels || report?.evidences || report?.persona?.evidences).length >
      0 ? (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {safeArray(report?.evidenceLabels || report?.evidences || report?.persona?.evidences)
            .slice(0, 8)
            .map((e, idx) => (
              <Chip key={`${String(e)}-${idx}`}>{String(e)}</Chip>
            ))}
        </div>
      ) : null}
    </section>
  );
}

// ------------------------------------------------------
// 해시태그/지역 섹션
// ------------------------------------------------------
function TagRegionSection({ report }) {
  const tags =
    safeArray(report?.topHashtags) ||
    safeArray(report?.hashtags) ||
    safeArray(report?.topTags);

  const regions =
    safeArray(report?.topRegions) ||
    safeArray(report?.regions) ||
    safeArray(report?.topRegion);

  // 기존 구조(UserPersonaTagStat/UserPersonaRegionStat) 대응:
  // - { tag, score } / { region, score }
  // - 혹은 문자열 배열일 수도 있음
  const normalizedTags = useMemo(() => {
    return safeArray(tags)
      .map((t) => {
        if (typeof t === "string") return { label: t, weight: null };
        const label = t?.tag ?? t?.name ?? t?.label ?? null;
        const weight = t?.score ?? t?.value ?? null;
        return label ? { label, weight } : null;
      })
      .filter(Boolean);
  }, [tags]);

  const normalizedRegions = useMemo(() => {
    return safeArray(regions)
      .map((r) => {
        if (typeof r === "string") return { label: r, weight: null };
        const label = r?.region ?? r?.name ?? r?.label ?? null;
        const weight = r?.score ?? r?.value ?? null;
        return label ? { label, weight } : null;
      })
      .filter(Boolean);
  }, [regions]);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-paper rounded-[18px] border border-secondary-light shadow-card px-6 py-5">
        <SectionTitle
          title="자주 보는 해시태그"
          desc="내가 관심 있게 본 팝업들의 해시태그를 모아봤어요."
        />

        <div className="mt-3">
          {normalizedTags.length === 0 ? (
            <EmptyBox>아직 해시태그 패턴이 뚜렷하지 않아요. 조금만 더 둘러보면 좋아요!</EmptyBox>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {normalizedTags.slice(0, 12).map((t, idx) => (
                <Chip key={`${t.label}-${idx}`} variant="soft">
                  #{t.label}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-paper rounded-[18px] border border-secondary-light shadow-card px-6 py-5">
        <SectionTitle
          title="자주 가는 지역"
          desc="내 활동이 많이 쌓인 지역 중심으로 보여드려요."
        />

        <div className="mt-3">
          {normalizedRegions.length === 0 ? (
            <EmptyBox>아직 지역 패턴이 없어요. 새로운 동네를 탐험해보면 추천이 더 좋아져요.</EmptyBox>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {normalizedRegions.slice(0, 12).map((r, idx) => (
                <Chip key={`${r.label}-${idx}`}>{r.label}</Chip>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------
// 추천 카드(이유 포함)
// ------------------------------------------------------
function ReasonList({ reasons }) {
  const normalized = safeArray(reasons)
    .map((r) => {
      if (!r) return null;
      if (typeof r === "string") return { tag: "근거", text: r };
      // { tag, text } 형태 기대
      const tag = r?.tag ?? r?.label ?? "근거";
      const text = r?.text ?? r?.reason ?? r?.value ?? null;
      return text ? { tag, text } : null;
    })
    .filter(Boolean);

  if (normalized.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {normalized.slice(0, 4).map((r, idx) => (
        <span
          key={`${r.tag}-${idx}`}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary-soft2/25 border border-primary-soft2 text-[11px] text-black"
        >
          <span className="font-semibold">{r.tag}</span>
          <span className="text-gray-700">·</span>
          <span className="text-gray-800">{r.text}</span>
        </span>
      ))}
    </div>
  );
}

function RecommendationCard({ item }) {
  // item이 pop 정보를 직접 들고 있거나, popup 필드 아래에 있을 수도 있음
  const popup = item?.popup ?? item ?? {};

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
            alt={popup.title || "팝업 썸네일"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[12px] text-gray-700">
            이미지 없음
          </div>
        )}

        <span className="absolute left-2 top-2 inline-flex items-center px-1.5 py-[2px] rounded-full bg-primary-soft2/80 text-[11px] text-primary-dark">
          {statusLabel(popup.status)}
        </span>
      </div>

      {/* 본문 */}
      <div className="flex-1 py-3 pr-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[15px] font-semibold text-black line-clamp-2">
              {popup.title || "팝업 이름"}
            </h3>

            {/* matchLevel (선택) */}
            {item?.matchLevel ? (
              <Chip variant="dark">
                {String(item.matchLevel).toUpperCase() === "HIGH"
                  ? "🔥 강추천"
                  : String(item.matchLevel).toUpperCase() === "MID"
                  ? "👍 추천"
                  : "🌱 탐색"}
              </Chip>
            ) : null}
          </div>

          {popup.location ? (
            <p className="text-[12px] text-gray-700 flex items-center gap-1 mt-1">
              <span aria-hidden="true">📍</span>
              <span className="truncate">{popup.location}</span>
            </p>
          ) : null}

          {/* 추천 이유 */}
          <ReasonList reasons={item?.reasons || popup?.reasons} />

          {/* 한 줄 요약 */}
          {item?.oneLine || popup?.oneLine ? (
            <p className="text-[12px] text-gray-700 leading-relaxed mt-2 line-clamp-2">
              {item?.oneLine || popup?.oneLine}
            </p>
          ) : null}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[14px] font-medium text-primary">
            {priceLabel(popup)}
          </span>
          <span className="text-[12px] text-gray-700 group-hover:text-primary-dark transition-colors">
            자세히 보기 →
          </span>
        </div>
      </div>
    </Link>
  );
}

function RecommendationSection({ report }) {
  // 백엔드가 "recommendations" 하나로 주는 경우 + 기존 2탭 구조 둘 다 대응
  const unified = safeArray(report?.recommendations || report?.picks || report?.recommendedPopups);

  const similar = safeArray(report?.similarTastePopups);
  const demo = safeArray(report?.demographicPopups);

  const [tab, setTab] = useState(() => {
    // unified가 있으면 탭이 필요 없으니 "unified"
    if (unified.length > 0) return "unified";
    // 아니면 기존처럼 similar/demographic 탭
    return "similar";
  });

  const list = useMemo(() => {
    if (unified.length > 0) return unified;
    return tab === "demographic" ? demo : similar;
  }, [unified, tab, demo, similar]);

  const strategyLabel =
    report?.recommendationStrategy?.label ||
    report?.strategy?.label ||
    report?.strategyLabel ||
    null;

  const strategySummary =
    report?.recommendationStrategy?.summary ||
    report?.strategy?.summary ||
    report?.strategySummary ||
    null;

  return (
    <section className="bg-paper rounded-[18px] border border-secondary-light shadow-card px-6 py-5">
      <div className="flex flex-col gap-2">
        <SectionTitle
          title="추천 팝업"
          desc="서버에서 후보군을 고정으로 뽑고, AI가 ‘추천 이유’만 설명해요."
        />

        {(strategyLabel || strategySummary) && (
          <div className="mt-1 rounded-[14px] bg-primary-soft2/15 border border-primary-soft2 px-4 py-3">
            {strategyLabel ? (
              <p className="text-[13px] font-semibold text-black">{strategyLabel}</p>
            ) : null}
            {strategySummary ? (
              <p className="text-[13px] text-gray-700 mt-1 whitespace-pre-line">
                {strategySummary}
              </p>
            ) : null}
          </div>
        )}

        {/* unified가 없을 때만 탭 노출 */}
        {unified.length === 0 && (
          <div className="inline-flex items-center rounded-full bg-primary-soft2/20 p-1 w-fit mt-2">
            <button
              type="button"
              onClick={() => setTab("similar")}
              className={cn(
                "px-3 py-1.5 text-[13px] rounded-full transition-colors",
                tab === "similar"
                  ? "bg-primary-soft2 text-primary-dark shadow-card"
                  : "text-gray-700 hover:text-primary"
              )}
            >
              내 취향 기반
            </button>
            <button
              type="button"
              onClick={() => setTab("demographic")}
              className={cn(
                "px-3 py-1.5 text-[13px] rounded-full transition-colors",
                tab === "demographic"
                  ? "bg-primary-soft2 text-primary-dark shadow-card"
                  : "text-gray-700 hover:text-primary"
              )}
            >
              성별 · 연령대 기반
            </button>
          </div>
        )}
      </div>

      <div className="mt-4">
        {list.length === 0 ? (
          <EmptyBox>
            아직 추천할 데이터가 부족해요. 찜/조회/예약 기록이 더 쌓이면 더 정확해져요.
          </EmptyBox>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {list.map((it, idx) => {
  // 안정적인 key 우선순위: popId -> (popup.popId) -> id -> idx
  const key = String(it?.popId ?? it?.popup?.popId ?? it?.id ?? idx);
  return <RecommendationCard key={key} item={it} />;
})}

          </div>
        )}
      </div>
    </section>
  );
}

// ------------------------------------------------------
// 메인 페이지
// ------------------------------------------------------
function UserPersonaReportPage() {
  const authUser = useAuthStore((s) => s.user);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/api/users/report");
      setReport(res.data);
    } catch (e) {
      console.error(e);
      setError(
        e.response?.data?.message || "리포트를 불러오는 중 오류가 발생했습니다."
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
            나의 팝업 성향과 추천을 보려면 먼저 로그인해주세요.
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
              ? `${authUser.nickname}님의 팝업 리포트`
              : "내 팝업 리포트"}
          </h1>
          <p className="text-[13px] text-gray-700">
            {report?.periodLabel
              ? `${report.periodLabel} 기준`
              : "최근 팝업 조회 · 찜 · 예약 기록을 바탕으로 분석했어요."}
          </p>
        </header>

        {/* 로딩 / 에러 */}
        {loading && (
          <div className="bg-paper rounded-[18px] border border-secondary-light shadow-card px-6 py-8 text-center text-[14px] text-gray-700">
            나의 팝업 성향을 분석하는 중입니다... ✨
          </div>
        )}

        {error && !loading && (
          <div className="bg-paper rounded-[18px] border border-primary-soft px-6 py-4 text-[14px] text-danger">
            {error}
          </div>
        )}

        {/* 본문 */}
        {report && !loading && !error && (
          <>
            {/* 1) 유저 성향 분석 */}
            <PersonaCard report={report} />

            {/* 2) 자주가는 지역 / 해시태그 */}
            <TagRegionSection report={report} />

            {/* 3) 추천 + 이유 */}
            <RecommendationSection report={report} />

            {/* 하단 안내 (선택) */}
            <div className="text-[12px] text-gray-600 px-1">
              ※ 추천 결과는 서버 기준으로 고정되며, AI는 추천 이유(설명)만 생성합니다.
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default UserPersonaReportPage;
