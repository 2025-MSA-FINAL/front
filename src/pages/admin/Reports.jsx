import { useState, useEffect } from "react";
import { Search, AlertTriangle, CheckCircle, XCircle, Clock, FileText, User, MessageSquare } from "lucide-react";
import axiosInstance from "../../api/axios";
import ReportDetailModal from "./ReportDetailModal";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // 모달 상태
  const [selectedReportId, setSelectedReportId] = useState(null);

  const itemsPerPage = 10;

  const categories = [
    { id: 1, name: "스팸/광고/도배" },
    { id: 2, name: "음란/성적 행위" },
    { id: 3, name: "아동·청소년 성범죄/청소년 유해" },
    { id: 4, name: "욕설/폭력/혐오/차별" },
    { id: 5, name: "불법 상품·서비스/불법 정보" },
    { id: 6, name: "개인정보 무단 수집/개인정보 노출" },
    { id: 7, name: "비정상 서비스 이용" },
    { id: 8, name: "자살·자해" },
    { id: 9, name: "사기·사칭" },
    { id: 10, name: "명예훼손·저작권 침해" },
    { id: 11, name: "불법촬영물 유통" },
    { id: 12, name: "불쾌한 표현(기타신고)" },
  ];

  // 통계는 최초 로드시에만
  useEffect(() => {
    fetchStats();
  }, []);

  // 검색어 디바운스
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  // 필터/페이지/검색어 변경 시 데이터 로드
  useEffect(() => {
    fetchReports();
  }, [filterStatus, filterCategory, filterType, sortBy, sortDir, currentPage, debouncedKeyword, searchType]);

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get("/api/admin/reports/stats");
      const data = response.data;
      const approvedCount = (data.approved || 0) + (data.resolved || 0);
      setStats({
        total: (data.pending || 0) + approvedCount + (data.rejected || 0),
        pending: data.pending || 0,
        approved: approvedCount,
        rejected: data.rejected || 0,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage - 1,
        size: itemsPerPage,
        sortBy: sortBy,
        sortDir: sortDir.toUpperCase(),
      };
      if (debouncedKeyword.trim()) {
        params.keyword = debouncedKeyword.trim();
        params.searchType = searchType;
      }
      if (filterStatus) params.status = filterStatus;
      if (filterCategory) params.categoryId = filterCategory;
      
      const response = await axiosInstance.get("/api/admin/reports", { params });
      setReports(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalElements(response.data.totalElements || 0);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("신고 목록을 불러오는데 실패했습니다.");
      setReports([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
      setIsInitialLoading(false);
    }
  };

  const handleStatusChange = async (repId, newStatus) => {
    const statusText = { approved: "승인", rejected: "반려" };
    if (!window.confirm(`이 신고를 "${statusText[newStatus]}"로 변경하시겠습니까?`)) return;
    try {
      await axiosInstance.put(`/api/admin/reports/${repId}`, null, { params: { status: newStatus } });
      alert(`${statusText[newStatus]}되었습니다!`);
      fetchStats();
      fetchReports();
    } catch (err) {
      console.error("Error updating report status:", err);
      alert(err.response?.data?.message || "상태 변경에 실패했습니다.");
    }
  };

  const handleViewDetail = (repId) => {
    setSelectedReportId(repId);
  };

  const handleCloseModal = () => {
    setSelectedReportId(null);
  };

  const handleModalStatusChange = () => {
    fetchStats();
    fetchReports();
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getDisplayStatus = (status) => {
    if (status === 'approved' || status === 'resolved') return 'approved';
    return status;
  };

  // 초기 로딩 UI
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C33DFF]"></div>
      </div>
    );
  }

  const filteredReports = filterType === "all" ? reports : reports.filter(r => r.repType === filterType);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#242424]">신고 관리</h1>
          <p className="text-sm text-[#70757A]">신고 내역 확인 및 처리</p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="전체 신고" 
          value={stats.total} 
          icon={<AlertTriangle className="w-6 h-6 text-white" />} 
          gradient="from-[#C33DFF] to-[#7E00CC]" 
        />
        <StatCard 
          title="대기중" 
          value={stats.pending} 
          icon={<Clock className="w-6 h-6 text-white" />} 
          gradient="from-[#FFC92D] to-[#FF2A7E]" 
        />
        <StatCard 
          title="승인" 
          value={stats.approved} 
          icon={<CheckCircle className="w-6 h-6 text-white" />} 
          gradient="from-[#45CFD3] to-[#C33DFF]" 
        />
        <StatCard 
          title="반려" 
          value={stats.rejected} 
          icon={<XCircle className="w-6 h-6 text-white" />} 
          gradient="from-[#FF2A7E] to-[#FFC92D]" 
        />
      </div>

      {/* 검색 & 필터 */}
      <div className="bg-white rounded-2xl shadow-xl px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* 검색 타입 선택 */}
          <select
            value={searchType}
            onChange={(e) => {
              setSearchType(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 border border-[#DDDFE2] rounded-xl 
                     focus:ring-2 focus:ring-[#C33DFF] focus:border-transparent"
          >
            <option value="all">전체 검색</option>
            <option value="reporterName">신고자명</option>
            <option value="reporterNickname">신고자 닉네임</option>
            <option value="targetName">신고 대상</option>
            <option value="categoryName">카테고리명</option>
          </select>

          {/* 검색어 입력 */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-[#70757A]" />
            <input
              type="text"
              placeholder={
                searchType === "all" ? "전체 검색..." :
                searchType === "reporterName" ? "신고자명 검색..." :
                searchType === "reporterNickname" ? "신고자 닉네임 검색..." :
                searchType === "targetName" ? "신고 대상 검색..." :
                "카테고리명 검색..."
              }
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border border-[#DDDFE2] rounded-xl 
                       focus:ring-2 focus:ring-[#C33DFF] focus:border-transparent"
            />
          </div>

          {/* 상태 필터 */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 border border-[#DDDFE2] rounded-xl 
                     focus:ring-2 focus:ring-[#C33DFF] focus:border-transparent"
          >
            <option value="">전체 상태</option>
            <option value="pending">대기</option>
            <option value="approved">승인</option>
            <option value="rejected">반려</option>
          </select>

          {/* 카테고리 필터 */}
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 border border-[#DDDFE2] rounded-xl 
                     focus:ring-2 focus:ring-[#C33DFF] focus:border-transparent"
          >
            <option value="">전체 카테고리</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* 타입 필터 */}
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 border border-[#DDDFE2] rounded-xl 
                     focus:ring-2 focus:ring-[#C33DFF] focus:border-transparent"
          >
            <option value="all">전체 타입</option>
            <option value="popup">팝업</option>
            <option value="user">유저</option>
            <option value="chat">채팅</option>
          </select>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-[#C33DFF]/10 to-[#45CFD3]/10 border-b-2 border-[#DDDFE2]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#242424] w-20 whitespace-nowrap">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#242424] w-24 whitespace-nowrap">타입</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#242424] w-48 whitespace-nowrap">신고 대상</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#242424] w-56 whitespace-nowrap">카테고리</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#242424] w-48 whitespace-nowrap">신고자</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#242424] w-24 whitespace-nowrap">상태</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#242424] w-36 whitespace-nowrap">신고일</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#242424] w-32 whitespace-nowrap">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F1F3]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-[#70757A]">
                    불러오는 중...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="text-[#FF2A7E] mb-4">{error}</div>
                    <button 
                      onClick={fetchReports} 
                      className="px-6 py-2 bg-gradient-to-r from-[#C33DFF] to-[#7E00CC] text-white rounded-xl hover:shadow-lg transition-all"
                    >
                      다시 시도
                    </button>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-[#70757A]">
                    신고가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const displayStatus = getDisplayStatus(report.repStatus);
                  return (
                    <tr key={report.repId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-center group">
                        <span
                          onClick={() => {
                            navigator.clipboard.writeText(report.repId);
                          }}
                          title="클릭하여 ID 복사"
                          className="
                            cursor-pointer
                            text-xs
                            text-gray-500
                            group-hover:text-gray-700
                            transition-colors
                            font-mono"
                        >
                          {report.repId}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          report.repType === "popup" ? "bg-gradient-to-r from-[#C33DFF]/20 to-[#7E00CC]/20 text-[#7E00CC]" :
                          report.repType === "user" ? "bg-gradient-to-r from-[#45CFD3]/20 to-[#C33DFF]/20 text-[#45CFD3]" :
                          "bg-gradient-to-r from-[#FF2A7E]/20 to-[#FFC92D]/20 text-[#FF2A7E]"
                        }`}>
                          {report.repType === "popup" ? "팝업" : report.repType === "USER" ? "유저" : "채팅"}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        {report.repType === "popup" ? (
                          <span className="text-sm text-[#C0C0C0]">-</span>
                        ) : report.repType === "user" ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[#45CFD3]" />
                            <div className="flex flex-col leading-tight">
                              <span className="text-sm text-[#242424] font-medium">{report.targetName}</span>
                              <span className="text-xs text-[#70757A]">@{report.targetNickname}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-[#FF2A7E]" />
                            <span className="text-sm text-[#242424] font-medium">{report.targetName}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#242424] font-medium">{report.categoryName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-col leading-tight">
                          <span className="text-sm text-[#242424] font-medium">{report.reporterName}</span>
                          <span className="text-xs text-[#70757A]">@{report.userNickname}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          displayStatus === "pending" ? "bg-gradient-to-r from-[#FFC92D]/20 to-[#FF2A7E]/20 text-[#FFC92D]" :
                          displayStatus === "approved" ? "bg-gradient-to-r from-[#45CFD3]/20 to-[#C33DFF]/20 text-[#45CFD3]" :
                          "bg-gradient-to-r from-[#FF2A7E]/20 to-[#FFC92D]/20 text-[#FF2A7E]"
                        }`}>
                          {displayStatus === "pending" ? "대기" : displayStatus === "approved" ? "승인" : "반려"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-[#70757A] whitespace-nowrap">{report.createdAt}</td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          {displayStatus === "pending" && (
                            <>
                              <button
                                onClick={() => handleStatusChange(report.repId, "approved")}
                                className="p-2 bg-gradient-to-r from-[#45CFD3] to-[#C33DFF] text-white rounded-lg hover:shadow-lg transition-all"
                                title="승인"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(report.repId, "rejected")}
                                className="p-2 bg-gradient-to-r from-[#FF2A7E] to-[#FFC92D] text-white rounded-lg hover:shadow-lg transition-all"
                                title="반려"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {displayStatus === "approved" && (
                            <span className="text-sm text-[#45CFD3] font-medium whitespace-nowrap">승인 완료</span>
                          )}
                          {displayStatus === "rejected" && (
                            <span className="text-sm text-[#FF2A7E] font-medium whitespace-nowrap">반려 완료</span>
                          )}
                          <button
                            onClick={() => handleViewDetail(report.repId)}
                            className="p-2 bg-gradient-to-r from-[#C33DFF]/10 to-[#7E00CC]/10 text-[#C33DFF] rounded-lg hover:from-[#C33DFF]/20 hover:to-[#7E00CC]/20 transition-all"
                            title="상세보기"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="px-6 py-4 border-t border-[#DDDFE2] flex items-center justify-between flex-wrap">
          <div className="text-sm text-[#70757A]">
            총 {totalElements.toLocaleString()}개의 신고
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-[#DDDFE2] rounded-lg hover:bg-[#F8F8F9] 
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[#424242]"
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
                      ? 'bg-gradient-to-r from-[#C33DFF] to-[#7E00CC] text-white'
                      : 'border border-[#DDDFE2] text-[#424242] hover:bg-[#F8F8F9]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-[#DDDFE2] rounded-lg hover:bg-[#F8F8F9] 
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[#424242]"
            >
              다음
            </button>
          </div>
        </div>
      </div>

      {/* 모달 */}
      {selectedReportId && (
        <ReportDetailModal
          repId={selectedReportId}
          onClose={handleCloseModal}
          onStatusChange={handleModalStatusChange}
        />
      )}
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