import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { AlertCircle } from "lucide-react";
import {
  CustomTooltipStyle,
  truncateText,
  mapGenderLabel,
} from "../../../utils/managerReportUtils";

// 디자인 토큰 기반 회색 사용
const MARKET_BAR_COLOR = "var(--color-secondary-dark)"; // 시장 데이터 충분
const MARKET_BAR_LIGHT = "var(--color-secondary)";      // 시장 데이터 부족

const ReportMarketSection = ({
  marketTrends,
  theme,
  isMobile,
  marketTitle,
  marketLegendMine,
  marketLegendMarket,
}) => {
  const trends = Array.isArray(marketTrends) ? marketTrends : [];

  const marketData = trends.map((trend) => ({
    tagName: trend.tagName,
    marketMetric: trend.marketReservationRate,
    myMetric: trend.myMetricRate,
    topAge: trend.topAgeGroup,
    topGender: trend.topGender,
    hasMarketData: trend.hasMarketData,
  }));

  const hasAnyMarketData = trends.some((t) => t.hasMarketData);
  const hasAnyInsufficient = trends.some((t) => !t.hasMarketData);

  const renderLegend = ({ payload = [] }) => {
    return (
      <div className="flex justify-center gap-4 mt-3 text-xs">
        {payload.map((item) => {
          const isMine = item.dataKey === "myMetric";
          const label = isMine ? marketLegendMine : marketLegendMarket;
          const textColor = isMine ? theme.main : "var(--color-text-sub)";

          return (
            <div key={item.dataKey} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span style={{ color: textColor }}>{label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-paper rounded-[24px] p-5 sm:p-6 lg:p-7 shadow-card border border-secondary-light flex flex-col">
      <div className="mb-6 flex flex-wrap justify-between items-start gap-3">
        <div>
          <h3 className="text-lg font-bold text-text-black">{marketTitle}</h3>
          <p className="text-xs text-text-sub mt-1">
            유사 태그 그룹의 평균 성과와 비교합니다.
          </p>
        </div>

        {!hasAnyMarketData && marketData.length > 0 && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-md font-medium border text-[10px] bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)] border-[var(--color-primary)]">
            <AlertCircle size={10} /> 시장 데이터 수집 중
          </span>
        )}
      </div>

      {marketData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 bg-[var(--color-paper-light)] rounded-2xl border border-dashed border-secondary-light m-2 min-h-[250px]">
          <p className="text-sm text-text-sub">
            등록된 해시태그가 없습니다.
          </p>
          <p className="text-xs text-text-sub mt-1">
            태그를 추가하면 시장 분석이 가능해져요.
          </p>
        </div>
      ) : (
        <>
          {/* 차트 */}
          <div className="h-[250px] w-full">
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
                  stroke="var(--color-secondary-light)"
                />

                <XAxis
                  dataKey="tagName"
                  axisLine={false}
                  tickLine={false}
                  interval={isMobile ? "preserveStartEnd" : 0}
                  minTickGap={isMobile ? 8 : 0}
                  tick={{
                    fontSize: isMobile ? 9 : 11,
                    fill: "var(--color-text-sub)",
                  }}
                  tickFormatter={(value) =>
                    truncateText(value, isMobile ? 4 : 6)
                  }
                />

                <YAxis hide />

                <Tooltip
                  cursor={{ fill: "var(--color-paper-light)" }}
                  contentStyle={CustomTooltipStyle}
                />

                <Legend content={renderLegend} />

                {/* 내 관심도 막대 */}
                <Bar
                  dataKey="myMetric"
                  name={marketLegendMine}
                  fill={theme.main}
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />

                {/* 시장 평균 막대 */}
                <Bar
                  dataKey="marketMetric"
                  name={marketLegendMarket}
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                  fill={MARKET_BAR_COLOR}
                >
                  {marketData.map((entry, index) => (
                    <Cell
                      key={`market-${index}`}
                      fill={
                        entry.hasMarketData ? MARKET_BAR_COLOR : MARKET_BAR_LIGHT
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 하단 태그별 카드 */}
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
                  className="flex items-start gap-3 p-3 rounded-xl bg-paper-light border border-secondary-light"
                >
                  <span
                    className="text-xs font-bold text-text-black bg-paper px-1.5 py-0.5 rounded border border-secondary-light max-w-[80px] sm:max-w-[120px] truncate"
                    title={`#${item.tagName}`}
                  >
                    #{truncateText(item.tagName, isMobile ? 6 : 10)}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-text-sub mb-1">
                      {item.hasMarketData ? (
                        <>
                          <span className="truncate">
                            내 타겟:{" "}
                            <b className="text-[var(--color-primary)]">
                              {item.topAge?.mine}{" "}
                              {mapGenderLabel(item.topGender?.mine)}
                            </b>
                          </span>
                          <span className="truncate">
                            시장 타겟:{" "}
                            <b className="text-text-black">
                              {item.topAge?.market}{" "}
                              {mapGenderLabel(item.topGender?.market)}
                            </b>
                          </span>
                        </>
                      ) : (
                        <span className="text-text-sub text-[11px]">
                          시장 데이터 수집 중...
                        </span>
                      )}
                    </div>

                    <div className="w-full h-1.5 bg-secondary-light rounded-full overflow-hidden flex">
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
              <p className="text-[11px] text-text-sub mt-1">
                * 연한 색 시장 평균 막대는 아직 데이터가 충분하지 않은 태그입니다.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReportMarketSection;
