import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { fetchManagerPopupListApi } from "../../api/managerApi";

import ManagerPopupStatusTabs from "./ManagerPopupStatusTabs";
import ManagerPopupGrid from "./ManagerPopupGrid";
import ManagerPopupSortSelect from "./ManagerPopupSortSelect";

const PAGE_SIZE = 8;

export default function ManagerMyPopupListSection() {
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);

  // status = 승인 상태 필터 (ALL / APPROVED / PENDING / REJECTED)
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [popupSort, setPopupSort] = useState("DEADLINE");

  const [popupPageData, setPopupPageData] = useState(null);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupError, setPopupError] = useState(null);

  // B안: "대기 / 반려" 탭에서는 최신순 고정, 정렬 UI도 숨김
  // "전체 / 승인 완료" 탭에서만 정렬 옵션 제공
  const isSortAvailable =
    statusFilter === "ALL" || statusFilter === "APPROVED";

  const loadPopupList = useCallback(async () => {
    if (!authUser) return;

    setPopupLoading(true);
    setPopupError(null);

    try {
      const data = await fetchManagerPopupListApi({
        page,
        size: PAGE_SIZE,
        status: statusFilter, // 백엔드에서 승인 상태로 해석
        sort: isSortAvailable ? popupSort : "CREATED", // PENDING / REJECTED는 항상 최신순
      });
      setPopupPageData(data);
    } catch (err) {
      console.error(err);
      setPopupError("목록을 불러오지 못했습니다.");
    } finally {
      setPopupLoading(false);
    }
  }, [authUser, page, statusFilter, popupSort, isSortAvailable]);

  useEffect(() => {
    loadPopupList();
  }, [loadPopupList]);

  const handleChangeStatus = (nextStatus) => {
    setStatusFilter(nextStatus);
    setPage(0);

    // 대기/반려로 바꿀 때는 무조건 최신순으로 맞춰둔다 (B안)
    if (nextStatus === "PENDING" || nextStatus === "REJECTED") {
      setPopupSort("CREATED");
    }

    // 승인 완료/전체 탭일 때는 이전에 쓰던 정렬 그대로 두기
  };

  const handleChangeSort = (nextSort) => {
    if (!isSortAvailable) return; // 방어 코드 (이론상 안 들어오긴 함)
    setPopupSort(nextSort);
    setPage(0);
  };

  const handleClickPopup = (popId) => {
    navigate(`/manager/popup/${popId}`);
  };

  return (
    <section className="w-full max-w-[1120px] mb-20">
      {/* 1. 섹션 헤더 (제목 + 설명) */}
      <div className="mb-1">
        <h2 className="text-[20px] font-bold text-text-black mb-1">
          내가 등록한 팝업
        </h2>
        <p className="text-[13px] text-text-sub">
          매니저님이 등록한 팝업 스토어의 승인 상태와 진행 현황을 한눈에
          관리해보세요.
        </p>
      </div>

      {/* 2. 컨트롤 바 (탭 + 정렬) */}
      <div
        className="
          flex flex-col sm:flex-row 
          items-start sm:items-end
          justify-between 
          gap-3 mb-4 
          pb-0
        "
      >
        {/* 좌측: 승인 상태 탭 */}
        <div className="flex-1 w-full">
          <ManagerPopupStatusTabs
            value={statusFilter}
            onChange={handleChangeStatus}
          />
        </div>

        {/* 우측: 정렬 버튼 (전체 / 승인 완료에서만 노출) */}
        {isSortAvailable && (
          <div className="flex items-center justify-end mb-1 sm:mb-0 py-1 px-4 sm:px-0 w-full sm:w-auto">
            <ManagerPopupSortSelect
              value={popupSort}
              onChange={handleChangeSort}
            />
          </div>
        )}
      </div>

      {/* 3. 리스트 (이전의 그리드) */}
      <ManagerPopupGrid
        pageData={popupPageData}
        loading={popupLoading}
        error={popupError}
        onRetry={loadPopupList}
        onChangePage={setPage}
        onClickItem={handleClickPopup}
      />
    </section>
  );
}
