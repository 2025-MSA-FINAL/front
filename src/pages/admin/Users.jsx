import { useState, useEffect } from "react";
import { Search, Users as UsersIcon, UserCog, CheckCircle, XCircle } from "lucide-react";
import axiosInstance from "../../api/axios";

const pageSize = 10;

export default function Users() {
  const [mode, setMode] = useState("user");
  const [userList, setUserList] = useState([]);
  const [managerList, setManagerList] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ACTIVE");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // 모드에 따른 현재 리스트
  const currentList = mode === "user" ? userList : managerList;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const params = { 
          status: filterStatus,
          keyword: searchKeyword,
          page: currentPage - 1,
          size: pageSize,
        };

        let response;
        if (mode === "user") {
          response = await axiosInstance.get("/api/admin/users", { params });
          setUserList(response.data.content || []);
        } else {
          response = await axiosInstance.get("/api/admin/managers", { params });
          setManagerList(response.data.content || []);
        }

        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || response.data.total || 0);

      } catch (err) {
        console.error("Error fetching data:", err);

        if (mode === "user") setUserList([]);
        else setManagerList([]);

        setTotalPages(1);
        setTotalElements(0);

      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mode, filterStatus, currentPage, searchKeyword]);

  // 페이지 변경
  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // 필터 및 검색 변경
  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  // 유저 상태 변경
  const handleStatusChange = async (userId, newStatus) => {
    const statusText = newStatus === "ACTIVE" ? "활성화" : "정지";
    if (!window.confirm(`이 회원을 ${statusText}하시겠습니까?`)) return;

    try {
      await axiosInstance.put(`/api/admin/users/${userId}/status`, null, {
        params: { status: newStatus }
      });

      alert(`${statusText}되었습니다!`);
      setCurrentPage(1);

    } catch (err) {
      console.error("Error changing status:", err);
      alert("상태 변경에 실패했습니다.");
    }
  };

  // 역할 변경
  const handleRoleChange = async (userId, newRole) => {
    const roleText = newRole === "MANAGER" ? "매니저로 승격" : "일반 회원으로 변경";
    if (!window.confirm(`이 회원을 ${roleText}하시겠습니까?`)) return;

    try {
      await axiosInstance.put(`/api/admin/users/${userId}/role`, null, {
        params: { role: newRole }
      });

      alert(`${roleText}되었습니다!`);
      setCurrentPage(1);

    } catch (err) {
      console.error("Error changing role:", err);
      alert("권한 변경에 실패했습니다.");
    }
  };

  // 로딩 UI
  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-[70vh] text-gray-500">
          로딩 중...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">유저 관리</h2>
          <p className="text-gray-500 text-sm">회원/매니저 정보를 조회하고 관리할 수 있습니다.</p>
        </div>

        {/* 유저/매니저 토글 */}
        <button
          onClick={() => setMode(mode === "user" ? "manager" : "user")}
          className="flex items-center gap-2 px-5 py-2 rounded-full shadow-md text-sm 
                     bg-gradient-to-r from-purple-600 to-purple-800 text-white"
        >
          {mode === "user" ? (
            <>
              <UsersIcon className="w-4 h-4" />
              매니저 목록 보기
            </>
          ) : (
            <>
              <UserCog className="w-4 h-4" />
              회원 목록 보기
            </>
          )}
        </button>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-2xl shadow-xl px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="이름, 닉네임, 이메일 검색..."
                value={searchKeyword}
                onChange={(e) => handleFilterChange(setSearchKeyword, e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl 
                       focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => handleFilterChange(setFilterStatus, e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl 
                     focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          >
            <option value="ALL">전체 상태</option>
            <option value="ACTIVE">활성</option>
            <option value="DELETED">탈퇴</option>
          </select>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {mode === "user" ? "회원 목록" : "매니저 목록"}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gradient-to-r from-purple-50 to-cyan-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">이름</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">닉네임</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">이메일</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">상태</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">가입일</th>
                {filterStatus === "DELETED" && (
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">탈퇴일</th>
                )}
                {filterStatus !== "DELETED" && (
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">관리</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
  {currentList.length === 0 ? (
    <tr>
      <td
        colSpan={filterStatus === "DELETED" ? 7 : 6}
        className="px-4 py-12 text-center text-gray-500"
      >
        조회된 목록이 없습니다.
      </td>
    </tr>
  ) : (
    currentList.map((item) => (
      <tr key={item.userId} className="hover:bg-gray-50 transition-colors">

        {/* ID 원형 뱃지 */}
        <td className="px-4 py-3">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center 
                            bg-gradient-to-br from-purple-600 to-purple-800 text-white 
                            text-sm font-bold shadow-sm">
              {item.userId}
            </div>
          </div>
        </td>

        {/* 이름 */}
        <td className="px-4 py-3 text-sm whitespace-nowrap max-w-[120px] truncate">
          {item.userName}
        </td>

        {/* 닉네임 */}
        <td className="px-4 py-3 text-sm whitespace-nowrap max-w-[120px] truncate">
          @{item.userNickname}
        </td>

        {/* 이메일 */}
        <td className="px-4 py-3 text-sm whitespace-nowrap max-w-[160px] truncate">
          {item.userEmail}
        </td>

        {/* 상태 뱃지 — 절대 안 잘리게 */}
        <td className="px-4 py-3 whitespace-nowrap">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap
              ${item.userStatus === "ACTIVE"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
              }`}
          >
            {item.userStatus === "ACTIVE" ? "활성" : "탈퇴"}
          </span>
        </td>

        {/* 가입일 */}
        <td className="px-4 py-3 text-sm whitespace-nowrap">
          {item.createdAt}
        </td>

        {/* 탈퇴일 */}
        {filterStatus === "DELETED" && (
          <td className="px-4 py-3 text-sm whitespace-nowrap">
            {item.updatedAt}
          </td>
        )}

        {/* 관리 버튼 */}
        {filterStatus !== "DELETED" && (
          <td className="px-4 py-3 whitespace-nowrap">
            <div className="flex gap-2">
              <button
                onClick={() =>
                  handleStatusChange(
                    item.userId,
                    item.userStatus === "ACTIVE" ? "DELETED" : "ACTIVE"
                  )
                }
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                {item.userStatus === "ACTIVE" ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() =>
                  handleRoleChange(
                    item.userId,
                    item.userRole === "USER" ? "MANAGER" : "USER"
                  )
                }
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <UserCog className="w-4 h-4" />
              </button>
            </div>
          </td>
        )}
      </tr>
    ))
  )}
</tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-between flex-wrap">
          <div className="text-sm text-gray-500">
            총 {totalElements.toLocaleString()}명 
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
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
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === pageNum
                      ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white"
                      : "border border-gray-300"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
