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

const ReportAudienceSection = ({
  audience,
  theme,
  timeSlotTitle,
  audienceBasisLabel,
}) => {
  const data = audience || {};
  const hasAudienceData = data.hasEnoughData;

  const genderData = [
    {
      name: "남성",
      value: data.genderRatio?.MALE ?? 0,
      color: "#94A3B8",
    },
    {
      name: "여성",
      value: data.genderRatio?.FEMALE ?? 0,
      color: theme.main,
    },
  ];
  const totalGenderCount = genderData.reduce((acc, cur) => acc + cur.value, 0);

  const ageData = Object.keys(data.ageGroupDistribution || {}).map((key) => ({
    name: key,
    count: data.ageGroupDistribution[key],
  }));

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
    <div className="bg-white rounded-[24px] p-5 sm:p-6 lg:p-7 shadow-card border border-gray-100 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">방문객 인구 통계</h3>
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
  );
};

export default ReportAudienceSection;