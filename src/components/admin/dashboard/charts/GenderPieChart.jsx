import React, { useMemo } from 'react';
import GenderTooltip from '../../tooltip/GenderTooltip.jsx';
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from 'recharts';

export default function GenderPieChart({ data }) {
    
    const COLORS = ['#C33DFF', '#45CFD3', '#FFC92D'];

    // 데이터 확인 로직 (이전과 동일)
    if (!data || data.length === 0 || data.reduce((sum, item) => sum + item.value, 0) === 0) {
        return <div className="text-center text-gray-400 py-10">데이터 없음</div>;
    }

    const mappedData = useMemo(() => {
        return data.map((item, index) => ({
            ...item,
            color: COLORS[index % COLORS.length],
        }));
    // ESLint 경고 무시 주석 (유지)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]); 

    //  전체 사용자 수 계산 (중앙에 표시할 값)
    const totalUsers = mappedData.reduce((sum, item) => sum + item.value, 0);

    return (
        //  중앙 범례를 오버레이하기 위해 relative 포지셔닝 사용
        <div className="relative w-full h-full"> 
            
            <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Pie
                        data={mappedData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80} //  바깥 반지름
                        innerRadius={60} //  안쪽 반지름 설정: 도넛 차트 구현
                        paddingAngle={5} // 조각 사이 간격 (선택 사항)
                        labelLine={false} 
                    >
                        {mappedData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color}
                                stroke={entry.color}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<GenderTooltip />} /> 
                </PieChart>
            </ResponsiveContainer>

            {/* 중앙 범례 오버레이 (Absolute Position) */}
            <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center pointer-events-none">
                <div className="text-center">
                    {/* 1. 총 사용자 수 표시 */}
                    <p className="text-xs text-gray-500 mb-1">전체 사용자</p>
                    <p className="text-2xl font-bold text-gray-800">{totalUsers}명</p>
                    
                    {/* 2. 각 항목의 값과 색상 표시 (선택적으로 추가 가능) */}
                    <div className="mt-2 flex flex-col items-end gap-1">
                        {mappedData.map((entry, index) => (
                            <span key={entry.name} className="inline-flex items-center mx-1 text-xs">
                                <span 
                                    className="w-2 h-2 rounded-full mr-1" 
                                    style={{ backgroundColor: entry.color }}
                                />
                                {entry.name} ({entry.value}명)
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            
        </div>
    );
}