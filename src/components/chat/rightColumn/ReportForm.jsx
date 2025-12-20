import React, { useState } from "react";
import ReportIcon from "../icons/ReportIcon";

export default function ReportForm({ onSubmit }) {
  const [categoryId, setCategoryId] = useState(1);
  const [files, setFiles] = useState([]);

  const handleFile = (e) => {
    const arr = Array.from(e.target.files || []);
    setFiles(arr.slice(0, 10));
  };

  const canSubmit = files.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-title-lg font-semibold text-primary-dark flex items-center gap-2">
        <ReportIcon className="w-6 h-6 text-accent-pink" />
        신고하기
      </h2>

      {/* 카테고리 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">신고 사유</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          className="rounded-lg border px-3 py-2"
        >
          <option value={1}>욕설/비방</option>
          <option value={2}>스팸/광고</option>
          <option value={3}>개인정보 침해</option>
          <option value={4}>지적 재산 침해</option>
          <option value={5}>부적절한 콘텐츠</option>
        </select>
      </div>

      {/* 이미지 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">
          증거 이미지
          <span className="ml-1 text-xs text-red-500">(1장 이상 필수)</span>
        </label>

        <input type="file" multiple accept="image/*" onChange={handleFile} />

        <span className="text-xs text-gray-400">
          최대 10장까지 첨부할 수 있어요.
        </span>
      </div>

      <button
        disabled={!canSubmit}
        onClick={() => onSubmit({ categoryId, files })}
        className={`
          py-3 rounded-btn font-semibold transition
          ${
            canSubmit
              ? "bg-primary text-white hover:bg-primary-dark"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }
        `}
      >
        신고하기
      </button>
    </div>
  );
}
