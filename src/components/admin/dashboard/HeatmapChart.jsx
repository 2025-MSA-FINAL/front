export default function HeatmapChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        데이터가 없습니다
      </div>
    );
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const uniqueDays = [...new Set(data.map((d) => d.day))].slice(-7);

  const getColor = (views) => {
    if (views === 0) return "bg-purple-50";
    if (views <= 2) return "bg-purple-200";
    if (views <= 4) return "bg-purple-400";
    if (views <= 6) return "bg-purple-600";
    return "bg-purple-800";
  };

  const getWeekday = (day) => {
    if (day.includes("토")) return "saturday";
    if (day.includes("일")) return "sunday";
    return "weekday";
  };

  return (
    <div className="w-full h-full flex flex-col py-2">
      {/* <h3 className="text-lg font-semibold mb-4">조회 패턴 분석</h3> */}
      
      <div className="overflow-x-auto">
        <div className="min-w-[800px] pb-4">
          {/* 시간 헤더 */}
          <div className="flex mb-2">
            <div className="w-28 flex-shrink-0"></div>
            <div className="flex flex-1">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="min-w-[32px] h-8 flex items-center justify-center text-xs text-gray-600 font-medium mx-[1px]"
                >
                  {hour}
                </div>
              ))}
            </div>
          </div>

          {/* 히트맵 그리드 */}
        <div className="pb-4">
          {uniqueDays.map((day) => {
            const weekdayType = getWeekday(day);
            const bgColor =
              weekdayType === "saturday"
                ? "bg-blue-50/50"
                : weekdayType === "sunday"
                ? "bg-red-50/50"
                : "";

            return (
              <div key={day} className={`flex mb-2 ${bgColor}`}>
                {/* 요일 라벨 */}
                <div className="w-28 flex-shrink-0 sticky left-0 bg-white z-10 flex items-center justify-end pr-4">
                  <span className="text-sm font-medium text-gray-700">
                    {day}
                  </span>
                </div>

                {/* 시간별 셀 */}
                <div className="flex flex-1">
                  {hours.map((hour) => {
                    const cell = data.find(
                      (d) => d.day === day && d.hour === hour
                    );
                    const views = cell?.views || 0;

                    return (
                      <div
                        key={`${day}-${hour}`}
                        className={`min-w-[32px] h-12 flex items-center justify-center text-xs font-semibold text-white rounded-sm mx-[1px] transition-all
                          ${getColor(views)}
                          ${views > 0 ? "cursor-default" : ""}
                        `}
                        // 클릭 이벤트 제거
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
    </div>

      {/* 범례 */}
      <div className="mt-4 pt-3 flex items-center justify-center gap-2 text-xs text-gray-600">
        <span>적음</span>
        <div className="flex gap-1">
          {[0, 2, 4, 6, 8].map((val) => (
            <div
              key={val}
              className={`w-4 h-4 rounded-sm ${getColor(val)}`}
            ></div>
          ))}
        </div>
        <span>많음</span>
      </div>
    </div>
  );
}