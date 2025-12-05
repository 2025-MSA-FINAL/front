import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

//import { useState } from "react";

import useDashboardStats from "@/hooks/admin/useDashboardStats";
import usePopularHashtags from "@/hooks/admin/usePopularHashtags";

import KpiCard from "@/components/admin/dashboard/KpiCard";
import ChartCard from "@/components/admin/dashboard/ChartCard";
import HeatmapChart from "@/components/admin/dashboard/HeatmapChart";

import GenderTooltip from "@/components/admin/tooltip/GenderTooltip";
import AgeTooltip from "@/components/admin/tooltip/AgeTooltip";

import WordCloud from "@/components/admin/wordcloud/WordCloud";
import { Users, Store, MessageSquare, AlertCircle, Home } from "lucide-react";

export default function Dashboard() {
  const {
    stats,
    loading,
    genderData,
    ageData,
    currentDate,
    monthlyUserGrowth,
  } = useDashboardStats();

  const {
    hashtags,
    gender,
    age,
    setGender,
    setAge,
    loading: hashtagLoading,
  } = usePopularHashtags();

  //const [selectedCell, setSelectedCell] = useState(null);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-gray-500">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            대시보드
          </h1>
          <p className="text-sm text-gray-600">
            PopSpot 서비스의 전체 현황을 한 눈에 확인하세요.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <KpiCard
          title="총 유저 수"
          value={stats.totalUsers || 0}
          sub={`오늘 +${stats.newUsersToday || 0}, 이번주 +${stats.newUsersThisWeek || 0}`}
          icon={<Users className="w-6 h-6 text-white" />}
          gradient="from-[#C33DFF] to-[#7E00CC]"
        />

        <KpiCard
          title="팝업스토어"
          value={stats.totalPopupStores || 0}
          sub={`진행 ${stats.activePopupStores || 0}, 대기 ${stats.pendingApproval || 0}`}
          icon={<Store className="w-6 h-6 text-white" />}
          gradient="from-[#45CFD3] to-[#C33DFF]"
        />

        <KpiCard
          title="채팅방"
          value={stats.totalChatRooms || 0}
          sub="전체 채팅방 수"
          icon={<MessageSquare className="w-6 h-6 text-white" />}
          gradient="from-[#7E00CC] to-[#C33DFF]"
        />

        <KpiCard
          title="전체 신고"
          value={stats.totalReports || 0}
          sub={`대기 ${stats.pendingReports || 0}`}
          icon={<AlertCircle className="w-6 h-6 text-white" />}
          gradient="from-[#FF2A7E] to-[#FFC92D]"
        />

        <KpiCard
          title="종료 임박 팝업"
          value={stats.endingSoon || 0}
          sub="7일 이내 종료"
          icon={<Home className="w-6 h-6 text-white" />}
          gradient="from-[#FFC92D] to-[#FF2A7E]"
        />
      </div>

      {/* 월별 유저 그래프 */}
      <ChartCard title="월별 신규 유저 추이" metadata="최근 4개월 데이터">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={monthlyUserGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DDDFE2" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<AgeTooltip />} />
            <Line
              type="monotone"
              dataKey="newUsers"
              stroke="#C33DFF"
              strokeWidth={3}
              dot={{ fill: "#C33DFF", r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 연령별 */}
      <ChartCard
        title="연령대별 유저 분포"
        metadata={`전체 유저 ${stats.totalUsers}명 기준 (${currentDate})`}
      >
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={ageData}>
            <defs>
              <linearGradient id="ageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7E00CC" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#7E00CC" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis dataKey="ageGroup" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" stroke="#DDDFE2" />
            <Tooltip content={<AgeTooltip />} />
            <Area
              type="monotone"
              dataKey="userCount"
              stroke="#7E00CC"
              fill="url(#ageGradient)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 성별 */}
      <ChartCard
        title="성별 유저 비율"
        metadata={`전체 ${stats.totalUsers}명 기준 (${currentDate})`}
      >
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={genderData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ name, value }) => `${name} ${value}명`}
            >
              {genderData.map((item, i) => (
                <Cell key={i} fill={item.color} />
              ))}
            </Pie>
            <Tooltip content={<GenderTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 이번 주 인기 팝업 TOP 5 */}
      <ChartCard title="이번 주 인기 팝업 TOP 5" height="320px">
        {stats.weeklyTopPopups && stats.weeklyTopPopups.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.weeklyTopPopups}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="popName"
                type="category"
                width={150}
                tick={(props) => {
                  const { x, y, payload } = props;
                  const maxLength = 15;
                  const text = payload.value;
                  const truncated =
                    text.length > maxLength
                      ? text.substring(0, maxLength) + "..."
                      : text;

                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={4}
                        textAnchor="end"
                        fill="#667"
                        fontSize={12}
                        title={text}
                      >
                        {truncated}
                      </text>
                    </g>
                  );
                }}
              />
              <Tooltip
                formatter={(value, name, props) => [
                  `${value}회`,
                  props.payload.popName,
                ]}
              />
              <Bar dataKey="viewCount" fill="#7E00CC" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[260px] text-gray-500">
            <Store className="w-12 h-12 mb-3 opacity-40" />
            <p>이번 주 조회 데이터가 없습니다</p>
          </div>
        )}

        <div className="-mt-2">
          <p className="text-xs text-gray-400 text-center">
          조회수 기준 (2025년 12월 4일 오후 {new Date().getHours()}:
          {String(new Date().getMinutes()).padStart(2, "0")})
        </p>
      </div>
      </ChartCard>

      {/* 카테고리별 신고 건수 */}
     <ChartCard title="카테고리별 신고 건수" height="450px">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={stats.reportCategoryStats || []}
            margin={{ top: 5, right: 30, left: 10, bottom: 90 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="categoryName"
              angle={0}
              textAnchor="middle"
              height={100}
              interval={0}
              tick={(props) => {
                const { x, y, payload } = props;
                const isMobile = window.innerWidth < 640;
                const fontSize = isMobile ? 8 : 9;
                const text = payload.value;
                
                // 반응형 텍스트 길이
                const maxCharsPerLine = 6;
                const parts = [];
                
                if (text.length <= maxCharsPerLine) {
                  parts.push(text);
                } else {
                  // "/" 위치 찾아서 적절히 나누기
                  const slashIndex = text.indexOf('/');
                  if (slashIndex > 0 && slashIndex < maxCharsPerLine * 2) {
                    const firstSlash = text.indexOf('/', slashIndex + 1);
                    if (firstSlash > 0) {
                      parts.push(text.substring(0, firstSlash));
                      parts.push(text.substring(firstSlash + 1));
                    } else {
                      parts.push(text.substring(0, slashIndex + 1));
                      parts.push(text.substring(slashIndex + 1));
                    }
                  } else {
                    // "/" 없으면 중간에서 자르기
                    parts.push(text.substring(0, maxCharsPerLine));
                    parts.push(text.substring(maxCharsPerLine));
                  }
                }
                
                return (
                  <g transform={`translate(${x},${y})`}>
                    {parts.map((part, index) => (
                      <text
                        key={index}
                        x={0}
                        y={0}
                        dy={10 + (index * 13)}
                        textAnchor="middle"
                        fill="#667"
                        fontSize={fontSize}
                        title={text}
                      >
                        {part}
                      </text>
                    ))}
                  </g>
                );
              }}
            />
            <YAxis />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white px-3 py-2 border border-gray-200 rounded-lg shadow-lg">
                      <p className="text-sm font-semibold text-gray-900">
                        {payload[0].payload.categoryName}
                      </p>
                      <p className="text-sm text-gray-600">
                        신고 건수: <span className="font-bold text-[#E02B6C]">{payload[0].value}건</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="reportCount" fill="#E02B6C" />
          </BarChart>
        </ResponsiveContainer>
         <div className="-mt-8">
          <p className="text-xs text-gray-400 text-center">
          전체 신고 {stats.totalReports || 0}건 기준
          </p>
      </div>
    </ChartCard>

      {/* 조회수 히트맵 */}
      <ChartCard title="최근 7일 조회수 히트맵"
        height="520px">
        <div className="w-full overflow-auto">
         
          <HeatmapChart
            data={stats.viewHeatmap}
            //onCellClick={(cell) => setSelectedCell(cell)}
          />
        </div>
      </ChartCard>

      {/* 드릴다운 상세 추후 예정 - 숨김 처리 */}
      {/* {selectedCell && (
        <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {selectedCell.fullDate} {selectedCell.hour}시 조회 상세
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            조회수: <strong className="text-purple-600">{selectedCell.views}</strong>
          </p>
          <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            ※ API 확장 시 이 자리에서 "해당 시간대 인기 팝업 TOP5, 시간대별 상세 그래프" 등이 표시될 수 있습니다.
          </p>
        </div>
      )} */}

      {/* 인기 해시태그 */}
      <ChartCard
        title="인기 해시태그"
        metadata={`성별/연령대 기준 인기 해시태그 (${currentDate})`}
      >
        {/* 필터 UI */}
        <div className="flex flex-col md:flex-row justify-between mb-4 gap-3">
          {/* 성별 필터 */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-gray-600 whitespace-nowrap">
              성별
            </span>
            {[
              { key: "all", label: "전체" },
              { key: "male", label: "남성" },
              { key: "female", label: "여성" },
            ].map((g) => (
              <button
                key={g.key}
                onClick={() => setGender(g.key)}
                className={`
                  px-3 py-1 text-xs md:text-sm rounded-full border transition-all
                  ${
                    gender === g.key
                      ? "bg-[#C33DFF] text-white border-transparent shadow-sm"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-purple-50"
                  }
                `}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* 연령 필터 */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-gray-600 whitespace-nowrap">
              연령대
            </span>
            {["전체", "10대", "20대", "30대", "40대", "50대"].map((a) => (
              <button
                key={a}
                onClick={() => setAge(a)}
                className={`
                  px-3 py-1 rounded-full text-xs md:text-sm border transition-all
                  ${
                    age === a
                      ? "bg-[#45CFD3] text-white border-transparent shadow-sm"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-cyan-50"
                  }
                `}
              >
                {a}
              </button>
            ))}
          </div>

          {/* 초기화 버튼 */}
          <button
            onClick={() => {
              setGender("all");
              setAge("all");
            }}
            className="flex items-center gap-1 px-3 py-1 text-xs md:text-sm border rounded-full bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
          >
            초기화
          </button>
        </div>

        {/* WordCloud 영역 */}
        {hashtagLoading ? (
          <div className="flex items-center justify-center h-[220px] text-gray-500 text-sm">
            인기 해시태그를 불러오는 중입니다...
          </div>
        ) : hashtags.length === 0 ? (
          <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
            선택한 필터 조건에 해당하는 해시태그가 없습니다.
          </div>
        ) : (
          <div className="h-[220px] md:h-[260px]">
            <WordCloud data={hashtags} />
          </div>
        )}
      </ChartCard>
    </div>
  );
}