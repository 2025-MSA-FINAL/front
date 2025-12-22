// 예약 생성 모달 (BlurModal 사용)
// src/components/chat/common/schedule/CreateScheduleModal.jsx
import { useState } from "react";
import BlurModal from "../../../common/BlurModal";
import ScheduleForm from "./ScheduleForm";
import ScheduledListModal from "./ScheduledListModal";

export default function CreateScheduleModal({
  open,
  onClose,
  roomId,
  roomType,
}) {
  const [mode, setMode] = useState("create"); // create | list | edit
  const [editingItem, setEditingItem] = useState(null);

  if (!open) return null;

  return (
    <>
      {(mode === "create" || mode === "edit") && (
        <BlurModal open={open} onClose={onClose} width="420px">
          <ScheduleForm
            roomId={roomId}
            roomType={roomType}
            mode={mode}
            initialData={editingItem}
            onClose={onClose}
            onCancelEdit={() => {
              setEditingItem(null);
              setMode("list");
            }}
            onOpenList={() => setMode("list")}
            onFinishEdit={() => {
              setEditingItem(null);
              setMode("list");
            }}
            onError={() => alert("예약 메시지 처리 실패")}
          />
        </BlurModal>
      )}

      {mode === "list" && (
        <ScheduledListModal
          open={true}
          onClose={() => setMode("create")}
          onEdit={(item) => {
            setEditingItem(item);
            setMode("edit");
          }}
        />
      )}
    </>
  );
}
