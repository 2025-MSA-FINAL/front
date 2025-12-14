import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer 
} from "recharts";
import { Store } from "lucide-react";

// BarChart 툴팁 포맷터 함수
const tooltipFormatter = (value, name, props) => [
  `${value}회`,
  props.payload.popName, // 팝업 이름 표시
];

// YAxis 틱 커스터마이징 함수 (이름 길이에 따른 자르기)
const renderCustomYAxisTick = (props) => {
  const { x, y, payload } = props;
  const maxLength = 15;
  const text = payload.value;
  const truncated =
    text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor="end"
        fill="#667"
        fontSize={12}
        title={text}
      >
        {truncated}
      </text>
    </g>
  );
};


export default function PopularPopupBarChart({ data, metadata }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <Store className="w-12 h-12 mb-3 opacity-40" />
        <p>이번 주 조회 데이터가 없습니다</p>
        <p className="text-xs text-gray-400 mt-2">{metadata}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ResponsiveContainer width="100%" height="100%" className="flex-grow min-h-0">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            dataKey="popName"
            type="category"
            width={150}
            tick={renderCustomYAxisTick} // 커스텀 틱 사용
          />
          <Tooltip formatter={tooltipFormatter} />
          <Bar dataKey="viewCount" fill="#7E00CC" />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 text-center pt-3">
        {metadata}
      </p>
    </div>
  );
}