import React, { useState, useEffect } from "react";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. 리얼 더미 데이터 (레이아웃 파괴 테스트용)
 * ─────────────────────────────────────────────────────────────────────────────
 */
const DUMMY_POPUPS = [
  {
    id: 1,
    name: "성수동 빈티지 굿즈 마켓 & 아티스트 콜라보 팝업",
    location: "서울 성동구 연무장길",
    period: "11.20 - 12.05",
    status: "ONGOING",
    isFree: true,
    imageUrl:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800",
    tags: ["#성수", "#빈티지", "#단독입점"],
  },
  {
    id: 2,
    name: "2025 S/S 한정판 스니커즈 'The Phantom' 런칭 쇼케이스 (사전 예약 필수)",
    location: "서울 강남구 도산대로",
    period: "11.25 - 12.10",
    status: "UPCOMING",
    isFree: false,
    imageUrl:
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=80&w=800",
    tags: ["#스니커즈", "#드로우", "#리셀주의", "#한정판"],
  },
  {
    id: 3,
    name: "달콤한 휴식, 디저트 페스타",
    location: "서울 마포구",
    period: "11.18 - 11.30",
    status: "ENDED",
    isFree: false,
    imageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800",
    tags: ["#푸드", "#데이트"],
  },
  {
    id: 4,
    name: "젠틀몬스터 x 마르지엘라 퓨처리스틱 전시",
    location: "서울 용산구",
    period: "12.01 - 12.15",
    status: "ONGOING",
    isFree: true,
    imageUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800",
    tags: ["#전시", "#포토존", "#웨이팅필수"],
  },
  {
    id: 5,
    name: "레트로 게임 스테이션: 추억의 오락실",
    location: "서울 종로구 익선동",
    period: "12.10 - 12.31",
    status: "UPCOMING",
    isFree: true,
    imageUrl:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800",
    tags: ["#레트로", "#게임", "#이색체험"],
  },
];

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 2. 메인 페이지 컴포넌트 (프리뷰용)
 *   - viewMode: grid | list2 | list1
 * ─────────────────────────────────────────────────────────────────────────────
 */
const VIEW_MODES = {
  GRID: "grid",
  LIST_2: "list2",
  LIST_1: "list1",
};

export default function PopupListPreviewFinal() {
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // 모달 상태

  // 모달 열렸을 때 백그라운드 스크롤 막기
  useEffect(() => {
    if (isFilterOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => (document.body.style.overflow = "unset");
  }, [isFilterOpen]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans pb-20">
      {/* 헤더 영역 */}
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          지금 주목해야 할 팝업
        </h1>
        <p className="text-slate-500 text-sm md:text-base">
          서울 곳곳의 트렌디한 공간을 큐레이션 해드립니다.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* 컨트롤 바 (검색 + 뷰 모드 토글) */}
        <section className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* 검색창 */}
          <div className="relative w-full md:w-96 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7C3AED] transition-colors">
              <SearchIcon />
            </div>
            <input
              className="w-full bg-white pl-11 pr-4 py-3 rounded-full border border-slate-200 shadow-sm outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all placeholder:text-slate-400 text-sm"
              placeholder="지역, 브랜드, 태그로 찾아보세요"
            />
          </div>

          {/* 뷰 모드 토글 */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="bg-white p-1 rounded-lg border border-slate-200 flex shadow-sm">
              {/* GRID */}
              <button
                onClick={() => setViewMode(VIEW_MODES.GRID)}
                className={`p-2 rounded-md transition-all ${
                  viewMode === VIEW_MODES.GRID
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="그리드"
              >
                <GridIcon />
              </button>
              {/* LIST 2열 */}
              <button
                onClick={() => setViewMode(VIEW_MODES.LIST_2)}
                className={`p-2 rounded-md transition-all ${
                  viewMode === VIEW_MODES.LIST_2
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="리스트 2열"
              >
                <ListTwoIcon />
              </button>
              {/* LIST 1열 */}
              <button
                onClick={() => setViewMode(VIEW_MODES.LIST_1)}
                className={`p-2 rounded-md transition-all ${
                  viewMode === VIEW_MODES.LIST_1
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="리스트 1열"
              >
                <ListIcon />
              </button>
            </div>
          </div>
        </section>

        {/* 필터 칩 & 상세 필터 버튼 */}
        <section className="flex flex-wrap gap-2 items-center">
          {/* Quick Filters */}
          <FilterChip label="전체" active />
          <FilterChip label="성수 · 서울숲" />
          <FilterChip label="강남 · 역삼" />
          <FilterChip label="이번 주말" />
          <FilterChip label="무료 입장" />

          <div className="w-[1px] h-6 bg-slate-300 mx-2 hidden sm:block"></div>

          {/* 상세 필터 트리거 버튼 */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
          >
            <FilterIcon />
            상세 필터
          </button>

          {/* 결과 개수 (예시) */}
          <span className="ml-auto text-xs text-slate-500">
            총 <span className="font-semibold">{DUMMY_POPUPS.length}</span>개
            팝업
          </span>
        </section>

        {/* 리스트 렌더링 영역 */}
        <section className="mt-2">
          {viewMode === VIEW_MODES.GRID && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {DUMMY_POPUPS.map((popup) => (
                <RefinedGridCard key={popup.id} data={popup} />
              ))}
            </div>
          )}

          {viewMode === VIEW_MODES.LIST_2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DUMMY_POPUPS.map((popup) => (
                <RefinedListCard key={popup.id} data={popup} />
              ))}
            </div>
          )}

          {viewMode === VIEW_MODES.LIST_1 && (
            <div className="space-y-4">
              {DUMMY_POPUPS.map((popup) => (
                <RefinedListCard key={popup.id} data={popup} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 상세 필터 모달 */}
      {isFilterOpen && <FilterModal onClose={() => setIsFilterOpen(false)} />}
    </div>
  );
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 3. 상세 필터 모달
 * ─────────────────────────────────────────────────────────────────────────────
 */
function FilterModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose} // 배경 클릭 시 닫기
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫기 방지
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">상세 필터 설정</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* 바디 (스크롤 가능) */}
        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* 지역 */}
          <section>
            <h3 className="text-sm font-bold text-slate-900 mb-3">지역 선택</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                "강남·역삼",
                "성수·서울숲",
                "홍대·합정",
                "한남·이태원",
                "압구정·청담",
                "을지로·종로",
              ].map((loc) => (
                <label
                  key={loc}
                  className="flex items-center gap-2 cursor-pointer group select-none"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-[#7C3AED] focus:ring-[#7C3AED]"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                    {loc}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* 기간 */}
          <section>
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              방문 가능한 날짜
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-[#7C3AED]"
              />
              <span className="text-slate-400">~</span>
              <input
                type="date"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-[#7C3AED]"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors">
                이번 주말
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors">
                다음 주
              </button>
            </div>
          </section>

          {/* 가격 (라디오) */}
          <section>
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              입장료 / 예산
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:border-[#7C3AED] has-[:checked]:border-[#7C3AED] has-[:checked]:bg-purple-50 transition-all">
                <input
                  type="radio"
                  name="price"
                  className="w-4 h-4 text-[#7C3AED] focus:ring-[#7C3AED] accent-[#7C3AED]"
                  defaultChecked
                />
                <span className="text-sm font-medium text-slate-700">
                  무료 입장만 보기
                </span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:border-[#7C3AED] has-[:checked]:border-[#7C3AED] has-[:checked]:bg-purple-50 transition-all">
                <input
                  type="radio"
                  name="price"
                  className="w-4 h-4 text-[#7C3AED] focus:ring-[#7C3AED] accent-[#7C3AED]"
                />
                <span className="text-sm font-medium text-slate-700">
                  상관 없음 (유료 포함)
                </span>
              </label>
            </div>
          </section>
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-white transition-colors"
          >
            초기화
          </button>
          <button
            onClick={onClose}
            className="flex-[2] px-4 py-3 rounded-xl bg-[#7C3AED] text-white font-bold hover:bg-[#6D28D9] shadow-lg shadow-purple-200 transition-all"
          >
            {DUMMY_POPUPS.length}개 결과 보기
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 4. 카드 컴포넌트
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* 그리드용 카드 */
function RefinedGridCard({ data }) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer">
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
        <img
          src={data.imageUrl}
          alt={data.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* 찜 버튼 */}
        <button className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-slate-400 hover:text-red-500 hover:scale-110 transition-all z-10">
          <HeartIcon />
        </button>
        <div className="absolute top-3 left-3 flex gap-1">
          <StatusBadge status={data.status} />
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {data.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[11px] font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-[17px] font-bold text-slate-900 leading-snug line-clamp-2 mb-2">
          {data.name}
        </h3>
        <div className="mt-auto space-y-1.5 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>📍</span>
            <span className="truncate">{data.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>🗓</span>
            <span>{data.period}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 리스트용 카드 */
function RefinedListCard({ data }) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex h-36 md:h-44 cursor-pointer">
      <div className="w-32 md:w-48 relative flex-shrink-0 bg-slate-100">
        <img
          src={data.imageUrl}
          alt={data.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2">
          <StatusBadge status={data.status} />
        </div>
      </div>

      <div className="flex-1 p-4 md:p-5 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-base md:text-xl font-bold text-slate-900 leading-tight line-clamp-2">
              {data.name}
            </h3>
            <button className="text-slate-300 hover:text-red-500 transition-colors">
              <HeartIcon size={24} />
            </button>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            {data.location}
          </p>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag) => (
              <span key={tag} className="text-xs text-slate-400">
                {tag}
              </span>
            ))}
          </div>
          <span className="text-xs md:text-sm font-medium text-slate-700 bg-slate-50 px-2 py-1 rounded">
            {data.isFree ? "무료 입장" : "유료"}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 5. 공통 UI 컴포넌트
 * ─────────────────────────────────────────────────────────────────────────────
 */

function FilterChip({ label, active }) {
  return (
    <button
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
      ${
        active
          ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-md shadow-purple-200"
          : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

/* 상태 뱃지 */
function StatusBadge({ status }) {
  const styles = {
    ONGOING: "bg-[#7C3AED] text-white",
    UPCOMING: "bg-blue-100 text-blue-700",
    ENDED: "bg-slate-100 text-slate-500",
  };
  const labels = {
    ONGOING: "진행중",
    UPCOMING: "오픈예정",
    ENDED: "종료",
  };

  return (
    <span
      className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 6. SVG 아이콘들
 * ─────────────────────────────────────────────────────────────────────────────
 */
const SearchIcon = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const FilterIcon = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
    />
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

const ListIcon = () => (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
    <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5S3.17 13.5 4 13.5 5.5 12.83 5.5 12 4.83 10.5 4 10.5zm0-6C3.17 4.5 2.5 5.17 2.5 6S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5S3.17 19.5 4 19.5 5.5 18.83 5.5 18 4.83 16.5 4 16.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
  </svg>
);

const HeartIcon = ({ size = 20 }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
