import { X, User, MessageSquare, Calendar, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";

export default function ReportDetailModal({ repId, onClose, onStatusChange }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (repId) {
      fetchDetail();
    }
  }, [repId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/api/admin/reports/${repId}`);
      setDetail(response.data);
    } catch (err) {
      console.error("Error fetching report detail:", err);
      setError("신고 상세 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    const statusText = { approved: "승인", rejected: "반려" };
    if (!window.confirm(`이 신고를 "${statusText[newStatus]}"로 변경하시겠습니까?`)) return;
    
    try {
      await axiosInstance.put(`/api/admin/reports/${repId}`, null, { 
        params: { status: newStatus } 
      });
      alert(`${statusText[newStatus]}되었습니다!`);
      onStatusChange();
      onClose();
    } catch (err) {
      console.error("Error updating report status:", err);
      alert(err.response?.data?.message || "상태 변경에 실패했습니다.");
    }
  };

  const getDisplayStatus = (status) => {
    if (status === 'approved' || status === 'resolved') return 'approved';
    return status;
  };

  const getStatusBadge = (status) => {
    const displayStatus = getDisplayStatus(status);
    const styles = {
      pending: "bg-gradient-to-r from-[#FFC92D]/20 to-[#FF2A7E]/20 text-[#FFC92D]",
      approved: "bg-gradient-to-r from-[#45CFD3]/20 to-[#C33DFF]/20 text-[#45CFD3]",
      rejected: "bg-gradient-to-r from-[#FF2A7E]/20 to-[#FFC92D]/20 text-[#FF2A7E]"
    };
    const labels = {
      pending: "대기중",
      approved: "승인",
      rejected: "반려"
    };
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${styles[displayStatus]}`}>
        {labels[displayStatus]}
      </span>
    );
  };

  const getTypeInfo = (type) => {
    const types = {
      popup: { label: "팝업", color: "from-[#C33DFF]/20 to-[#7E00CC]/20 text-[#7E00CC]" },
      user: { label: "유저", color: "from-[#45CFD3]/20 to-[#C33DFF]/20 text-[#45CFD3]" },
      chat: { label: "채팅", color: "from-[#FF2A7E]/20 to-[#FFC92D]/20 text-[#FF2A7E]" }
    };
    return types[type] || types.user;
  };

  if (!repId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-[#DDDFE2] bg-gradient-to-r from-[#C33DFF]/5 to-[#45CFD3]/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-[#C33DFF] to-[#7E00CC] rounded-xl">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#242424]">신고 상세 정보</h2>
              <p className="text-sm text-[#70757A]">신고 ID: {repId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-[#70757A]" />
          </button>
        </div>

        {/* 본문 */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C33DFF]"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-[#FF2A7E] mb-4">{error}</div>
              <button 
                onClick={fetchDetail} 
                className="px-6 py-2 bg-gradient-to-r from-[#C33DFF] to-[#7E00CC] text-white rounded-xl hover:shadow-lg transition-all"
              >
                다시 시도
              </button>
            </div>
          ) : detail ? (
            <div className="p-6 space-y-6">
              {/* 기본 정보 */}
              <div className="bg-gradient-to-br from-[#C33DFF]/5 to-[#45CFD3]/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#242424] mb-4">기본 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem 
                    label="신고 타입" 
                    value={
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getTypeInfo(detail.repType).color}`}>
                        {getTypeInfo(detail.repType).label}
                      </span>
                    }
                  />
                  <InfoItem 
                    label="상태" 
                    value={getStatusBadge(detail.repStatus)}
                  />
                  <InfoItem 
                    label="신고 카테고리" 
                    value={detail.categoryName}
                    fullWidth
                  />
                </div>
              </div>

              {/* 신고자 정보 */}
              <div className="bg-gradient-to-br from-[#45CFD3]/5 to-[#C33DFF]/5 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-[#C33DFF]" />
                  <h3 className="text-lg font-semibold text-[#242424]">신고자 정보</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="사용자 ID" value={detail.userId} />
                  <InfoItem label="닉네임" value={detail.userNickname} />
                  <InfoItem label="이메일" value={detail.userEmail} fullWidth />
                </div>
              </div>

              {/* 신고 대상 정보 */}
              <div className="bg-gradient-to-br from-[#FF2A7E]/5 to-[#FFC92D]/5 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  {detail.repType === 'user' ? (
                    <User className="w-5 h-5 text-[#FF2A7E]" />
                  ) : (
                    <MessageSquare className="w-5 h-5 text-[#FF2A7E]" />
                  )}
                  <h3 className="text-lg font-semibold text-[#242424]">신고 대상</h3>
                </div>
                <InfoItem 
                  label={detail.repType === 'user' ? '대상 사용자 ID' : detail.repType === 'chat' ? '채팅방 ID' : '팝업 ID'} 
                  value={detail.repTargetId}
                />
              </div>

              {/* 신고 이미지 */}
              {detail.reportImages && detail.reportImages.length > 0 && (
                <div className="bg-gradient-to-br from-[#FFC92D]/5 to-[#FF2A7E]/5 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[#242424] mb-4">첨부 이미지</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {detail.reportImages.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`신고 이미지 ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border-2 border-[#DDDFE2]"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 신고 일시 */}
              <div className="bg-gradient-to-br from-[#C33DFF]/5 to-[#7E00CC]/5 rounded-xl p-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#C33DFF]" />
                  <span className="text-sm font-medium text-[#70757A]">신고 일시</span>
                  <span className="text-sm font-semibold text-[#242424]">{detail.createdAt}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* 푸터 (액션 버튼) */}
        {detail && (
          <div className="p-6 border-t border-[#DDDFE2] bg-gray-50">
            <div className="flex justify-end gap-3">
              {getDisplayStatus(detail.repStatus) === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusChange('approved')}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#45CFD3] to-[#C33DFF] text-white rounded-xl hover:shadow-lg transition-all font-medium"
                  >
                    <CheckCircle className="w-5 h-5" />
                    승인
                  </button>
                  <button
                    onClick={() => handleStatusChange('rejected')}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF2A7E] to-[#FFC92D] text-white rounded-xl hover:shadow-lg transition-all font-medium"
                  >
                    <XCircle className="w-5 h-5" />
                    반려
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="px-6 py-3 border border-[#DDDFE2] text-[#424242] rounded-xl hover:bg-gray-100 transition-all font-medium"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value, fullWidth = false }) {
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <div className="text-sm text-[#70757A] mb-1">{label}</div>
      <div className="text-sm font-semibold text-[#242424]">
        {value || '-'}
      </div>
    </div>
  );
}