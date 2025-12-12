// src/components/admin/dashboard/charts/GenderTooltip.jsx (수정)

export default function GenderTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0];
  
  const rawData = data.payload || {};
  
  const name = data.name;        // "남성" / "여성"
  const value = data.value;      // 숫자
  const color = data.fill;       
  
  // percent를 data.percent 또는 rawData.percent를 통해 안전하게 추출
  const percentValue = data.percent !== undefined ? data.percent : rawData.percent;
  const percent = percentValue !== undefined ? (percentValue * 100).toFixed(1) : null;


  return (
    <div
      className="rounded-xl shadow-lg p-3 bg-white border border-gray-200"
      style={{ minWidth: "100px" }}
    >
      <div className="font-semibold text-gray-900 flex items-center gap-2">
        <span
          className="w-3 h-3 rounded"
          style={{ backgroundColor: color }}
        />
        {name}
      </div>

      <div className="mt-1 text-sm text-gray-700">
        {/*  value가 숫자인지 확인하여 안전하게 toLocaleString 호출 */}
        <span className="font-medium">{typeof value === 'number' ? value.toLocaleString() : value}명</span>
      </div>

      {percent && (
        <div className="mt-1 text-xs text-gray-500">
          ({percent}%)
        </div>
      )}
    </div>
  );
}