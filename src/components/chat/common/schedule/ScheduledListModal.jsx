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
    <BlurModal
      open={open}
      onClose={onClose}
      width="420px"
      showCloseButton={false}
    >
      <div
        className="
          flex flex-col gap-5
          bg-white/80
          backdrop-blur-xl
          border border-white/40
          rounded-3xl
          px-6 py-7
          shadow-dropdown
          animate-pop-in
        "
      >
        {/* Title */}
        <h2 className="text-title-lg font-semibold text-text-black">
          예약 메시지 목록
        </h2>

        {/* Loading / Empty */}
        {loading && (
          <div className="text-body-sm text-text-sub">불러오는 중...</div>
        )}

        {!loading && list.length === 0 && (
          <div className="text-body-sm text-text-sub">
            예약된 메시지가 없습니다.
          </div>
        )}

        {/* List */}
        <div className="flex flex-col gap-3">
          {list.map((m) => (
            <div
              key={m.csmId}
              className="
                p-4 rounded-2xl
                bg-white
                border border-secondary
                flex justify-between items-center gap-3
                hover:bg-secondary-light
                transition
              "
            >
              {/* Content */}
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-body-md font-semibold text-text-black">
                  {formatPreview(m.scheduledAt)}
                </span>
                <span
                  className="
                    text-body-sm text-text-sub
                    block overflow-hidden
                    text-ellipsis whitespace-nowrap
                  "
                >
                  {m.content}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* ✏️ 수정 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(m);
                  }}
                  className="
                    text-text-sub
                    hover:text-accent-aqua
                    transition
                  "
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
                  className="
                    text-body-sm
                    text-accent-pink
                    font-semibold
                    hover:opacity-80
                    transition
                  "
                >
                  취소
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="
            mt-4 py-3 rounded-full
            bg-primary
            text-text-white
            font-semibold
            shadow-brand
            hover:shadow-hover
            hover:opacity-95
            transition
          "
        >
          닫기
        </button>
      </div>

      {/* =========================
          Confirm Cancel Modal
         ========================= */}
      {confirmTarget && (
        <BlurModal
          open={true}
          onClose={() => setConfirmTarget(null)}
          width="360px"
          showCloseButton={false}
        >
          <div
            className="
              flex flex-col gap-5
              bg-white/80
              backdrop-blur-xl
              border border-white/40
              rounded-3xl
              px-6 py-6
              shadow-dropdown
              animate-pop-in
            "
          >
            <h3 className="text-title-md font-semibold text-text-black">
              예약 취소
            </h3>

            <p className="text-body-sm text-text-sub">
              이 예약 메시지를 취소하시겠습니까?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmTarget(null)}
                className="
                  flex-1 py-2 rounded-full
                  bg-secondary-light
                  text-text-sub
                  font-semibold
                  hover:bg-secondary
                  transition
                "
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
                className="
                  flex-1 py-2 rounded-full
                  bg-accent-pink
                  text-text-white
                  font-semibold
                  shadow-hover
                  hover:opacity-90
                  transition
                "
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
