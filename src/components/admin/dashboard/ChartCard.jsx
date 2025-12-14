import { Skeleton } from "./Skeleton";
import React from 'react';

/**
 * 차트/컨텐츠를 담는 공통 카드 컴포넌트 (로딩 스켈레톤 내장)
 * @param {object} props
 * @param {string} props.title - 카드 제목
 * @param {string} [props.metadata] - 부가 정보
 * @param {string} [props.height] - 카드 높이 (Tailwind CSS 또는 CSS 값)
 * @param {boolean} [props.isLoading=false] - 로딩 상태 여부
 * @param {React.ReactNode} props.children - 차트/컨텐츠
 */
export default function ChartCard({
  title,
  metadata,
  height = "320px",
  isLoading = false,
  children,
}) {

  const cardStyle = {
    height: height,
  };

  const skeletonHeight = height ? `h-[${parseInt(height.replace('px', '')) - 80}px]` : "h-[260px]";

  return (
    <div
      className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm flex flex-col"
      style={cardStyle}
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {metadata && (
          <p className="text-xs text-gray-500 mt-1">{metadata}</p>
        )}
      </div>

      {/* 컨텐츠/차트 영역 */}
      <div className="flex-grow min-h-0">
        {isLoading ? (
          // 로딩 중일 때 Skeleton 표시
          <Skeleton className={`w-full ${skeletonHeight} rounded-lg mt-4`} />
        ) : (
          children
        )}
      </div>
    </div>
  );
}