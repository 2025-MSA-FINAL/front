import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, Eye, Trash2 } from "lucide-react";
import axiosInstance from "../../api/axios";

export default function Popups() {
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterModeration, setFilterModeration] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // 검색어 디바운스
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // 검색 시 첫 페이지로
      fetchPopups();
    }, 500); // 0.5초 대기

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // 필터/페이지 변경 시 즉시 검색
  useEffect(() => {
    fetchPopups();
  }, [filterStatus, filterModeration, currentPage]);

  const fetchPopups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 쿼리 파라미터 구성
      const params = {
        page: currentPage - 1, // 백엔드는 보통 0부터 시작
        size: pageSize,
      };
      
      if (searchKeyword) params.keyword = searchKeyword;
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterModeration !== "all") params.moderation = filterModeration;
      
      const response = await axiosInstance.get("/api/admin/popups", { params });
      
      // 페이징 처리된 응답 구조에 맞게 수정
      setPopups(response.data.content || response.data.data || response.data);
      setTotalPages(response.data.totalPages || 1);
      setTotalElements(response.data.totalElements || response.data.total || 0);
      
    } catch (err) {
      console.error("Error fetching popups:", err);
      setError("팝업스토어 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (popId) => {
    if (!confirm("이 팝업스토어를 승인하시겠습니까?")) return;

    try {
      await axiosInstance.put(`/api/admin/popups/${popId}/approve`);
      
      // 목록 새로고침
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
      
      // 목록 새로고침
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
      
      // 목록 새로고침
      fetchPopups();
      
      alert("삭제되었습니다!");
    } catch (err) {
      console.error("Error deleting popup:", err);
      alert(err.response?.data?.message || "삭제에 실패했습니다.");
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // 검색 시 첫 페이지로
    fetchPopups();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button
            onClick={fetchPopups}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">팝업 관리</h1>
        <p className="text-gray-600">팝업스토어 승인 및 관리</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-2">전체 팝업</div>
          <div className="text-3xl font-bold text-gray-800">{totalElements}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-2">승인 대기</div>
          <div className="text-3xl font-bold text-orange-600">
            {popups.filter(p => p.popModerationStatus === null).length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-2">활성 팝업</div>
          <div className="text-3xl font-bold text-green-600">
            {popups.filter(p => p.popStatus === "active" || p.popStatus === "ONGOING").length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-2">종료 팝업</div>
          <div className="text-3xl font-bold text-gray-600">
            {popups.filter(p => p.popStatus === "ended" || p.popStatus === "ENDED").length}
          </div>
        </div>
      </div>

      {/* 필터 & 검색 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="팝업명, 위치 검색..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">전체 상태</option>
            <option value="upcoming">예정</option>
            <option value="active">활성</option>
            <option value="ended">종료</option>
          </select>

          <select
            value={filterModeration}
            onChange={(e) => setFilterModeration(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">전체 승인상태</option>
            <option value="pending">승인 대기</option>
            <option value="approved">승인됨</option>
            <option value="rejected">반려됨</option>
          </select>
        </div>

        <button
          onClick={handleSearch}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          검색
        </button>
      </div>

      {/* 팝업 테이블 */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">팝업명</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">위치</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">상태</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">승인상태</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">조회수</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">기간</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {popups.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    팝업스토어가 없습니다.
                  </td>
                </tr>
              ) : (
                popups.map((popup) => (
                  <tr key={popup.popId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{popup.popId}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{popup.popName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{popup.popLocation}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          popup.popStatus === "active" || popup.popStatus === "ONGOING"
                            ? "bg-green-100 text-green-700"
                            : popup.popStatus === "upcoming" || popup.popStatus === "UPCOMING"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {popup.popStatus === "active" || popup.popStatus === "ONGOING"
                          ? "활성"
                          : popup.popStatus === "upcoming" || popup.popStatus === "UPCOMING"
                          ? "예정"
                          : "종료"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          popup.popModerationStatus === null
                            ? "bg-orange-100 text-orange-700"
                            : popup.popModerationStatus
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {popup.popModerationStatus === null ? "대기" : popup.popModerationStatus ? "승인" : "반려"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {popup.popViewCount?.toLocaleString() || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {popup.popStartDate} ~ {popup.popEndDate}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {popup.popModerationStatus === null && (
                          <>
                            <button
                              onClick={() => handleApprove(popup.popId)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="승인"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(popup.popId)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="반려"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(popup.popId)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
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
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            총 {totalElements}개의 팝업스토어
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            
            {/* 페이지 번호들 */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}