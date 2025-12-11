import { Skeleton } from "@/components/admin/dashboard/Skeleton";
import KpiCard from "@/components/admin/dashboard/KpiCard"; // KpiCard만 사용한다고 가정

/**
 * 대시보드 전체 로딩 시 보여줄 스켈레톤 컴포넌트
 */
export default function DashboardSkeleton() {
  return (
    <div className="space-y-10">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Skeleton className="h-8 w-64 mb-1" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
        ))}
      </div>

      {/* Main Chart Section Skeletons (월별, 연령별, 성별) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Skeleton className="h-[320px] w-full" />
        <Skeleton className="h-[320px] w-full" />
        <Skeleton className="h-[320px] w-full" />
      </div>

      {/* Other Charts Skeletons */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Skeleton className="h-[320px] w-full" /> {/* 인기 팝업 */}
        <Skeleton className="h-[450px] w-full" /> {/* 신고 건수 */}
      </div>

      <Skeleton className="h-[520px] w-full" /> {/* 히트맵 */}
      <Skeleton className="h-[400px] w-full" /> {/* 해시태그 */}
    </div>
  );
}