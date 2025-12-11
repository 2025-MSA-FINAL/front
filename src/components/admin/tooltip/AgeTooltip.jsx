import React from 'react';
export default function AgeTooltip({ active, payload }) {
 
    if (!active || !payload || payload.length === 0) {
    return null;
  }

  const dataItem = payload[0];  

  const ageGroup = dataItem?.payload?.ageGroup;

  const userCount = dataItem?.value;

  if (!ageGroup || userCount === undefined) {
        return null;
    }


  return (
    <div className="bg-white border rounded-md px-3 py-2 text-sm shadow">
      {/* data.title은 주로 X축 레이블(예: 2025-12) 또는 카테고리(예: 20대) */}
      <div className="font-bold">{ageGroup}</div> 
      {/* data.label은 시리즈 이름 (예: '유저 수'), data.value는 실제 값 */}
      <div>유저 수 : <span className="font-medium text-purple-600">{userCount.toLocaleString()}명</span></div> 
    </div>
  );
}