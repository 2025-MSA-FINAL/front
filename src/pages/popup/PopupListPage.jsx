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

  //상단 상태
  const [isLoadingEnded, setIsLoadingEnded] = useState(false);


  // =========================================
  // 2. 데이터 호출 로직 (수정완료: 이어달리기 적용)
  // =========================================

  const loadPopupList = useCallback(async ({ cursorParam = null, append = false } = {}) => {
    //이어달리기로 넘어가는 순간에 isLoading 체크를 무시
    if (append && isLoading) return;
    
    //더 이상 불러올 게 없는데(hasNext: false), 이어달리기(isLoadingEnded)도 아니라면 진짜 끝
    if (append && !hasNext && !isLoadingEnded) return;

    setIsLoading(true);
    setIsError(false);

    try {
      //마감임박순(DEADLINE)일 때만 자동 이어달리기 필터 적용
      let statusParam;
      
      // 1. 사용자가 필터에서 직접 상태를 골랐으면 그걸 최우선으로 따름
      if (filter.statusList?.length > 0) {
        statusParam = filter.statusList.join(",");
      } 
      // 2. 사용자가 상태 필터를 안 걸었고, 정렬이 마감임박순이라면 자동 분기
      else if (sort === "DEADLINE") {
        if (isLoadingEnded) {
            statusParam = "ENDED";            // 2단계: 종료된 것만 불러오기
        } else {
            statusParam = "ONGOING,UPCOMING"; // 1단계: 진행중/예정만 불러오기
        }
      } 
      // 3. 그 외에는 파라미터 안 보냄 (전체 조회)
      else {
        statusParam = undefined;
      }

      const params = {
        cursor: cursorParam,
        size: PAGE_SIZE,
        keyword: appliedKeyword || undefined,
        sort: sort,
        status: statusParam, //위에서 결정한 값 사용
        minPrice: filter.minPrice > 0 ? filter.minPrice : undefined,
        maxPrice: filter.maxPrice < 100000 ? filter.maxPrice : undefined,
        startDate: filter.startDate || undefined,
        endDate: filter.endDate || undefined,
        regions: filter.regions?.length > 0 ? filter.regions : undefined,
      };

      const data = await fetchPopupListApi(params);
      const { content = [], nextCursor, hasNext: serverHasNext } = data;

      //중복 제거
      setPopups((prev) => {
        if (!append) return content;
        const combined = [...prev, ...content];
        const uniqueMap = new Map(combined.map((item) => [item.popId, item]));
        return Array.from(uniqueMap.values());
      });

      //이어달리기 전환 판단
      //마감임박순이고, 유저가 따로 상태 필터를 안 걸었을 때만 작동
      if (sort === "DEADLINE" && !filter.statusList?.length) {
        
        //서버가 더 없음(false)이라고 했는데, 아직 1단계(진행중)였다면
        if (!serverHasNext && !isLoadingEnded) {
            console.log("진행중 팝업 소진. 종료된 팝업 로딩 모드 전환");
            setIsLoadingEnded(true); //2단계 ON
            setCursor(null);         //커서 초기화 (종료된 팝업 1페이지부터 시작)
            setHasNext(true);        //스크롤 계속 되게 강제 설정
        } else {
            //평범한 상황 (계속 1단계거나 이미 2단계거나)
            setCursor(nextCursor ?? null);
            setHasNext(serverHasNext ?? false);
        }
      } else {
        //다른 정렬일 때는 서버 응답 그대로 따름
        setCursor(nextCursor ?? null);
        setHasNext(serverHasNext ?? false);
      }

    } catch (e) {
      console.error("팝업 목록 조회 실패", e);
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsInitialLoaded(true);
    }
  }, [isLoading, hasNext, appliedKeyword, sort, filter, isLoadingEnded]); // isLoadingEnded 의존성 필수!

  //이어달리기 모드가 켜지면, 자동으로 종료된 팝업 1페이지를 호출
  useEffect(() => {
    if (isLoadingEnded) {
      loadPopupList({ cursorParam: null, append: true });
    }
  }, [isLoadingEnded]);

  // =========================================
  // 3. 이펙트
  // =========================================

  // 초기화 & 리로드
  useEffect(() => {
    //정렬이나 필터가 바뀌면 즉시 화면 비우기
    setPopups([]);
    setCursor(null);
    setHasNext(true);
    setIsInitialLoaded(false); // 로딩 표시를 위해 초기화

    setIsLoadingEnded(false);

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
      </section>

      {/* 2. 검색 & 필터 영역 */}
      <section className="max-w-[1000px] mx-auto px-5 mb-4">
        <div className="flex flex-col gap-4">
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
