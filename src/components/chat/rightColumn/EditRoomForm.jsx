import React, { useState } from "react";
import EditIcon from "../icons/EditIcon";

export default function EditRoomForm({ room, onSubmit }) {
  const [title, setTitle] = useState(room?.title || "");
  const [description, setDescription] = useState(room?.description || "");
  const [maxUserCnt, setMaxUserCnt] = useState(room?.maxUserCnt || "");

  const currentUserCnt = room?.currentUserCnt ?? 0;

  const handleSubmit = () => {
    if (maxUserCnt < currentUserCnt) {
      alert(
        `현재 참여 인원(${currentUserCnt}명)보다 더 적게 설정할 수 없습니다.`
      );
      return;
    }

    onSubmit({ title, description, maxUserCnt });
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-title-lg font-semibold text-primary-dark flex items-center gap-2">
        <EditIcon className="w-5 h-5" stroke="#C33DFF" />
        채팅방 수정
      </h2>

      {/* 제목 */}
      <div>
        <label className="text-text-sub text-sm">채팅방 이름</label>
        <input
          className="mt-2 w-full p-3 rounded-card bg-secondary-light border border-secondary
                     focus:outline-none focus:border-primary"
          maxLength={30}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      {/* 최대 인원수 */}
      <div>
        <label className="text-text-sub text-sm">인원 수</label>
        <input
          type="number"
          min={currentUserCnt}
          className="mt-2 w-full p-3 rounded-card bg-secondary-light border border-secondary 
                     focus:outline-none focus:border-primary no-number-spin"
          value={maxUserCnt}
          onChange={(e) => setMaxUserCnt(Number(e.target.value))}
        />
        <p className="text-xs text-gray-500 mt-1">
          현재 인원: {currentUserCnt}명 (보다 작게 설정 불가)
        </p>
      </div>

      {/* 설명 */}
      <div>
        <label className="text-text-sub text-sm">설명</label>
        <textarea
          className="mt-2 w-full p-3 rounded-card bg-secondary-light border border-secondary h-28
                     resize-none chat-textarea-scroll focus:outline-none focus:border-primary"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="mt-1 w-full py-3 rounded-btn bg-primary text-white font-semibold hover:bg-primary-dark transition"
      >
        저장하기
      </button>
    </div>
  );
}
