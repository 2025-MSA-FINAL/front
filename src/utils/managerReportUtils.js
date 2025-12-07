export const stripTagPrefix = (text) => {
  if (!text) return "";
  return text.replace(/^\[[^\]]+\]\s*/, "").trim();
};

export const mapGenderLabel = (code) => {
  if (code === "MALE") return "남성";
  if (code === "FEMALE") return "여성";
  return code || "-";
};

export const truncateText = (text, maxLength = 8) => {
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
};

export const CustomTooltipStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  borderRadius: "12px",
  border: "1px solid #E5E7EB",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  fontSize: "12px",
  padding: "8px 12px",
  color: "#374151",
};

export const getThemeByBasis = (basis) => {
  if (basis === "RESERVATION") {
    return {
      id: "RESERVATION",
      badgeLabel: "예약자 기준",
      description: "실제 예약으로 이어진 고객들의 데이터를 분석했어요.",
      badgeStyle: "bg-purple-100 text-purple-700 border-purple-200",
      main: "#C33DFF",
      mainSoft: "#F3E5FF",
      accent: "#FFD93D",
      textMain: "text-purple-900",
    };
  }
  return {
    id: "WISHLIST",
    badgeLabel: "관심(찜) 유저 기준",
    description: "우리 팝업을 찜한 잠재 고객들의 데이터를 분석했어요.",
    badgeStyle: "bg-teal-50 text-teal-600 border-teal-200",
    main: "#45DFD3",
    mainSoft: "#E0F7FA",
    accent: "#FF2A7E",
    textMain: "text-teal-900",
  };
};
