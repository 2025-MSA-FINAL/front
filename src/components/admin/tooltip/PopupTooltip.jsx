
export default function PopupTooltip({ active, payload }) {
  if (!active || !payload || !payload.length || !payload[0]) {
    return null;
  }
  
  const data = payload[0].payload;
  if (!data) {
    return null;
  }

  return (
    <div className="bg-white p-3 border rounded-lg shadow-lg">
      <p className="font-bold text-sm">{data.popName}</p>
      <p className="text-xs text-gray-600">
        조회수: <strong className="text-[#7E00CC]">{data.viewCount}</strong>
      </p>
    </div>
  );
}