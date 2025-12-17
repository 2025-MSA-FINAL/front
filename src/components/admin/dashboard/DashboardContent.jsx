import React, { useMemo, useState } from "react";
// import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, Cell, ... } from "recharts"; 

import useDashboardStats from "@/hooks/admin/useDashboardStats";
import usePopularHashtags from "@/hooks/admin/usePopularHashtags";
import { useAIReport } from "@/hooks/admin/useAIReport";


// 컴포넌트 Import
import KpiCard from "@/components/admin/dashboard/KpiCard";
import ChartCard from "@/components/admin/dashboard/ChartCard";
import HeatmapChart from "@/components/admin/dashboard/HeatmapChart";
import WordCloud from "@/components/admin/wordcloud/WordCloud";
import AIReportCard from "@/components/admin/dashboard/AIReportCard";


// 분리된 차트 컴포넌트 Import 
import UserGrowthLineChart from "@/components/admin/dashboard/charts/UserGrowthLineChart";
import AgeDistributionAreaChart from "@/components/admin/dashboard/charts/AgeDistributionAreaChart";
import GenderPieChart from "@/components/admin/dashboard/charts/GenderPieChart";
import PopularPopupBarChart from "@/components/admin/dashboard/charts/PopularPopupBarChart";
import ReportCategoryList from "@/components/admin/dashboard/charts/ReportCategoryList";
import { Users, Store, MessageSquare, AlertCircle, Home, RotateCcw } from "lucide-react";


// Tailwind CSS 클래스 상수화
const HASHTAG_BUTTON_BASE_CLASS = "px-3 py-1 rounded-full text-xs border transition-all whitespace-nowrap";
const HASHTAG_GENDER_ACTIVE_CLASS = "bg-[#C33DFF] text-white border-transparent shadow-sm";
const HASHTAG_GENDER_INACTIVE_CLASS = "bg-white text-gray-700 border-gray-300 hover:bg-purple-50";
const HASHTAG_AGE_ACTIVE_CLASS = "bg-[#45CFD3] text-white border-transparent shadow-sm";
const HASHTAG_AGE_INACTIVE_CLASS = "bg-white text-gray-700 border-gray-300 hover:bg-cyan-50";


export default function DashboardContent() {
  const { stats, genderData, ageData, currentDate, monthlyUserGrowth } =
    useDashboardStats();

    //  데이터 확인 로그 추가
    console.log("Monthly Growth Data:", monthlyUserGrowth);
    console.log("Age Data:", ageData);

  const {
    hashtags,
    gender,
    age,
    setGender,
    setAge,
    isFetching: hashtagFetching, 
  } = usePopularHashtags();

  //AI 리포트 hook 추가
  const { report, loading, error, fetchReport } = useAIReport();
  const [showReport, setShowReport] = useState(false);
  
  // KPI 데이터 가공 
  const kpiData = useMemo(() => [
    {
      title: "총 유저 수",
      value: stats.totalUsers || 0,
      sub: `오늘 +${stats.newUsersToday || 0}, 이번주 +${stats.newUsersThisWeek || 0}`,
      icon: <Users className="w-6 h-6 text-white" />,
      gradient: "from-[#C33DFF] to-[#7E00CC]",
    },
    {
      title: "팝업스토어",
      value: stats.totalPopupStores || 0,
      sub: `진행 ${stats.activePopupStores || 0}, 대기 ${stats.pendingApproval || 0}`,
      icon: <Store className="w-6 h-6 text-white" />,
      gradient: "from-[#45CFD3] to-[#C33DFF]",
    },
    {
      title: "채팅방",
      value: stats.totalChatRooms || 0,
      sub: "전체 채팅방 수",
      icon: <MessageSquare className="w-6 h-6 text-white" />,
      gradient: "from-[#7E00CC] to-[#C33DFF]",
    },
    {
      title: "전체 신고",
      value: stats.totalReports || 0,
      sub: `대기 ${stats.pendingReports || 0}`,
      icon: <AlertCircle className="w-6 h-6 text-white" />,
      gradient: "from-[#FF2A7E] to-[#FFC92D]",
    },
    {
      title: "종료 임박 팝업",
      value: stats.endingSoon || 0,
      sub: "7일 이내 종료",
      icon: <Home className="w-6 h-6 text-white" />,
      gradient: "from-[#FFC92D] to-[#FF2A7E]",
    },
  ], [stats]);

  // 바 차트 하단 메타데이터 시간 계산
  const now = new Date();
  const barChartMetadataTime = `조회수 기준 (2025년 12월 4일 오후 ${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")})`;

  
  return (
    <div className="space-y-10">
      {/* Header (생략) */}
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            대시보드
          </h1>
          <p className="text-sm text-gray-600">
            PopSpot 서비스의 전체 현황을 한 눈에 확인하세요.
          </p>
        </div>
      </header>

      {/* KPI Cards Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        {kpiData.map((data, i) => (
          <KpiCard key={i} {...data} />
        ))}
      </section>

      {/* Line, Area, Pie Charts Section (차트 컴포넌트 분리 적용) */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* 월별 신규 유저 추이 */}
        <ChartCard title="월별 신규 유저 추이" metadata="최근 4개월 데이터" height="320px">
          <UserGrowthLineChart data={monthlyUserGrowth} />
        </ChartCard>

        {/* 연령별 유저 분포 */}
        <ChartCard
          title="연령대별 유저 분포"
          metadata={`전체 ${stats.totalUsers || 0}명 기준 (${currentDate})`}
          height="320px"
        >
          <AgeDistributionAreaChart data={ageData} />
        </ChartCard>

        {/* 성별 유저 비율 */}
        <ChartCard
          title="성별 유저 비율"
          metadata={`전체 ${stats.totalUsers || 0}명 기준 (${currentDate})`}
          height="320px"
        >
          <GenderPieChart data={genderData} />
        </ChartCard>
      </section>

      {/* Bar Charts Section (차트 컴포넌트 분리 적용) */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 이번 주 인기 팝업 TOP 5 */}
        <ChartCard title="이번 주 인기 팝업 TOP 5" height="450px">
          <PopularPopupBarChart 
            data={stats.weeklyTopPopups} 
            metadata={barChartMetadataTime} // 계산된 메타데이터 전달
          />
        </ChartCard>

        {/* 카테고리별 신고 건수 */}
        <ChartCard title="카테고리별 신고 현황" metadata="가장 많은 신고 건수를 가진 항목 순" height="450px">
          <ReportCategoryList 
            data={stats.reportCategoryStats}
            totalReports={stats.totalReports}
          />
        </ChartCard>
      </section>


      {/* Heatmap/WordCloud Section (필터 클래스 상수화 적용) */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 조회수 히트맵 (원본과 동일) */}
        <ChartCard title="최근 7일 조회수 히트맵" height="520px">
          <div className="w-full overflow-auto h-full">
            <HeatmapChart data={stats.viewHeatmap} />
          </div>
        </ChartCard>
        
        {/* 인기 해시태그 */}
        <ChartCard
          title="인기 해시태그"
          metadata={`성별/연령대 기준 인기 해시태그 (${currentDate})`}
          height="520px"
          isLoading={hashtagFetching}
        >
          {/* 필터 UI - 2줄 분리 구조 (시작점 일치 및 새로고침 버튼 이동) */}
          <div className="flex flex-col mb-4 gap-4"></div>
           
           {/* 1행 연령 필터 */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 whitespace-nowrap w-[50px]">연령대</span>
              
              <div className="flex items-center gap-2 overflow-x-auto p-0">
                {["전체", "10대", "20대", "30대", "40대", "50대"].map((a) => (
                  <button
                    key={a}
                    onClick={() => setAge(a)}
                    className={`${HASHTAG_BUTTON_BASE_CLASS} ${
                      age === a ? HASHTAG_AGE_ACTIVE_CLASS : HASHTAG_AGE_INACTIVE_CLASS
                    } whitespace-nowrap`}
                  >
                    {a}
                  </button>
                ))}
            </div>
           </div>

            {/* 2행 성별 필터 & 초기화 */}
            <div className="flex items-center gap-2 ">
              <div className="flex items-center gap-2 overflow-x-auto p-0">
                <span className="text-xs text-gray-600 whitespace-nowrap w-[50px]">성별</span>
             
              <div className="flex items-center gap-2 overflow-x-auto p-0">
                {["all", "male", "female"].map((key) => (
                  <button
                    key={key}
                    onClick={() => setGender(key)}
                    className={`${HASHTAG_BUTTON_BASE_CLASS} ${
                      gender === key ? HASHTAG_GENDER_ACTIVE_CLASS : HASHTAG_GENDER_INACTIVE_CLASS
                    } text-sm`}
                  >
                    {key === "all" ? "전체" : key === "male" ? "남성" : "여성"}
                  </button>
                ))}
            
            {/* 초기화 버튼 */}
            <button
              onClick={() => {
                setGender("all");
                setAge("전체");
              }}
              className={`
                ${HASHTAG_BUTTON_BASE_CLASS} 
                bg-white text-gray-700 border-gray-300 hover:bg-gray-100 
                self-start 
                !p-1.5
             `} aria-label="필터 초기화"
              >
                <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
     </div>

          {/* WordCloud 영역 */}
          <div className="flex-grow min-h-0 mt-4">
            {!hashtagFetching && hashtags.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                선택한 필터 조건에 해당하는 해시태그가 없습니다.
              </div>
            ) : (
              <div className="h-full">
                <WordCloud data={hashtags} />
              </div>
            )}
          </div>
        </ChartCard>
      </section>
      
          <section>
        {/* AI 리포트 헤더 */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <span className="text-3xl">🤖</span>
                AI 운영 리포트
              </h2>
              <p className="text-purple-100 text-sm">
                대시보드 통계 데이터 기반 자동 분석 및 전략 제안
              </p>
            </div>
            
            <button
              onClick={() => {
                if (!showReport) {
                  fetchReport();
                }
                setShowReport(!showReport);
              }}
              disabled={loading}
              className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold 
                       hover:bg-purple-50 transition-all duration-200 disabled:opacity-50 
                       disabled:cursor-not-allowed shadow-md hover:shadow-lg whitespace-nowrap"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" 
                            stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  생성 중...
                </span>
              ) : showReport ? (
                '리포트 닫기'
              ) : (
                'AI 리포트 생성'
              )}
            </button>
          </div>
        </div>

        {/* 에러 표시 */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-red-800">오류 발생</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* AI 리포트 카드 */}
        {showReport && report && (
          <div className="mt-6">
            <AIReportCard report={report} />
          </div>
        )}
      </section>
    </div>
  );
}
