import { useMemo } from "react";
// React Query를 사용하기 위해 useQuery를 import 합니다.
// @tanstack/react-query 패키지가 설치되어 있어야 합니다.
import { useQuery } from "@tanstack/react-query"; 
import axiosInstance from "@/api/axios";

// 1. 데이터 패칭 함수 분리
const fetchDashboardStats = async () => {
  const res = await axiosInstance.get("/api/admin/dashboard/stats");
  // 서버에서 받은 원본 데이터 구조를 그대로 반환합니다.
  return res.data;
};

// 2. 훅 수정 (Loading 상태 제거, Suspense 사용)
export default function useDashboardStats() {
  
  // React Query를 사용하여 데이터 패칭 및 캐싱 처리
  // 'suspense: true' 설정을 통해 초기 로딩 시 `loading` 상태 대신 Suspense fallback을 트리거합니다.
  const { 
    data: stats, // 쿼리가 성공하면 stats에 데이터가 할당됩니다.
    // isFetching, // 데이터가 백그라운드에서 업데이트 중인지 확인하는 데 사용할 수 있습니다.
  } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    // 옵션: 데이터가 오래되었다고 판단하기 전까지의 시간 (예: 5분)
    staleTime: 1000 * 60 * 5, 
    // 옵션: 초기 로딩을 Suspense로 처리하도록 설정
    suspense: true, 
  });
  
  // Suspense 덕분에 stats는 항상 데이터가 존재하는 상태(null이 아닌)로 보장됩니다.
  // 다만, API 응답 구조가 비어있을 경우를 대비하여 방어 코드는 유지합니다.

  // 3. 현재 시간 정보 (캐싱이나 로딩과 관계없이 동작)
  const currentDate = useMemo(
    () =>
      new Date().toLocaleString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  // 4. 성별 데이터 가공
  const genderData = useMemo(() => {
    // Suspense 덕분에 stats는 존재하지만, 내부 필드가 없을 수 있으므로 방어 코드 유지
    if (!stats?.userDemographics) return []; 

    const maleCount = stats.userDemographics
      .filter((d) => d.gender === "male")
      .reduce((sum, d) => sum + d.userCount, 0);

    const femaleCount = stats.userDemographics
      .filter((d) => d.gender === "female")
      .reduce((sum, d) => sum + d.userCount, 0);

    return [
      { name: "남성", value: maleCount, color: "#45CFD3" },
      { name: "여성", value: femaleCount, color: "#FF2A7E" },
    ];
  }, [stats]);

  // 5. 연령대 데이터 가공
  const ageData = useMemo(() => {
    if (!stats?.userDemographics) return [];

    const ageOrder = {
      "10대": 1,
      "20대": 2,
      "30대": 3,
      "40대": 4,
      "50대+": 5,
    };

    const aggregated = stats.userDemographics.reduce((acc, d) => {
      const existing = acc.find((a) => a.ageGroup === d.ageGroup);
      if (existing) existing.userCount += d.userCount;
      else acc.push({ ageGroup: d.ageGroup, userCount: d.userCount });
      return acc;
    }, []);

    return aggregated.sort(
      (a, b) => (ageOrder[a.ageGroup] || 999) - (ageOrder[b.ageGroup] || 999)
    );
  }, [stats]);

  // 6. 월별 신규 유저 데이터
  const monthlyUserGrowth = useMemo(() => {
    if (!stats?.monthlyUserGrowth) return [];
    return stats.monthlyUserGrowth;
  }, [stats]);
  
  // 7. 해시태그 워드클라우드 (여기서는 사용하지 않지만, 데이터는 가져옵니다)
  // usePopularHashtags 훅이 이 데이터를 사용하지 않고 별도로 가져온다면 이 부분은 제거해도 됩니다.
  // 원본 코드에 있었으므로 유지합니다.
  const wordCloudData = useMemo(() => {
    if (!stats?.popularHashtags) return [];
    return stats.popularHashtags.map((tag) => ({
      name: tag.hashName,
      value: tag.wishlistCount,
    }));
  }, [stats]);


  // 8. 반환
  return {
    stats,
    // loading 상태는 Suspense로 대체되었으므로 제거합니다.
    genderData,
    ageData,
    wordCloudData,
    currentDate,
    monthlyUserGrowth,
    // isFetching // 필요하다면 이 값을 추가하여 백그라운드 업데이트 상태를 표시할 수 있습니다.
  };
}