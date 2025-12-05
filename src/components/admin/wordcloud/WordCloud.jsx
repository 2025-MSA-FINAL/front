import React from "react";
import ReactECharts from "echarts-for-react";
import "echarts-wordcloud";

const PALETTE = ["#C33DFF", "#45CFD3", "#FF2A7E", "#BFF731", "#FFC92D", "#7E00CC"];

export default function WordCloud({ data }) {
  // 데이터 유효성 검사
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-[#70757A]">
        데이터가 없습니다
      </div>
    );
  }

  //  데이터 정제 및 변환
  const validData = data
    .filter(item => {
      // name과 value가 있고, value가 유효한 숫자인지 확인
      return item && 
             item.name && 
             item.value !== null && 
             item.value !== undefined && 
             !isNaN(Number(item.value)) &&
             Number(item.value) > 0;
    })
    .map(item => ({
      name: String(item.name).trim(),
      value: Math.max(1, Math.round(Number(item.value))) // 최소값 1, 정수로 변환
    }));

  //  정제 후 데이터가 없으면 메시지 표시
  if (validData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-[#70757A]">
        유효한 데이터가 없습니다
      </div>
    );
  }

  const option = {
    tooltip: {
      show: true,
      formatter: (item) => `${item.name} : ${item.value}`,
    },
    series: [
      {
        type: "wordCloud",
        gridSize: 8,
        sizeRange: [14, 52],
        rotationRange: [-45, 45],
        shape: "circle",
        width: "100%",
        height: "100%",
        textStyle: {
          fontFamily: "Pretendard, system-ui, -apple-system, BlinkMacSystemFont",
          fontWeight: 600,
          color: () => {
            const i = Math.floor(Math.random() * PALETTE.length);
            return PALETTE[i];
          },
        },
        emphasis: {
          textStyle: {
            shadowBlur: 8,
            shadowColor: "rgba(0,0,0,0.3)",
          },
        },
        data: validData, 
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: 280, width: "100%" }}
      opts={{ renderer: "canvas" }}
    />
  );
}