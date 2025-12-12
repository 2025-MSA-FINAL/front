import React from "react";
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
  Label,
  LineChart,
  Line,
} from "recharts";
import { Info } from "lucide-react";
import { CustomTooltipStyle } from "../../../utils/managerReportUtils";

// 남성 도넛 컬러: 테마 토큰 기반
const MALE_COLOR = "var(--color-secondary-dark)";

const ReportAudienceSection = ({
  audience,
  theme,
  timeSlotTitle,
  audienceBasisLabel,
}) => {
  const data = audience || {};
  const hasAudienceData = data.hasEnoughData;

  // 성별 데이터
  const genderData = [
    {
      name: "남성",
      value: data.genderRatio?.MALE ?? 0,
      color: MALE_COLOR,
    },
    {
      name: "여성",
      value: data.genderRatio?.FEMALE ?? 0,
      color: theme.main,
    },
  ];
  const totalGenderCount = genderData.reduce((acc, cur) => acc + cur.value, 0);

  // 연령대 데이터
  const ageData = Object.keys(data.ageGroupDistribution || {}).map((key) => ({
    name: key,
    count: data.ageGroupDistribution[key],
  }));

  // 시간대 데이터 (0~23시)
  const rawTimeSlot = data.timeSlotDistribution || {};
  const timeSlotData = Array.from({ length: 24 }, (_, h) => {
    const key = String(h);
    return {
      name: `${h}시`,
      count: rawTimeSlot[key] ?? 0,
    };
  });
  const timeSlotTicks = timeSlotData
    .filter((_, index) => index % 2 === 0)
    .map((d) => d.name);

  return (
    <div className="bg-paper rounded-[24px] p-5 sm:p-6 lg:p-7 shadow-card border border-secondary-light flex flex-col">
      {/* 헤더 영역 */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg font-bold text-text-black">방문객 인구 통계</h3>
          <p className="text-xs text-text-sub mt-1">
            방문자들의 성별·연령·시간대 분포를 분석합니다.
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1">
          <span className="bg-paper-light text-text-sub text-[10px] px-2 py-1 rounded-md font-medium border border-secondary-light">
            {audienceBasisLabel}
          </span>

          {!hasAudienceData && (
            <span className="bg-secondary-light text-text-sub text-[10px] px-2 py-1 rounded-md font-medium">
              데이터 부족
            </span>
          )}
        </div>
      </div>

      {hasAudienceData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
          {/* 성별 도넛 */}
          <div className="flex flex-col items-center justify-center relative">
            <h4 className="absolute top-0 left-0 text-xs font-semibold text-text-sub">
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
                        fill: "var(--color-text-black)",
                        fontSize: 16,
                        fontWeight: 700,
                      }}
                    />
                    <Label
                      value="Total"
                      position="center"
                      dy={16}
                      style={{
                        fill: "var(--color-text-sub)",
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
                  className="flex items-center gap-1.5 text-xs font-medium text-text-sub"
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

          {/* 연령대 바 차트 */}
          <div className="flex flex-col justify-center relative">
            <h4 className="text-xs font-semibold text-text-sub mb-4">
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
                    stroke="var(--color-secondary-light)"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={48}
                    tick={{
                      fontSize: 12,
                      fill: "var(--color-text-sub)",
                    }}
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

          {/* 시간대 꺾은선 차트 */}
          <div className="md:col-span-2 border-t border-dashed border-secondary-light pt-6 mt-2">
            <div className="flex justify-between items-end mb-4">
              <h4 className="text-xs font-semibold text-text-sub">
                {timeSlotTitle} (주요 활동 시간대)
              </h4>
              <p className="text-[11px] text-text-sub">
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
                    stroke="var(--color-secondary-light)"
                  />
                  <XAxis
                    dataKey="name"
                    ticks={timeSlotTicks}
                    interval={0}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                      fill: "var(--color-text-sub)",
                    }}
                  />
                  <YAxis hide domain={[0, "dataMax + 1"]} />
                  <Tooltip
                    cursor={{
                      stroke: "var(--color-secondary-light)",
                      strokeWidth: 1,
                    }}
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
        // 데이터 부족 상태
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 opacity-70">
          <Info size={32} className="text-text-sub mb-3" />
          <p className="text-sm text-text-sub font-medium">
            데이터가 부족합니다
          </p>
          <p className="text-xs text-text-sub">
            방문자 수가 좀 더 쌓이면 통계가 활성화됩니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportAudienceSection;
