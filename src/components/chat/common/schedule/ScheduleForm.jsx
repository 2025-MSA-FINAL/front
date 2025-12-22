// 날짜/시간/내용 입력 폼
// src/components/chat/common/schedule/ScheduleForm.jsx
import { useState, useEffect } from "react";
import ScheduleDateTimePicker from "./ScheduleDateTimePicker";
import {
  createScheduledMessage,
  updateScheduledMessage,
} from "../../../../api/chatApi";

function formatSchedulePreview(iso) {
  if (!iso) return "";

  const d = new Date(iso);
  const now = new Date();

  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const isTomorrow =
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate();

  let dateLabel;
  if (isToday) dateLabel = "오늘";
  else if (isTomorrow) dateLabel = "내일";
  else dateLabel = `${d.getMonth() + 1}월 ${d.getDate()}일`;

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours < 12 ? "오전" : "오후";

  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;

  return `${dateLabel} ${ampm} ${hours}:${minutes}`;
}

export default function ScheduleForm({
  roomId,
  roomType,
  mode = "create", // create | edit
  initialData,
  onClose,
  onOpenList,
  onCancelEdit,
  onFinishEdit,
  onError,
}) {
  const [content, setContent] = useState(initialData?.content ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    initialData?.scheduledAt ?? null
  );

  const [pickerOpen, setPickerOpen] = useState(false);
  const [tempDate, setTempDate] = useState(null);

  const [loading, setLoading] = useState(false);
  const canSubmit = content.trim() && scheduledAt;

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;

    try {
      setLoading(true);

      if (mode === "edit") {
        await updateScheduledMessage(initialData.csmId, {
          content,
          scheduledAt,
        });
        onFinishEdit?.();
      } else {
        await createScheduledMessage({
          roomId,
          roomType,
          content,
          scheduledAt,
        });
        onOpenList();
      }
    } catch {
      onError?.();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setContent(initialData.content);
      setScheduledAt(initialData.scheduledAt);
    }
  }, [mode, initialData]);

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <h2 className="text-xl font-semibold text-gray-900">예약 메시지</h2>

      {/* Message input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-500">메시지</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="보낼 메시지를 입력하세요"
          className="
            w-full h-28
            rounded-2xl
            border border-gray-200
            bg-gray-50
            px-4 py-3
            text-sm text-gray-800
            resize-none
            focus:outline-none
            focus:ring-2 focus:ring-[#5856D6]/40
          "
        />
      </div>

      {/* Date selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-500">예약 시간</label>

        <button
          onClick={() => {
            setTempDate(scheduledAt);
            setPickerOpen(true);
          }}
          className="
            w-full flex items-center justify-between
            px-4 py-3
            rounded-2xl
            border border-gray-200
            bg-white
            text-sm
            hover:bg-gray-50
            transition cursor-pointer
          "
        >
          <span className={scheduledAt ? "text-gray-900" : "text-gray-400"}>
            {scheduledAt
              ? formatSchedulePreview(scheduledAt)
              : "날짜 및 시간 선택"}
          </span>

          <span className="text-[#5856D6] font-semibold">선택</span>
        </button>
      </div>

      {/* DateTime Picker */}
      {pickerOpen && (
        <ScheduleDateTimePicker
          value={tempDate}
          minDateTime={
            mode === "edit" && initialData
              ? new Date(initialData.scheduledAt)
              : null
          }
          onConfirm={(v) => {
            setScheduledAt(v);
            setPickerOpen(false);
          }}
          onCancel={() => setPickerOpen(false)}
        />
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => {
            if (mode === "edit") {
              onCancelEdit?.();
            } else {
              onClose();
            }
          }}
          className="
            flex-1 py-3
            rounded-full
            bg-gray-100
            text-gray-600
            font-semibold
            hover:bg-gray-200
            transition cursor-pointer
          "
        >
          취소
        </button>

        <button
          disabled={!canSubmit || loading}
          onClick={handleSubmit}
          className="
            flex-1 py-3
            rounded-full
            bg-[#5856D6]
            text-white
            font-semibold
            transition
            disabled:opacity-40 cursor-pointer
          "
        >
          {loading ? "예약 중..." : mode === "edit" ? "수정 저장" : "예약"}
        </button>
      </div>

      {mode === "create" && (
        <button
          onClick={() => {
            onOpenList?.();
          }}
          className="
      text-sm text-[#5856D6]
      font-semibold
      underline
      self-center cursor-pointer
    "
        >
          예약 목록 보기
        </button>
      )}
    </div>
  );
}
