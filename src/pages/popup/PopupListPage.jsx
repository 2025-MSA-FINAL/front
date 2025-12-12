import React, { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { usePopupList } from "../../hooks/usePopupList"; // 훅 import

//컴포넌트 임포트
import PopupCard from "../../components/popup/PopupCard";
import PopupFilterPanel from "../../components/popup/PopupFilterPanel";

//뷰 모드 상수
const VIEW_MODES = {
  GRID: "grid",
  LIST_2: "list2",
  LIST_1: "list1",
};

export default function PopupListPage() {
  const user = useAuthStore((state) => state.user);

  const {
    popups, isLoading, isError, isInitialLoaded, wishlistLoadingId,
    viewMode, setViewMode, isFilterOpen, setIsFilterOpen, loadMoreRef,
    searchQuery, setSearchQuery, sort, setSort, filter, setFilter,
    isFilterDefault, isTodayQuickActive, isOngoingQuickActive, isFilterDirty,
    handleSearch, handleToggleWishlist, toggleQuickFilter, retryLoad
  } = usePopupList();

  //모달 열림 시 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = isFilterOpen ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [isFilterOpen]);

  return (
    <div className="min-h-screen bg-[var(--color-secondary-light)] font-[var(--font-sans)] pb-20">
      {/* 1. 헤더 */}
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-8 animate-[fade-up_0.5s_ease-out_forwards]">
        <h1 className="text-[32px] font-bold tracking-tight text-[var(--color-text-black)] mb-2">
          지금 가볼 만한 팝업 스토어
        </h1>
        <p className="text-[16px] text-[var(--color-text-sub)]">
          서울부터 제주까지, 전국의 트렌디한 공간을 큐레이션 해드립니다.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* 2. 컨트롤 바 */}
        <section className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-secondary-dark)] group-focus-within:text-[var(--color-primary)] transition-colors">
              <SearchIcon />
            </div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full bg-[var(--color-paper)] pl-11 pr-4 py-3 rounded-[8px] border border-transparent shadow-[var(--shadow-card)] outline-none focus:border-[var(--color-primary)] focus:shadow-[var(--shadow-brand)] transition-all text-[14px] placeholder:text-[var(--color-text-sub)]"
              placeholder="이름·해시태그 검색"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="bg-[var(--color-paper)] p-1 rounded-[8px] border border-[var(--color-secondary)] flex shadow-sm">
              <ViewModeBtn
                mode={VIEW_MODES.GRID}
                current={viewMode}
                onClick={setViewMode}
                icon={<GridIcon />}
              />
              <ViewModeBtn
                mode={VIEW_MODES.LIST_2}
                current={viewMode}
                onClick={setViewMode}
                icon={<ListTwoIcon />}
              />
              <ViewModeBtn
                mode={VIEW_MODES.LIST_1}
                current={viewMode}
                onClick={setViewMode}
                icon={<ListOneIcon />}
              />
            </div>

            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2.5 bg-[var(--color-paper)] border border-[var(--color-secondary)] rounded-[8px] text-[13px] text-[var(--color-text-sub)] font-medium outline-none cursor-pointer hover:border-[var(--color-secondary-dark)] transition-colors"
              >
                <option value="DEADLINE">마감 임박순</option>
                <option value="POPULAR">인기순 (찜+조회)</option>
                <option value="VIEW">조회 많은순</option>
                <option value="CREATED">최신 등록순</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-sub)] text-xs">
                ▼
              </div>
            </div>
          </div>
        </section>

        {/* 3. 필터 바 */}
        <section className="flex flex-wrap gap-2 items-center">
          <QuickFilterChip
            label="전체"
            active={isFilterDefault}
            onClick={() => toggleQuickFilter("RESET")}
          />
          <QuickFilterChip
            label="오늘"
            active={isTodayQuickActive}
            onClick={() => toggleQuickFilter("TODAY")}
          />
          <QuickFilterChip
            label="진행 중"
            active={isOngoingQuickActive}
            onClick={() => toggleQuickFilter("ONGOING_ONLY")}
          />
          <QuickFilterChip
            label="무료 입장"
            active={filter.freeOnly}
            onClick={() => toggleQuickFilter("FREE")}
          />

          <div className="w-[1px] h-5 bg-[var(--color-secondary)] mx-2 hidden sm:block"></div>

          <button
            onClick={() => setIsFilterOpen(true)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-[13px] font-medium transition-all shadow-sm
              ${isFilterDirty
                ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)]"
                : "border-[var(--color-secondary)] bg-[var(--color-paper)] text-[var(--color-text-sub)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              }
            `}
          >
            <FilterIcon />
            <span>상세 필터</span>
            {isFilterDirty && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-dark)]" />
            )}
          </button>
        </section>

        {/* 4. 리스트 렌더링 영역 */}
        <section>
          {isError ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <p className="text-[var(--color-text-sub)] mb-4">
                목록을 불러오는 중 문제가 발생했습니다.
              </p>
              <button
                onClick={retryLoad}
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              >
                다시 시도하기
              </button>
            </div>
          ) : !isInitialLoaded && isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] bg-gray-200 rounded-[20px] animate-pulse"
                />
              ))}
            </div>
          ) : popups.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center opacity-70">
              <span className="text-4xl mb-2">🤔</span>
              <p className="text-[var(--color-text-black)] font-bold">
                조건에 맞는 팝업이 없어요
              </p>
              <p className="text-[var(--color-text-sub)] text-sm">
                필터를 변경하거나 다른 검색어로 찾아보세요
              </p>
              <button
                onClick={() => toggleQuickFilter("RESET")}
                className="mt-4 px-4 py-2 bg-white border rounded-full text-sm"
              >
                초기화
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === VIEW_MODES.GRID
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10"
                  : viewMode === VIEW_MODES.LIST_2
                    ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                    : "space-y-4" // LIST_1
              }
            >
              {popups.map((popup) => (
                <PopupCard
                  key={popup.popId}
                  popup={popup}
                  viewMode={viewMode}
                  onClick={() =>
                    (window.location.href = `/popup/${popup.popId}`)
                  }
                  onToggleWishlist={handleToggleWishlist}
                  isWishlistLoading={wishlistLoadingId === popup.popId}
                  userRole={user?.role}
                />
              ))}
            </div>
          )}

          {!isError && (
            <div
              ref={loadMoreRef}
              className="h-20 mt-10 flex justify-center items-center"
            >
              {isLoading && (
                <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          )}
        </section>
      </div>

      {isFilterOpen && (
        <PopupFilterPanel
          filter={filter}
          onChange={setFilter}
          onClose={() => setIsFilterOpen(false)}
        />
      )}
    </div>
  );
}

// ─────────── [Sub Components] ───────────
function ViewModeBtn({ mode, current, onClick, icon }) {
  const isActive = mode === current;
  return (
    <button
      onClick={() => onClick(mode)}
      className={`p-2 rounded-[6px] transition-all ${isActive
          ? "bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)]"
          : "text-[var(--color-text-sub)] hover:text-[var(--color-text-main)]"
        }`}
    >
      {icon}
    </button>
  );
}

function QuickFilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 border
      ${active
          ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md"
          : "bg-[var(--color-paper)] text-[var(--color-text-sub)] border-[var(--color-secondary)] hover:border-[var(--color-primary-soft)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-paper-light)]"
        }`}
    >
      {label}
    </button>
  );
}

const SearchIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const FilterIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);
const GridIcon = () => (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
    <path d="M10 3H3v7h7V3zm11 0h-7v7h7V3zm0 11h-7v7h7v-7zM10 14H3v7h7v-7z" />
  </svg>
);
const ListTwoIcon = () => (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 5h8v4H3V5zm10 0h8v4h-8V5zM3 13h8v4H3v-4zm10 0h8v4h-8v-4z" />
  </svg>
);
const ListOneIcon = () => (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
    <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5S3.17 13.5 4 13.5 5.5 12.83 5.5 12 4.83 10.5 4 10.5zm0-6C3.17 4.5 2.5 5.17 2.5 6S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5S3.17 19.5 4 19.5 5.5 18.83 5.5 18 4.83 16.5 4 16.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
  </svg>
);