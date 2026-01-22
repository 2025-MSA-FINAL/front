import axios from './axios'; 
const API_BASE_URL = '/api/admin/ai-reports'; 

/**
 * @returns {Promise<Object>} AdminAIReportDto와 매핑되는 리포트 데이터
 */
export const generateMonthlyReport = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/monthly`);
    return response.data; 

  } catch (error) {
    console.error('generateMonthlyReport API 호출 실패:', error);
    throw error; 
  }
};