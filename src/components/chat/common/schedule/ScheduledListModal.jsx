import { useEffect, useState } from "react";
import BlurModal from "../../../common/BlurModal";
import {
  getMyScheduledMessages,
  cancelScheduledMessage,
} from "../../../../api/chatApi";
import EditIcon from "../../icons/EditIcon";

function formatPreview(iso) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(
    2,
    "0"
  )}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function ScheduledListModal({ open, onClose, onEdit }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const fetchList = async () => {
      setLoading(true);
      try {
        const data = await getMyScheduledMessages("PENDING");
        if (!cancelled) {
          setList(data.filter((m) => m.csmStatus === "PENDING"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchList();

    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  return (
    <BlurModal open={open} onClose={onClose} width="420px">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">예약 메시지 목록</h2>

        {loading && <div className="text-sm text-gray-400">불러오는 중...</div>}

        {!loading && list.length === 0 && (
          <div className="text-sm text-gray-500">예약된 메시지가 없습니다.</div>
        )}

        <div className="flex flex-col gap-3">
          {list.map((m) => (
            <div
              key={m.csmId}
              className="
                p-3 rounded-xl
                border border-gray-200
                flex justify-between items-center gap-3
            "
            >
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium">
                  {formatPreview(m.scheduledAt)}
                </span>
                <span
                  className="
                    text-xs text-gray-500
                    block
                    overflow-hidden
                    text-ellipsis
                    whitespace-nowrap
                "
                >
                  {m.content}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* ✏️ 수정 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(m);
                  }}
                  className="text-gray-500 hover:text-[#5856D6]"
                  title="수정"
                >
                  <EditIcon className="w-4 h-4 cursor-pointer" />
                </button>

                {/* ❌ 취소 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmTarget(m);
                  }}
                  className="text-xs text-red-500 font-semibold cursor-pointer"
                >
                  취소
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="
            mt-4 py-3 rounded-full
            bg-[#5856D6] text-white
            font-semibold cursor-pointer
          "
        >
          닫기
        </button>
      </div>
      {confirmTarget && (
        <BlurModal
          open={true}
          onClose={() => setConfirmTarget(null)}
          width="360px"
        >
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">예약 취소</h3>

            <p className="text-sm text-gray-600">
              이 예약 메시지를 취소하시겠습니까?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmTarget(null)}
                className="flex-1 py-2 rounded-full bg-gray-100 text-gray-600 cursor-pointer"
              >
                아니오
              </button>

              <button
                onClick={async () => {
                  try {
                    await cancelScheduledMessage(confirmTarget.csmId);
                    setList((prev) =>
                      prev.filter((m) => m.csmId !== confirmTarget.csmId)
                    );
                  } catch {
                    alert("예약 취소에 실패했습니다.");
                  } finally {
                    setConfirmTarget(null);
                  }
                }}
                className="flex-1 py-2 rounded-full bg-red-500 text-white font-semibold cursor-pointer"
              >
                취소하기
              </button>
            </div>
          </div>
        </BlurModal>
      )}
    </BlurModal>
  );
}
