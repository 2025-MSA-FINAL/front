import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "@/api/axios";

export default function AdminChatRoomReports() {
  const { chatId } = useParams();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    axiosInstance.get(`/api/admin/chatrooms/${chatId}/reports`)
      .then(res => setReports(res.data));
  }, [chatId]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">채팅방 신고 목록</h1>

      {reports.map(r => (
        <div key={r.reportId} className="border rounded-xl p-4 bg-white">
          <div className="text-sm text-gray-600">
            신고자: {r.reporterName} / 대상자: {r.targetUserName}
          </div>

          <div className="mt-2 font-medium">{r.reason}</div>

          <div className="mt-2 flex justify-between items-center">
            <span className={`text-xs px-2 py-1 rounded ${
              r.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}>
              {r.status}
            </span>

            <button
              onClick={() =>
                axiosInstance.patch(`/api/admin/chatrooms/reports/${r.reportId}?status=resolved`)
              }
              className="px-3 py-1 bg-indigo-500 text-white rounded"
            >
              처리완료
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
