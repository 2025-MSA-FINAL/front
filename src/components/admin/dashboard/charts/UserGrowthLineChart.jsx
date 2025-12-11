import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function UserGrowthLineChart({ data }) {
    if (!data || data.length === 0) return null;

    const formatXAxisTick = (tickItem) => {
    // tickItem은 '2025-09', '2025-10' 같은 형식의 문자열
    if (tickItem && typeof tickItem === 'string' && tickItem.includes('-')) {
        // 월(Month) 부분만 추출하여 반환 (예: '10')
        const month = tickItem.split('-')[1]; 
        return `${month}월`;
    }
    return tickItem;
};

    const formatYAxisTick = (tickItem) => {
        if (tickItem === 0) return 0;
        if (Math.abs(tickItem) >= 1000000) {
            // 100만 이상이면 M으로 축약 (예: 1,500,000 -> 1.5M)
            return (tickItem / 1000000).toFixed(1) + 'M';
        }
        if (Math.abs(tickItem) >= 10000) {
            // 1천 이상이면 K로 축약 (예: 15,000 -> 15K)
            // 만약 쉼표만 쓰고 싶다면 toLocaleString() 사용
            return (tickItem / 1000).toFixed(0) + 'K'; 
        }
        // 1만 미만이면 쉼표 포맷만 적용 (예: 9,999)
        return tickItem.toLocaleString();
    };


    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart 
                data={data} 
                margin={{ top: 10, right: 20, left: -5, bottom: 10 }} 
            > 
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                
                <XAxis 
                    dataKey="month" 
                    stroke="#6B7280" 
                    tickLine={false} 
                    axisLine={false} 
                    interval={0}
                    tickFormatter={formatXAxisTick}
                />
                
                {/*  YAxis dataKey는 보통 사용하지 않으며, 숫자가 0부터 시작하도록 domain을 설정 */}
                <YAxis 
                    stroke="#6B7280" 
                    tickLine={false} 
                    axisLine={false} 
                    domain={[0, 'auto']} 
                    tickFormatter={formatYAxisTick}
                />
                
                <Tooltip />
                <Line 
                    type="monotone" 
                    dataKey="newUsers" // 이 dataKey가 데이터 객체의 키와 일치해야 합니다.
                    stroke="#7E00CC" 
                    strokeWidth={3} 
                    dot={{ r: 4 }} 
                />
            </LineChart>
        </ResponsiveContainer>
    );
}