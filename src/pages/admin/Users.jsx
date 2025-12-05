import { useState, useEffect } from "react";
import { Search, Users as UsersIcon, UserCog, CheckCircle, XCircle } from "lucide-react";
import axiosInstance from "../../api/axios";

export default function Users() {
  const [mode, setMode] = useState("user");
  const [userList, setUserList] = useState([]);
  const [managerList, setManagerList] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ACTIVE");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  // ⭐ useEffect 내부에서 직접 fetch 로직 작성
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (mode === "user") {
          const res = await axiosInstance.get("/api/admin/users", {
            params: { status: filterStatus, page: 0, size: 100 }
          });
          setUserList(res.data.content || res.data);
        } else {
          const res = await axiosInstance.get("/api/admin/managers", {
            params: { status: filterStatus, page: 0, size: 100 }
          });
          setManagerList(res.data.content || res.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        if (mode === "user") {
          setUserList([]);
        } else {
          setManagerList([]);
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [mode, filterStatus]);

  const handleStatusChange = async (userId, newStatus) => {
    const statusText = newStatus === "ACTIVE" ? "활성화" : "정지";
    if (!window.confirm(`이 유저를 ${statusText}하시겠습니까?`)) return;

    try {
      await axiosInstance.put(`/api/admin/users/${userId}/status`, null, {
        params: { status: newStatus }
      });

      if (mode === "user") {
        setUserList(userList.map(u => 
          u.userId === userId ? { ...u, userStatus: newStatus } : u
        ));
      } else {
        setManagerList(managerList.map(m => 
          m.userId === userId ? { ...m, userStatus: newStatus } : m
        ));
      }

      alert(`${statusText}되었습니다!`);
    } catch (err) {
      console.error("Error changing status:", err);
      alert("상태 변경에 실패했습니다.");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const roleText = newRole === "MANAGER" ? "매니저로 승격" : "일반 유저로 변경";
    if (!window.confirm(`이 유저를 ${roleText}하시겠습니까?`)) return;

    try {
      await axiosInstance.put(`/api/admin/users/${userId}/role`, null, {
        params: { role: newRole }
      });

      alert(`${roleText}되었습니다!`);
      
      // ⭐ 데이터 다시 불러오기
      setLoading(true);
      try {
        if (mode === "user") {
          const res = await axiosInstance.get("/api/admin/users", {
            params: { status: filterStatus, page: 0, size: 100 }
          });
          setUserList(res.data.content || res.data);
        } else {
          const res = await axiosInstance.get("/api/admin/managers", {
            params: { status: filterStatus, page: 0, size: 100 }
          });
          setManagerList(res.data.content || res.data);
        }
        setLoading(false);
      } catch (fetchErr) {
        console.error("Error refetching:", fetchErr);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error changing role:", err);
      alert("권한 변경에 실패했습니다.");
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === "user" ? "manager" : "user");
    setLoading(true);
  };

  const currentList = mode === "user" ? userList : managerList;

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
    <div className="p-8 space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">유저 관리</h2>
          <p className="text-gray-500 text-sm">
            유저/매니저 정보를 조회하고 관리할 수 있습니다.
          </p>
        </div>

        {/* 유저/매니저 토글 */}
        <button
          onClick={toggleMode}
          className={`flex items-center gap-2 px-5 py-2 rounded-full shadow-md 
            text-sm transition-all
            ${mode === "user" 
              ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white" 
              : "bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
            }
          `}
        >
          {mode === "user" ? (
            <>
              <UsersIcon className="w-4 h-4" />
              유저 목록 보기
            </>
          ) : (
            <>
              <UserCog className="w-4 h-4" />
              매니저 목록 보기
            </>
          )}
        </button>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="이름, 닉네임, 이메일 검색..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl 
                         focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
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
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {mode === "user" ? "유저 목록" : "매니저 목록"}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-50 to-cyan-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">이름</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">닉네임</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">이메일</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">상태</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">가입일</th>
                {filterStatus === "DELETED" && (
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">탈퇴일</th>
                )}
                {filterStatus !== "DELETED" && (
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">관리</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentList
                .filter(item => 
                  !searchKeyword || 
                  item.userName.includes(searchKeyword) ||
                  item.userNickname.includes(searchKeyword) ||
                  item.userEmail.includes(searchKeyword)
                )
                .map((item) => (
                <tr
                  key={item.userId}
                  className={`hover:bg-gray-50 transition-colors ${item.userStatus === "DELETED" ? 'opacity-60' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-sm">
                      {item.userId}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.userName}</td>
                  <td className="px-6 py-4 text-gray-500">@{item.userNickname}</td>
                  <td className="px-6 py-4 text-gray-500">{item.userEmail}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.userStatus === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.userStatus === "ACTIVE" ? "활성" : "탈퇴"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.createdAt}</td>
                  
                  {filterStatus === "DELETED" && (
                    <td className="px-6 py-4 text-sm text-gray-500">{item.updatedAt}</td>
                  )}
                  
                  {filterStatus !== "DELETED" && (
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusChange(
                            item.userId, 
                            item.userStatus === "ACTIVE" ? "DELETED" : "ACTIVE"
                          )}
                          className={`p-2 rounded-lg transition-colors ${
                            item.userStatus === "ACTIVE"
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={item.userStatus === "ACTIVE" ? "정지" : "활성화"}
                        >
                          {item.userStatus === "ACTIVE" ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => handleRoleChange(
                            item.userId,
                            item.userRole === "USER" ? "MANAGER" : "USER"
                          )}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={item.userRole === "USER" ? "매니저로 승격" : "유저로 변경"}
                        >
                          <UserCog className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            총 {currentList.length}명의 {mode === "user" ? "유저" : "매니저"}
          </div>
        </div>
      </div>
    </div>
  );
}