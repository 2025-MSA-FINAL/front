import React from 'react';
import AgeTooltip from '../../tooltip/AgeTooltip.jsx';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const formatYAxisTick = (tickItem) => {
    if (typeof tickItem === 'number') {
        return tickItem.toLocaleString(); 
    }
    return tickItem;
};

export default function AgeDistributionAreaChart({ data }) {
    //  데이터 확인 로직 추가
    if (!data || data.length === 0) return <div className="text-center text-gray-400 py-10">데이터 없음</div>;

    return (
        <ResponsiveContainer width="100%" height="100%">
            {/*  여백 유지 */}
            <AreaChart 
                data={data} 
                margin={{ top: 10, right: 20, left: -5, bottom: 10 }} 
            > 
                <defs>
                    <linearGradient id="ageGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C33DFF" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#C33DFF" stopOpacity={0.05}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                
                {/*  XAxis dataKey 확인 (예: '20대') */}
                <XAxis dataKey="ageGroup" stroke="#6B7280" tickLine={false} axisLine={false} />
                
                {/*  YAxis domain 설정으로 데이터가 0부터 시작하도록 강제 */}
                <YAxis 
                    stroke="#6B7280" 
                    tickLine={false} 
                    axisLine={false} 
                    domain={[0, 'auto']} 
                    tickFormatter={formatYAxisTick}
                    //label={{ value: '(명)', angle: 0, position: 'top', dx: 0, dy: -10 }}
                    />
                
                <Tooltip content={<AgeTooltip />} />
                <Area 
                    type="monotone" 
                    dataKey="userCount" // 이 dataKey가 데이터 객체의 키와 일치하는 지 확인
                    stroke="#C33DFF" 
                    fill="url(#ageGradient)" 
                    strokeWidth={2} 
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}