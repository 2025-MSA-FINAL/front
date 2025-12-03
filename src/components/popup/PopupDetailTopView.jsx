import OutlineButton from "../button/OutlineButton";

//InfoRow 컴포넌트
function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-5 items-start">
      <span 
        className="
          flex-shrink-0 
          w-[56px] py-[3px] 
          text-center text-[13px] font-bold text-text-sub 
          border border-secondary rounded-full bg-white
        "
      >
        {label}
      </span>
      <span className="text-[17px] text-text-black leading-relaxed break-keep font-medium">
        {value}
      </span>
    </div>
  );
}

export default function PopupDetailTopView({
  popup,
  statusLabel,
  dateRange,
  aiSummaryText,
  isFree,
  price,
  actionComponent, 
}) {
  const { popName, popThumbnail, hashtags, popLocation, popStatus } = popup;

  const getStatusStyle = () => {
    switch (popStatus) {
      case "UPCOMING": return "border-accent-aqua text-accent-aqua bg-accent-aqua/10";
      case "ONGOING": return "border-primary text-primary bg-primary-light/50";
      case "ENDED": return "border-secondary text-secondary-dark bg-secondary-light";
      default: return "border-primary text-primary bg-primary-light/50";
    }
  };

  return (
    <>
      {/* 1. 상단 헤더 영역 */}
      <div className="flex flex-col items-center gap-5 mb-10 text-center">
        {/* 배지 */}
         <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full border-[1.5px] text-[13px] font-bold leading-none ${getStatusStyle()}`}>
          {statusLabel}
        </span>
        
        {/* 타이틀 */}
        <h1 className="text-[28px] md:text-[40px] font-bold text-text-black leading-tight tracking-tight">
          {popName}
        </h1>
        
        {/* 해시태그 */}
        {/* max-w-[600px]: 너무 옆으로 퍼지지 않게 너비 제한 */}
        {/* mx-auto: 중앙 정렬 */}
        <div className="flex flex-wrap justify-center gap-2 max-w-[600px] mx-auto">
          {hashtags?.map((tag) => (
            <span 
              key={tag} 
              className="
                px-3 py-1.5 
                rounded-[8px]
                bg-secondary-light
                text-text-sub text-[13px] font-medium
              "
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* 2. 메인 컨텐츠 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 items-start">
        
        {/* 좌측: 썸네일 (3:4 비율) */}
        <div className="aspect-[3/4] bg-secondary-light rounded-[20px] overflow-hidden border border-secondary/50 shadow-sm relative flex items-center justify-center">
          {popThumbnail ? (
            <img src={popThumbnail} alt={popName} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full relative opacity-50">
               <div className="absolute inset-0 bg-transparent border border-secondary m-[-3px]" />
               <div className="absolute w-full h-[1px] bg-secondary" style={{ top: "50%", transform: "rotate(45deg)" }} />
               <div className="absolute w-full h-[1px] bg-secondary" style={{ top: "50%", transform: "rotate(-45deg)" }} />
            </div>
          )}
        </div>

        {/* 우측: 정보 영역 */}
        <div className="flex flex-col h-full gap-6">
          
          {/* AI 요약 박스 */}
          <section className="bg-white p-6 rounded-[20px] border border-secondary-light">
            <h2 className="text-[15px] font-bold text-text-black mb-3 flex items-center gap-2">✨ AI 요약</h2>
            <p className="text-[14px] leading-7 text-text-sub whitespace-pre-line">{aiSummaryText}</p>
          </section>

          {/* 상세 정보 리스트 */}
          <section className="flex flex-col gap-4 py-2">
            <InfoRow label="장소" value={popLocation} />
            <InfoRow label="기간" value={dateRange} />
            <InfoRow label="가격" value={isFree ? "무료" : `${price?.toLocaleString()}원`} />
          </section>
            
          <div className="mt-auto flex flex-col gap-4">
             {/* 전달받은 버튼 컴포넌트 렌더링 */}
             {actionComponent}
          </div>

        </div>
      </div>
    </>
  );
}