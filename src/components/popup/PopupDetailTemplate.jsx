import PopupDetailTopView from "./PopupDetailTopView";
import OutlineButton from "../button/OutlineButton";

export default function PopupDetailTemplate({
  loading,
  error,
  navigate,
  popup,
  statusLabel,
  dateRange,
  aiSummaryText,
  isFree,
  actions,
  bottomSection,
}) {
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-text-sub">불러오는 중입니다...</p>
      </div>
    );
  }

  if (error || !popup) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-text-sub mb-4">{error || "데이터가 없습니다."}</p>
        <OutlineButton onClick={() => navigate(-1)}>돌아가기</OutlineButton>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-paper-light">
      
      {/* 내부 컨텐츠 중앙 정렬 */}
      <div className="max-w-6xl mx-auto px-10 py-12">
        
        {/* 1. 상단 뷰 */}
        <PopupDetailTopView
          popup={popup}
          statusLabel={statusLabel}
          dateRange={dateRange}
          aiSummaryText={aiSummaryText}
          isFree={isFree}
          price={popup.popPrice}
          actionComponent={actions}
        />

        {/* 2. 하단 섹션 */}
        {bottomSection}
        
      </div>
    </div>
  );
}