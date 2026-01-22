// src/pages/user/UserPersonaReportPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../../api/authApi";
import { useAuthStore } from "../../store/authStore";

// ------------------------------------------------------
// utils
// ------------------------------------------------------
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
function safeArray(v) {
  return Array.isArray(v) ? v : [];
}
function normalizeGender(g) {
  if (!g) return null;
  const gg = String(g).toUpperCase();
  if (gg === "MALE" || gg === "M") return "남성";
  if (gg === "FEMALE" || gg === "F") return "여성";
  return null;
}
function statusLabel(status) {
  const s = String(status || "").toUpperCase();
  return (
    {
      UPCOMING: "오픈 예정",
      ONGOING: "진행 중",
      ENDED: "종료",
    }[s] || null
  );
}
function statusTone(status) {
  const s = String(status || "").toUpperCase();
  if (s === "ONGOING")
    return "bg-emerald-500/15 text-emerald-900 border-emerald-500/25";
  if (s === "UPCOMING")
    return "bg-indigo-500/15 text-indigo-900 border-indigo-500/25";
  if (s === "ENDED") return "bg-gray-500/15 text-gray-800 border-gray-500/25";
  return "bg-gray-500/10 text-gray-800 border-gray-300/40";
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
function normalizeTagItems(tags) {
  return safeArray(tags)
    .map((t) => {
      if (typeof t === "string") return { label: t, weight: null };
      const label = t?.tag ?? t?.name ?? t?.label ?? null;
      const weight = t?.score ?? t?.value ?? null;
      return label ? { label, weight } : null;
    })
    .filter(Boolean);
}
function normalizeRegionItems(regions) {
  return safeArray(regions)
    .map((r) => {
      if (typeof r === "string") return { label: r, weight: null };
      const label = r?.region ?? r?.name ?? r?.label ?? null;
      const weight = r?.score ?? r?.value ?? null;
      return label ? { label, weight } : null;
    })
    .filter(Boolean);
}

// ------------------------------------------------------
// design atoms
// ------------------------------------------------------
function Pill({ children, tone = "soft", className }) {
  const base =
    "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[12px] leading-none whitespace-nowrap";
  const style =
    tone === "solid"
      ? "bg-gray-900 text-white border-gray-900"
      : tone === "brand"
      ? "bg-primary-soft2/30 text-primary-dark border-primary-soft2"
      : tone === "glass"
      ? "bg-white/40 backdrop-blur border-white/50 text-gray-900"
      : "bg-white border-secondary-light text-gray-900";

  return (
    <span
      className={cn(
        base,
        style,
        // ✅ 길어져도 UI 안 깨지게: 한 줄 + 최대폭 + ... 처리
        "min-w-0 max-w-[160px] sm:max-w-[220px]",
        className
      )}
      title={typeof children === "string" ? children : undefined}
    >
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}

function Card({ className, children }) {
  return (
    <section
      className={cn(
        "rounded-[20px] border border-secondary-light bg-paper shadow-card",
        className
      )}
    >
      {children}
    </section>
  );
}

function CardHeader({ eyebrow, title, desc, right }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        {eyebrow ? <p className="text-[12px] text-gray-600">{eyebrow}</p> : null}
        {title ? (
          <h2 className="text-[18px] font-semibold text-gray-950 mt-0.5 break-keep">
            {title}
          </h2>
        ) : null}
        {desc ? <p className="text-[13px] text-gray-700 mt-1">{desc}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-secondary-light/70 my-4" />;
}

function SkeletonLine({ w = "w-full" }) {
  return <div className={cn("h-3 rounded-full bg-gray-200/80", w)} />;
}

function SkeletonBox() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2 w-full">
          <SkeletonLine w="w-40" />
          <SkeletonLine w="w-64" />
          <div className="flex gap-2 mt-2">
            <div className="h-7 w-20 rounded-full bg-gray-200/80" />
            <div className="h-7 w-24 rounded-full bg-gray-200/80" />
            <div className="h-7 w-28 rounded-full bg-gray-200/80" />
          </div>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-gray-200/80" />
      </div>
      <div className="mt-5 space-y-2">
        <SkeletonLine />
        <SkeletonLine w="w-11/12" />
        <SkeletonLine w="w-10/12" />
      </div>
    </Card>
  );
}

// ------------------------------------------------------
// hero + persona
// ------------------------------------------------------
function PersonaHero({ report, nickname }) {
  const headline =
    report?.personaHeadline ||
    report?.personaTitle ||
    report?.persona?.headline ||
    report?.persona?.title ||
    report?.personaOneLiner ||
    report?.summaryHeadline ||
    report?.nicknameTitle ||
    null;

  const detail =
    report?.personaDetail ||
    report?.personaDescription ||
    report?.persona?.detail ||
    report?.persona?.description ||
    report?.summary ||
    report?.personaSummary ||
    null;

  const ageGroup = report?.ageGroupLabel || report?.ageGroup || null;
  const gender = normalizeGender(report?.gender);
  const periodLabel = report?.periodLabel ? String(report.periodLabel) : null;

  const tags = normalizeTagItems(report?.topHashtags);
  const regions = normalizeRegionItems(report?.topRegions);
  const topTag = tags[0]?.label ?? null;
  const topRegion = regions[0]?.label ?? null;

  const detailBoost = useMemo(() => {
    const parts = [];
    if (topTag) parts.push(`요즘 "${topTag}" 키워드에 눈길이 가고`);
    if (topRegion) parts.push(`${topRegion} 동선을 자주 타는 편이에요`);
    if (parts.length === 0) return null;
    return `${parts.join(", ")}.`;
  }, [topTag, topRegion]);

  return (
    <div className="relative overflow-hidden rounded-[26px] border border-secondary-light bg-paper shadow-card">
      <div className="absolute inset-0">
        <div className="absolute -top-24 -right-28 w-[420px] h-[420px] rounded-full bg-primary-soft2/35 blur-3xl" />
        <div className="absolute -bottom-28 -left-24 w-[420px] h-[420px] rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 to-white/95" />
      </div>

      <div className="relative p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[12px] text-gray-700">
              AI가 분석한 {nickname ? `${nickname}님의` : "나의"} 성향
            </p>
            <h1 className="mt-2 text-[24px] sm:text-[28px] font-semibold text-gray-950 tracking-tight break-keep">
              {headline || "아직은 취향을 모으는 중"}
            </h1>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              {ageGroup ? <Pill tone="glass">{ageGroup}</Pill> : null}
              {gender ? <Pill tone="glass">{gender}</Pill> : null}
              {periodLabel ? <Pill tone="glass">{periodLabel}</Pill> : null}
            </div>
          </div>

          <div className="shrink-0">
            <div className="h-11 w-11 rounded-2xl bg-white/60 border border-white/60 backdrop-blur flex items-center justify-center">
              <span className="text-[18px]" aria-hidden="true">
                ✨
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8">
            <div className="rounded-[18px] bg-white/70 backdrop-blur border border-white/60 p-5">
              {detail ? (
                <p className="text-[14px] text-gray-800 leading-relaxed whitespace-pre-line">
                  {detail}
                  {detailBoost ? (
                    <span className="text-gray-700"> {" "}{detailBoost}</span>
                  ) : null}
                </p>
              ) : (
                <p className="text-[14px] text-gray-700 leading-relaxed">
                  아직 충분한 활동 데이터가 없어 성향 분석이 간단하게 제공돼요. 🙂
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              <MiniInsight
                title="요즘 관심 키워드"
                value={topTag ? `#${topTag}` : "데이터 수집 중"}
                icon="🏷️"
              />
              <MiniInsight
                title="자주 보는 동선"
                value={topRegion || "데이터 수집 중"}
                icon="🗺️"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniInsight({ title, value, icon }) {
  return (
    <div className="rounded-[18px] bg-white/70 backdrop-blur border border-white/60 p-4">
      <p className="text-[12px] text-gray-600 flex items-center gap-1">
        <span aria-hidden="true">{icon}</span>
        {title}
      </p>
      <p className="mt-1 text-[14px] font-semibold text-gray-950 break-keep">
        {value}
      </p>
      <div className="mt-3 h-px bg-white/70" />
      <p className="mt-2 text-[12px] text-gray-700">기록이 쌓일수록 더 선명해져요</p>
    </div>
  );
}

// ------------------------------------------------------
// tag / region
// ------------------------------------------------------
function TagRegionSection({ report }) {
  const tags = normalizeTagItems(report?.topHashtags || report?.hashtags || report?.topTags);
  const regions = normalizeRegionItems(report?.topRegions || report?.regions || report?.topRegion);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <Card className="lg:col-span-7 p-6">
        <CardHeader
          eyebrow="관심 패턴"
          title="자주 보는 해시태그"
          desc={null}
          right={<Pill tone="brand">TOP</Pill>}
        />
        <Divider />
        {tags.length === 0 ? (
          <div className="rounded-[18px] border border-secondary-light bg-white p-4 text-[13px] text-gray-700">
            아직 해시태그 패턴이 뚜렷하지 않아요.
          </div>
        ) : (
          <>
            <TopRow
              a={tags[0] ? `#${tags[0].label}` : null}
              b={tags[1] ? `#${tags[1].label}` : null}
              c={tags[2] ? `#${tags[2].label}` : null}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.slice(0, 14).map((t, idx) => (
                <Pill key={`${t.label}-${idx}`} tone={idx < 3 ? "brand" : "soft"}>
                  #{t.label}
                </Pill>
              ))}
            </div>
          </>
        )}
      </Card>

      <Card className="lg:col-span-5 p-6">
        <CardHeader
          eyebrow="동선"
          title="자주 가는 지역"
          desc={null}
          right={<Pill tone="brand">MAP</Pill>}
        />
        <Divider />
        {regions.length === 0 ? (
          <div className="rounded-[18px] border border-secondary-light bg-white p-4 text-[13px] text-gray-700">
            아직 지역 패턴이 없어요.
          </div>
        ) : (
          <>
            <TopRow
              a={regions[0]?.label ?? null}
              b={regions[1]?.label ?? null}
              c={regions[2]?.label ?? null}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {regions.slice(0, 14).map((r, idx) => (
                <Pill key={`${r.label}-${idx}`} tone={idx < 3 ? "brand" : "soft"}>
                  {r.label}
                </Pill>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

function TopRow({ a, b, c }) {
  const items = [a, b, c].filter(Boolean);
  if (items.length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {items.map((x, i) => (
        <div
          key={`${x}-${i}`}
          className="rounded-[16px] border border-secondary-light bg-white px-4 py-3 min-w-0"
          title={x}
        >
          <p className="text-[12px] text-gray-600">TOP {i + 1}</p>
          <p className="mt-0.5 text-[14px] font-semibold text-gray-950 truncate min-w-0">
            {x}
          </p>
        </div>
      ))}
    </div>
  );
}

// ------------------------------------------------------
// recommendations
// ------------------------------------------------------
function ReasonPills({ reasons }) {
  const normalized = safeArray(reasons)
    .map((r) => {
      if (!r) return null;
      if (typeof r === "string") return { label: "근거", text: r };
      const label = r?.label ?? r?.tag ?? "근거";
      const text = r?.text ?? r?.reason ?? r?.value ?? null;
      return text ? { label, text } : null;
    })
    .filter(Boolean)
    .slice(0, 3);

  if (normalized.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {normalized.map((r, idx) => (
        <span
          key={`${r.label}-${idx}`}
          className="inline-flex items-center gap-2 rounded-full border border-primary-soft2 bg-primary-soft2/15 px-3 py-1 text-[12px] min-w-0 max-w-full"
          title={`${r.label} · ${r.text}`}
        >
          <span className="font-semibold text-primary-dark shrink-0">{r.label}</span>
          <span className="h-3 w-px bg-primary-soft2/80 shrink-0" />
          <span className="text-gray-800 min-w-0 truncate">{r.text}</span>
        </span>
      ))}
    </div>
  );
}

function MatchBadge({ level }) {
  if (!level) return null;
  const lv = String(level).toUpperCase();
  const map = {
    HIGH: { text: "🔥 강추천", cls: "bg-rose-500/15 text-rose-900 border-rose-500/25" },
    MID: { text: "👍 추천", cls: "bg-amber-500/15 text-amber-900 border-amber-500/25" },
    LOW: { text: "🌱 탐색", cls: "bg-gray-500/10 text-gray-800 border-gray-300/40" },
  };
  const x = map[lv] || map.LOW;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-[12px]", x.cls)}>
      {x.text}
    </span>
  );
}

function RecommendationCard({ item }) {
  const popup = item?.popup ?? item ?? {};
  const st = statusLabel(popup.status);

  return (
    <Link
      to={`/popup/${popup.popId}`}
      className="group relative overflow-hidden rounded-[22px] border border-secondary-light bg-paper shadow-card hover:border-primary-soft2/80 transition-colors"
    >
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute -top-24 -right-24 w-[240px] h-[240px] rounded-full bg-primary-soft2/30 blur-3xl" />
      </div>

      <div className="relative">
        <div className="relative h-[150px] bg-secondary-light overflow-hidden">
          {popup.thumbnailUrl ? (
            <img
              src={popup.thumbnailUrl}
              alt={popup.title || "팝업 썸네일"}
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[12px] text-gray-700">
              이미지 없음
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0" />

          <div className="absolute left-4 top-4 flex items-center gap-2">
            {st ? (
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-[12px]",
                  statusTone(popup.status)
                )}
              >
                {st}
              </span>
            ) : null}
          </div>

          <div className="absolute right-4 top-4">
            <MatchBadge level={item?.matchLevel} />
          </div>

          <div className="absolute left-4 bottom-4 right-4">
            <h3 className="text-white text-[16px] font-semibold line-clamp-2 drop-shadow">
              {popup.title || "팝업 이름"}
            </h3>
            {popup.location ? (
              <p className="text-white/85 text-[12px] mt-1 truncate">📍 {popup.location}</p>
            ) : null}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[14px] font-semibold text-gray-950">{priceLabel(popup)}</div>

            {typeof item?.serverScore === "number" ? (
              <Pill tone="soft" className="max-w-none">
                서버 점수 {item.serverScore}
              </Pill>
            ) : null}
          </div>

          <ReasonPills reasons={item?.reasons || popup?.reasons} />

          {(item?.oneLine || popup?.oneLine) ? (
            <p className="mt-3 text-[13px] text-gray-700 leading-relaxed line-clamp-2">
              {item?.oneLine || popup?.oneLine}
            </p>
          ) : null}

          <div className="mt-4 flex items-center justify-between">
            <span className="text-[12px] text-gray-600">클릭하면 상세로 이동해요</span>
            <span className="text-[12px] font-semibold text-primary-dark group-hover:text-primary transition-colors">
              자세히 보기 →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function RecommendationSection({ report }) {
  const unified = safeArray(report?.recommendations || report?.picks || report?.recommendedPopups);
  const list = useMemo(() => unified, [unified]);

  return (
    <Card className="p-6">
      <CardHeader eyebrow="추천" title="지금 가볼 만한 팝업" desc={null} right={null} />
      <Divider />
      {list.length === 0 ? (
        <div className="rounded-[18px] border border-secondary-light bg-white p-4 text-[13px] text-gray-700">
          아직 추천할 데이터가 부족해요.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((it, idx) => {
            const key = String(it?.popId ?? it?.popup?.popId ?? it?.id ?? idx);
            return <RecommendationCard key={key} item={it} />;
          })}
        </div>
      )}
    </Card>
  );
}

// ------------------------------------------------------
// page
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
      setError(e.response?.data?.message || "리포트를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) fetchReport();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.userId]);

  if (!authUser) {
    return (
      <main className="min-h-[calc(100vh-88px)] bg-white px-4 py-10 flex flex-col items-center">
        <div className="w-full max-w-[1040px]">
          <Card className="p-8 text-center">
            <h1 className="text-[22px] font-semibold text-gray-950">
              개인화 리포트는 로그인 후 확인할 수 있어요
            </h1>
            <p className="text-[14px] text-gray-700 mt-2">
              나의 팝업 성향과 추천을 보려면 먼저 로그인해주세요.
            </p>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-88px)] bg-white px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-[1040px] flex flex-col gap-5">
        <header className="flex flex-col gap-2 px-1">
          <h1 className="text-[22px] sm:text-[26px] font-semibold text-gray-950 tracking-tight">
            {authUser.nickname ? `${authUser.nickname}님의 리포트` : "내 리포트"}
          </h1>
          <p className="text-[13px] text-gray-700">
            {report?.periodLabel ? `${report.periodLabel} 기준` : null}
          </p>
        </header>

        {loading && (
          <div className="flex flex-col gap-4">
            <SkeletonBox />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <Card className="lg:col-span-7 p-6">
                <SkeletonLine w="w-40" />
                <div className="mt-4 space-y-2">
                  <SkeletonLine />
                  <SkeletonLine w="w-10/12" />
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="h-8 w-24 rounded-full bg-gray-200/80" />
                  <div className="h-8 w-28 rounded-full bg-gray-200/80" />
                </div>
              </Card>
              <Card className="lg:col-span-5 p-6">
                <SkeletonLine w="w-40" />
                <div className="mt-4 space-y-2">
                  <SkeletonLine />
                  <SkeletonLine w="w-9/12" />
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="h-8 w-24 rounded-full bg-gray-200/80" />
                  <div className="h-8 w-28 rounded-full bg-gray-200/80" />
                </div>
              </Card>
            </div>
            <Card className="p-6">
              <SkeletonLine w="w-40" />
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <div className="h-[320px] rounded-[22px] bg-gray-200/60" />
                <div className="h-[320px] rounded-[22px] bg-gray-200/60" />
                <div className="h-[320px] rounded-[22px] bg-gray-200/60" />
              </div>
            </Card>
          </div>
        )}

        {error && !loading && (
          <Card className="p-6 border-primary-soft">
            <p className="text-[14px] text-danger">{error}</p>
          </Card>
        )}

        {report && !loading && !error && (
          <>
            <PersonaHero report={report} nickname={authUser.nickname} />
            <TagRegionSection report={report} />
            <RecommendationSection report={report} />
          </>
        )}
      </div>
    </main>
  );
}

export default UserPersonaReportPage;
