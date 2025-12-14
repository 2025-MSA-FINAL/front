import React from 'react';

export default function ReportCategoryList({ data, totalReports }) {
    if (!data || data.length === 0 || totalReports === 0) {
        return (
            <div className="text-center text-gray-500 py-12">신고 데이터가 없습니다.</div>
        );
    }

    // 건수 순으로 내림차순 정렬
    const sortedData = [...data].sort((a, b) => b.reportCount - a.reportCount); 

    // 가장 많은 건수를 구하여 진행률 바의 100% 기준으로 사용합니다.
    const maxCount = sortedData[0]?.reportCount || 1; 

    const PURPLE_START = '#C33DFF'; // 밝은 보라색
    const PURPLE_END = '#7E00CC'; // 진한 보라색 (고객님 요청색)
    const PURPLE_PERCENT = '#9D4EDD'; // 비율 텍스트 색상
    const RANK_COLOR = 'text-[#F8F8F9]'; // 상위 랭킹 텍스트 색상 (청록색)

    return (
        <div className="space-y-4 pt-2 h-full overflow-y-auto"> 
            {/* 전체 건수 표시 */}
            <div className="text-sm text-[#70757A] pb-2 border-b border-gray-100">
                전체 <span className="font-bold text-[#242424]">{totalReports}</span>건
            </div>
            
            {/* 리스트 항목 */}
            {sortedData.map((item, index) => {
                const percent = ((item.reportCount / totalReports) * 100).toFixed(1);
                const barWidth = `${(item.reportCount / maxCount) * 100}%`;
                
                // 상위 3위에 대한 배경색 설정
                const rankBg = index < 3 ? 'bg-[#45DFD3]' : 'bg-gray-100';
                const rankTextColor = index < 3 ? RANK_COLOR : 'text-gray-500';

                return (
                    <div key={item.categoryName} className="flex flex-col pb-4">
                        <div className="flex justify-between items-center mb-1">
                            {/* 1. 순위 (박스 스타일 적용) & 이름 */}
                            <div className="flex items-center gap-3">
                                {/*  박스 스타일 적용: 원형, 배경색, 중앙 정렬 */}
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 
                                    ${rankBg} ${rankTextColor}`}>
                                    {index + 1}
                                </span>
                                
                                <span className="text-sm font-semibold text-gray-800 line-clamp-1">
                                    {item.categoryName}
                                </span>
                            </div>
                            
                            {/* 2. 건수 & 비율 */}
                            <div className="flex items-baseline gap-1 min-w-[100px] justify-end">
                                <span className="text-xl font-bold text-gray-800">
                                    {item.reportCount.toLocaleString()}
                                </span>
                                {/* 비율 텍스트 색상 */}
                                <span className={`text-xs text-[${PURPLE_PERCENT}] font-medium`}> 
                                    ({percent}%)
                                </span>
                            </div>
                        </div>

                        {/* 3. 진행률 바 */}
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                                className={`h-2 rounded-full bg-gradient-to-r from-[${PURPLE_START}] to-[${PURPLE_END}] transition-all duration-500`} 
                                style={{ width: barWidth }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}