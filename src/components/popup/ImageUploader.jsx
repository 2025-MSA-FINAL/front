import { useRef, useState } from "react";
import clsx from "clsx";

import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/**
 * 파일 드래그인지 체크 (텍스트 드래그 등은 무시)
 */
const isFileDrag = (e) =>
  Array.from(e?.dataTransfer?.types || []).includes("Files");

/**
 * 대표 썸네일 업로더
 */
export const ThumbnailUploader = ({
  previewUrl,
  onUpload,
  error,
  touched,
  isUploading = false,
}) => {
  const fileInputRef = useRef(null);
  const hasError = touched && !!error;

  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);

  const handleClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    const { files } = e.target;
    if (!files || files.length === 0) return;
    onUpload(files, "thumbnail");
    e.target.value = "";
  };

  /**
   * wrapper에서 드래그/드롭 처리 (버튼+미리보기 전체 drop zone)
   */
  const handleWrapDragEnter = (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    if (isUploading) return;

    dragCounter.current += 1;
    setIsDragOver(true);
  };

  const handleWrapDragOver = (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    if (isUploading) return;

    e.dataTransfer.dropEffect = "copy";
  };

  const handleWrapDragLeave = (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();

    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragOver(false);
    }
  };

  const handleWrapDrop = (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();

    dragCounter.current = 0;
    setIsDragOver(false);

    if (isUploading) return;

    const { files } = e.dataTransfer;
    if (!files || files.length === 0) return;

    //썸네일은 1장만 사용
    onUpload(files, "thumbnail");
  };

  return (
    <div
      className="w-full mb-10"
      onDragEnter={handleWrapDragEnter}
      onDragOver={handleWrapDragOver}
      onDragLeave={handleWrapDragLeave}
      onDrop={handleWrapDrop}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-title-lg text-text-sub">썸네일 이미지 추가</h3>
        {isUploading && (
          <span className="text-label-sm text-text-sub">업로드 중...</span>
        )}
      </div>

      {/* 버튼은 drop 이벤트 제거 */}
      <button
        type="button"
        onClick={handleClick}
        className={clsx(
          "w-full rounded-[18px] border border-dashed bg-secondary-light/60 hover:bg-secondary-light transition-colors",
          "shadow-card overflow-hidden relative",
          hasError && "border-accent-pink",
          isDragOver &&
            "border-primary-dark bg-primary-light ring-2 ring-primary/60 scale-[1.01]"
        )}
      >
        <div className="relative w-full pt-[75%]">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="팝업 스토어 썸네일"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-text-sub">
              <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center shadow-card">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 4V16"
                    stroke="#70757A"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M7 9L12 4L17 9"
                    stroke="#70757A"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 18H19"
                    stroke="#AFB4BA"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="text-label-md">썸네일 이미지를 업로드해 주세요</p>
              <p className="text-label-sm text-text-sub/70">
                1:1 또는 4:3 비율 권장
              </p>
              <p className="text-label-sm text-text-sub/60">
                클릭 또는 드래그 앤 드랍
              </p>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="text-label-md text-text-white">업로드 중...</span>
            </div>
          )}
        </div>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      {hasError && (
        <p className="mt-2 text-label-sm text-accent-pink">{error}</p>
      )}
    </div>
  );
};

function SortableImageCard({ id, url, index, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-full pt-[100%] rounded-[16px] overflow-hidden bg-secondary-light shadow-card cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          className="absolute top-1.5 right-1.5 z-20 w-6 h-6 rounded-full bg-black/60 text-text-white flex items-center justify-center text-[10px]"
        >
          ×
        </button>
      )}

      <img
        src={url}
        alt={`상세 이미지 ${index + 1}`}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}

/**
 * 상세 이미지 업로더
 */
export const DetailImageUploader = ({
  images = [],
  onUpload,
  onRemove,
  onMove,
  error,
  touched,
  isUploading = false,
  maxCount = 10,
}) => {
  const fileInputRef = useRef(null);
  const hasError = touched && !!error;
  const currentCount = images.length;
  const isMax = currentCount >= maxCount;

  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);

  const handleClick = () => {
    if (isUploading || isMax) return;
    fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    const { files } = e.target;
    if (!files || files.length === 0) return;

    onUpload(files, "detail");
    e.target.value = "";
  };

  const handleWrapDragEnter = (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    if (isUploading || isMax) return;

    dragCounter.current += 1;
    setIsDragOver(true);
  };

  const handleWrapDragOver = (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    if (isUploading || isMax) return;

    e.dataTransfer.dropEffect = "copy";
  };

  const handleWrapDragLeave = (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();

    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragOver(false);
    }
  };

  const handleWrapDrop = (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();

    dragCounter.current = 0;
    setIsDragOver(false);

    if (isUploading || isMax) return;

    const { files } = e.dataTransfer;
    if (!files || files.length === 0) return;

    onUpload(files, "detail");
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    if (!onMove) return;

    const oldIndex = images.findIndex((url) => url === active.id);
    const newIndex = images.findIndex((url) => url === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onMove(oldIndex, newIndex);
  };

  return (
    <div
      className="w-full"
      onDragEnter={handleWrapDragEnter}
      onDragOver={handleWrapDragOver}
      onDragLeave={handleWrapDragLeave}
      onDrop={handleWrapDrop}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-title-lg text-text-sub">상세 이미지 추가</h3>
        <span className="text-label-sm text-text-sub">
          {currentCount}/{maxCount}
        </span>
      </div>

      <p className="text-label-sm text-text-sub mb-2">
        팝업 공간, 디테일, 굿즈 등을 보여줄 이미지를 올려주세요.
      </p>

      <button
        type="button"
        onClick={handleClick}
        disabled={isMax}
        className={clsx(
          "w-full rounded-[18px] border border-dashed bg-secondary-light/60 hover:bg-secondary-light transition-colors",
          "shadow-card overflow-hidden relative flex items-center justify-center px-4 py-4",
          isMax && "opacity-60 cursor-not-allowed",
          hasError && "border-accent-pink",
          isDragOver &&
            !isMax &&
            "border-primary-dark bg-primary-light ring-2 ring-primary/60 scale-[1.01]"
        )}
      >
        <div className="flex items-center gap-3 text-text-sub">
          <div className="w-8 h-8 rounded-full bg-paper flex items-center justify-center shadow-card">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5V19"
                stroke="#70757A"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M5 12H19"
                stroke="#70757A"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-label-md">상세 이미지를 업로드해 주세요</span>
            <span className="text-label-sm text-text-sub/70">
              클릭 또는 드래그 앤 드랍 · 여러 장 선택 가능 · 최대 {maxCount}장
            </span>
          </div>
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <span className="text-label-md text-text-white">업로드 중...</span>
          </div>
        )}
      </button>

      <input
        ref={fileInputRef}
        className="hidden"
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
      />

      {hasError && (
        <p className="mt-2 text-label-sm text-accent-pink">{error}</p>
      )}

      {images.length > 0 && (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images}>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {images.map((url, index) => (
                <SortableImageCard
                  key={url}
                  id={url}
                  url={url}
                  index={index}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
