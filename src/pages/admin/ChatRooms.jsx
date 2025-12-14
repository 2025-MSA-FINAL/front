import { useState, useEffect } from "react";
import { Search, MessageSquare, Users, Trash2, AlertTriangle, CheckSquare, Square, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";

export default function ChatRooms() {
  const navigate = useNavigate();
  const [chatRooms, setChatRooms] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState(""); 
  const [debouncedKeyword, setDebouncedKeyword] = useState(""); //  디바운스된 키워드
  const [searchType, setSearchType] = useState("all");
  const [filterDeleted, setFilterDeleted] = useState("active");
  const [sortBy, setSortBy] = useState("createdAt");
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  
  const itemsPerPage = 10;

  // 🔥 검색어 디바운스 - 500ms 후 debouncedKeyword 업데이트
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
      setCurrentPage(1); // 검색어 변경 시 첫 페이지로
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword]);

  // 🔥 API 호출 함수 (useCallback 제거)
  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage - 1, 
        size: itemsPerPage,
        sort: sortBy,
      };
      
      // 검색어 및 검색 타입 추가
      if (debouncedKeyword.trim()) {
        params.keyword = debouncedKeyword.trim();
        params.searchType = searchType;
      }
      
      // 삭제 상태 필터
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
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchStats();
    fetchChatRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDeleted, sortBy, currentPage, searchType, debouncedKeyword]);

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
    if (!confirm("이 채팅방을 삭제하시겠습니까?")) return;

    try {
      await axiosInstance.delete(`/api/admin/chatrooms/${chatId}`);
      
      alert("채팅방이 삭제되었습니다!");
      fetchStats();
      fetchChatRooms();
    } catch (err) {
      console.error("Error deleting chatroom:", err);
      alert(err.response?.data?.message || "삭제에 실패했습니다.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRooms.length === 0) {
      alert("삭제할 채팅방을 선택해주세요.");
      return;
    }

    if (!confirm(`선택한 ${selectedRooms.length}개의 채팅방을 삭제하시겠습니까?`)) return;

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
    }
  };

  const handleViewReports = (chatId, chatName) => {
    navigate(`/reports?type=chat&targetId=${chatId}&targetName=${encodeURIComponent(chatName)}`);
  };

  const handleSearch = () => {
    setDebouncedKeyword(keyword); // 디바운스 무시하고 즉시 적용
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C33DFF]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <div className="text-[#FF2A7E] text-xl mb-4">{error}</div>
          <button
            onClick={fetchChatRooms}
            className="px-6 py-2 bg-gradient-to-r from-[#C33DFF] to-[#7E00CC] text-white rounded-xl"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#242424]">채팅방 관리</h1>
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
            icon={<MessageSquare className="w-6 h-6 text-white" />}
            gradient="from-[#45CFD3] to-[#C33DFF]"
          />
          <StatCard
            title="비활성 채팅방"
            value={stats.inactiveChatRooms}
            icon={<MessageSquare className="w-6 h-6 text-white" />}
            gradient="from-[#7E00CC] to-[#C33DFF]"
          />
          <StatCard
            title="신고된 채팅방"
            value={stats.reportedChatRooms}
            icon={<AlertTriangle className="w-6 h-6 text-white" />}
            gradient="from-[#FF2A7E] to-[#FFC92D]"
          />
        </div>
      )}

      {/* 필터 & 검색 */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* 검색 타입 드롭다운 */}
          <select
            value={searchType}
            onChange={(e) => {
              setSearchType(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 border border-[#DDDFE2] rounded-xl 
                     focus:ring-2 focus:ring-[#C33DFF] focus:border-transparent"
          >
            <option value="all">통합 검색</option>
            <option value="user">사용자(방장)</option>
            <option value="popup">팝업스토어 이름</option>
            <option value="chatName">채팅방 이름</option>
          </select>
          
          {/* 검색어 입력 필드 */}
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-[#70757A]" />
              <input
                type="text"
                placeholder="검색어를 입력하세요..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-[#DDDFE2] rounded-xl 
                         focus:ring-2 focus:ring-[#C33DFF] focus:border-transparent"
                id="chatRoomSearch"
                name="chatRoomSearch"
              />
            </div>
          </div>

          {/* 삭제 상태 필터 */}
          <select
            value={filterDeleted}
            onChange={(e) => {
              setFilterDeleted(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 border border-[#DDDFE2] rounded-xl 
                     focus:ring-2 focus:ring-[#C33DFF] focus:border-transparent"
          >
            <option value="all">전체 상태</option>
            <option value="active">활성</option>
            <option value="deleted">삭제됨</option>
          </select>

          {/* 정렬 필터 */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 border border-[#DDDFE2] rounded-xl 
                     focus:ring-2 focus:ring-[#C33DFF] focus:border-transparent"
          >
            <option value="createdAt">생성일 순</option>
            <option value="reportCount">신고 많은 순</option>
            <option value="participantCount">참여자 많은 순</option>
            <option value="messageCount">메시지 많은 순</option>
            <option value="name">이름 순</option>
          </select>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-gradient-to-r from-[#C33DFF] to-[#7E00CC] text-white rounded-xl 
                     hover:shadow-lg transition-all"
          >
            검색
          </button>
          {selectedRooms.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-6 py-2 bg-[#FF2A7E] text-white rounded-xl hover:shadow-lg 
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
              {chatRooms.length === 0 ? (
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
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#C33DFF] to-[#7E00CC] text-white font-bold text-xs">
                        {room.chatId}
                      </div>
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
                          {room.hostUserId}
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
                      {room.hasReports ? (
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
                        <span className="text-xs text-[#70757A] whitespace-nowra">없음</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-[#70757A] whitespace-nowrap">
                      {room.createdAt}
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
        <div className="px-6 py-4 border-t border-[#DDDFE2] flex items-center justify-between">
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
            
            {/* 페이지 번호 버튼 (최대 5개 표시) */}
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