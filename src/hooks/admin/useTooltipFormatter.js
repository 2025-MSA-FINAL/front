export default function useTooltipFormatter() {
  return (payload) => {
    if (!payload || !payload.length) return null;

    const data = payload[0].payload;

    if (data.categoryName)
      return { title: data.categoryName, label: "신고 건수", value: data.reportCount };

    if (data.popName)
      return { title: data.popName, label: "조회수", value: data.viewCount };

    if (data.ageGroup)
      return { title: `${data.ageGroup} 연령대`, label: "유저 수", value: data.userCount };

    if (data.name)
      return { title: data.name, label: "수치", value: payload[0].value };

    return { title: "정보", label: "값", value: payload[0].value };
  };
}
