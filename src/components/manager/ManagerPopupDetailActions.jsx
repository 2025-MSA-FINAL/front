// src/components/manager/ManagerPopupDetailActions.jsx
import PrimaryButton from "../button/PrimaryButton";

export default function ManagerPopupDetailActions({
  onClickViewUserPage,
  onClickEdit,
  onClickDelete,
  deleting,
}) {
  return (
    <div className="mt-6 flex items-center justify-between gap-4">
      {/* 왼쪽: 수정 / 삭제 버튼 (같은 모양) */}
      <div className="flex items-center gap-2">
        {/* 삭제 버튼: 회색 */}
        <button
          type="button"
          onClick={onClickDelete}
          disabled={deleting}
          className={`
            min-w-[70px] h-10 px-4 rounded-full text-[14px] font-medium
            border border-secondary-light bg-secondary-light/70 text-text-sub
            hover:bg-secondary hover:border-secondary hover:text-text-black
            disabled:opacity-60 disabled:cursor-not-allowed
            transition-colors
          `}
        >
          {deleting ? "삭제 중..." : "삭제"}
        </button>

        {/* 수정 버튼: 보라색 아웃라인 + hover 시 연보라 배경 */}
        <button
          type="button"
          onClick={onClickEdit}
          className={`
            min-w-[70px] h-10 px-4 rounded-full text-[14px] font-medium
            border border-primary bg-transparent text-primary
            hover:bg-primary-light hover:shadow-sm
            transition-colors transition-shadow
          `}
        >
          수정
        </button>
      </div>

      {/* 오른쪽: 상세보기 버튼 — 예약하기 버튼 스타일/크기 */}
      <div className="flex-1">
        <PrimaryButton
          onClick={onClickViewUserPage}
          size="lg"
          fullWidth
          className="
            h-12 rounded-full text-[16px] font-bold shadow-brand
            hover:brightness-105 active:scale-[0.98]
          "
        >
          상세보기
        </PrimaryButton>
      </div>
    </div>
  );
}
