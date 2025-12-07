import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  // [수정 1] YAxis 추가
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

  return (
    <div className="bg-white rounded-[24px] p-5 sm:p-6 lg:p-7 shadow-card border border-gray-100 flex flex-col">
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
          <p className="text-sm text-gray-500">등록된 해시태그가 없습니다.</p>
          <p className="text-xs text-gray-400 mt-1">
            태그를 추가하면 시장 분석이 가능해져요.
          </p>
        </div>
      ) : (
        <>
          {/* [수정 2] flex-1 min-h-[250px] 대신 h-[250px] 고정 높이 사용 */}
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
                {/* [수정 3] 누락되었던 YAxis 추가 (숨김 처리) */}
                <YAxis hide />

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
  );
};

export default ReportMarketSection;