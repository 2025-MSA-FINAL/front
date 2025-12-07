import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/api/axios";

export default function useDashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // ===== 백엔드 API 호출 =====
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/admin/dashboard/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Dashboard stats error:", err);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  // ===== 성별 데이터 =====
  const genderData = useMemo(() => {
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

  // ===== 연령대 데이터 (수정됨) =====
  const ageData = useMemo(() => {
    if (!stats?.userDemographics) return [];

    const ageOrder = {
      "10대": 1,
      "20대": 2,
      "30대": 3,
      "40대": 4,
      "50대+": 5,
    };

    //  reduce 결과를 변수에 저장
    const aggregated = stats.userDemographics.reduce((acc, d) => {
      const existing = acc.find((a) => a.ageGroup === d.ageGroup);
      if (existing) existing.userCount += d.userCount;
      else acc.push({ ageGroup: d.ageGroup, userCount: d.userCount });
      return acc;
    }, []);

    //  정렬해서 반환
    return aggregated.sort(
      (a, b) => (ageOrder[a.ageGroup] || 999) - (ageOrder[b.ageGroup] || 999)
    );
  }, [stats]);

  // =====  월별 신규 유저 데이터 =====
  const monthlyUserGrowth = useMemo(() => {
    if (!stats?.monthlyUserGrowth) return [];
    return stats.monthlyUserGrowth;
  }, [stats]);

  // ===== 해시태그 워드클라우드 =====
  const wordCloudData = useMemo(() => {
    if (!stats?.popularHashtags) return [];
    return stats.popularHashtags.map((tag) => ({
      name: tag.hashName,
      value: tag.wishlistCount,
    }));
  }, [stats]);

  return {
    stats,
    loading,
    genderData,
    ageData,
    wordCloudData,
    currentDate,
    monthlyUserGrowth,
  };
}