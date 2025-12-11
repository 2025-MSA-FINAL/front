import { useState, useEffect, useRef, useCallback } from "react";
import { fetchPopupListApi, togglePopupWishlistApi } from "../api/popupApi";

const PAGE_SIZE = 12;

//오늘 날짜 YYYY-MM-DD
const getTodayYmd = () => {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function usePopupList() {
  // =========================================
  // 1. 상태 관리
  // =========================================
  
  //데이터 상태
  const [popups, setPopups] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasNext, setHasNext] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);
  
  //DEADLINE 2단계 이어달리기 상태 (false: 1단계, true: 2단계)
  const [isLoadingEnded, setIsLoadingEnded] = useState(false);

  //UI 상태
  const [viewMode, setViewMode] = useState("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  //검색 & 필터 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [sort, setSort] = useState("DEADLINE");
  const [filter, setFilter] = useState({
    regions: [],
    startDate: null,
    endDate: null,
    statusList: [],
    minPrice: 0,
    maxPrice: 100000,
    freeOnly: false,
  });

  const [wishlistLoadingId, setWishlistLoadingId] = useState(null);
  const loadMoreRef = useRef(null);

  // =========================================
  // 2. 데이터 호출 로직
  // =========================================
  const loadPopupList = useCallback(
    async ({ cursorParam = null, append = false, deadlinePhase = "AUTO" } = {}) => {
      if (append && isLoading) return;
      if (append && !hasNext) return;

      setIsLoading(true);
      setIsError(false);

      try {
        const hasExplicitStatus = filter.statusList?.length > 0;
        const isDeadlineSort = sort === "DEADLINE" && !hasExplicitStatus;
        let effectivePhase = deadlinePhase;
        
        //현재 상태에 따라 1단계(진행중)인지 2단계(종료)인지 판단
        if (deadlinePhase === "AUTO") {
          effectivePhase = isLoadingEnded ? "ENDED" : "ONGOING";
        }

        //파라미터 구성
        let statusParam;
        if (hasExplicitStatus) {
          statusParam = filter.statusList.join(",");
        } else if (isDeadlineSort) {
          statusParam = effectivePhase === "ENDED" ? "ENDED" : "ONGOING,UPCOMING";
        } else {
          statusParam = undefined;
        }

        const params = {
          cursor: cursorParam,
          size: PAGE_SIZE,
          keyword: appliedKeyword || undefined,
          sort: sort,
          status: statusParam,
          minPrice: filter.freeOnly ? 0 : filter.minPrice > 0 ? filter.minPrice : undefined,
          maxPrice: filter.freeOnly ? 0 : filter.maxPrice < 100000 ? filter.maxPrice : undefined,
          startDate: filter.startDate || undefined,
          endDate: filter.endDate || undefined,
          regions: filter.regions?.length > 0 ? filter.regions : undefined,
        };

        const data = await fetchPopupListApi(params);
        const { content = [], nextCursor, hasNext: serverHasNext } = data;

        setPopups((prev) => {
          if (!append) return content;
          //중복 제거
          const combined = [...prev, ...content];
          const uniqueMap = new Map(combined.map((item) => [item.popId, item]));
          return Array.from(uniqueMap.values());
        });

        //이어달리기 로직 판단
        if (isDeadlineSort) {
          if (!serverHasNext && effectivePhase === "ONGOING") {
            //1단계 끝 -> 2단계 준비
            setIsLoadingEnded(true);
            setCursor(null);
            setHasNext(true);
          } else {
            setCursor(nextCursor ?? null);
            setHasNext(serverHasNext ?? false);
          }
        } else {
          setCursor(nextCursor ?? null);
          setHasNext(serverHasNext ?? false);
        }
      } catch (e) {
        console.error("❌ 팝업 목록 조회 실패", e);
        setIsError(true);
      } finally {
        setIsLoading(false);
        setIsInitialLoaded(true);
      }
    },
    [isLoading, hasNext, appliedKeyword, sort, filter, isLoadingEnded]
  );

  //Effect: DEADLINE 2단계(종료된 팝업) 이어달리기 자동 시작
  useEffect(() => {
    if (isLoadingEnded) {
      loadPopupList({ cursorParam: null, append: true, deadlinePhase: "ENDED" });
    }
  }, [isLoadingEnded, loadPopupList]);

  //Effect: 필터/정렬/검색어 변경 시 목록 리셋
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setPopups([]);
    setCursor(null);
    setHasNext(true);
    setIsInitialLoaded(false);
    setIsLoadingEnded(false);
    loadPopupList({ cursorParam: null, append: false, deadlinePhase: "ONGOING" });
  }, [appliedKeyword, sort, filter]);

  //Effect: 무한 스크롤 Observer
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !isLoading && cursor && !isError) {
          loadPopupList({ cursorParam: cursor, append: true });
        }
      },
      { threshold: 1.0 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [cursor, hasNext, isLoading, loadPopupList, isError]);

  // =========================================
  // 3. 핸들러 및 헬퍼
  // =========================================
  const handleSearch = () => setAppliedKeyword(searchQuery.trim());

  const handleToggleWishlist = async (popupId) => {
    if (!popupId || wishlistLoadingId) return;
    try {
      setWishlistLoadingId(popupId);
      const result = await togglePopupWishlistApi(popupId);
      setPopups((prev) =>
        prev.map((item) => (item.popId === popupId ? { ...item, isLiked: result.isLiked } : item))
      );
    } catch (e) {
      if (e.response?.status === 401) {
        if (window.confirm("로그인이 필요합니다. 이동하시겠습니까?")) {
          window.location.href = "/login";
        }
      }
    } finally {
      setWishlistLoadingId(null);
    }
  };

  //퀵 필터 헬퍼 로직
  const todayStr = getTodayYmd();
  const isFilterDefault =
    !(filter.regions?.length) && 
    !filter.startDate && 
    !filter.endDate && 
    !(filter.statusList?.length) && 
    !filter.freeOnly && 
    (filter.minPrice === 0 && filter.maxPrice === 100000);
    
  const isTodayQuickActive = filter.startDate === todayStr && filter.endDate === todayStr;
  const isOngoingQuickActive = filter.statusList?.length === 1 && filter.statusList[0] === "ONGOING";
  const isFilterDirty = !isFilterDefault;

  const toggleQuickFilter = (type) => {
    if (type === "TODAY") {
      setFilter((prev) => {
        const alreadyToday = prev.startDate === todayStr && prev.endDate === todayStr;
        if (alreadyToday) return { ...prev, startDate: null, endDate: null };
        return { ...prev, startDate: todayStr, endDate: todayStr };
      });
    } else if (type === "ONGOING_ONLY") {
      setFilter((prev) => {
        const current = prev.statusList || [];
        const onlyOngoing = current.length === 1 && current[0] === "ONGOING";
        return { ...prev, statusList: onlyOngoing ? [] : ["ONGOING"] };
      });
    } else if (type === "FREE") {
      setFilter((prev) => ({ ...prev, freeOnly: !prev.freeOnly }));
    } else if (type === "RESET") {
      setFilter({
        regions: [], startDate: null, endDate: null, statusList: [], minPrice: 0, maxPrice: 100000, freeOnly: false,
      });
      setAppliedKeyword("");
      setSearchQuery("");
      setSort("DEADLINE");
    }
  };

  return {
    // Data
    popups,
    isLoading,
    isError,
    isInitialLoaded,
    wishlistLoadingId,
    
    // UI State
    viewMode, setViewMode,
    isFilterOpen, setIsFilterOpen,
    loadMoreRef,
    
    // Search & Filter State
    searchQuery, setSearchQuery,
    sort, setSort,
    filter, setFilter,
    
    // Computed Values (for UI)
    isFilterDefault,
    isTodayQuickActive,
    isOngoingQuickActive,
    isFilterDirty,
    
    // Actions
    handleSearch,
    handleToggleWishlist,
    toggleQuickFilter,
    retryLoad: () => loadPopupList({ cursorParam: null, append: false, deadlinePhase: "ONGOING" }),
  };
}