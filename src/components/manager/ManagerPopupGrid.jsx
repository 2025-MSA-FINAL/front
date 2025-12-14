// src/components/manager/ManagerPopupGrid.jsx
import React from "react";
import Pagination from "../Pagination";
import PopupCard from "../popup/PopupCard";

export default function ManagerPopupGrid({
  pageData,
  loading,
  error,
  onRetry,
  onChangePage,
  onClickItem,
}) {
  const content = pageData?.content ?? [];
  const pageNumber = pageData?.pageNumber ?? 0;
  const totalPages = pageData?.totalPages ?? 0;

  //로딩
  if (loading && !pageData) {
    return (
      <section className="max-w-[900px] mx-auto px-4 py-16">
        <p className="text-text-sub text-center">
          나의 팝업을 불러오는 중입니다.
        </p>
      </section>
    );
  }

  //에러
  if (error) {
    return (
      <section className="max-w-[900px] mx-auto px-4 py-16 flex flex-col items-center gap-4">
        <p className="text-text-sub text-center">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-5 py-2 rounded-full border border-secondary text-[13px] hover:bg-paper transition"
          >
            다시 시도하기
          </button>
        )}
      </section>
    );
  }

  //빈 상태
  if (!loading && content.length === 0) {
    return (
      <section className="max-w-[900px] mx-auto px-4 py-20 flex flex-col items-center gap-3 text-center">
        <div className="text-4xl mb-2">🧐</div>
        <p className="text-headline-sm text-text-black">
          등록한 팝업이 아직 없어요.
        </p>
        <p className="text-body-md text-text-sub">
          새로운 팝업을 등록하면 이곳에서 한 번에 관리할 수 있어요.
        </p>
      </section>
    );
  }

  return (
  <section className="w-full max-w-[1120px] mx-auto px-4 pt-3 pb-16">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6">
      {content.map((popup) => (
        <div key={popup.popId} className="w-full">
          <PopupCard
            popup={popup}
            userRole="MANAGER"
            viewMode="list2"
            onClick={() => onClickItem?.(popup.popId)}
          />
        </div>
      ))}
    </div>

    <Pagination
      page={pageNumber}
      totalPages={totalPages}
      onChange={onChangePage}
    />
  </section>
);
}
