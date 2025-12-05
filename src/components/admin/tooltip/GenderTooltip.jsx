export default function GenderTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0];
  
  const name = data.name;        // "남성" / "여성"
  const value = data.value;      // 예: 312
  const color = data.fill;       // PieChart 색상 자동 전달
  const percent = data.percent ? (data.percent * 100).toFixed(1) : null;

  return (
    <div
      className="rounded-xl shadow-lg p-3 bg-white border border-gray-200"
      style={{ minWidth: "140px" }}
    >
      <div className="font-semibold text-gray-900 flex items-center gap-2">
        <span
          className="w-3 h-3 rounded"
          style={{ backgroundColor: color }}
        />
        {name}
      </div>

      <div className="mt-1 text-sm text-gray-700">
        <span className="font-medium">{value.toLocaleString()}명</span>
      </div>

      {percent && (
        <div className="mt-1 text-xs text-gray-500">
          ({percent}%)
        </div>
      )}
    </div>
  );
}
