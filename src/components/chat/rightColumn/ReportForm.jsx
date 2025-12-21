import { useState, useMemo, useEffect, useRef } from "react";
import ReportIcon from "../icons/ReportIcon";
import heic2any from "heic2any";

const MAX_FILES = 10;

export default function ReportForm({ onSubmit }) {
  const [categoryId, setCategoryId] = useState(1);

  // 🔑 파일 + HEIC 실패 여부를 함께 관리
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryVisible, setCategoryVisible] = useState(false);
  const categoryRef = useRef(null);

  /* ---------------------------------
     HEIC → JPG 변환
  ---------------------------------- */
  const convertHeicIfNeeded = async (file) => {
    const name = file.name?.toLowerCase() || "";
    const type = file.type?.toLowerCase() || "";

    const isHeic =
      type.includes("heic") ||
      type.includes("heif") ||
      name.endsWith(".heic") ||
      name.endsWith(".heif");

    if (!isHeic) {
      return { file, heicFailed: false };
    }

    try {
      const result = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.9,
      });

      const blob = Array.isArray(result) ? result[0] : result;

      const jpgFile = new File(
        [blob],
        file.name.replace(/\.(heic|heif)$/i, ".jpg"),
        {
          type: "image/jpeg",
          lastModified: Date.now(),
        }
      );

      return { file: jpgFile, heicFailed: false };
    } catch (err) {
      console.warn("⚠️ HEIC 변환 실패:", file.name, err);
      // ❗ 실패했지만 파일은 유지 (서버 변환 가능)
      return { file, heicFailed: true };
    }
  };

  /* ---------------------------------
     파일 추가
  ---------------------------------- */
  const addFiles = async (incomingFiles) => {
    if (!incomingFiles || incomingFiles.length === 0) return;

    const remain = MAX_FILES - files.length;
    if (remain <= 0) return;

    const sliced = incomingFiles.slice(0, remain);

    const converted = await Promise.all(
      sliced.map((file) => convertHeicIfNeeded(file))
    );

    setFiles((prev) => [...prev, ...converted]);
  };

  const handleFileInput = async (e) => {
    await addFiles(Array.from(e.target.files || []));
    e.target.value = "";
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const dropped = Array.from(e.dataTransfer.files || []).filter((f) =>
      f.type.startsWith("image/")
    );

    await addFiles(dropped);
  };

  /* ---------------------------------
     Preview
  ---------------------------------- */
  const previews = useMemo(
    () => files.map((f) => URL.createObjectURL(f.file)),
    [files]
  );

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  /* ---------------------------------
     삭제
  ---------------------------------- */
  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  /* ---------------------------------
     HEIC 실패 개수 계산 → 자동 UI 연동
  ---------------------------------- */
  const heicFailCount = files.filter((f) => f.heicFailed).length;

  const canSubmit = files.length > 0;

  useEffect(() => {
    const handler = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setCategoryOpen(false);
        setTimeout(() => setCategoryVisible(false), 180);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleCategory = () => {
    if (!categoryVisible) {
      setCategoryVisible(true);
      setTimeout(() => setCategoryOpen(true), 10);
    } else {
      setCategoryOpen(false);
      setTimeout(() => setCategoryVisible(false), 180);
    }
  };

  /* ===================================================================== */

  return (
    <div className="flex flex-col gap-6 relative w-full h-full max-h-[85vh] overflow-y-auto px-1">
      {/* HEADER */}
      <div className="flex items-center gap-3 pb-3 border-b sticky top-0 bg-white z-10">
        <div className="w-10 h-10 rounded-full bg-accent-pink/10 flex items-center justify-center">
          <ReportIcon className="w-6 h-6 text-accent-pink" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">신고하기</h2>
          <p className="text-xs text-gray-500">
            커뮤니티 가이드 위반 내용을 신고해주세요
          </p>
        </div>
      </div>

      {/* 신고 사유 */}
      <div className="flex flex-col gap-2 relative" ref={categoryRef}>
        <label className="text-sm font-medium text-gray-700">신고 사유</label>

        {/* 선택 버튼 */}
        <div
          onClick={toggleCategory}
          className="
      relative w-full cursor-pointer
      rounded-xl border border-gray-300
      bg-white px-4 py-3
      flex items-center justify-between
      text-sm text-gray-800
      transition-all duration-200
      hover:border-accent-pink hover:shadow-sm
    "
        >
          <span>
            {
              {
                1: "욕설 / 비방",
                2: "스팸 / 광고",
                3: "개인정보 침해",
                4: "지적 재산 침해",
                5: "부적절한 콘텐츠",
              }[categoryId]
            }
          </span>

          <span
            className={`
        transition-transform duration-200
        ${categoryOpen ? "rotate-180" : ""}
      `}
          >
            ▼
          </span>
        </div>

        {/* 드롭다운 */}
        {categoryVisible && (
          <div
            className={`
            absolute z-20 mt-2 w-full
            rounded-[18px]
            bg-white/40 backdrop-blur-xl
            border border-white/20
            shadow-[0_8px_25px_rgba(0,0,0,0.12)]
            overflow-hidden
            transition-all duration-200
            ${
              categoryOpen
                ? "opacity-100 translate-y-17"
                : "opacity-0 -translate-y-2"
            }
          `}
          >
            {[
              { id: 1, label: "욕설 / 비방" },
              { id: 2, label: "스팸 / 광고" },
              { id: 3, label: "개인정보 침해" },
              { id: 4, label: "지적 재산 침해" },
              { id: 5, label: "부적절한 콘텐츠" },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setCategoryId(item.id);
                  setCategoryOpen(false);
                  setTimeout(() => setCategoryVisible(false), 180);
                }}
                className="
                  relative px-4 py-3 cursor-pointer
                  text-sm text-text-black
                  transition
                  hover:bg-accent-pink/10
                "
              >
                {item.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 이미지 업로드 */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">증거 이미지</span>
          <span className="text-red-500 font-medium">
            {files.length}/{MAX_FILES}
          </span>
        </div>

        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`
            flex flex-col items-center justify-center gap-2
            border-2 border-dashed rounded-xl p-8 cursor-pointer transition
            ${
              isDragOver
                ? "border-accent-pink bg-accent-pink/10"
                : "border-gray-300 hover:border-accent-pink hover:bg-accent-pink/5"
            }
          `}
        >
          <input
            type="file"
            multiple
            accept="image/*,.heic,.heif"
            onChange={handleFileInput}
            className="hidden"
          />
          <span className="text-sm text-gray-600">
            클릭하거나 드래그해서 이미지 업로드
          </span>
          <span className="text-xs text-gray-400">최대 10장까지 가능</span>
        </label>

        {/* Preview */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {previews.map((src, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-lg overflow-hidden border"
              >
                <img src={src} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeFile(idx)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-sm hover:bg-black/80"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ⚠️ HEIC 변환 실패 경고 (자동 소멸) */}
      {heicFailCount > 0 && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          일부 HEIC 이미지({heicFailCount}개)를 브라우저에서 변환하지 못했어요.
          <br />
          미리보기가 안 보일 수 있지만 신고는 정상 접수돼요.
        </div>
      )}

      {/* SUBMIT */}
      <div className="sticky bottom-0 bg-white pt-3">
        <button
          disabled={!canSubmit}
          onClick={() =>
            onSubmit({
              categoryId,
              files: files.map((f) => f.file), // 서버에는 File만 전달
            })
          }
          className={`
            w-full py-3 rounded-xl font-semibold transition-all
            ${
              canSubmit
                ? "bg-accent-pink text-white hover:bg-accent-pink/90 active:scale-[0.98]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          신고하기
        </button>
      </div>
    </div>
  );
}
