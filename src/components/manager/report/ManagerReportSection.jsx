import React, { useEffect, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Label,
    LineChart,
    Line,
} from "recharts";
import {
    TrendingUp,
    MousePointerClick,
    CalendarCheck,
    Sparkles,
    Heart,
    Info,
    AlertCircle,
} from "lucide-react";
import { fetchManagerReportApi } from "../../../api/managerApi";

// ================================
// 공통 유틸 & 스타일
// ================================
const stripTagPrefix = (text) => {
    if (!text) return "";
    return text.replace(/^\[[^\]]+\]\s*/, "").trim();
};

const mapGenderLabel = (code) => {
    if (code === "MALE") return "남성";
    if (code === "FEMALE") return "여성";
    return code || "-";
};

const truncateText = (text, maxLength = 8) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
};

const CustomTooltipStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    fontSize: "12px",
    padding: "8px 12px",
    color: "#374151",
};

// ================================
// 반응형 훅 (모바일 여부 판단)
// ================================
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(
        typeof window !== "undefined" ? window.innerWidth < 640 : false
    );

    useEffect(() => {
        const handleResize = () => {
            if (typeof window === "undefined") return;
            setIsMobile(window.innerWidth < 640);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return isMobile;
};

// ================================
// 테마 유틸
// ================================
const getThemeByBasis = (basis) => {
    if (basis === "RESERVATION") {
        return {
            id: "RESERVATION",
            badgeLabel: "예약자 기준",
            description: "실제 예약으로 이어진 고객들의 데이터를 분석했어요.",
            badgeStyle: "bg-purple-100 text-purple-700 border-purple-200",
            main: "#C33DFF",
            mainSoft: "#F3E5FF",
            accent: "#FFD93D",
            textMain: "text-purple-900",
        };
    }
    return {
        id: "WISHLIST",
        badgeLabel: "관심(찜) 유저 기준",
        description: "우리 팝업을 찜한 잠재 고객들의 데이터를 분석했어요.",
        badgeStyle: "bg-teal-50 text-teal-600 border-teal-200",
        main: "#45DFD3",
        mainSoft: "#E0F7FA",
        accent: "#FF2A7E",
        textMain: "text-teal-900",
    };
};

// ================================
// KPI 카드
// ================================
const KpiCard = ({
    title,
    value,
    subText,
    icon,
    themeColor,
    iconBgColor,
    highlight,
    disabled,
}) => {
    return (
        <div
            className={`
        relative rounded-[24px] h-full flex flex-col justify-between
        bg-white border border-gray-100 shadow-card
        transition-all duration-300 hover:shadow-[0_10px_35px_rgba(15,23,42,0.07)] hover:-translate-y-1
        ${highlight ? "overflow-hidden" : ""}
        ${disabled ? "opacity-70" : ""}
      `}
            style={
                highlight
                    ? {
                        background:
                            "radial-gradient(circle at top left, rgba(69,223,211,0.18), transparent 55%)",
                    }
                    : {}
            }
        >
            {highlight && (
                <div className="pointer-events-none absolute -top-10 -right-6 w-28 h-28 rounded-full bg-[var(--color-accent-aqua-soft)] opacity-60 blur-2" />
            )}

            <div className="relative z-10 px-5 pt-4 pb-3 flex items-start justify-between">
                <div
                    className="rounded-2xl p-2.5 flex items-center justify-center shadow-sm"
                    style={{
                        backgroundColor: iconBgColor || "rgba(249,250,251,0.9)",
                    }}
                >
                    {icon}
                </div>
                {highlight && (
                    <span
                        className="mt-1 flex h-2 w-2 rounded-full bg-red-500 animate-pulse"
                        title="최근 집계 기준"
                    />
                )}
            </div>

            <div className="relative z-10 px-5 pb-4">
                <p className="text-[13px] font-medium text-gray-500 mb-1">{title}</p>
                <p className="text-[24px] sm:text-[26px] lg:text-[28px] font-extrabold text-gray-900 leading-none mb-2">
                    {value}
                </p>
                {subText && (
                    <p
                        className="text-[12px] font-medium"
                        style={{
                            color: disabled ? "#9CA3AF" : themeColor,
                        }}
                    >
                        {subText}
                    </p>
                )}
            </div>
        </div>
    );
};

// ================================
// AI 인사이트 카드
// ================================
const AiInsightCard = ({ data }) => {
    if (!data) return null;

    const summary = stripTagPrefix(data.summary);
    const trend = stripTagPrefix(data.trendAnalysis);
    const action = stripTagPrefix(data.actionSuggestion);

    return (
        <div className="relative overflow-hidden rounded-[24px] p-5 sm:p-6 md:p-7 text-white shadow-card mt-8 bg-gradient-to-br from-[#020617] via-[#020617] to-[#111827]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)] opacity-25 blur-[90px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="absolute bottom-[-80px] left-[-40px] w-56 h-56 bg-[var(--color-accent-aqua)] opacity-20 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="p-2 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/30">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-[18px] md:text-[20px] font-bold">
                            AI 매니저 인사이트
                        </h3>
                        <p className="text-[12px] text-gray-400 mt-0.5">
                            데이터 기반으로 요약·분석·액션까지 정리해 드렸어요.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 lg:gap-6">
                    <div className="bg-white/10 backdrop-blur-md rounded-[18px] p-4 sm:p-5 border border-white/10 min-w-0">
                        <p className="text-[12px] text-indigo-200 mb-2 font-semibold flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-pulse" />
                            요약
                        </p>
                        <p className="text-[14px] sm:text-[15px] font-medium leading-relaxed whitespace-pre-line">
                            {summary}
                        </p>
                    </div>

                    <div className="space-y-3 min-w-0">
                        {/* 시장 분석 카드 */}
                        <div className="bg-white/5 rounded-[16px] p-4 border border-white/5">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <p className="text-[12px] text-emerald-200 font-semibold flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                                    시장 분석
                                </p>
                                <span className="text-[11px] text-gray-500">
                                    시장 트렌드와 타겟 고객을 정리했어요.
                                </span>
                            </div>

                            <p className="text-[13px] text-gray-200 leading-relaxed whitespace-pre-line">
                                {trend}
                            </p>
                        </div>

                        {/* 추천 액션 플랜 카드 */}
                        <div className="rounded-[16px] p-[1px] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-pink)] shadow-card">
                            <div className="bg-[#020617] rounded-[15px] p-4 h-full relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-pink)] opacity-10" />
                                <div className="relative">
                                    <p className="text-[12px] text-[var(--color-primary-light)] mb-1 flex items-center gap-1.5">
                                        <TrendingUp size={14} /> 추천 액션 플랜
                                    </p>
                                    <p className="text-[13px] font-semibold text-white leading-relaxed whitespace-pre-line">
                                        {action}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ================================
// 메인 섹션
// ================================
export default function ManagerReportSection({ popupId }) {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const isMobile = useIsMobile();

    useEffect(() => {
        if (!popupId) return;
        fetchManagerReportApi(popupId)
            .then((data) => setReport(data))
            .catch((err) => {
                console.error(err);
                setReport(null);
            })
            .finally(() => setLoading(false));
    }, [popupId]);

    if (loading)
        return (
            <div className="py-32 text-center text-gray-400 animate-pulse">
                데이터를 분석하고 있습니다...
            </div>
        );
    if (!report)
        return (
            <div className="py-32 text-center text-gray-400">
                리포트를 불러올 수 없습니다.
            </div>
        );

    const theme = getThemeByBasis(report.basis);
    const isReservationMode = theme.id === "RESERVATION";

    const audienceBasisLabel = isReservationMode
        ? "예약자 기준 인구 통계"
        : "찜(관심) 유저 기준 인구 통계";

    const marketTitle = isReservationMode
        ? "예약 전환율 비교 (태그별)"
        : "관심도(찜/조회) 비교 (태그별)";

    const marketLegendMarket = isReservationMode
        ? "시장 평균 예약률"
        : "시장 평균 관심도";
    const marketLegendMine = isReservationMode ? "내 예약률" : "내 관심도";

    const timeSlotTitle = isReservationMode ? "예약 시간대" : "관심 시간대";

    const KPI = report.kpi || {};
    const audience = report.audience || {};
    const hasAudienceData = audience.hasEnoughData;
    const marketTrends = Array.isArray(report.marketTrends)
        ? report.marketTrends
        : [];

    const genderData = [
        {
            name: "남성",
            value: audience.genderRatio?.MALE ?? 0,
            color: "#94A3B8",
        },
        {
            name: "여성",
            value: audience.genderRatio?.FEMALE ?? 0,
            color: theme.main,
        },
    ];
    const totalGenderCount = genderData.reduce((acc, cur) => acc + cur.value, 0);

    const ageData = Object.keys(audience.ageGroupDistribution || {}).map(
        (key) => ({
            name: key,
            count: audience.ageGroupDistribution[key],
        })
    );

    //시간대: 0~23시 전체 + 없는 구간은 0
    const rawTimeSlot = audience.timeSlotDistribution || {};
    const timeSlotData = Array.from({ length: 24 }, (_, h) => {
        const key = String(h);
        return {
            name: `${h}시`,
            count: rawTimeSlot[key] ?? 0,
        };
    });
    //X축 라벨: 2시간 간격만 노출
    const timeSlotTicks = timeSlotData
        .filter((_, index) => index % 2 === 0)
        .map((d) => d.name);

    const marketData = marketTrends.map((trend) => ({
        tagName: trend.tagName,
        marketMetric: trend.marketReservationRate,
        myMetric: trend.myMetricRate,
        topAge: trend.topAgeGroup,
        topGender: trend.topGender,
        hasMarketData: trend.hasMarketData,
    }));

    const hasAnyMarketData = marketTrends.some((t) => t.hasMarketData);
    const hasAnyInsufficient = marketTrends.some((t) => !t.hasMarketData);

    return (
        <section className="w-full max-w-[1200px] mx-auto animate-fade-up pb-20 px-4 sm:px-6 lg:px-0">
            {/* 헤더 */}
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            AI 매니저 리포트
                        </h2>
                        <span
                            className={`px-3 py-1 rounded-full text-[12px] font-bold border ${theme.badgeStyle}`}
                        >
                            {theme.badgeLabel}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">{theme.description}</p>
                </div>
            </header>

            {/* 1. KPI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <KpiCard
                    title="총 조회수"
                    value={(KPI.totalViews ?? 0).toLocaleString()}
                    icon={<MousePointerClick size={22} className={theme.textMain} />}
                    themeColor={theme.main}
                    iconBgColor={theme.mainSoft}
                    highlight
                />
                <KpiCard
                    title="찜 수"
                    value={(KPI.totalWishlists ?? 0).toLocaleString()}
                    icon={<Heart size={22} className="text-pink-500" />}
                    themeColor="#FF2A7E"
                    iconBgColor="#FDF2F8"
                />
                <KpiCard
                    title="관심도 (Interest)"
                    value={`${KPI.interestRate ?? 0}%`}
                    subText="조회 대비 찜 비율"
                    icon={<TrendingUp size={22} className="text-yellow-500" />}
                    themeColor="#FFD93D"
                    iconBgColor="#FEF9C3"
                />
                <KpiCard
                    title={isReservationMode ? "총 예약 확정" : "예약 미사용"}
                    value={
                        isReservationMode
                            ? (KPI.totalReservations ?? 0).toLocaleString()
                            : "-"
                    }
                    subText={
                        isReservationMode
                            ? `전환율 ${KPI.reservationRate ?? 0}%`
                            : "현장 전용 팝업"
                    }
                    icon={
                        <CalendarCheck
                            size={22}
                            className={isReservationMode ? "text-blue-500" : "text-gray-400"}
                        />
                    }
                    themeColor="#3B82F6"
                    iconBgColor="#EFF6FF"
                    disabled={!isReservationMode}
                />
            </div>

            {/* 2. 차트 그리드 */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* 인구 통계 */}
                <div className="xl:col-span-6 bg-white rounded-[24px] p-5 sm:p-6 lg:p-7 shadow-card border border-gray-100 flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                방문객 인구 통계
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                방문자들의 성별·연령·시간대 분포를 분석합니다.
                            </p>
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-1">
                            <span className="bg-gray-50 text-gray-500 text-[10px] px-2 py-1 rounded-md font-medium border border-gray-100">
                                {audienceBasisLabel}
                            </span>
                            {!hasAudienceData && (
                                <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-1 rounded-md font-medium">
                                    데이터 부족
                                </span>
                            )}
                        </div>
                    </div>

                    {hasAudienceData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                            {/* 성별 도넛 */}
                            <div className="flex flex-col items-center justify-center relative">
                                <h4 className="absolute top-0 left-0 text-xs font-semibold text-gray-400">
                                    성별 비율
                                </h4>
                                <div className="w-full h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={genderData}
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                cornerRadius={6}
                                            >
                                                {genderData.map((entry, index) => (
                                                    <Cell
                                                        key={`gender-${index}`}
                                                        fill={entry.color}
                                                        stroke="none"
                                                    />
                                                ))}
                                                <Label
                                                    value={`${totalGenderCount}명`}
                                                    position="center"
                                                    dy={-2}
                                                    style={{
                                                        fill: "#111827",
                                                        fontSize: 16,
                                                        fontWeight: 700,
                                                    }}
                                                />
                                                <Label
                                                    value="Total"
                                                    position="center"
                                                    dy={16}
                                                    style={{
                                                        fill: "#9CA3AF",
                                                        fontSize: 11,
                                                        fontWeight: 500,
                                                    }}
                                                />
                                            </Pie>
                                            <Tooltip contentStyle={CustomTooltipStyle} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-wrap justify-center gap-4 mt-[-10px]">
                                    {genderData.map((d) => (
                                        <div
                                            key={d.name}
                                            className="flex items-center gap-1.5 text-xs font-medium text-gray-600"
                                        >
                                            <span
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{ backgroundColor: d.color }}
                                            />
                                            {d.name}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 연령대 */}
                            <div className="flex flex-col justify-center relative">
                                <h4 className="text-xs font-semibold text-gray-400 mb-4">
                                    연령대 분포
                                </h4>
                                <div className="w-full h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={ageData}
                                            layout="vertical"
                                            margin={{ left: 0, right: 16 }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                horizontal={false}
                                                stroke="#f0f0f0"
                                            />
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                axisLine={false}
                                                tickLine={false}
                                                width={48}
                                                tick={{ fontSize: 12, fill: "#6B7280" }}
                                            />
                                            <Tooltip
                                                cursor={{ fill: "transparent" }}
                                                contentStyle={CustomTooltipStyle}
                                            />
                                            <Bar
                                                dataKey="count"
                                                fill={theme.main}
                                                radius={[0, 4, 4, 0]}
                                                barSize={16}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* 시간대 (꺾은선 차트) */}
                            <div className="md:col-span-2 border-t border-dashed border-gray-100 pt-6 mt-2">
                                <div className="flex justify-between items-end mb-4">
                                    <h4 className="text-xs font-semibold text-gray-400">
                                        {timeSlotTitle} (주요 활동 시간대)
                                    </h4>
                                    <p className="text-[11px] text-gray-400">
                                        트래픽이 가장 몰리는 시간입니다.
                                    </p>
                                </div>
                                <div className="w-full h-[140px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={timeSlotData}
                                            margin={{ top: 10, left: 12, right: 12 }}
                                        >
                                            <CartesianGrid
                                                vertical={false}
                                                strokeDasharray="3 3"
                                                stroke="#f0f0f0"
                                            />
                                            <XAxis
                                                dataKey="name"
                                                ticks={timeSlotTicks}
                                                interval={0}
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                                            />
                                            <YAxis hide domain={[0, "dataMax + 1"]} />
                                            <Tooltip
                                                cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
                                                contentStyle={CustomTooltipStyle}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="count"
                                                stroke={theme.main}
                                                strokeWidth={2.2}
                                                dot={{ r: 3 }}
                                                activeDot={{ r: 5 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 opacity-60">
                            <Info size={32} className="text-gray-300 mb-3" />
                            <p className="text-sm text-gray-500 font-medium">
                                데이터가 부족합니다
                            </p>
                            <p className="text-xs text-gray-400">
                                방문자 수가 좀 더 쌓이면 통계가 활성화됩니다.
                            </p>
                        </div>
                    )}
                </div>

                {/* 시장 비교 */}
                <div className="xl:col-span-6 bg-white rounded-[24px] p-5 sm:p-6 lg:p-7 shadow-card border border-gray-100 flex flex-col">
                    <div className="mb-6 flex flex-wrap justify-between items-start gap-3">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{marketTitle}</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                유사 태그 그룹의 평균 성과와 비교합니다.
                            </p>
                        </div>
                        {!hasAnyMarketData && marketData.length > 0 && (
                            <span className="flex items-center gap-1 bg-yellow-50 text-yellow-600 text-[10px] px-2 py-1 rounded-md font-medium border border-yellow-100">
                                <AlertCircle size={10} /> 시장 데이터 수집 중
                            </span>
                        )}
                    </div>

                    {marketData.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 m-2 min-h-[250px]">
                            <p className="text-sm text-gray-500">
                                등록된 해시태그가 없습니다.
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                태그를 추가하면 시장 분석이 가능해져요.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 min-h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={marketData}
                                        margin={{
                                            top: 20,
                                            bottom: 16,
                                            left: isMobile ? 0 : 8,
                                            right: isMobile ? 0 : 8,
                                        }}
                                    >
                                        <CartesianGrid
                                            vertical={false}
                                            strokeDasharray="3 3"
                                            stroke="#f0f0f0"
                                        />
                                        <XAxis
                                            dataKey="tagName"
                                            axisLine={false}
                                            tickLine={false}
                                            interval={isMobile ? "preserveStartEnd" : 0}
                                            minTickGap={isMobile ? 8 : 0}
                                            tick={{
                                                fontSize: isMobile ? 9 : 11,
                                                fill: "#6B7280",
                                            }}
                                            tickFormatter={(value) =>
                                                truncateText(value, isMobile ? 4 : 6)  
                                            }
                                        />

                                        <Tooltip
                                            cursor={{ fill: "#F3F4F6" }}
                                            contentStyle={CustomTooltipStyle}
                                        />
                                        <Legend
                                            iconType="circle"
                                            wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                                        />
                                        <Bar
                                            dataKey="myMetric"
                                            name={marketLegendMine}
                                            fill={theme.main}
                                            radius={[4, 4, 0, 0]}
                                            barSize={18}
                                        />
                                        <Bar
                                            dataKey="marketMetric"
                                            name={marketLegendMarket}
                                            radius={[4, 4, 0, 0]}
                                            barSize={18}
                                        >
                                            {marketData.map((entry, index) => (
                                                <Cell
                                                    key={`market-${index}`}
                                                    fill={entry.hasMarketData ? "#E5E7EB" : "#F3F4F6"}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-6 space-y-3">
                                {marketData.slice(0, 3).map((item, idx) => {
                                    const denom =
                                        (item.myMetric || 0) + (item.marketMetric || 0) || 1;
                                    const ratio = Math.min(
                                        ((item.myMetric || 0) / denom) * 100,
                                        100
                                    );

                                    return (
                                        <div
                                            key={`${item.tagName}-${idx}`}
                                            className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                                        >
                                            <span
                                                className="text-xs font-bold text-gray-700 bg-white px-1.5 py-0.5 rounded border border-gray-200 max-w-[80px] sm:max-w-[120px] truncate"
                                                title={`#${item.tagName}`}
                                            >
                                                #{truncateText(item.tagName, isMobile ? 6 : 10)}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-gray-500 mb-1">
                                                    {item.hasMarketData ? (
                                                        <>
                                                            <span className="truncate">
                                                                시장 타겟:{" "}
                                                                <b className="text-gray-700">
                                                                    {item.topAge?.market}{" "}
                                                                    {mapGenderLabel(item.topGender?.market)}
                                                                </b>
                                                            </span>
                                                            <span className="truncate">
                                                                내 타겟:{" "}
                                                                <b className="text-[var(--color-primary)]">
                                                                    {item.topAge?.mine}{" "}
                                                                    {mapGenderLabel(item.topGender?.mine)}
                                                                </b>
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400 text-[11px]">
                                                            시장 데이터 수집 중...
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden flex">
                                                    <div
                                                        className="h-full bg-[var(--color-primary)] transition-all duration-500"
                                                        style={{ width: `${ratio}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {hasAnyInsufficient && (
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        * 연한 색 시장 평균 막대는 아직 데이터가 충분하지 않은 태그입니다.
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* 3. AI 인사이트 */}
            <AiInsightCard data={report.aiInsight} />
        </section>
    );
}
