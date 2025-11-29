import React, { useEffect, useRef, useState, useCallback } from "react";

import PopupCard from "../../components/popup/PopupCard";
import PopupSearchBar from "../../components/popup/PopupSearchBar";
import PopupFilterPanel from "../../components/popup/PopupFilterPanel";
import PopupSortSelect from "../../components/popup/PopupSortSelect";

import {
  fetchPopupListApi,
  togglePopupWishlistApi,
} from "../../api/popupApi";

import { useAuthStore } from "../../store/authStore"; //

const PAGE_SIZE = 12;

export default function PopupListPage() {
  // =========================================
  // 1. 상태 관리
  // =========================================
  
  //로그인 유저 정보 가져오기
  const user = useAuthStore((state) => state.user);
  
  const [popups, setPopups] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasNext, setHasNext] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);

  //검색어
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");

  //필터
  const [filter, setFilter] = useState({
    regions: [],
    startDate: null,
    endDate: null,
    statusList: [],
    minPrice: 0,
    maxPrice: 100000,
  });

  //정렬
  const [sort, setSort] = useState("DEADLINE");

  //찜 로딩 방지
  const [wishlistLoadingId, setWishlistLoadingId] = useState(null);

  //무한 스크롤 타겟
  const loadMoreRef = useRef(null);


  // =========================================
  // 2. 데이터 호출 로직
  // =========================================

  const loadPopupList = useCallback(async ({ cursorParam = null, append = false } = {}) => {
    if (isLoading) return;
    if (append && !hasNext) return;

    setIsLoading(true);
    setIsError(false);

    try {
      //statusList 배열을 콤마로 연결 
      const statusParam = filter.statusList?.length > 0 
        ? filter.statusList.join(",") 
        : undefined;

      const params = {
        cursor: cursorParam,
        size: PAGE_SIZE,
        keyword: appliedKeyword || undefined,
        sort: sort,
        status: statusParam,
        minPrice: filter.minPrice > 0 ? filter.minPrice : undefined,
        maxPrice: filter.maxPrice < 100000 ? filter.maxPrice : undefined,
        startDate: filter.startDate || undefined,
        endDate: filter.endDate || undefined,
        regions: filter.regions?.length > 0 ? filter.regions : undefined,
      };

      const data = await fetchPopupListApi(params);
      const { content = [], nextCursor, hasNext: newHasNext } = data;

      setPopups((prev) => (append ? [...prev, ...content] : content));
      setCursor(nextCursor ?? null);
      setHasNext(newHasNext ?? false);
    } catch (e) {
      console.error("팝업 목록 조회 실패", e);
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsInitialLoaded(true);
    }
  }, [isLoading, hasNext, appliedKeyword, sort, filter]);


  // =========================================
  // 3. 이펙트
  // =========================================

  // 초기화 & 리로드
  useEffect(() => {
    loadPopupList({ cursorParam: null, append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedKeyword, sort, filter]);

  // 무한 스크롤
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNext && !isLoading && cursor) {
          loadPopupList({ cursorParam: cursor, append: true });
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [cursor, hasNext, isLoading, loadPopupList]);


  // =========================================
  // 4. 핸들러
  // =========================================

  const handleSearch = () => {
    setAppliedKeyword(searchQuery.trim());
  };

  const handleToggleWishlist = async (popupId) => {
    if (!popupId || wishlistLoadingId) return;

    try {
      setWishlistLoadingId(popupId);
      const result = await togglePopupWishlistApi(popupId);
      const { isLiked } = result;

      setPopups((prev) =>
        prev.map((item) =>
          item.popId === popupId ? { ...item, isLiked } : item
        )
      );
    } catch (e) {
      // 401 Unauthorized 처리
      if (e.response?.status === 401) {
        if (window.confirm("로그인이 필요한 기능입니다. 로그인 페이지로 이동할까요?")) {
          window.location.href = "/login";
        }
      } else {
        alert("찜 처리 중 오류가 발생했어요.");
      }
    } finally {
      setWishlistLoadingId(null);
    }
  };


  // =========================================
  // 5. 렌더링
  // =========================================
  return (
    <main className="min-h-screen bg-paper-light pb-20">
      
      {/* 1. 헤더 영역 */}
      <section className="pt-[60px] pb-[40px] px-6 text-center">
        <h1 className="text-headline-lg font-bold text-text-black mb-3">
          지금 가볼 만한 팝업 스토어
        </h1>
        <p className="text-body-lg text-text-sub">
          위치, 가격, 진행 상태별로 내가 가고 싶은 팝업을 골라보세요.
        </p>
      </section>

      {/* 2. 검색 & 필터 영역 */}
      <section className="max-w-[1000px] mx-auto px-5 mb-4">
        <div className="flex flex-col gap-8">
          <PopupSearchBar
            keyword={searchQuery}
            setKeyword={setSearchQuery}
            onSearch={handleSearch}
          />
          <PopupFilterPanel 
            filter={filter} 
            onChange={setFilter} 
          />
          <div className="flex justify-end items-center gap-2">
            <PopupSortSelect 
              value={sort} 
              onChange={setSort} 
            />
          </div>
        </div>
      </section>

      {/* 3. 목록 리스트 영역 */}
      <section className="max-w-[1000px] mx-auto px-5"> 
        
        {/* 에러 상태 */}
        {isError && (
          <div className="py-20 flex flex-col items-center gap-4">
            <p className="text-body-md text-text-sub">
              목록을 불러오는 중 문제가 생겼어요.
            </p>
            <button
              onClick={() => loadPopupList({ cursorParam: null, append: false })}
              className="px-6 py-2 rounded-full bg-primary text-text-white text-body-sm hover:bg-primary-dark transition"
            >
              다시 시도하기
            </button>
          </div>
        )}

        {/* 빈 결과 상태 */}
        {!isError && isInitialLoaded && popups.length === 0 && (
          <div className="py-32 flex flex-col items-center gap-3 text-center">
             <div className="text-4xl mb-2">🤔</div>
            <p className="text-headline-sm text-text-black">
              조건에 맞는 팝업 스토어가 없어요.
            </p>
            <p className="text-body-md text-text-sub">
              필터를 변경하거나 다른 검색어로 찾아보세요.
            </p>
            <button
                onClick={() => {
                    setFilter({
                        regions: [],
                        startDate: null,
                        endDate: null,
                        statusList: [],
                        minPrice: 0,
                        maxPrice: 100000,
                    });
                    setAppliedKeyword("");
                    setSearchQuery("");
                }}
                className="mt-4 px-5 py-2 border border-secondary rounded-full text-body-sm hover:bg-paper transition"
            >
                필터 초기화
            </button>
          </div>
        )}

        {/* 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
          {popups.map((popup) => (
            <PopupCard
              key={popup.popId}
              popup={popup}
              onClick={() => window.location.href = `/popups/${popup.popId}`}
              onToggleWishlist={handleToggleWishlist}
              isWishlistLoading={wishlistLoadingId === popup.popId}
              userRole={user?.role}
            />
          ))}
        </div>

        {/* 하단 무한 스크롤 트리거 & 로딩 */}
        <div ref={loadMoreRef} className="h-20 mt-10 flex justify-center items-center">
          {isLoading && (
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
             </div>
          )}
        </div>
      </section>
    </main>
  );
}
