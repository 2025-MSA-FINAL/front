import React, { useEffect, useState } from "react";
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

    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(0);
    const [popupSort, setPopupSort] = useState("DEADLINE");

    const [popupPageData, setPopupPageData] = useState(null);
    const [popupLoading, setPopupLoading] = useState(false);
    const [popupError, setPopupError] = useState(null);

    const loadPopupList = async () => {
        if (!authUser) return;
        setPopupLoading(true);
        setPopupError(null);
        try {
            const data = await fetchManagerPopupListApi({
                page,
                size: PAGE_SIZE,
                status: statusFilter,
                sort: popupSort,
            });
            setPopupPageData(data);
        } catch (err) {
            console.error(err);
            setPopupError("목록을 불러오지 못했습니다.");
        } finally {
            setPopupLoading(false);
        }
    };

    useEffect(() => {
        loadPopupList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authUser, page, statusFilter, popupSort]);

    const handleChangeStatus = (nextStatus) => {
        setStatusFilter(nextStatus);
        setPage(0);
    };

    const handleChangeSort = (nextSort) => {
        setPopupSort(nextSort);
        setPage(0);
    };

    const handleClickPopup = (popId) => {
        navigate(`/manager/popup/${popId}`);
    };

    return (
        <section className="w-full max-w-[900px] mb-20">
            {/* 1. 섹션 헤더 (제목 + 설명) */}
            <div className="mb-1">
                <h2 className="text-[20px] font-bold text-text-black mb-1">
                    내가 등록한 팝업
                </h2>
                <p className="text-[13px] text-text-sub">
                    매니저님이 등록한 팝업 스토어의 현황을 확인하고 관리해보세요.
                </p>
            </div>

            {/* 2. 컨트롤 바 (탭 + 정렬) */}
            <div className="
                    flex flex-col sm:flex-row 
                    items-start sm:items-end    
                    justify-between 
                    gap-3 mb-4 
                    border-b border-secondary-light pb-0
                ">
                {/* 좌측: 탭 메뉴 */}
                <div className="flex-1">
                    <ManagerPopupStatusTabs
                        value={statusFilter}
                        onChange={handleChangeStatus}
                    />
                </div>

                {/* 우측: 정렬 버튼 */}
                <div className="flex items-center justify-end mb-1 sm:mb-0 py-1">
                    <ManagerPopupSortSelect
                        value={popupSort}
                        onChange={handleChangeSort}
                    />
                </div>
            </div>

            {/* 3. 그리드 리스트 */}
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
