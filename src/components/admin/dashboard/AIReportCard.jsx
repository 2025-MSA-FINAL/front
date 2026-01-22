const AIReportCard = ({ report }) => {
  if (!report) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // PDF 다운로드 핸들러
  const handleDownload = () => {
    if (!report.airPdfUrl) {
      alert("다운로드 가능한 PDF 파일이 없습니다.");
      return;
    }
    // API 서버의 절대 경로가 필요할 경우를 대비해 window.open 사용
    window.open(report.airPdfUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* 헤더: 제목과 다운로드 버튼 배치 */}
      <div className="pb-4 flex justify-between items-start">        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {report.reportTitle}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            생성일: {formatDate(report.generatedAt)}
          </p>
        </div>
        
        {/* PDF 다운로드 버튼 추가 */}
        {report.airPdfUrl && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm text-sm font-medium"
          >
            <span className="text-lg">📥</span>
            PDF 다운로드
          </button>
        )}
      </div>

      {/* 핵심 요약 */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-xl">📌</span>
          핵심 요약
        </h3>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {report.executiveSummary}
          </p>
        </div>
      </section>

      {/* 고객 구성 */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-xl">👥</span>
          고객 구성
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {report.audienceInsight}
          </p>
        </div>
      </section>

      {/* 카테고리 분석 */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-xl">📊</span>
          카테고리 분석
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {report.categoryInsight}
          </p>
        </div>
      </section>

      {/* 행동 패턴 */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-xl">🔍</span>
          행동 패턴
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {report.behaviorInsight}
          </p>
        </div>
      </section>

      {/* 운영 전략 */}
      <section>
        <h3 className="text-lg font-semibold text-indigo-900 mb-3 flex items-center gap-2">
          <span className="text-xl">💡</span>
          운영 전략 제안
        </h3>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 p-4 rounded-lg">
          {/* 배열 형태의 추천 사항 처리 */}
          <div className="text-indigo-900 leading-relaxed font-medium">
            {Array.isArray(report.recommendation) ? (
              <ul className="list-disc list-inside space-y-2">
                {report.recommendation.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            ) : (
              <p className="whitespace-pre-line">{report.recommendation}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AIReportCard;