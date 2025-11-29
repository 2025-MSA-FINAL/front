import React, { useState, useEffect, useRef, useMemo } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import DateRangePicker from "../form/DateRangePicker";
import { SEOUL_DISTRICTS } from "../../data/regions";

const FilterChip = ({ label, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 rounded-full text-body-sm transition-all border
      ${
        isSelected
          ? "bg-primary text-text-white border-primary font-bold shadow-brand"
          : "bg-paper text-text-sub border-secondary-light hover:border-primary-light hover:text-primary"
      }
    `}
  >
    {label}
  </button>
);

const STATUS_OPTIONS = [
  { label: "진행중", value: "ONGOING" },
  { label: "오픈예정", value: "UPCOMING" },
  { label: "종료", value: "ENDED" },
];

export default function PopupFilterPanel({ filter, onChange }) {
  // -----------------------------
  // 1. 지역 (Region)
  // -----------------------------
  const [regionInput, setRegionInput] = useState("");
  const [showRegionSuggestions, setShowRegionSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const regionInputRef = useRef(null);
  const suggestionsListRef = useRef(null);

  const suggestedRegions = useMemo(() => {
    if (!regionInput.trim()) return [];
    return SEOUL_DISTRICTS.filter((dist) => dist.includes(regionInput));
  }, [regionInput]);

  useEffect(() => {
    if (suggestionsListRef.current && focusedIndex >= 0) {
      const activeItem = suggestionsListRef.current.children[focusedIndex];
      if (activeItem) {
        activeItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [focusedIndex]);

  const addRegion = (region) => {
    if (filter.regions?.includes(region)) {
      setRegionInput("");
      setShowRegionSuggestions(false);
      setFocusedIndex(-1);
      return;
    }
    const newRegions = [...(filter.regions || []), region];
    onChange({ ...filter, regions: newRegions });
    setRegionInput("");
    setShowRegionSuggestions(false);
    setFocusedIndex(-1);
  };

  const removeRegion = (regionToRemove) => {
    const newRegions = filter.regions.filter((r) => r !== regionToRemove);
    onChange({ ...filter, regions: newRegions });
  };

  const handleRegionKeyDown = (e) => {
    if (
      e.key === "Backspace" &&
      regionInput === "" &&
      filter.regions?.length > 0
    ) {
      const lastRegion = filter.regions[filter.regions.length - 1];
      removeRegion(lastRegion);
      return;
    }

    if (suggestedRegions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) =>
        prev < suggestedRegions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && suggestedRegions[focusedIndex]) {
        addRegion(suggestedRegions[focusedIndex]);
      } else if (suggestedRegions.length > 0) {
        addRegion(suggestedRegions[0]);
      }
    }
  };

  // -----------------------------
  // 2. 기간 (Date)
  // -----------------------------
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateChange = ({ startDate, endDate }) => {
    const formatDate = (d) => {
      if (!d) return null;
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().split("T")[0];
    };
    onChange({
      ...filter,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    });
  };

  // -----------------------------
  // 3. 가격 (Price)
  // -----------------------------
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const isFreeOnly = !!filter.freeOnly;

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
      // 무료만 보기 켜면 가격 범위를 0으로 고정
      onChange({
        ...filter,
        freeOnly: true,
        minPrice: 0,
        maxPrice: 0,
      });
    } else {
      // 끌 때는 기본 범위로 복원 (원하면 여기 값 조정해도 됨)
      onChange({
        ...filter,
        freeOnly: false,
        minPrice: 0,
        maxPrice: 100000,
      });
    }
  };

  // -----------------------------
  // 4. 현황 (Status)
  // -----------------------------
  const toggleStatus = (value) => {
    const currentStatuses = filter.statusList || [];

    // 1. "전체" 클릭 시 -> 즉시 초기화
    if (value === "ALL") {
      onChange({ ...filter, statusList: [] });
      return;
    }

    // 2. 개별 상태 토글 계산
    let newStatuses;
    if (currentStatuses.includes(value)) {
      newStatuses = currentStatuses.filter((s) => s !== value);
    } else {
      newStatuses = [...currentStatuses, value];
    }

    //애니메이션 로직 적용
    if (newStatuses.length === STATUS_OPTIONS.length) {
      onChange({ ...filter, statusList: newStatuses });

      setTimeout(() => {
        onChange({ ...filter, statusList: [] });
      }, 75);
    } else {
      onChange({ ...filter, statusList: newStatuses });
    }
  };

  const isAllStatus = (filter.statusList || []).length === 0;

  // -----------------------------
  // 5. 초기화
  // -----------------------------
  const handleReset = () => {
    onChange({
      regions: [],
      startDate: null,
      endDate: null,
      minPrice: 0,
      maxPrice: 100000,
      statusList: [],
      freeOnly: false,
    });
  };

  return (
    <div className="w-full bg-paper rounded-[20px] border border-secondary-light shadow-sm mb-0">
      
      <div className="px-6 py-6 flex flex-col gap-6">
        
        {/* 상단 헤더: 상세 필터 / 초기화 */}
        <div className="flex items-start justify-between mb-0">
          <span className="text-label-lg font-semibold text-text-black">
            상세 필터
          </span>
          <button
            onClick={handleReset}
            className="text-label-sm text-text-sub hover:text-primary transition-colors flex items-center gap-1"
          >
            <span>↻</span> 필터 초기화
          </button>
        </div>
        
        {/* 상단: 지역 & 기간 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 1. 지역 선택 */}
          <div className="relative z-20" ref={regionInputRef}>
            <label className="block text-label-md text-text-sub mb-2 font-medium">
              지역
            </label>
            <div
              className="
                  flex items-center gap-1 pl-4 pr-3 
                  bg-paper border border-secondary rounded-[12px] 
                  focus-within:border-primary transition-colors 
                  h-[50px]
                  overflow-x-auto scrollbar-hide
                "
            >
              {(filter.regions || []).map((region) => (
                <span
                  key={region}
                  className="
                      inline-flex items-center gap-1 px-2 py-1 
                      bg-primary-light/20 text-primary text-label-sm 
                      rounded-[6px] border border-primary-light
                      transition-colors duration-200
                      hover:bg-primary-light/60 hover:border-primary
                      whitespace-nowrap flex-shrink-0
                    "
                >
                  {region}
                  <button
                    onClick={() => removeRegion(region)}
                    className="hover:text-primary-dark font-bold px-1"
                  >
                    ✕
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={regionInput}
                onChange={(e) => {
                  setRegionInput(e.target.value);
                  setShowRegionSuggestions(true);
                  setFocusedIndex(-1);
                }}
                onKeyDown={handleRegionKeyDown}
                onFocus={() => regionInput && setShowRegionSuggestions(true)}
                placeholder={filter.regions?.length ? "" : "지역 검색"}
                className="flex-1 min-w-[80px] bg-transparent outline-none text-body-sm placeholder:text-secondary h-full"
              />
            </div>

            {showRegionSuggestions && suggestedRegions.length > 0 && (
              <ul
                ref={suggestionsListRef}
                className="absolute top-full left-0 w-full mt-2 bg-paper border border-secondary-light rounded-[12px] shadow-dropdown overflow-hidden z-20 max-h-[240px] overflow-y-auto"
              >
                {suggestedRegions.map((region, idx) => (
                  <li
                    key={region}
                    onClick={() => addRegion(region)}
                    className={`
                        px-4 py-3 text-body-sm cursor-pointer transition-colors
                        ${
                          idx === focusedIndex
                            ? "bg-primary-light/20 text-primary font-bold"
                            : "hover:bg-secondary-light text-text-black"
                        } 
                    `}
                  >
                    {region}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 2. 기간 선택 */}
          <div className="relative z-[20]" ref={datePickerRef}>
            <label className="block text-label-md text-text-sub mb-2 font-medium">
              기간
            </label>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`
                  w-full h-[50px] px-4 bg-paper border rounded-[12px] text-left flex items-center justify-between
                  ${
                    showDatePicker
                      ? "border-primary ring-1 ring-primary"
                      : "border-secondary"
                  }
              `}
            >
              <span
                className={`text-body-sm ${
                  filter.startDate ? "text-text-black" : "text-secondary"
                }`}
              >
                {filter.startDate && filter.endDate
                  ? `${filter.startDate} ~ ${filter.endDate}`
                  : "방문 희망 날짜 선택"}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-secondary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
            </button>

            {showDatePicker && (
              <div className="absolute top-full right-0 mt-2 z-20 bg-paper rounded-[24px] shadow-dropdown p-1 border border-secondary-light">
                <div className="flex justify-end p-2 pb-0">
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="text-label-sm text-secondary hover:text-black"
                  >
                    닫기 ✕
                  </button>
                </div>
                <DateRangePicker
                  startDate={
                    filter.startDate ? new Date(filter.startDate) : null
                  }
                  endDate={filter.endDate ? new Date(filter.endDate) : null}
                  onChange={handleDateChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* 하단: 현황 & 가격 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          {/* 3. 현황 */}
          <div>
            <label className="block text-label-md text-text-sub mb-3 font-medium">
              진행 현황
            </label>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                label="전체"
                isSelected={isAllStatus}
                onClick={() => toggleStatus("ALL")}
              />
              {STATUS_OPTIONS.map((opt) => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  isSelected={(filter.statusList || []).includes(opt.value)}
                  onClick={() => toggleStatus(opt.value)}
                />
              ))}
            </div>
          </div>

          {/* 4. 가격 */}
          <div className="px-2">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <label className="text-label-md text-text-sub font-medium">
                  가격 범위
                </label>
                <button
                  type="button"
                  onClick={toggleFreeOnly}
                  className={`
                    px-3 py-1 rounded-full text-label-sm border
                    transition-colors
                    ${
                      isFreeOnly
                        ? "bg-primary-light text-primary border-primary"
                        : "bg-paper text-secondary border-secondary-light hover:border-primary-light hover:text-primary"
                    }
                  `}
                >
                  무료만 보기
                </button>
              </div>
              <span className="text-label-sm text-primary font-bold">
                {isFreeOnly
                  ? "무료만 보기"
                  : `${priceRange[0].toLocaleString()}원 ~ ${priceRange[1].toLocaleString()}원`}
              </span>
            </div>
            <Slider
              range
              min={0}
              max={100000}
              step={1000}
              value={priceRange}
              onChange={setPriceRange}
              onAfterChange={handlePriceChangeComplete}
              disabled={isFreeOnly}
              trackStyle={[{ backgroundColor: "var(--color-primary)" }]}
              handleStyle={[
                {
                  borderColor: "var(--color-primary)",
                  backgroundColor: "var(--color-paper)",
                  opacity: 1,
                },
                {
                  borderColor: "var(--color-primary)",
                  backgroundColor: "var(--color-paper)",
                  opacity: 1,
                },
              ]}
              railStyle={{ backgroundColor: "var(--color-secondary-light)" }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
