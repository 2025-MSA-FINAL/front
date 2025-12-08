import React from "react";
import {
  MousePointerClick,
  CalendarCheck,
  Heart,
  TrendingUp,
} from "lucide-react";
import ReportKpiCard from "./ReportKpiCard";

const ReportKpiSection = ({ kpi, theme, isReservationMode }) => {
  const KPI = kpi || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <ReportKpiCard
        title="총 조회수"
        value={(KPI.totalViews ?? 0).toLocaleString()}
        icon={<MousePointerClick size={22} className={theme.textMain} />}
        themeColor={theme.main}
        iconBgColor={theme.mainSoft}
        highlight
      />
      <ReportKpiCard
        title="찜 수"
        value={(KPI.totalWishlists ?? 0).toLocaleString()}
        icon={<Heart size={22} className="text-pink-500" />}
        themeColor="#FF2A7E"
        iconBgColor="#FDF2F8"
      />
      <ReportKpiCard
        title="관심도 (Interest)"
        value={`${KPI.interestRate ?? 0}%`}
        subText="조회 대비 찜 비율"
        icon={<TrendingUp size={22} className="text-yellow-500" />}
        themeColor="#FFD93D"
        iconBgColor="#FEF9C3"
      />
      <ReportKpiCard
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
  );
};

export default ReportKpiSection;