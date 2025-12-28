import { useState, useEffect } from "react";
import { Search, MessageSquare, Users, Trash2, AlertTriangle, CheckSquare, Square, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";

export default function ChatRooms() {
  const navigate = useNavigate();
  const [chatRooms, setChatRooms] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState(""); 
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [filterDeleted, setFilterDeleted] = useState("active");
  const [sortBy, setSortBy] = useState("createdAt");
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  
  const itemsPerPage = 10;

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
    fetchChatRooms();
  }, [filterDeleted, sortBy, currentPage, searchType, debouncedKeyword]);

  const fetchChatRooms = async () => {
    try {
      if (isInitialLoading) {
        setLoading(true);
      }
      setError(null);
      
      const params = {
        page: currentPage - 1, 
        size: itemsPerPage,
        sort: sortBy,
      };
      
      if (debouncedKeyword.trim()) {
        params.keyword = debouncedKeyword.trim();
        params.searchType = searchType;
      }
      
      if (filterDeleted === "active") {
        params.isDeleted = false;
      } else if (filterDeleted === "deleted") {
        params.isDeleted = true;
      }
      
      const response = await axiosInstance.get("/api/admin/chatrooms", { params });
      
      setChatRooms(response.data.content || response.data.data || response.data);
      setTotalPages(response.data.totalPages || 1);
      setTotalElements(response.data.totalElements || response.data.total || 0);
      
    } catch (err) {
      console.error("Error fetching chatrooms:", err);
      setError("채팅방 목록을 불러오는데 실패했습니다.");
      setChatRooms([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      if (isInitialLoading) {
        setLoading(false);
        setIsInitialLoading(false);
      }
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get("/api/admin/chatrooms/stats");
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setStats({
        totalChatRooms: 0,
        activeChatRooms: 0,
        inactiveChatRooms: 0,
        reportedChatRooms: 0,
      });
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms(chatRooms.map(r => r.chatId));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectRoom = (chatId) => {
    if (selectedRooms.includes(chatId)) {
      setSelectedRooms(selectedRooms.filter(id => id !== chatId));
    } else {
      setSelectedRooms([...selectedRooms, chatId]);
    }
  };

  const handleDelete = async (chatId) => {
    try {
      await axiosInstance.delete(`/api/admin/chatrooms/${chatId}`);
      
      alert("채팅방이 삭제되었습니다!");
      fetchStats();
      fetchChatRooms();
    } catch (err) {
      console.error("Error deleting chatroom:", err);
      alert(err.response?.data?.message || "삭제에 실패했습니다.");
      fetchChatRooms(); 
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRooms.length === 0) {
      alert("삭제할 채팅방을 선택해주세요.");
      return;
    }

    if (!window.confirm(`선택한 ${selectedRooms.length}개의 채팅방을 삭제하시겠습니까?`)) return;

    try {
      await Promise.all(
        selectedRooms.map(chatId => 
          axiosInstance.delete(`/api/admin/chatrooms/${chatId}`)
        )
      );
      
      setSelectedRooms([]);
      setSelectAll(false);
      alert("선택한 채팅방이 삭제되었습니다!");
      fetchStats();
      fetchChatRooms();
    } catch (err) {
      console.error("Error bulk deleting:", err);
      alert(err.response?.data?.message || "일괄 삭제에 실패했습니다.");
      fetchChatRooms();
    }
  };

  const handleViewReports = (chatId, chatName) => {
    navigate(`/admin/reports?type=chat&targetId=${chatId}&targetName=${encodeURIComponent(chatName)}`);
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 날짜 포맷 함수 추가
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    // ISO 형식(YYYY-MM-DDTHH:mm:ss)을 일반 형식으로 변환
    return dateString.replace('T', ' ');
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
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#242424]">채팅방 관리</h1>
          <p className="text-sm text-[#70757A]">팝업 채팅방 목록 및 관리</p>
        </div>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            title="전체 채팅방" 
            value={stats.totalChatRooms} 
            icon={<MessageSquare className="w-6 h-6 text-white" />} 
            gradient="from-[#C33DFF] to-[#7E00CC]" 
          />
          <StatCard 
            title="활성 채팅방" 
            value={stats.activeChatRooms} 
            icon={<Users className="w-6 h-6 text-white" />} 
            gradient="from-[#45CFD3] to-[#C33DFF]" 
          />
          <StatCard 
            title="비활성 채팅방" 
            value={stats.inactiveChatRooms} 
            icon={<MessageSquare className="w-6 h-6 text-white" />} 
            gradient="from-[#FF2A7E] to-[#FFC92D]" 
          />
          <StatCard 
            title="신고된 채팅방" 
            value={stats.reportedChatRooms} 
            icon={<AlertTriangle className="w-6 h-6 text-white" />} 
            gradient="from-[#FFC92D] to-[#FF2A7E]" 
          />
        </div>
      )}

      {/* 검색 & 필터 */}
      <div className="bg-white rounded-2xl shadow-xl px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={searchType}
            onChange={(e) => {
              setSearchType(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 border border-[#DDDFE2] rounded-xl focus:ring-2 focus:ring-[#C33DFF] focus:border-transparent"
          >
            <option value="all">전체 검색</option>
            <option value="chatName">채팅방명</option>
            <option value="popupName">팝업명</option>
            <option value="hostName">방장명</option>
          </select>

          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-[#70757A]" />
            <input
              type="text"
              placeholder={
                searchType === "all" ? "채팅방, 팝업, 방장 검색..." :
                searchType === "chatName" ? "채팅방명 검색..." :
                searchType === "popupName" ? "팝업명 검색..." :
                "방장명 검색..."
              }
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border border-[#DDDFE2] rounded-xl focus:ring-2 focus:ring-[#C33DFF] focus:border-transparent"
            />
          </div>

          <select
            value={filterDeleted}
            onChange={(e) => {
              setFilterDeleted(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 border border-[#DDDFE2] rounded-xl focus:ring-2 focus:ring-[#C33DFF] focus:border-transparent"
          >
            <option value="all">전체 상태</option>
            <option value="active">활성</option>
            <option value="deleted">삭제됨</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 border border-[#DDDFE2] rounded-xl focus:ring-2 focus:ring-[#C33DFF] focus:border-transparent"
          >
            <option value="createdAt">생성일 순</option>
            <option value="participantCount">참여자 순</option>
            <option value="reportCount">신고 순</option>
          </select>
        </div>

        <div className="mt-4 flex justify-end">
          {selectedRooms.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-gradient-to-r from-[#FF2A7E] to-[#FFC92D] 
                       text-white rounded-xl hover:shadow-lg 
                       transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              선택 삭제 ({selectedRooms.length})
            </button>
          )}
        </div>
      </div>

      {/* 채팅방 테이블 */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-[#C33DFF]/10 to-[#45CFD3]/10 border-b-2 border-[#DDDFE2]">
              <tr>
                <th className="px-6 py-4 text-left whitespace-nowrap">
                  <button onClick={handleSelectAll} className="text-[#C33DFF] hover:text-[#7E00CC]">
                    {selectAll ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#242424] whitespace-nowrap">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#242424] whitespace-nowrap">팝업스토어 이름</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#242424] whitespace-nowrap">채팅방 이름</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#242424] whitespace-nowrap">방장</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#242424] whitespace-nowrap">인원수</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#242424] whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-[#FF2A7E]" />
                    신고
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#242424] whitespace-nowrap">생성일</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#242424] whitespace-nowrap">삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F1F3]">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-[#70757A]">
                    불러오는 중...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="text-[#FF2A7E] mb-4">{error}</div>
                    <button
                      onClick={fetchChatRooms}
                      className="px-6 py-2 bg-gradient-to-r from-[#C33DFF] to-[#7E00CC] text-white rounded-xl hover:shadow-lg transition-all"
                    >
                      다시 시도
                    </button>
                  </td>
                </tr>
              ) : chatRooms.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-[#70757A]">
                    채팅방이 없습니다.
                  </td>
                </tr>
              ) : (
                chatRooms.map((room) => (
                  <tr 
                    key={room.chatId} 
                    className={`hover:bg-[#F8F8F9] transition-colors ${room.chatIsDeleted ? 'opacity-50 bg-[#F0F1F3]' : ''}`}
                  >
                    <td className="px-6 py-3">
                      <button 
                        onClick={() => handleSelectRoom(room.chatId)}
                        className="text-[#C33DFF] hover:text-[#7E00CC]"
                      >
                        {selectedRooms.includes(room.chatId) ? 
                          <CheckSquare className="w-5 h-5" /> : 
                          <Square className="w-5 h-5" />
                        }
                      </button>
                    </td>
                    <td className="px-6 py-3 group">
                      <span
                        onClick={() => navigator.clipboard.writeText(room.chatId)}
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
                        {room.chatId}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="font-medium text-sm text-[#242424]">
                        {room.popupName}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-medium text-sm text-[#242424]">
                        {room.chatName}
                        {room.chatIsDeleted && (
                          <span className="ml-2 text-xs text-[#FF2A7E]">(삭제됨)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#45CFD3] to-[#C33DFF] flex items-center justify-center text-white text-xs font-bold">
                          {room.hostUserId?.toString().slice(-2) || '?'}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-[#242424]">{room.hostUserName}</div>
                          <div className="text-xs text-[#70757A]">@{room.hostNickname}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-medium text-[#242424]">
                        {room.participantCount} / {room.maxParticipants}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      {room.reportCount > 0 ? (
                        <button
                          onClick={() => handleViewReports(room.chatId, room.chatName)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-gradient-to-r from-[#FF2A7E]/10 to-[#FFC92D]/10 
                                     hover:from-[#FF2A7E]/20 hover:to-[#FFC92D]/20 text-[#FF2A7E] rounded-lg 
                                     transition-all cursor-pointer group"
                          title="신고 내역 보기"
                        >
                          <AlertTriangle className="w-3 h-3 group-hover:scale-110 transition-transform" />
                          <span className="font-semibold">{room.reportCount}건</span>
                        </button>
                      ) : (
                        <span className="text-xs text-[#70757A]">없음</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-[#70757A] whitespace-nowrap">
                      {formatDateTime(room.createdAt)}
                    </td>
                    <td className="px-6 py-3">
                      {!room.chatIsDeleted && (
                        <button
                          onClick={() => handleDelete(room.chatId)}
                          className="w-7 h-7 flex items-center justify-center bg-[#FF2A7E] hover:bg-[#C33DFF] 
                                     text-white rounded-full transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
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
            총 {totalElements.toLocaleString()}개의 채팅방
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
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
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
    </div>
  );
}

// 통계 카드 컴포넌트
function StatCard({ title, value, icon, gradient }) {
  return (
    <div className={`rounded-2xl shadow-xl p-6 text-white bg-gradient-to-br ${gradient} flex flex-col justify-between min-h-[120px]`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-medium text-white/90">{title}</div>
        <div className="bg-white/20 p-3 rounded-xl">{icon}</div>
      </div>
      <div className="text-3xl font-extrabold">
        {value?.toLocaleString()}
      </div>
    </div>
  );
}