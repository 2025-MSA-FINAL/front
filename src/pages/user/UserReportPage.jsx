// src/pages/user/UserPersonaReportPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../../api/authApi";
import { useAuthStore } from "../../store/authStore";

// ------------------------------------------------------
// utils (data access only)
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
    return "bg-accent-lime-soft text-text-black border-accent-lime-soft";
  if (s === "UPCOMING")
    return "bg-accent-aqua-soft text-text-black border-accent-aqua-soft";
  if (s === "ENDED")
    return "bg-secondary-light text-text-sub border-secondary";
  return "bg-secondary-light text-text-sub border-secondary";
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
function normalizeWeightedItems(list, keyCandidates) {
  return safeArray(list)
    .map((x) => {
      if (!x) return null;
      if (typeof x === "string") return { label: x, weight: null };
      let label = null;
      for (const k of keyCandidates) {
        if (x?.[k]) {
          label = x[k];
          break;
        }
      }
      const weight = x?.score ?? x?.value ?? x?.weight ?? null;
      const wNum =
        weight == null ? null : typeof weight === "number" ? weight : Number(weight);
      return label
        ? { label: String(label), weight: Number.isNaN(wNum) ? null : wNum }
        : null;
    })
    .filter(Boolean);
}

// ------------------------------------------------------
// UI atoms (theme-token-first)
// ------------------------------------------------------
function Shell({ children }) {
  return (
    <main className="min-h-[calc(100vh-88px)] px-4 py-8 flex justify-center bg-paper-light">
      <div className="w-full max-w-[1120px]">{children}</div>
    </main>
  );
}

function Card({ className, children }) {
  return (
    <section
      className={cn(
        "rounded-[20px] border border-secondary-light bg-paper shadow-card overflow-hidden",
        className
      )}
    >
      {children}
    </section>
  );
}

function Divider({ className }) {
  return <div className={cn("h-px bg-secondary-light", className)} />;
}

function Pill({ children, tone = "soft", className, title }) {
  const base =
    "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[12px] leading-none whitespace-nowrap min-w-0";
  const style =
    tone === "solid"
      ? "bg-primary text-text-white border-primary"
      : tone === "brand"
      ? "bg-primary-soft2 text-primary-dark border-primary-soft"
      : tone === "glass"
      ? "bg-paper/70 backdrop-blur border-secondary-light text-text-black"
      : "bg-paper border-secondary-light text-text-black";

  return (
    <span
      className={cn(base, style, "max-w-[180px] sm:max-w-[240px]", className)}
      title={title || (typeof children === "string" ? children : undefined)}
    >
      <span className="truncate min-w-0">{children}</span>
    </span>
  );
}

function IconBadge({ children, tone = "brand" }) {
  const bg =
    tone === "brand"
      ? "bg-primary-soft2 border-primary-soft"
      : "bg-paper border-secondary-light";

  return (
    <div
      className={cn(
        "h-11 w-11 rounded-2xl border flex items-center justify-center shadow-card",
        bg
      )}
    >
      <span className="text-[18px]" aria-hidden="true">
        {children}
      </span>
    </div>
  );
}

function SectionHeader({ kicker, title, right, desc }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="min-w-0">
        {kicker ? <p className="text-[12px] text-text-sub">{kicker}</p> : null}
        <h3 className="mt-1 text-[18px] font-semibold text-text-black tracking-tight">
          {title}
        </h3>
        {desc ? <p className="mt-1 text-[13px] text-text-sub">{desc}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

function SkeletonBlock() {
  return (
    <Card className="p-6">
      <div className="h-6 w-2/3 rounded-full bg-secondary-light animate-pulse" />
      <div className="mt-3 h-4 w-1/2 rounded-full bg-secondary-light animate-pulse" />
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 h-28 rounded-[18px] bg-secondary-light animate-pulse" />
        <div className="lg:col-span-4 h-28 rounded-[18px] bg-secondary-light animate-pulse" />
      </div>
    </Card>
  );
}

function GlowCard({ icon, title, value, hint, tone = "tag" }) {
  const glow =
    tone === "region"
      ? "bg-gradient-to-br from-accent-aqua-soft via-paper to-paper"
      : "bg-gradient-to-br from-primary-soft2 via-paper to-paper";

  return (
    <div className="relative overflow-hidden rounded-[18px] border border-secondary-light bg-paper p-4">
      <div className={cn("absolute inset-0", glow)} />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] text-text-sub flex items-center gap-1">
              <span aria-hidden="true">{icon}</span>
              {title}
            </p>
            <p className="mt-1 text-[15px] font-semibold text-text-black truncate" title={value}>
              {value}
            </p>
            {hint ? <p className="mt-2 text-[12px] text-text-sub">{hint}</p> : null}
          </div>
          <div className="shrink-0">
            <Pill tone="brand">TOP</Pill>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------
// hero (✅ "~~님의 리포트" 상단 섹션 자체 없음)
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

  return (
    <Card className="p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] text-text-sub">
            AI가 분석한 {nickname ? `${nickname}님의` : "나의"} 성향
          </p>
          <h2 className="mt-2 text-[22px] sm:text-[28px] font-semibold text-text-black break-keep tracking-tight">
            {headline || "아직은 취향을 모으는 중"}
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {ageGroup ? <Pill tone="glass">{ageGroup}</Pill> : null}
            {gender ? <Pill tone="glass">{gender}</Pill> : null}
            <Pill tone="glass">기록이 쌓일수록 더 선명해져요</Pill>
          </div>
        </div>

        <IconBadge tone="brand">🪄</IconBadge>
      </div>

      <div className="mt-5 rounded-[18px] bg-primary-soft2/60 border border-secondary-light p-5">
        {detail ? (
          <p className="text-[14px] text-text-black leading-relaxed whitespace-pre-line">
            {detail}
          </p>
        ) : (
          <p className="text-[14px] text-text-sub leading-relaxed">
            아직 충분한 활동 데이터가 없어 성향 분석이 간단하게 제공돼요. 🙂
          </p>
        )}
      </div>
    </Card>
  );
}

// ------------------------------------------------------
// insights (NO weights: rank list + chips)
// ------------------------------------------------------
function RankBadge({ n }) {
  const tone =
    n === 1
      ? "bg-primary-soft2 text-primary-dark border-primary-soft"
      : n === 2
      ? "bg-accent-aqua-soft text-text-black border-accent-aqua-soft"
      : n === 3
      ? "bg-accent-lemon-soft text-text-black border-accent-lemon-soft"
      : "bg-secondary-light text-text-sub border-secondary";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center h-7 min-w-[28px] px-2 rounded-full border text-[12px] font-semibold",
        tone
      )}
      aria-label={`${n}위`}
    >
      {n}
    </span>
  );
}

function RankRow({ n, label, prefix }) {
  const text = prefix ? `${prefix}${label}` : label;
  return (
    <div className="flex items-center gap-3">
      <RankBadge n={n} />
      <p className="text-[13px] font-semibold text-text-black truncate min-w-0" title={text}>
        {text}
      </p>
    </div>
  );
}

function InsightBoard({ title, subtitle, items, prefix }) {
  const top = items?.[0]?.label ?? null;

  return (
    <div className="rounded-[20px] border border-secondary-light bg-paper p-5">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] text-text-sub">{subtitle}</p>
          <h4 className="mt-1 text-[16px] font-semibold text-text-black">{title}</h4>
        </div>
        {items?.length ? <Pill tone="brand">TOP {Math.min(6, items.length)}</Pill> : null}
      </div>

      <Divider className="my-4" />

      {!items?.length ? (
        <div className="rounded-[18px] border border-secondary-light bg-paper-light p-4 text-[13px] text-text-sub">
          아직 데이터가 부족해요.
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.slice(0, 6).map((it, idx) => (
              <RankRow key={`${it.label}-${idx}`} n={idx + 1} label={it.label} prefix={prefix} />
            ))}
          </div>

          <div className="pt-4 flex flex-wrap gap-2">
            {items.slice(0, 14).map((it, idx) => (
              <Pill key={`${it.label}-${idx}`} tone={idx < 3 ? "brand" : "soft"}>
                {prefix}
                {it.label}
              </Pill>
            ))}
          </div>

          {top ? (
            <p className="mt-4 text-[12px] text-text-sub">
              가장 눈에 띄는 패턴은{" "}
              <span className="font-semibold text-text-black">
                {prefix}
                {top}
              </span>{" "}
              이에요.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

function InsightsSection({ report }) {
  const tagsRaw = useMemo(
    () =>
      normalizeWeightedItems(
        report?.topHashtags || report?.hashtags || report?.topTags,
        ["tag", "name", "label"]
      ).map((x) => ({ label: x.label })),
    [report]
  );

  const regionsRaw = useMemo(
    () =>
      normalizeWeightedItems(
        report?.topRegions || report?.regions || report?.topRegion,
        ["region", "name", "label"]
      ).map((x) => ({ label: x.label })),
    [report]
  );

  const topTag = tagsRaw[0]?.label ?? null;
  const topRegion = regionsRaw[0]?.label ?? null;

  return (
    <Card className="p-6">
      {/* ✅ 차트 위 영역을 "하나의 섹션"처럼: 헤더 + 요약카드 묶음 */}
      <div className="rounded-[20px] border border-secondary-light bg-paper overflow-hidden">
        <div className="relative p-5 sm:p-6">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-[360px] h-[360px] rounded-full bg-primary-soft2 blur-3xl opacity-60" />
            <div className="absolute -bottom-28 -left-28 w-[360px] h-[360px] rounded-full bg-accent-aqua-soft blur-3xl opacity-40" />
          </div>

          <div className="relative">
            <SectionHeader
              kicker="인사이트"
              title="관심 패턴 & 동선"
              desc="가중치/점수 대신, 자주 본 키워드와 지역을 순위로 보여줘요."
              right={<Pill tone="brand">INSIGHTS</Pill>}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
            <GlowCard
              icon="🏷️"
              title="가장 많이 본 키워드"
              value={topTag ? `#${topTag}` : "데이터 수집 중"}
              hint={topTag ? "이 키워드 기반 추천이 자주 보일 수 있어요" : "조금만 더 기록이 필요해요"}
              tone="tag"
            />
            <GlowCard
              icon="🗺️"
              title="가장 많이 본 지역"
              value={topRegion || "데이터 수집 중"}
              hint={topRegion ? "근처 팝업을 우선 추천할 수 있어요" : "조금만 더 기록이 필요해요"}
              tone="region"
            />
          </div>
        </div>

        <Divider />
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <InsightBoard title="자주 보는 해시태그" subtitle="관심 패턴" items={tagsRaw} prefix="#" />
        </div>
        <div className="lg:col-span-5">
          <InsightBoard title="자주 보는 지역" subtitle="동선" items={regionsRaw} prefix="" />
        </div>
      </div>
    </Card>
  );
}

// ------------------------------------------------------
// recommendations
// ------------------------------------------------------
function MatchBadge({ level }) {
  if (!level) return null;
  const lv = String(level).toUpperCase();
  const map = {
    HIGH: { text: "🔥 강추천", cls: "bg-accent-pink-soft text-text-black border-accent-pink-soft" },
    MID: { text: "👍 추천", cls: "bg-accent-lemon-soft text-text-black border-accent-lemon-soft" },
    LOW: { text: "🌱 탐색", cls: "bg-secondary-light text-text-sub border-secondary" },
  };
  const x = map[lv] || map.LOW;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold",
        x.cls
      )}
    >
      {x.text}
    </span>
  );
}

function pickReasonText({ item, popup, topTag, topRegion }) {
  const raw = safeArray(item?.reasons || popup?.reasons)
    .map((r) => {
      if (!r) return null;
      if (typeof r === "string") return r;
      return r?.text ?? r?.reason ?? r?.value ?? null;
    })
    .filter(Boolean);

  if (raw.length) return raw[0];

  const parts = [];
  const st = statusLabel(popup?.status);
  if (st && st !== "종료") parts.push(`${st} 팝업`);
  if (popup?.location) parts.push(`위치: ${popup.location}`);
  if (topRegion && popup?.location && String(popup.location).includes(topRegion))
    parts.push(`자주 가는 지역(${topRegion})과 연관`);
  if (topTag) parts.push(`관심 키워드(#${topTag}) 기반 추천`);

  const price = priceLabel(popup);
  if (price && price !== "가격 정보 없음") parts.push(`가격: ${price}`);

  if (parts.length >= 2) return parts.slice(0, 2).join(" · ");
  if (parts.length === 1) return `${parts[0]} · 한번 둘러볼 만해요`;
  return "최근 취향과 유사한 팝업이에요";
}

function RecommendationCard({ item, topTag, topRegion }) {
  const popup = item?.popup ?? item ?? {};
  const st = statusLabel(popup.status);
  const reasonText = pickReasonText({ item, popup, topTag, topRegion });

  return (
    <Link
      to={`/popup/${popup.popId}`}
      className="group relative overflow-hidden rounded-[20px] border border-secondary-light bg-paper shadow-card hover:shadow-hover hover:border-primary-soft transition-all"
    >
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute -top-24 -right-24 w-[260px] h-[260px] rounded-full bg-primary-soft2 blur-3xl opacity-70" />
      </div>

      <div className="relative">
        <div className="relative h-[170px] bg-secondary-light overflow-hidden">
          {popup.thumbnailUrl ? (
            <img
              src={popup.thumbnailUrl}
              alt={popup.title || "팝업 썸네일"}
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[12px] text-text-sub">
              이미지 없음
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/0" />

          <div className="absolute left-4 top-4 flex items-center gap-2">
            {st ? (
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold backdrop-blur",
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
            <h3 className="text-text-white text-[16px] font-semibold line-clamp-2 drop-shadow">
              {popup.title || "팝업 이름"}
            </h3>
            {popup.location ? (
              <p className="text-text-white/85 text-[12px] mt-1 truncate">📍 {popup.location}</p>
            ) : null}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[14px] font-semibold text-text-black">{priceLabel(popup)}</div>
          </div>

          <p className="mt-3 text-[13px] text-text-sub leading-relaxed line-clamp-2">
            {reasonText}
          </p>

          {(item?.oneLine || popup?.oneLine) ? (
            <p className="mt-2 text-[12px] text-text-sub leading-relaxed line-clamp-2">
              {item?.oneLine || popup?.oneLine}
            </p>
          ) : null}

          <div className="mt-4 flex items-center justify-between">
            <span className="text-[12px] text-text-sub">클릭하면 상세로 이동해요</span>
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

  const tags = normalizeWeightedItems(
    report?.topHashtags || report?.hashtags || report?.topTags,
    ["tag", "name", "label"]
  );
  const regions = normalizeWeightedItems(
    report?.topRegions || report?.regions || report?.topRegion,
    ["region", "name", "label"]
  );

  const topTag = tags[0]?.label ?? null;
  const topRegion = regions[0]?.label ?? null;

  return (
    <Card className="p-6">
      <SectionHeader
        kicker="추천"
        title="지금 가볼 만한 팝업"
        desc="관심 패턴과 동선을 기반으로 골랐어요."
        right={<Pill tone="brand">{unified.length ? `${unified.length}개` : "PICKS"}</Pill>}
      />

      <Divider className="my-4" />

      {unified.length === 0 ? (
        <div className="rounded-[18px] border border-secondary-light bg-paper-light p-4 text-[13px] text-text-sub">
          아직 추천할 데이터가 부족해요.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {unified.map((it, idx) => {
            const key = String(it?.popId ?? it?.popup?.popId ?? it?.id ?? idx);
            return (
              <RecommendationCard
                key={key}
                item={it}
                topTag={topTag}
                topRegion={topRegion}
              />
            );
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
      <Shell>
        <Card className="p-8 text-center">
          <h1 className="text-[22px] font-semibold text-text-black">
            개인화 리포트는 로그인 후 확인할 수 있어요
          </h1>
          <p className="text-[14px] text-text-sub mt-2">
            나의 팝업 성향과 추천을 보려면 먼저 로그인해주세요.
          </p>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      {loading ? (
        <div className="flex flex-col gap-4">
          <SkeletonBlock />
          <Card className="p-6">
            <div className="h-4 w-40 rounded-full bg-secondary-light animate-pulse" />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="h-24 rounded-[18px] bg-secondary-light animate-pulse" />
              <div className="h-24 rounded-[18px] bg-secondary-light animate-pulse" />
            </div>
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 h-48 rounded-[20px] bg-secondary-light animate-pulse" />
              <div className="lg:col-span-5 h-48 rounded-[20px] bg-secondary-light animate-pulse" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="h-4 w-40 rounded-full bg-secondary-light animate-pulse" />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="h-[340px] rounded-[20px] bg-secondary-light animate-pulse" />
              <div className="h-[340px] rounded-[20px] bg-secondary-light animate-pulse" />
              <div className="h-[340px] rounded-[20px] bg-secondary-light animate-pulse" />
            </div>
          </Card>
        </div>
      ) : null}

      {error && !loading ? (
        <Card className="p-6 border-primary-soft">
          <p className="text-[14px] text-accent-pink">{error}</p>
        </Card>
      ) : null}

      {report && !loading && !error ? (
        <div className="flex flex-col gap-4">
          <PersonaHero report={report} nickname={authUser.nickname} />
          <InsightsSection report={report} />
          <RecommendationSection report={report} />
        </div>
      ) : null}
    </Shell>
  );
}

export default UserPersonaReportPage;
