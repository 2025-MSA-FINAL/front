import React, { useEffect, useState } from "react";
import { fetchManagerReportApi } from "../../../api/managerApi";
import useIsMobile from "../../../hooks/useIsMobile";
import { getThemeByBasis } from "../../../utils/managerReportUtils";

import ReportKpiSection from "./ReportKpiSection";
import ReportAudienceSection from "./ReportAudienceSection";
import ReportMarketSection from "./ReportMarketSection";
import ReportAiInsightCard from "./ReportAiInsightCard";

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

  const KPI = report.kpi || {};
  const audience = report.audience || {};
  const marketTrends = Array.isArray(report.marketTrends)
    ? report.marketTrends
    : [];
  const aiInsight = report.aiInsight;

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

  return (
    <section className="w-full max-w-[1200px] mx-auto animate-fade-up pb-20 px-4 sm:px-6 lg:px-0">
      {/* 헤더 */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h2 className="text-2xl font-extrabold text-text-black tracking-tight">
              AI 매니저 리포트
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-[12px] font-bold border ${theme.badgeStyle}`}
            >
              {theme.badgeLabel}
            </span>
          </div>
          <p className="text-sm text-text-sub">{theme.description}</p>
        </div>
      </header>

      {/* 1. KPI */}
      <ReportKpiSection
        kpi={KPI}
        theme={theme}
        isReservationMode={isReservationMode}
      />

      {/* 2. 차트 그리드 */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-6">
          <ReportAudienceSection
            audience={audience}
            theme={theme}
            timeSlotTitle={timeSlotTitle}
            audienceBasisLabel={audienceBasisLabel}
          />
        </div>
        <div className="xl:col-span-6">
          <ReportMarketSection
            marketTrends={marketTrends}
            theme={theme}
            isMobile={isMobile}
            marketTitle={marketTitle}
            marketLegendMine={marketLegendMine}
            marketLegendMarket={marketLegendMarket}
          />
        </div>
      </div>

      {/* 3. AI 인사이트 */}
      <ReportAiInsightCard data={aiInsight} />
    </section>
  );
}