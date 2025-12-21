import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, Eye, Trash2, RotateCcw, FileText, Clock, AlertTriangle, X, ChevronDown } from "lucide-react";
import axiosInstance from "../../api/axios";

export default function Popups() {
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterModeration, setFilterModeration] = useState("all");
  const [filterDeleted, setFilterDeleted] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // 삭제 모달 상태
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");

  //  승인상태 드롭다운 상태
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    ended: 0,
  });
  const pageSize = 10;

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  useEffect(() => {
    fetchPopups();
  }, [filterStatus, filterModeration, filterDeleted, currentPage, debouncedKeyword]);

  //  드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    if (openDropdownId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdownId]);

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
      if (isInitialLoading) {
      setLoading(true);
      }
      setError(null);

      const params = {
        page: currentPage - 1,
        size: pageSize,
      };
      
      if (debouncedKeyword) params.keyword = debouncedKeyword;
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterModeration !== "all") params.moderation = filterModeration;
      if (filterDeleted !== "all") params.deletedFilter = filterDeleted;
      
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
      if (isInitialLoading) {
      setLoading(false);
      setIsInitialLoading(false);
      }
    }
  };

  //  승인 상태 변경 (confirm 후에만 API 호출)
  const handleModerationChange = async (popId, newStatus) => {
    setOpenDropdownId(null); // 드롭다운 닫기
    
    const statusText = 
      newStatus === null ? "대기" :
      newStatus === true ? "승인" : "거절";

    // 거절로 변경 시 사유 입력
    let reason = null;
    if (newStatus === false) {
      reason = prompt("거절 사유를 입력하세요:");
      if (!reason) {
        alert("거절 사유는 필수입니다.");
        return;
      }
    }

    //  확인 후에만 진행
    const confirmResult =  await confirm(`이 팝업스토어를 "${statusText}" 상태로 변경하시겠습니까?`);
    if (!confirmResult) {
    console.log('hi');
      return;
    }
    console.log('here');
    console.log(confirmResult);


    try {
      // 대기(NULL)로 변경
      if (newStatus === null) {
        await axiosInstance.put(`/api/admin/popups/${popId}/moderation`, {
          status: null
        });
      }
      // 승인
      else if (newStatus === true) {
        await axiosInstance.put(`/api/admin/popups/${popId}/approve`);
      }
      // 거절
      else {
        await axiosInstance.put(`/api/admin/popups/${popId}/reject`, { reason });
      }

      fetchStats();
      fetchPopups();
      alert(`"${statusText}" 상태로 변경되었습니다!`);
    } catch (err) {
      console.error("Error changing moderation status:", err);
      alert(err.response?.data?.message || "상태 변경에 실패했습니다.");
      fetchPopups();
    }
  };

  // 삭제 모달 열기
  const openDeleteModal = (popup) => {
    setDeleteTarget(popup);
    setDeleteReason("");
    setDeleteModalOpen(true);
  };

  // 삭제 모달 닫기
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
    setDeleteReason("");
  };

  // 삭제 실행
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      const params = deleteReason ? { reason: deleteReason } : {};
      await axiosInstance.delete(`/api/admin/popups/${deleteTarget.popId}`, { params });
      
      closeDeleteModal();
      fetchStats();
      fetchPopups();
      alert("삭제되었습니다!");
    } catch (err) {
      console.error("Error deleting popup:", err);
      alert(err.response?.data?.message || "삭제에 실패했습니다.");
    }
  };

  // 복구
  const handleRestore = async (popId) => {
    if (!confirm("이 팝업스토어를 복구하시겠습니까?")) return;

    try {
      await axiosInstance.put(`/api/admin/popups/${popId}/restore`);
      fetchStats();
      fetchPopups();
      alert("복구되었습니다!");
    } catch (err) {
      console.error("Error restoring popup:", err);
      alert(err.response?.data?.message || "복구에 실패했습니다.");
    }
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

      {/* 통계 카드 */}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <select
            value={filterDeleted}
            onChange={(e) => {
              setFilterDeleted(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 border border-[#DDDFE2] rounded-xl focus:ring-2 focus:ring-[#C33DFF] focus:border-transparent"
          >
            <option value="all">전체</option>
            <option value="active">활성</option>
            <option value="deleted">삭제됨</option>
          </select>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-4 py-4 border-b border-[#DDDFE2]">
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
                <th className="px-4 py-4 text-left text-sm font-semibold text-[#242424] w-36 whitespace-nowrap">승인상태</th>
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
                  <tr 
                    key={popup.popId} 
                    className={`hover:bg-[#F8F8F9] transition-colors ${
                      popup.popIsDeleted ? 'bg-red-50/50' : ''
                    }`}
                  >
                    <td className="px-4 py-4 w-16 text-center group">
                      <span
                        onClick={() => navigator.clipboard.writeText(popup.popId)}
                        title="클릭하여 ID 복사"
                        className="cursor-pointer text-xs text-gray-500 group-hover:text-gray-700 transition-colors font-mono"
                      >
                        {popup.popId}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#242424] whitespace-nowrap">
                          {popup.popName}
                        </span>
                        {popup.popIsDeleted && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                            삭제됨
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm">
                      <span className="text-sm text-[#242424] whitespace-nowrap">{popup.popLocation}</span>
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

                    {/*  승인상태 커스텀 드롭다운 버튼 */}
                    <td className="px-4 py-4 w-36">
                      {!popup.popIsDeleted ? (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(openDropdownId === popup.popId ? null : popup.popId);
                            }}
                            className="w-full px-3 py-2 rounded-lg text-sm font-medium border border-[#DDDFE2] bg-white text-[#424242] hover:border-[#C33DFF] focus:ring-2 focus:ring-[#C33DFF] focus:border-transparent transition-all cursor-pointer flex items-center justify-between"
                          >
                            <span>
                              {popup.popModerationStatus === null ? " 대기" :
                               popup.popModerationStatus ? " 승인" : " 반려"}
                            </span>
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          
                          {/* 드롭다운 메뉴 */}
                          {openDropdownId === popup.popId && (
                            <div className="absolute z-50 mt-1 w-full bg-white border border-[#DDDFE2] rounded-lg shadow-lg overflow-hidden">
                              <button
                                onClick={() => handleModerationChange(popup.popId, null)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-[#F8F8F9] transition-colors flex items-center gap-2"
                              >
                                 대기
                              </button>
                              <button
                                onClick={() => handleModerationChange(popup.popId, true)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-[#F8F8F9] transition-colors flex items-center gap-2"
                              >
                                 승인
                              </button>
                              <button
                                onClick={() => handleModerationChange(popup.popId, false)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-[#F8F8F9] transition-colors flex items-center gap-2"
                              >
                                 반려
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
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
                        {popup.popIsDeleted ? (
                          <button
                            onClick={() => handleRestore(popup.popId)}
                            className="p-1.5 bg-gradient-to-r from-[#45CFD3] to-[#C33DFF] text-white rounded-lg hover:shadow-lg transition-all"
                            title="복구"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => openDeleteModal(popup)}
                            className="p-1.5 bg-gradient-to-r from-[#FF2A7E]/10 to-[#FFC92D]/10 text-[#FF2A7E] rounded-lg hover:from-[#FF2A7E]/20 hover:to-[#FFC92D]/20 transition-all"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
            {(filterStatus !== "all" || filterModeration !== "all" || filterDeleted !== "active" || searchKeyword) && (
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

      {/* 삭제 모달 */}
      {deleteModalOpen && (
        <DeleteModal
          popup={deleteTarget}
          reason={deleteReason}
          setReason={setDeleteReason}
          onConfirm={handleDeleteConfirm}
          onClose={closeDeleteModal}
        />
      )}
    </div>
  );
}

// 삭제 모달 컴포넌트
function DeleteModal({ popup, reason, setReason, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDDFE2]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-[#FF2A7E]/10 to-[#FFC92D]/10 rounded-lg">
              <Trash2 className="w-5 h-5 text-[#FF2A7E]" />
            </div>
            <h3 className="text-xl font-bold text-[#242424]">팝업스토어 삭제</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#70757A]" />
          </button>
        </div>

        {/* 내용 */}
        <div className="px-6 py-6 space-y-4">
          {/* 경고 메시지 */}
          <div className="bg-gradient-to-r from-[#FF2A7E]/5 to-[#FFC92D]/5 border border-[#FF2A7E]/20 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-[#FF2A7E] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-[#424242]">
                <p className="font-semibold mb-2">이 팝업스토어를 삭제하시겠습니까?</p>
                <p className="text-[#70757A] leading-relaxed">
                  이 작업은 관리자 권한으로 수행되는 삭제 처리입니다. 삭제 전 아래 내용을 확인해 주세요.
                </p>
              </div>
            </div>
          </div>

          {/* 팝업 정보 */}
          <div className="bg-[#F8F8F9] rounded-xl p-4">
            <p className="text-xs text-[#70757A] mb-1">삭제 대상</p>
            <p className="font-semibold text-[#242424]">{popup?.popName}</p>
            <p className="text-sm text-[#70757A] mt-1">{popup?.popLocation}</p>
          </div>

          {/* 주의사항 */}
          <ul className="text-sm text-[#70757A] space-y-2 pl-5">
            <li className="list-disc">사용자에게 즉시 노출이 중단됩니다.</li>
            <li className="list-disc">예약, 신고, 채팅 등 관련 이력 데이터는 유지됩니다.</li>
            <li className="list-disc">삭제된 팝업은 관리자 화면에서만 조회 가능합니다.</li>
          </ul>

          {/* 삭제 사유 입력 */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#242424]">
              삭제 사유 <span className="text-[#70757A] font-normal">(선택 사항)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="삭제 사유를 입력하세요 (선택 사항)"
              className="w-full px-4 py-3 border border-[#DDDFE2] rounded-xl focus:ring-2 focus:ring-[#FF2A7E] focus:border-transparent transition-all resize-none"
              rows="3"
            />
          </div>

          {/* 경고 문구 */}
          <p className="text-xs text-[#FF2A7E] font-semibold">
            ※ 삭제 처리 후에는 '전체' 또는 '삭제됨' 필터에서만 조회 가능합니다.
          </p>
        </div>

        {/* 버튼 */}
        <div className="px-6 py-4 border-t border-[#DDDFE2] flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-[#DDDFE2] text-[#424242] rounded-xl hover:bg-[#F8F8F9] transition-all font-semibold"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-gradient-to-r from-[#FF2A7E] to-[#FFC92D] text-white rounded-xl hover:shadow-lg transition-all font-semibold"
          >
            삭제
          </button>
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