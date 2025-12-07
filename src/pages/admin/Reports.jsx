import { useState, useEffect } from "react";
import { Search, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import axiosInstance from "../../api/axios";

// Mock 데이터
const MOCK_REPORTS = [
  { repId: 1, repType: "popup", repTargetId: 1, repStatus: "pending", categoryName: "부적절한 행동", userNickname: "cheolsu", createdAt: "2024-11-25", targetName: "BTS 팝업스토어" },
  { repId: 2, repType: "popup", repTargetId: 2, repStatus: "pending", categoryName: "스팸/광고", userNickname: "younghee", createdAt: "2024-11-26", targetName: "디즈니 팝업" },
  { repId: 3, repType: "user", repTargetId: 2, repStatus: "approved", categoryName: "욕설/비방", userNickname: "manager1", createdAt: "2024-11-18", targetName: "이영희" },
  { repId: 4, repType: "user", repTargetId: 1, repStatus: "resolved", categoryName: "부적절한 행동", userNickname: "user1", createdAt: "2024-11-23", targetName: "김철수" },
  { repId: 5, repType: "popup", repTargetId: 1, repStatus: "rejected", categoryName: "허위 정보", userNickname: "today", createdAt: "2024-11-27", targetName: "BTS 팝업스토어" },
];

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [useMockData] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [filterStatus, filterType]);

  const fetchReports = async () => {
    if (useMockData) {
      setTimeout(() => {
        let filtered = [...MOCK_REPORTS];
        
        if (filterStatus !== "all") {
          filtered = filtered.filter(r => r.repStatus === filterStatus);
        }
        
        if (filterType !== "all") {
          filtered = filtered.filter(r => r.repType === filterType);
        }
        
        if (searchKeyword) {
          filtered = filtered.filter(r => 
            r.categoryName.includes(searchKeyword) || 
            r.userNickname.includes(searchKeyword) ||
            r.targetName.includes(searchKeyword)
          );
        }
        
        setReports(filtered);
        setLoading(false);
      }, 300);
    }
  };

  const handleStatusChange = async (repId, newStatus) => {
    const statusText = {
      approved: "승인",
      resolved: "처리완료",
      rejected: "반려"
    };

    if (!confirm(`이 신고를 "${statusText[newStatus]}"로 변경하시겠습니까?`)) return;

    try {
      if (!useMockData) {
        await axiosInstance.put(`/api/admin/reports/${repId}`, null, {
          params: { status: newStatus }
        });
      }
      
      setReports(reports.map(r => 
        r.repId === repId ? { ...r, repStatus: newStatus } : r
      ));
      
      alert(`${statusText[newStatus]}되었습니다!`);
    } catch (err) {
      console.error("Error updating report status:", err);
      alert("상태 변경에 실패했습니다.");
    }
  };

  const handleSearch = () => {
    fetchReports();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 통계 계산
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.repStatus === "pending").length,
    approved: reports.filter(r => r.repStatus === "approved").length,
    resolved: reports.filter(r => r.repStatus === "resolved").length,
    rejected: reports.filter(r => r.repStatus === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">신고 관리</h1>
        <p className="text-gray-600">신고 내역 확인 및 처리</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-2">전체 신고</div>
          <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-2 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            대기 중
          </div>
          <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-2 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            승인됨
          </div>
          <div className="text-3xl font-bold text-blue-600">{stats.approved}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-2">처리완료</div>
          <div className="text-3xl font-bold text-green-600">{stats.resolved}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-2 flex items-center gap-1">
            <XCircle className="w-4 h-4" />
            반려됨
          </div>
          <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
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
                placeholder="카테고리, 신고자, 대상 검색..."
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
            <option value="pending">대기 중</option>
            <option value="approved">승인됨</option>
            <option value="resolved">처리완료</option>
            <option value="rejected">반려됨</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">전체 타입</option>
            <option value="popup">팝업</option>
            <option value="user">유저</option>
          </select>
        </div>

        <button
          onClick={handleSearch}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          검색
        </button>
      </div>

      {/* 신고 테이블 */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">타입</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">카테고리</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">신고자</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">신고 대상</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">상태</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">신고일</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.repId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{report.repId}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        report.repType === "popup"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {report.repType === "popup" ? "팝업" : "유저"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-900">{report.categoryName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    @{report.userNickname}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {report.targetName}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        report.repStatus === "pending"
                          ? "bg-orange-100 text-orange-700"
                          : report.repStatus === "approved"
                          ? "bg-blue-100 text-blue-700"
                          : report.repStatus === "resolved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {report.repStatus === "pending" ? "대기" 
                        : report.repStatus === "approved" ? "승인"
                        : report.repStatus === "resolved" ? "처리완료"
                        : "반려"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {report.createdAt}
                  </td>
                  <td className="px-6 py-4">
                    {report.repStatus === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusChange(report.repId, "approved")}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="승인"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(report.repId, "rejected")}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="반려"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {report.repStatus === "approved" && (
                      <button
                        onClick={() => handleStatusChange(report.repId, "resolved")}
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        처리완료
                      </button>
                    )}
                    {(report.repStatus === "resolved" || report.repStatus === "rejected") && (
                      <span className="text-sm text-gray-500">완료됨</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            총 {reports.length}개의 신고
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              이전
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              1
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}