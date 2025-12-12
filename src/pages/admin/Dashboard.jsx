import React, { Suspense } from "react";
// QueryClientProvider는 상위 컴포넌트(예: _app.js)에 있어야 합니다.

import DashboardContent from "@/components/admin/dashboard/DashboardContent";
import DashboardSkeleton from "@/components/admin/dashboard/DashboardSkeleton"; // 전체 로딩 스켈레톤

// DashboardContent에서 로딩된 데이터를 사용하므로,
// 초기 로딩 시 전체 스켈레톤을 표시합니다.
export default function Dashboard() {
  return (
    // <Suspense>는 useDashboardStats와 usePopularHashtags의 초기 로딩을 캐치합니다.
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}