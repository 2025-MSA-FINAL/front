import { useState, useEffect } from "react";
import { Search, MessageSquare, Users, Trash2, AlertTriangle, CheckSquare, Square, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";

// Mock 데이터
const MOCK_CHATROOMS = [
  { chatId: 1, chatName: "아이유 팝업", popId: 1, hostUserId: 1, hostUserName: "김철수", hostNickname: "cheolsu", participantCount: 50, maxParticipants: 300, messageCount: 234, reportCount: 3, hasReports: true, chatIsDeleted: false, createdAt: "2024-11-15" },
  { chatId: 2, chatName: "인생 자문01 팝업", popId: 2, hostUserId: 2, hostUserName: "이영희", hostNickname: "younghee", participantCount: 15, maxParticipants: 40, messageCount: 567, reportCount: 0, hasReports: false, chatIsDeleted: false, createdAt: "2024-11-20" },
  { chatId: 3, chatName: "버너브로칸 팝업", popId: 3, hostUserId: 3, hostUserName: "박관리", hostNickname: "manager1", participantCount: 10, maxParticipants: 40, messageCount: 89, reportCount: 1, hasReports: true, chatIsDeleted: false, createdAt: "2024-11-22" },
  { chatId: 4, chatName: "인생 자문01 팝업", popId: 4, hostUserId: 4, hostUserName: "최유저", hostNickname: "user1", participantCount: 30, maxParticipants: 150, messageCount: 45, reportCount: 0, hasReports: false, chatIsDeleted: false, createdAt: "2024-11-25" },
  { chatId: 5, chatName: "버너브로칸 팝업", popId: 5, hostUserId: 5, hostUserName: "정오늘", hostNickname: "today", participantCount: 30, maxParticipants: 150, messageCount: 12, reportCount: 5, hasReports: true, chatIsDeleted: false, createdAt: "2024-11-10" },
  { chatId: 6, chatName: "아이유 팝업", popId: 6, hostUserId: 1, hostUserName: "김철수", hostNickname: "cheolsu", participantCount: 30, maxParticipants: 150, messageCount: 89, reportCount: 0, hasReports: false, chatIsDeleted: false, createdAt: "2024-11-22" },
  { chatId: 7, chatName: "인생 자문01 팝업", popId: 7, hostUserId: 2, hostUserName: "이영희", hostNickname: "younghee", participantCount: 30, maxParticipants: 150, messageCount: 234, reportCount: 1, hasReports: true, chatIsDeleted: false, createdAt: "2024-11-15" },
];

const MOCK_STATS = {
  totalChatRooms: 7,
  activeChatRooms: 7,
  inactiveChatRooms: 0,
  reportedChatRooms: 3,
};

export default function ChatRooms() {
  const navigate = useNavigate();
  const [chatRooms, setChatRooms] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterDeleted, setFilterDeleted] = useState("active");
  const [sortBy, setSortBy] = useState("createdAt");
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [useMockData, setUseMockData] = useState(true);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchStats();
    fetchChatRooms();
  }, [filterDeleted, sortBy, currentPage, useMockData]);

  const fetchStats = async () => {
    if (useMockData) {
      setStats(MOCK_STATS);
    } else {
      try {
        const response = await axiosInstance.get("/api/admin/chatrooms/stats");
        setStats(response.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setStats(MOCK_STATS);
      }
    }
  };

  const fetchChatRooms = async () => {
    if (useMockData) {
      setTimeout(() => {
        let filtered = [...MOCK_CHATROOMS];
        
        if (filterDeleted === "active") {
          filtered = filtered.filter(c => !c.chatIsDeleted);
        } else if (filterDeleted === "deleted") {
          filtered = filtered.filter(c => c.chatIsDeleted);
        }
        
        if (searchKeyword) {
          filtered = filtered.filter(c => 
            c.chatName.includes(searchKeyword)
          );
        }
        
        // 정렬
        filtered.sort((a, b) => {
          if (sortBy === "reportCount") {
            return b.reportCount - a.reportCount;
          } else if (sortBy === "participantCount") {
            return b.participantCount - a.participantCount;
          } else if (sortBy === "messageCount") {
            return b.messageCount - a.messageCount;
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        setChatRooms(filtered);
        setLoading(false);
      }, 300);
    } else {
      try {
        setLoading(true);
        const params = {
          page: currentPage - 1,
          size: itemsPerPage,
          isDeleted: filterDeleted === "active" ? false : filterDeleted === "deleted" ? true : null,
          sortBy: sortBy,
        };
        
        const response = await axiosInstance.get("/api/admin/chatrooms", { params });
        setChatRooms(response.data.content || response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching chatrooms:", err);
        setChatRooms([]);
        setLoading(false);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms(paginatedRooms.map(r => r.chatId));
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
      if (!useMockData) {
        await axiosInstance.delete(`/api/admin/chatrooms/${chatId}`);
      }
      
      setChatRooms(chatRooms.map(c => 
        c.chatId === chatId ? { ...c, chatIsDeleted: true } : c
      ));
      
      alert("채팅방이 삭제되었습니다!");
      fetchStats();
    } catch (err) {
      console.error("Error deleting chatroom:", err);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRooms.length === 0) {
      alert("삭제할 채팅방을 선택해주세요.");
      return;
    }

    if (!confirm(`선택한 ${selectedRooms.length}개의 채팅방을 삭제하시겠습니까?`)) return;

    try {
      for (const chatId of selectedRooms) {
        if (!useMockData) {
          await axiosInstance.delete(`/api/admin/chatrooms/${chatId}`);
        }
      }
      
      setChatRooms(chatRooms.map(c => 
        selectedRooms.includes(c.chatId) ? { ...c, chatIsDeleted: true } : c
      ));
      
      setSelectedRooms([]);
      setSelectAll(false);
      alert("선택한 채팅방이 삭제되었습니다!");
      fetchStats();
    } catch (err) {
      console.error("Error bulk deleting:", err);
      alert("일괄 삭제에 실패했습니다.");
    }
  };

  const handleViewReports = (chatId, chatName) => {
    navigate(`/reports?type=chat&targetId=${chatId}&targetName=${encodeURIComponent(chatName)}`);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchChatRooms();
  };

  // 페이지네이션
  const totalPages = Math.ceil(chatRooms.length / itemsPerPage);
  const paginatedRooms = chatRooms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-[#70757A]">
        로딩 중...
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

        {/* Mock 데이터 토글 */}
        <button
          onClick={() => setUseMockData(prev => !prev)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm shadow-md transition-all
            ${useMockData ? 'bg-[#C33DFF] text-white' : 'bg-white text-[#424242] border border-[#DDDFE2]'}`}
        >
          {useMockData ? "Mock 데이터 사용 중" : "실제 API 사용 중"}
        </button>
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
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-[#70757A]" />
              <input
                type="text"
                placeholder="팝업명 검색..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-[#DDDFE2] rounded-xl 
                         focus:ring-2 focus:ring-[#C33DFF] focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filterDeleted}
            onChange={(e) => setFilterDeleted(e.target.value)}
            className="px-4 py-3 border border-[#DDDFE2] rounded-xl 
                     focus:ring-2 focus:ring-[#C33DFF] focus:border-transparent"
          >
            <option value="all">전체 상태</option>
            <option value="active">활성</option>
            <option value="deleted">삭제됨</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-[#DDDFE2] rounded-xl 
                     focus:ring-2 focus:ring-[#C33DFF] focus:border-transparent"
          >
            <option value="createdAt">생성일 순</option>
            <option value="reportCount">신고 많은 순</option>
            <option value="participantCount">참여자 많은 순</option>
            <option value="messageCount">메시지 많은 순</option>
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
                <th className="px-6 py-4 text-left">
                  <button onClick={handleSelectAll} className="text-[#C33DFF] hover:text-[#7E00CC]">
                    {selectAll ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#242424]">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#242424]">채팅방 이름</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#242424]">방장</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#242424]">인원수</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#242424]">
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-[#FF2A7E]" />
                    신고
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#242424]">생성일</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#242424]">삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F1F3]">
              {paginatedRooms.map((room) => (
                <tr 
                  key={room.chatId} 
                  className={`hover:bg-[#F8F8F9] transition-colors ${room.chatIsDeleted ? 'opacity-50 bg-[#F0F1F3]' : ''}`}
                >
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#C33DFF] to-[#7E00CC] text-white font-bold text-sm">
                      {room.chatId}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[#242424]">
                      {room.chatName}
                      {room.chatIsDeleted && (
                        <span className="ml-2 text-xs text-[#FF2A7E]">(삭제됨)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#45CFD3] to-[#C33DFF] flex items-center justify-center text-white text-xs font-bold">
                        {room.hostUserId}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#242424]">{room.hostUserName}</div>
                        <div className="text-xs text-[#70757A]">@{room.hostNickname}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[#242424]">
                      {room.participantCount} / {room.maxParticipants}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {room.hasReports ? (
                      <button
                        onClick={() => handleViewReports(room.chatId, room.chatName)}
                        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#FF2A7E]/10 to-[#FFC92D]/10 
                                 hover:from-[#FF2A7E]/20 hover:to-[#FFC92D]/20 text-[#FF2A7E] rounded-lg 
                                 transition-all cursor-pointer group"
                        title="신고 내역 보기"
                      >
                        <AlertTriangle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">{room.reportCount}건</span>
                      </button>
                    ) : (
                      <span className="text-sm text-[#70757A]">없음</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#70757A]">
                    {room.createdAt}
                  </td>
                  <td className="px-6 py-4">
                    {!room.chatIsDeleted && (
                      <button
                        onClick={() => handleDelete(room.chatId)}
                        className="w-8 h-8 flex items-center justify-center bg-[#FF2A7E] hover:bg-[#C33DFF] 
                                 text-white rounded-full transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="px-6 py-4 border-t border-[#DDDFE2] flex items-center justify-between">
          <div className="text-sm text-[#70757A]">
            총 {chatRooms.length}개의 채팅방
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-[#DDDFE2] rounded-lg hover:bg-[#F8F8F9] 
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[#424242]"
            >
              이전
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-[#C33DFF] to-[#7E00CC] text-white rounded-lg">
              {currentPage}
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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