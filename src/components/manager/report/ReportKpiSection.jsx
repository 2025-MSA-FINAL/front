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

  const totalViews = (KPI.totalViews ?? 0).toLocaleString();
  const totalWishlists = (KPI.totalWishlists ?? 0).toLocaleString();
  const interestRate = `${KPI.interestRate ?? 0}%`;
  const totalReservations = (KPI.totalReservations ?? 0).toLocaleString();
  const reservationRate = KPI.reservationRate ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* 총 조회수 */}
      <ReportKpiCard
        title="총 조회수"
        value={totalViews}
        icon={
          <MousePointerClick
            size={22}
            className={theme?.textMain || "text-[var(--color-primary)]"}
          />
        }
        themeColor={theme?.main || "var(--color-primary)"}
        iconBgColor={theme?.mainSoft || "var(--color-primary-soft)"}
        highlight
      />

      {/* 찜 수 */}
      <ReportKpiCard
        title="찜 수"
        value={totalWishlists}
        icon={
          <Heart
            size={22}
            className="text-[var(--color-accent-pink)]"
          />
        }
        themeColor="var(--color-accent-pink)"
        iconBgColor="var(--color-accent-pink-soft)"
      />

      {/* 관심도 */}
      <ReportKpiCard
        title="관심도 (Interest)"
        value={interestRate}
        subText="조회 대비 찜 비율"
        icon={
          <TrendingUp
            size={22}
            className="text-[var(--color-accent-lemon)]"
          />
        }
        themeColor="var(--color-accent-lemon)"
        iconBgColor="var(--color-accent-lemon-soft)"
      />

      {/* 예약 관련 */}
      <ReportKpiCard
        title={isReservationMode ? "총 예약 확정" : "예약 미사용"}
        value={isReservationMode ? totalReservations : "-"}
        subText={
          isReservationMode
            ? `전환율 ${reservationRate}%`
            : "현장 전용 팝업"
        }
        icon={
          <CalendarCheck
            size={22}
            className={
              isReservationMode
                ? "text-[var(--color-accent-aqua)]"
                : "text-[var(--color-text-sub)]"
            }
          />
        }
        themeColor={
          isReservationMode
            ? "var(--color-accent-aqua)"
            : "var(--color-secondary)"
        }
        iconBgColor={
          isReservationMode
            ? "var(--color-accent-aqua-soft)"
            : "var(--color-paper-light)"
        }
        disabled={!isReservationMode}
      />
    </div>
  );
};

export default ReportKpiSection;
