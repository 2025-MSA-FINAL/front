import React, { useState } from "react";
import ReportIcon from "../icons/ReportIcon";

export default function ReportForm({ onSubmit }) {
  const [category, setCategory] = useState("욕설/비방");
  const [files, setFiles] = useState([]);

  const handleFile = (e) => {
    const arr = Array.from(e.target.files);
    setFiles(arr.slice(0, 10));
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-title-lg font-semibold text-primary-dark flex items-center gap-2">
        <ReportIcon className="w-6 h-6 text-accent-pink" />
        신고하기
      </h2>

      {/* 카테고리 */}
      <div>
        <label className="text-sm text-text-sub">카테고리</label>
        <select
          className="
            mt-2 w-full p-3 rounded-card bg-secondary-light 
            border border-secondary custom-select
            focus:outline-none focus:border-primary
          "
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>욕설/비방</option>
          <option>스팸/광고</option>
          <option>개인정보 침해</option>
          <option>지적 재산 침해</option>
          <option>부적절한 콘텐츠</option>
        </select>
      </div>

      {/* 이미지 업로드 */}
      <div>
        <label className="text-sm text-text-sub">증거 이미지</label>

        <div
          className="
            mt-2 w-full h-40 border-2 border-dashed border-secondary-dark/40
            rounded-card flex items-center justify-center text-secondary-dark
            bg-secondary-light/50
          "
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFile}
            className="cursor-pointer"
          />
        </div>

        {/* 선택 이미지 preview */}
        {files.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mt-3">
            {files.map((file, idx) => (
              <img
                key={idx}
                src={URL.createObjectURL(file)}
                className="rounded-card w-full h-20 object-cover border border-secondary"
              />
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => onSubmit({ category, files })}
        className="
          mt-3 w-full py-3 rounded-btn bg-primary 
          text-white font-semibold hover:bg-primary-dark transition
        "
      >
        신고하기
      </button>
    </div>
  );
}
