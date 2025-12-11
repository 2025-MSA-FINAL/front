import React, { useState, useEffect, useRef } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

//내부용 칩 컴포넌트
const FilterChip = ({ label, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all border
      ${
        isSelected
          ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md"
          : "bg-[var(--color-paper)] text-[var(--color-text-sub)] border-[var(--color-secondary)] hover:border-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
      }
    `}
  >
    {label}
  </button>
);

//백엔드 status 값
const STATUS_OPTIONS = [
  { label: "오픈 예정", value: "UPCOMING" },
  { label: "진행 중", value: "ONGOING" },
  { label: "종료", value: "ENDED" },
];

//로컬 날짜 → YYYY-MM-DD (타임존 보정 포함)
const toYMD = (d) => {
  if (!d) return null;
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split("T")[0];
};

//PopupFilterPanel (모달 버전, 실시간 반영)
export default function PopupFilterPanel({ filter, onChange, onClose }) {
  // -----------------------------
  // 1. 지역 (전국 대응 - 자유 입력)
  // -----------------------------
  const [regionInput, setRegionInput] = useState("");

  const addRegion = () => {
    const val = regionInput.trim();
    if (!val) return;

    const currentRegions = filter.regions || [];
    if (currentRegions.includes(val)) {
      setRegionInput("");
      return;
    }

    const newRegions = [...currentRegions, val];
    onChange({ ...filter, regions: newRegions });
    setRegionInput("");
  };

  const removeRegion = (regionToRemove) => {
    const currentRegions = filter.regions || [];
    const newRegions = currentRegions.filter((r) => r !== regionToRemove);
    onChange({ ...filter, regions: newRegions });
  };

  const handleRegionKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addRegion();
    }
    if (
      e.key === "Backspace" &&
      regionInput === "" &&
      (filter.regions || []).length > 0
    ) {
      const currentRegions = filter.regions || [];
      removeRegion(currentRegions[currentRegions.length - 1]);
    }
  };

  // -----------------------------
  // 2. 기간 (네이티브 date 인풋 2개 + 바보 방지)
  // -----------------------------
  const startInputRef = useRef(null);
  const endInputRef = useRef(null);

  const openStartPicker = () => {
    if (startInputRef.current?.showPicker) {
      startInputRef.current.showPicker();
    } else {
      startInputRef.current?.focus();
    }
  };

  const openEndPicker = () => {
    if (endInputRef.current?.showPicker) {
      endInputRef.current.showPicker();
    } else {
      endInputRef.current?.focus();
    }
  };

  const handleStartDateChange = (e) => {
    const newStart = e.target.value || null;
    const currentEnd = filter.endDate || null;

    let nextStart = newStart;
    let nextEnd = currentEnd;

    //start > end 인 경우 → 하루짜리 구간으로 자동 보정
    if (newStart && currentEnd && newStart > currentEnd) {
      nextEnd = newStart;
    }

    onChange({
      ...filter,
      startDate: nextStart,
      endDate: nextEnd,
    });
  };

  const handleEndDateChange = (e) => {
    const newEnd = e.target.value || null;
    const currentStart = filter.startDate || null;

    let nextEnd = newEnd;
    let nextStart = currentStart;

    //end < start 인 경우 → 하루짜리 구간으로 자동 보정
    if (newEnd && currentStart && newEnd < currentStart) {
      nextStart = newEnd;
    }

    onChange({
      ...filter,
      startDate: nextStart,
      endDate: nextEnd,
    });
  };

  //퀵 기간 (오늘 / 이번 주말 / 다음 주)
  const setQuickRange = (type) => {
    const today = new Date();
    let start = new Date(today);
    let end = new Date(today);

    if (type === "TODAY") {
      // 이미 today 로 초기화 되어 있음
    } else if (type === "THIS_WEEKEND") {
      const day = today.getDay(); // 0(일) ~ 6(토)
      const distToSat = 6 - day;
      start.setDate(today.getDate() + distToSat);
      end.setDate(today.getDate() + distToSat + 1); // 토~일
    } else if (type === "NEXT_WEEK") {
      const day = today.getDay();
      const distToMon = day === 0 ? 1 : 8 - day; // 다음주 월
      start.setDate(today.getDate() + distToMon);
      end = new Date(start);
      end.setDate(start.getDate() + 6); // 월~일
    }

    const s = toYMD(start);
    const e = toYMD(end);

    onChange({
      ...filter,
      startDate: s,
      endDate: e,
    });
  };

  //방문 일정만 초기화 (전체 초기화와 분리)
  const clearDateRange = () => {
    if (!filter.startDate && !filter.endDate) return;
    onChange({
      ...filter,
      startDate: null,
      endDate: null,
    });
  };

  // -----------------------------
  // 3. 가격 (Price)
  // -----------------------------
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const isFreeOnly = !!filter.freeOnly;

  // 외부 filter 값이 바뀌면 슬라이더 동기화
  useEffect(() => {
    const nextMin = filter.minPrice ?? 0;
    const nextMax = filter.maxPrice ?? 100000;
    if (priceRange[0] !== nextMin || priceRange[1] !== nextMax) {
      setPriceRange([nextMin, nextMax]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.minPrice, filter.maxPrice]);

  const handlePriceChangeComplete = (value) => {
    if (isFreeOnly) return;
    onChange({ ...filter, minPrice: value[0], maxPrice: value[1] });
  };

  const toggleFreeOnly = () => {
    const nextFreeOnly = !isFreeOnly;
    if (nextFreeOnly) {
      onChange({
        ...filter,
        freeOnly: true,
        minPrice: 0,
        maxPrice: 0,
      });
    } else {
      onChange({
        ...filter,
        freeOnly: false,
        minPrice: 0,
        maxPrice: 100000,
      });
    }
  };

  // -----------------------------
  // 4. 진행 상태 (Status) - "전체" 포함 UX
  // -----------------------------
  const selectedStatuses = filter.statusList || [];
  const isAllSelected = selectedStatuses.length === 0; // [] = 전체

  const toggleStatus = (value) => {
    //전체 클릭 시 그냥 모두 해제 = 전체
    if (value === "ALL") {
      onChange({ ...filter, statusList: [] });
      return;
    }

    const current = filter.statusList || [];
    let next = current.includes(value)
      ? current.filter((s) => s !== value)
      : [...current, value];

    //0개 선택 또는 3개 전부 선택 시 전체로 취급해서 []로 통일
    if (next.length === 0 || next.length === STATUS_OPTIONS.length) {
      next = [];
    }

    onChange({ ...filter, statusList: next });
  };

  // -----------------------------
  // 5. 초기화
  // -----------------------------
  const handleReset = () => {
    onChange({
      ...filter,
      regions: [],
      startDate: null,
      endDate: null,
      minPrice: 0,
      maxPrice: 100000,
      statusList: [], //전체
      freeOnly: false,
    });
    setRegionInput("");
    setPriceRange([0, 100000]);
  };

  return (
    // 1. 배경 (Backdrop)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* 2. 모달 컨테이너 */}
      <div
        className="bg-[var(--color-paper)] rounded-[20px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-secondary-light)] bg-[var(--color-paper)]">
          <h2 className="text-[18px] font-bold text-[var(--color-text-black)]">
            상세 필터
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text-sub)] hover:text-[var(--color-text-black)] p-1"
          >
            ✕
          </button>
        </div>

        {/* 바디 (스크롤 가능) */}
        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          {/* 섹션 1: 지역 */}
          <section>
            <div className="flex justify-between items-baseline mb-3">
              <h3 className="text-[15px] font-bold text-[var(--color-text-black)]">
                지역
              </h3>
              <span className="text-[12px] text-[var(--color-text-sub)]">
                원하는 지역을 입력하고 엔터를 눌러주세요
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 p-3 bg-[var(--color-paper)] border border-[var(--color-secondary)] rounded-[12px] focus-within:border-[var(--color-primary)] transition-colors min-h-[50px]">
              {(filter.regions || []).map((region) => (
                <span
                  key={region}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--color-primary-soft2)] text-[var(--color-primary-dark)] text-[13px] font-medium rounded-[6px]"
                >
                  {region}
                  <button
                    onClick={() => removeRegion(region)}
                    className="hover:text-red-500 ml-1"
                  >
                    ✕
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={regionInput}
                onChange={(e) => setRegionInput(e.target.value)}
                onKeyDown={handleRegionKeyDown}
                placeholder={
                  (filter.regions || []).length ? "" : "예: 강남, 부산, 성수동"
                }
                className="flex-1 min-w-[120px] bg-transparent outline-none text-[14px] placeholder:text-[var(--color-secondary)]"
              />
            </div>
          </section>

          {/* 섹션 2: 방문 일정 (네이티브 date 인풋 + 퀵 버튼) */}
          <section>
            <div className="flex justify-between items-baseline mb-3 gap-4">
              <h3 className="text-[15px] font-bold text-[var(--color-text-black)]">
                방문 일정
              </h3>
              <span className="text-[12px] text-[var(--color-text-sub)] text-right">
                시작일과 종료일을 비워두면 전체 기간의 팝업이 보여요
              </span>
            </div>

            {/* 날짜 인풋 2개 (라벨 제거 + ~ + 전체 영역 클릭 시 달력 열림) */}
            <div className="flex items-center gap-2 mb-3">
              {/* 시작일 */}
              <div
                className="flex-1"
                onClick={(e) => {
                  if (e.target.tagName !== "INPUT") {
                    openStartPicker();
                  }
                }}
              >
                <input
                  ref={startInputRef}
                  type="date"
                  value={filter.startDate || ""}
                  max={filter.endDate || undefined}
                  onChange={handleStartDateChange}
                  className="w-full h-[44px] px-3 bg-[var(--color-paper)] border border-[var(--color-secondary)] rounded-[10px] text-[14px] text-[var(--color-text-black)] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors cursor-pointer"
                />
              </div>

              {/* 가운데 ~ 표시 */}
              <span className="text-[14px] text-[var(--color-secondary)] px-1">
                ~
              </span>

              {/* 종료일 */}
              <div
                className="flex-1"
                onClick={(e) => {
                  if (e.target.tagName !== "INPUT") {
                    openEndPicker();
                  }
                }}
              >
                <input
                  ref={endInputRef}
                  type="date"
                  value={filter.endDate || ""}
                  min={filter.startDate || undefined}
                  onChange={handleEndDateChange}
                  className="w-full h-[44px] px-3 bg-[var(--color-paper)] border border-[var(--color-secondary)] rounded-[10px] text-[14px] text-[var(--color-text-black)] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors cursor-pointer"
                />
              </div>
            </div>

            {/* 퀵 버튼들 + 기간 지우기 */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuickRange("TODAY")}
                  className="px-3 py-1.5 rounded-[8px] bg-[var(--color-secondary-light)] text-[12px] text-[var(--color-text-sub)] hover:bg-[var(--color-secondary)] hover:text-white transition-colors"
                >
                  오늘
                </button>
                <button
                  type="button"
                  onClick={() => setQuickRange("THIS_WEEKEND")}
                  className="px-3 py-1.5 rounded-[8px] bg-[var(--color-secondary-light)] text-[12px] text-[var(--color-text-sub)] hover:bg-[var(--color-secondary)] hover:text-white transition-colors"
                >
                  이번 주말
                </button>
                <button
                  type="button"
                  onClick={() => setQuickRange("NEXT_WEEK")}
                  className="px-3 py-1.5 rounded-[8px] bg-[var(--color-secondary-light)] text-[12px] text-[var(--color-text-sub)] hover:bg-[var(--color-secondary)] hover:text-white transition-colors"
                >
                  다음 주
                </button>
              </div>

              {(filter.startDate || filter.endDate) && (
                <button
                  type="button"
                  onClick={clearDateRange}
                  className="text-[12px] text-[var(--color-text-sub)] underline underline-offset-2 hover:text-[var(--color-text-main)]"
                >
                  기간 지우기
                </button>
              )}
            </div>
          </section>

          {/* 섹션 3: 입장료 */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[15px] font-bold text-[var(--color-text-black)]">
                입장료 범위
              </h3>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFreeOnly}
                  onChange={toggleFreeOnly}
                  className="accent-[var(--color-primary)] w-4 h-4"
                />
                <span className="text-[13px] text-[var(--color-text-sub)]">
                  무료만 보기
                </span>
              </label>
            </div>

            <div className="px-2 pb-2">
              <Slider
                range
                min={0}
                max={100000}
                step={1000}
                value={priceRange}
                onChange={setPriceRange}
                onAfterChange={handlePriceChangeComplete}
                disabled={isFreeOnly}
                trackStyle={{ backgroundColor: "var(--color-primary)", height: 6 }}
                handleStyle={{
                  borderColor: "var(--color-primary)",
                  backgroundColor: "white",
                  opacity: 1,
                  height: 20,
                  width: 20,
                  marginTop: -7,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
                railStyle={{
                  backgroundColor: "var(--color-secondary-light)",
                  height: 6,
                }}
              />
              <div className="flex justify-between mt-3 text-[12px] text-[var(--color-text-sub)] font-medium">
                <span>
                  {isFreeOnly ? "0원" : `${priceRange[0].toLocaleString()}원`}
                </span>
                <span>
                  {isFreeOnly
                    ? "0원"
                    : `${priceRange[1].toLocaleString()}${
                        priceRange[1] === 100000 ? "+" : ""
                      }원`}
                </span>
              </div>
            </div>
          </section>

          {/* 섹션 4: 진행 상태 */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-[var(--color-text-black)]">
                진행 상태
              </h3>
              <span className="text-[11px] text-[var(--color-text-sub)]">
                선택하지 않거나 전체 선택 시 전체 팝업이 보여요
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* 전체 칩 */}
              <FilterChip
                label="전체"
                isSelected={isAllSelected}
                onClick={() => toggleStatus("ALL")}
              />
              {/* 개별 상태 칩 */}
              {STATUS_OPTIONS.map((opt) => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  isSelected={
                    !isAllSelected && selectedStatuses.includes(opt.value)
                  }
                  onClick={() => toggleStatus(opt.value)}
                />
              ))}
            </div>
          </section>
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t border-[var(--color-secondary-light)] bg-[var(--color-paper-light)] flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 rounded-[12px] border border-[var(--color-secondary)] bg-white text-[var(--color-text-sub)] text-[14px] font-medium hover:bg-[var(--color-secondary-light)] transition-colors"
          >
            초기화
          </button>
          <button
            onClick={onClose}
            className="flex-[2] py-3 rounded-[12px] bg-[var(--color-primary)] text-white text-[14px] font-bold shadow-md hover:opacity-90 transition-opacity"
          >
            필터 적용
          </button>
        </div>
      </div>
    </div>
  );
}
