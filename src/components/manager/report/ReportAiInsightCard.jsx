import React from "react";
import { Sparkles, TrendingUp } from "lucide-react";
import { stripTagPrefix } from "../../../utils/managerReportUtils";

const ReportAiInsightCard = ({ data }) => {
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

export default ReportAiInsightCard;