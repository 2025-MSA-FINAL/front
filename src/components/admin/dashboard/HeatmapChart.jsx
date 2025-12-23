export default function HeatmapChart({ data }) {
  console.log(" Heatmap raw data:", data);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        데이터가 없습니다
      </div>
    );
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const uniqueDays = [
    ...new Set(
      data
        .map((d) => d.dayLabel)
        .filter((day) => typeof day === "string" && day.length > 0)
    ),
  ].slice(-7);

  const getColor = (views) => {
    if (views === 0) return "bg-purple-50";
    if (views <= 2) return "bg-purple-200";
    if (views <= 4) return "bg-purple-400";
    if (views <= 6) return "bg-purple-600";
    return "bg-purple-800";
  };

  return (
    <div className="w-full flex flex-col pt-2 pb-0">
      <div className="w-full">
        {/* 시간 헤더 */}
        <div className="flex mb-2">
          <div className="w-28 flex-shrink-0"></div>
          <div 
            className="flex-1"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(24, 1fr)',
              gap: '4px'
            }}
          >
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-8 flex items-center justify-center text-xs text-gray-600 font-medium"
              >
                {hour}
              </div>
            ))}
          </div>
        </div>

        {/* 히트맵 그리드 */}
        <div className="space-y-2">
          {uniqueDays.map((day) => {
            if (!day) return null;

            return (
              <div key={day} className="flex">
                {/* 요일 라벨 */}
                <div className="w-28 flex-shrink-0 flex items-center justify-end pr-4">
                  <span className="text-sm font-medium text-gray-700">
                    {day}
                  </span>
                </div>

                {/* 시간별 셀 - CSS Grid로 완벽한 균등 분배 */}
                <div 
                  className="flex-1"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(24, 1fr)',
                    gap: '4px'
                  }}
                >
                  {hours.map((hour) => {
                    const cell = data.find(
                      (d) => d.dayLabel === day && d.hour === hour
                    );
                    const views = cell?.views || 0;

                    return (
                      <div
                        key={`${day}-${hour}`}
                        className={`h-12 flex items-center justify-center text-xs font-semibold text-white rounded-sm transition-all
                          ${getColor(views)}
                          ${views > 0 ? "cursor-default" : ""}
                        `}
                        title={`${day} ${hour}시: ${views}회`}
                      >
                        {views > 0 && views}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/*  범례 - 색상 추가 + 간격 줄임 */}
      <div className="mt-3 pt-2 pb-0 border-t border-gray-200 flex items-center justify-center gap-3 text-xs text-gray-600">
        <span className="font-medium">적음</span>
        <div className="flex gap-2">
          {[0, 2, 4, 6, 8].map((val) => (
            <div
              key={val}
              className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white ${getColor(val)}`}
              title={`조회수 ${val === 0 ? '0' : val === 8 ? '7+' : `~${val}`}`}
            >
              {val === 0 ? '0' : val === 2 ? '2' : val === 4 ? '4' : val === 6 ? '6' : '7+'}
            </div>
          ))}
        </div>
        <span className="font-medium">많음</span>
      </div>
    </div>
  );
}