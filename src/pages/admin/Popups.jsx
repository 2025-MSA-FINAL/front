import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, Eye, Trash2, FileText, Clock, AlertTriangle } from "lucide-react";
import axiosInstance from "../../api/axios";

export default function Popups() {
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);  // 초기 로딩 상태
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");  // debounced 검색어
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterModeration, setFilterModeration] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    ended: 0,
  });
  const pageSize = 10;

  // 통계는 최초 로드시에만 가져오기 (필터 무관)
  useEffect(() => {
    fetchStats();
  }, []);

  // 검색어 디바운스
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // 필터/페이지/debounced 검색어 변경 시 데이터 로드
  useEffect(() => {
    fetchPopups();
  }, [filterStatus, filterModeration, currentPage, debouncedKeyword]);

  // 전체 통계 가져오기 (필터 무관)
  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get("/api/admin/popups/stats");
      setStats({
        total: response.data.total || 0,
        pending: response.data.pending || 0,
        active: response.data.active || 0,
        ended: response.data.ended || 0,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      setStats({ total: 0, pending: 0, active: 0, ended: 0 });
    }
  };

  const fetchPopups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage - 1,
        size: pageSize,
      };
      
      if (debouncedKeyword) params.keyword = debouncedKeyword;
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterModeration !== "all") params.moderation = filterModeration;
      
      const response = await axiosInstance.get("/api/admin/popups", { params });
      
      setPopups(response.data.content || response.data.data || response.data);
      setTotalPages(response.data.totalPages || 1);
      setTotalElements(response.data.totalElements || response.data.total || 0);
      
    } catch (err) {
      console.error("Error fetching popups:", err);
      setError("팝업스토어 목록을 불러오는데 실패했습니다.");
      setPopups([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
      setIsInitialLoading(false);
    }
  };

  const handleApprove = async (popId) => {
    if (!confirm("이 팝업스토어를 승인하시겠습니까?")) return;

    try {
      await axiosInstance.put(`/api/admin/popups/${popId}/approve`);
      fetchStats();
      fetchPopups();
      alert("승인되었습니다!");
    } catch (err) {
      console.error("Error approving popup:", err);
      alert(err.response?.data?.message || "승인에 실패했습니다.");
    }
  };

  const handleReject = async (popId) => {
    if (!confirm("이 팝업스토어를 반려하시겠습니까?")) return;

    try {
      await axiosInstance.put(`/api/admin/popups/${popId}/reject`);
      fetchStats();
      fetchPopups();
      alert("반려되었습니다!");
    } catch (err) {
      console.error("Error rejecting popup:", err);
      alert(err.response?.data?.message || "반려에 실패했습니다.");
    }
  };

  const handleDelete = async (popId) => {
    if (!confirm("이 팝업스토어를 삭제하시겠습니까? (복구 불가능)")) return;

    try {
      await axiosInstance.delete(`/api/admin/popups/${popId}`);
      fetchStats();
      fetchPopups();
      alert("삭제되었습니다!");
    } catch (err) {
      console.error("Error deleting popup:", err);
      alert(err.response?.data?.message || "삭제에 실패했습니다.");
    }
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 초기 로딩 UI
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C33DFF]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#242424]">팝업 관리</h1>
          <p className="text-sm text-[#70757A]">팝업스토어 승인 및 관리</p>
        </div>
      </div>

      {/* 통계 카드 - 필터와 무관한 전체 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="전체 팝업" 
          value={stats.total} 
          icon={<FileText className="w-6 h-6 text-white" />} 
          gradient="from-[#C33DFF] to-[#7E00CC]" 
        />
        <StatCard 
          title="승인 대기" 
          value={stats.pending} 
          icon={<Clock className="w-6 h-6 text-white" />} 
          gradient="from-[#FFC92D] to-[#FF2A7E]" 
        />
        <StatCard 
          title="활성 팝업" 
          value={stats.active} 
          icon={<CheckCircle className="w-6 h-6 text-white" />} 
          gradient="from-[#45CFD3] to-[#C33DFF]" 
        />
        <StatCard 
          title="종료된 팝업" 
          value={stats.ended} 
          icon={<XCircle className="w-6 h-6 text-white" />} 
          gradient="from-[#FF2A7E] to-[#FFC92D]" 
        />
      </div>

      {/* 검색/필터 */}
      <div className="bg-white rounded-2xl shadow-xl px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-[#70757A]" />
            <input
              type="text"
              placeholder="팝업명, 위치 검색..."
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border border-[#DDDFE2] rounded-xl focus:ring-2 focus:ring-[#C33DFF] focus:border-transparent transition-all"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 border border-[#DDDFE2] rounded-xl focus:ring-2 focus:ring-[#C33DFF] focus:border-transparent"
          >
            <option value="all">전체 상태</option>
            <option value="ONGOING">활성</option>
            <option value="UPCOMING">예정</option>
            <option value="ENDED">종료</option>
          </select>
          
          <select
            value={filterModeration}
            onChange={(e) => {
              setFilterModeration(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 border border-[#DDDFE2] rounded-xl focus:ring-2 focus:ring-[#C33DFF] focus:border-transparent"
          >
            <option value="all">전체 승인상태</option>
            <option value="approved">승인</option>
            <option value="rejected">반려</option>
            <option value="pending">대기</option>
          </select>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#DDDFE2]">
          <h3 className="text-xl font-bold text-[#242424]">팝업스토어 목록</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-[#C33DFF]/10 to-[#45CFD3]/10 border-b-2 border-[#DDDFE2]">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-semibold text-[#242424] w-16 whitespace-nowrap">ID</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-[#242424] min-w-[150px] whitespace-nowrap">팝업명</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-[#242424] min-w-[150px] whitespace-nowrap">위치</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-[#242424] w-24 whitespace-nowrap">상태</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-[#242424] w-28 whitespace-nowrap">승인상태</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-[#242424] w-20 whitespace-nowrap">조회수</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-[#242424] w-[220px] whitespace-nowrap">기간</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-[#242424] w-24 whitespace-nowrap">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F1F3]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-[#70757A]">
                    불러오는 중...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center">
                    <div className="text-[#FF2A7E] mb-4">{error}</div>
                    <button 
                      onClick={fetchPopups} 
                      className="px-6 py-2 bg-gradient-to-r from-[#C33DFF] to-[#7E00CC] text-white rounded-xl hover:shadow-lg transition-all"
                    >
                      다시 시도
                    </button>
                  </td>
                </tr>
              ) : popups.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-[#70757A]">
                    팝업스토어가 없습니다.
                  </td>
                </tr>
              ) : (
                popups.map((popup) => (
                  <tr key={popup.popId} className="hover:bg-[#F8F8F9] transition-colors">
                     <td className="px-4 py-4 w-16 text-center group">
                  <span
                    onClick={() => navigator.clipboard.writeText(popup.popId)}
                    title="클릭하여 ID 복사"
                    className="
                      cursor-pointer
                      text-xs
                      text-gray-500
                      group-hover:text-gray-700
                      transition-colors
                      font-mono
                    "
                  >
                    {popup.popId}
                  </span>
                </td>
                  <td className="px-4 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#242424] whitespace-nowrap">{popup.popName}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#242424] whitespace-nowrap">{popup.popLocation}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 w-24">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          popup.popStatus === "active" || popup.popStatus === "ONGOING"
                            ? "bg-gradient-to-r from-[#45CFD3]/20 to-[#C33DFF]/20 text-[#45CFD3]"
                            : popup.popStatus === "upcoming" || popup.popStatus === "UPCOMING"
                            ? "bg-gradient-to-r from-[#C33DFF]/20 to-[#7E00CC]/20 text-[#7E00CC]"
                            : "bg-gradient-to-r from-[#FF2A7E]/20 to-[#FFC92D]/20 text-[#FF2A7E]"
                        }`}
                      >
                        {popup.popStatus === "active" || popup.popStatus === "ONGOING"
                          ? "활성"
                          : popup.popStatus === "upcoming" || popup.popStatus === "UPCOMING"
                          ? "예정"
                          : "종료"}
                      </span>
                    </td>
                    <td className="px-4 py-4 w-28">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          popup.popModerationStatus === null
                            ? "bg-gradient-to-r from-[#FFC92D]/20 to-[#FF2A7E]/20 text-[#FFC92D]"
                            : popup.popModerationStatus
                            ? "bg-gradient-to-r from-[#45CFD3]/20 to-[#C33DFF]/20 text-[#45CFD3]"
                            : "bg-gradient-to-r from-[#FF2A7E]/20 to-[#FFC92D]/20 text-[#FF2A7E]"
                        }`}
                      >
                        {popup.popModerationStatus === null ? "대기" : popup.popModerationStatus ? "승인" : "반려"}
                      </span>
                    </td>
                    <td className="px-4 py-4 w-20">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-[#C33DFF]" />
                        <span className="text-sm text-[#242424] font-medium whitespace-nowrap">
                          {popup.popViewCount?.toLocaleString() || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 w-[220px] text-xs text-[#70757A] whitespace-nowrap">
                      {popup.popStartDate} ~ {popup.popEndDate}
                    </td>
                    <td className="px-4 py-4 w-24">
                      <div className="flex gap-1">
                        {popup.popModerationStatus === null && (
                          <>
                            <button
                              onClick={() => handleApprove(popup.popId)}
                              className="p-1.5 bg-gradient-to-r from-[#45CFD3] to-[#C33DFF] text-white rounded-lg hover:shadow-lg transition-all"
                              title="승인"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(popup.popId)}
                              className="p-1.5 bg-gradient-to-r from-[#FF2A7E] to-[#FFC92D] text-white rounded-lg hover:shadow-lg transition-all"
                              title="반려"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {popup.popModerationStatus !== null && (
                          <span className="text-sm text-[#70757A] font-medium whitespace-nowrap">
                            {popup.popModerationStatus ? "승인 완료" : "반려 완료"}
                          </span>
                        )}
                        <button
                          onClick={() => handleDelete(popup.popId)}
                          className="p-1.5 bg-gradient-to-r from-[#C33DFF]/10 to-[#7E00CC]/10 text-[#C33DFF] rounded-lg hover:from-[#C33DFF]/20 hover:to-[#7E00CC]/20 transition-all"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="px-6 py-4 border-t border-[#DDDFE2] flex items-center justify-between flex-wrap">
          <div className="text-sm text-[#70757A]">
            총 {totalElements.toLocaleString()}개의 팝업스토어
            {(filterStatus !== "all" || filterModeration !== "all" || searchKeyword) && (
              <span className="text-[#C33DFF] ml-2 font-semibold">
                (전체 {stats.total.toLocaleString()}개 중)
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-[#DDDFE2] rounded-lg hover:bg-[#F8F8F9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[#424242]"
            >
              이전
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;
              
              if (pageNum < 1 || pageNum > totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === pageNum
                      ? "bg-gradient-to-r from-[#C33DFF] to-[#7E00CC] text-white"
                      : "border border-[#DDDFE2] text-[#424242] hover:bg-[#F8F8F9]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-[#DDDFE2] rounded-lg hover:bg-[#F8F8F9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[#424242]"
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, gradient }) {
  return (
    <div className={`rounded-2xl shadow-xl p-6 text-white bg-gradient-to-br ${gradient} flex flex-col justify-between min-h-[120px]`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-medium text-white/90">{title}</div>
        <div className="bg-white/20 p-3 rounded-xl">{icon}</div>
      </div>
      <div className="text-3xl font-extrabold">{value?.toLocaleString()}</div>
    </div>
  );
}