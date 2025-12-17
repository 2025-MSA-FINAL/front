import { useState } from 'react';
import { generateMonthlyReport } from '../../api/adminAIReportApi';

export const useAIReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await generateMonthlyReport();
      setReport(data);
    } catch (err) {
      setError(err.response?.data?.message || 'AI 리포트 생성에 실패했습니다.');
      console.error('AI 리포트 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    report,
    loading,
    error,
    fetchReport,
  };
};