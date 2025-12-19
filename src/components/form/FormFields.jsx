import clsx from "clsx";
import { useState, useEffect } from "react";
import DateRangePicker from "./DateRangePicker";

// 공통 인풋 스타일
const INPUT_BASE_CLASS =
    "w-full h-[50px] px-4 border-[1.5px] rounded-[16px] text-body-lg text-text-black outline-none focus:border-primary placeholder-[#E3E5E8] transition-colors bg-white";

/**
 * 공통 래퍼
 */
export const InputWrapper = ({
    label,
    subText,
    error,
    touched,
    children,
    className,
    hideErrorText = false,
    noMarginBottom = false,
}) => {
    const showError = touched && !!error;

    return (
        <div
            className={clsx(
                "w-full",
                !noMarginBottom && "mb-10",
                className
            )}
        >
            {/* 라벨은 항상 회색 */}
            <label className="block text-title-lg font-normal mb-3 text-text-sub">
                {label}
            </label>

            {children}

            {showError && !hideErrorText ? (
                <p className="text-accent-pink text-label-sm mt-2 ml-1">{error}</p>
            ) : subText ? (
                <p className="text-accent-pink text-label-sm mt-2 ml-1">{subText}</p>
            ) : null}
        </div>
    );
};

/**
 * 1. 텍스트 인풋
 */
export const TextInput = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    placeholder,
    subText,
    error,
    touched,
    className,
}) => (
    <InputWrapper
        label={label}
        subText={subText}
        error={error}
        touched={touched}
        className={className}
    >
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            className={clsx(
                INPUT_BASE_CLASS,
                touched && error ? "border-accent-pink" : "border-secondary"
            )}
        />
    </InputWrapper>
);

/**
 * 2. 날짜 인풋
 */
export const DateInput = ({
    label,
    startDate,
    endDate,
    onChange,
    onBlurStart,
    onBlurEnd,
    error,
    touched,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasError = touched && !!error;

    const toggleOpen = () => setIsOpen((prev) => !prev);
    const close = () => setIsOpen(false);

    const toLocalDateTimeString = (date) => {
        if (!date) return "";
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        const hh = "00";
        const mm = "00";
        return `${y}-${m}-${d}T${hh}:${mm}`;
    };

    const formatDisplay = (value) => {
        if (!value) return "";
        const [datePart] = value.split("T");
        const [y, m, d] = datePart.split("-");
        return `${y}.${m}.${d}`;
    };

    const displayStart = startDate
        ? formatDisplay(startDate)
        : "시작일을 선택해 주세요";
    const displayEnd = endDate
        ? formatDisplay(endDate)
        : "종료일을 선택해 주세요";

    const handleRangeChange = ({ startDate: s, endDate: e }) => {
        const hasStart = !!startDate;
        const hasEnd = !!endDate;

        if (!hasStart || (hasStart && hasEnd)) {
            if (s) {
                onChange({
                    target: {
                        name: "popStartDate",
                        value: toLocalDateTimeString(s),
                    },
                });
                onBlurStart?.({ target: { name: "popStartDate" } });
            }

            onChange({
                target: {
                    name: "popEndDate",
                    value: "",
                },
            });
            return;
        }

        if (hasStart && !hasEnd) {
            if (e) {
                onChange({
                    target: {
                        name: "popEndDate",
                        value: toLocalDateTimeString(e),
                    },
                });
                onBlurEnd?.({ target: { name: "popEndDate" } });
            }
            close();
        }
    };


    return (
        <InputWrapper
            label={label}
            error={error}
            touched={touched}
            className={className}
        >
            <div className="relative">
                {/* 읽기 전용처럼 보이는 필드들 */}
                <div className="flex items-stretch gap-4">
                    {/* 시작일 */}
                    <button
                        type="button"
                        onClick={toggleOpen}
                        className={clsx(
                            INPUT_BASE_CLASS,
                            "flex-1 flex flex-col items-start justify-center pr-4 text-left",
                            "cursor-pointer",
                            hasError ? "border-accent-pink" : "border-secondary"
                        )}
                    >
                        <span className="text-label-md text-secondary mb-1">시작</span>
                        <span
                            className={clsx(
                                "text-body-md",
                                startDate ? "text-text-black" : "text-secondary"
                            )}
                        >
                            {displayStart}
                        </span>
                    </button>

                    {/* 물결표 */}
                    <div className="flex items-center">
                        <span className="text-body-md text-secondary">~</span>
                    </div>

                    {/* 종료일 */}
                    <button
                        type="button"
                        onClick={toggleOpen}
                        className={clsx(
                            INPUT_BASE_CLASS,
                            "flex-1 flex flex-col items-start justify-center pr-4 text-left",
                            "cursor-pointer",
                            hasError ? "border-accent-pink" : "border-secondary"
                        )}
                    >
                        <span className="text-label-md text-secondary mb-1">종료</span>
                        <span
                            className={clsx(
                                "text-body-md",
                                endDate ? "text-text-black" : "text-secondary"
                            )}
                        >
                            {displayEnd}
                        </span>
                    </button>
                </div>

                {/* 달력 팝오버 */}
                {isOpen && (
                    <div className="absolute z-30 mt-3 left-0">
                        <DateRangePicker
                            startDate={startDate}
                            endDate={endDate}
                            onChange={handleRangeChange}
                        />
                    </div>
                )}
            </div>
        </InputWrapper>
    );
};


/**
 * 3. 셀렉트 인풋
 */
export const SelectInput = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    options,
    placeholder,
    error,
    touched,
    className,
    hideErrorText,
    noMarginBottom,
}) => (
    <InputWrapper
        label={label}
        error={error}
        touched={touched}
        hideErrorText={hideErrorText}
        noMarginBottom={noMarginBottom}
        className={clsx("mb-4", className)}
    >
        <div className="relative">
            <select
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                className={clsx(
                    INPUT_BASE_CLASS,
                    "appearance-none text-text-sub",
                    touched && error ? "border-accent-pink" : "border-secondary"
                )}
            >
                <option value="" disabled>
                    {placeholder || "선택해주세요"}
                </option>
                {(options || []).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {/* 화살표 아이콘 */}
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                    <path
                        d="M1 1L7 7L13 1"
                        stroke="#70757A"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        </div>
    </InputWrapper>
);

/**
 * 4. 가격 인풋
 */
export const PriceInput = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    touched,
    className,
}) => (
    <InputWrapper
        label={label}
        error={error}
        touched={touched}
        className={className}
    >
        <div className="relative">
            <input
                type="text"
                name={name}
                value={value === "" ? "" : Number(value).toLocaleString()}
                onChange={onChange}
                onBlur={onBlur}
                className={clsx(
                    INPUT_BASE_CLASS,
                    "text-right pr-10",
                    touched && error ? "border-accent-pink" : "border-secondary"
                )}
                placeholder="0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-body-md text-text-sub">
                원
            </span>
        </div>
    </InputWrapper>
);

/**
 * 5. 설명 텍스트 구역
 */
export const TextArea = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    placeholder,
    error,
    touched,
    className,
}) => (
    <InputWrapper
        label={label}
        error={error}
        touched={touched}
        className={className}
    >
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            className={clsx(
                INPUT_BASE_CLASS,
                "h-[320px] p-4 resize-none align-top leading-relaxed",
                touched && error ? "border-accent-pink" : "border-secondary"
            )}
        />
    </InputWrapper>
);

/**
 * 6. 태그 인풋
 */
export const TagInput = ({
    label,
    tags,
    onAdd,
    onRemove,
    onBlur,
    error,
    touched,
    className,
}) => {
    const [input, setInput] = useState("");

    const commitTag = () => {
        const trimmed = input.trim();
        if (!trimmed) return;
        onAdd(trimmed);
        setInput("");
    };

    const handleKeyDown = (e) => {
        if (e.isComposing) return;
        if (
            e.key === "Enter" ||
            e.key === " " ||
            e.key === "Spacebar"
        ) {
            e.preventDefault();
            commitTag();
            return;
        }

        if (
            (e.key === "Backspace" || e.key === "Delete") &&
            input === "" &&
            tags.length > 0
        ) {
            e.preventDefault();
            const lastTag = tags[tags.length - 1];
            onRemove(lastTag);
        }
    };

    return (
        <InputWrapper
            label={label}
            error={error}
            touched={touched}
            className={className}
        >
            <div
                className={clsx(
                    "w-full min-h-[50px] px-4 py-2 border-[1.5px] rounded-[16px] flex flex-wrap items-center gap-2 bg-white transition-colors focus-within:border-primary",
                    touched && error ? "border-accent-pink" : "border-secondary"
                )}
            >
                {tags.map((tag, idx) => (
                    <span
                        key={idx}
                        className={clsx(
                            "group inline-flex items-center gap-2 px-3 py-1 rounded-[6px] border text-body-sm",
                            "bg-secondary-light text-text-sub border-secondary",
                            "transition-colors",
                            "hover:bg-primary-light hover:border-primary hover:text-primary-dark"
                        )}
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => onRemove(tag)}
                            className="text-label-sm font-medium opacity-70 group-hover:opacity-100"
                        >
                            ✕
                        </button>
                    </span>
                ))}

                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={onBlur}
                    placeholder={
                        tags.length === 0 ? "태그 입력 후 엔터/스페이스 (예: 맛집)" : ""
                    }
                    className="flex-1 min-w-[100px] outline-none text-body-lg placeholder-[#E3E5E8] text-text-black"
                />
            </div>
        </InputWrapper>
    );
};


/**
 * 7. 라디오 그룹
 */
export const RadioGroup = ({
    label,
    name,
    value,
    onChange,
    error,
    touched,
    className,
}) => (
    <InputWrapper
        label={label}
        error={error}
        touched={touched}
        className={className}
    >
        <div className="flex gap-10 mt-2 items-center">
            {[false, true].map((val) => (
                <label
                    key={String(val)}
                    className="flex items-center gap-3 cursor-pointer group"
                >
                    <div
                        className={clsx(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                            value === val
                                ? "border-text-sub"
                                : "border-secondary group-hover:border-text-sub"
                        )}
                    >
                        {value === val && (
                            <div className="w-2.5 h-2.5 bg-text-sub rounded-full" />
                        )}
                    </div>

                    <input
                        type="radio"
                        name={name}
                        className="hidden"
                        checked={value === val}
                        onChange={() => onChange(val)}
                    />

                    <span
                        className={clsx(
                            "text-body-lg",
                            value === val
                                ? "text-text-sub"
                                : "text-secondary group-hover:text-text-sub"
                        )}
                    >
                        {val ? "있음" : "없음"}
                    </span>
                </label>
            ))}
        </div>
    </InputWrapper>
);

// 7. 주소 인풋 (주소 검색 + 상세 주소)
export const AddressInput = ({
    label = "팝업 스토어 장소",
    addressName = "popLocation",
    detailName = "locationDetail",
    addressValue,
    detailValue,
    onChange,
    required = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [touched, setTouched] = useState(false);

    const hasError = required && touched && !addressValue;
    const errorMessage = hasError ? "팝업 스토어 장소를 선택해 주세요." : undefined;

    const borderClass = hasError ? "border-accent-pink" : "border-secondary";

    const handleOpen = () => {
        setIsOpen(true);
        setTouched(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    // 주소 선택 시 폼 값에 반영
    const handleAddressSelect = (fullAddress) => {
        if (onChange) {
            onChange({
                target: {
                    name: addressName,
                    value: fullAddress,
                },
            });
        }
        setIsOpen(false);
    };

    // 모달 열릴 때만 카카오 우편번호 스크립트 로드 + embed
    useEffect(() => {
        if (!isOpen) return;

        const container = document.getElementById("popup-postcode-container");
        if (!container) return;

        const openPostcode = () => {
            container.innerHTML = "";

            const Postcode = window.daum && window.daum.Postcode;
            if (!Postcode) return;

            new Postcode({
                oncomplete(data) {
                    const fullAddress =
                        data.roadAddress || data.address || data.jibunAddress || "";
                    if (!fullAddress) return;
                    handleAddressSelect(fullAddress);
                },
                width: "100%",
                height: "100%",
            }).embed(container);
        };

        // 이미 스크립트 로드된 경우
        if (window.daum && window.daum.Postcode) {
            openPostcode();
            return;
        }

        // 아직이면 스크립트 로드
        const script = document.createElement("script");
        script.src =
            "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        script.async = true;
        script.onload = openPostcode;
        document.body.appendChild(script);

        return () => {
            script.onload = null;
        };
    }, [isOpen]);

    return (
        <InputWrapper
            label={label}
            error={errorMessage}
            touched={touched}
        >
            <div className="flex flex-col gap-2">
                {/* 주소 검색 인풋 (전체가 버튼 역할) */}
                <div className="relative">
                    <input
                        type="text"
                        name={addressName}
                        value={addressValue || ""}
                        readOnly
                        onClick={handleOpen}
                        placeholder="도로명, 건물명, 지번으로 검색"
                        className={clsx(
                            INPUT_BASE_CLASS,
                            "pr-14 cursor-pointer",
                            borderClass
                        )}
                    />
                    {/* 검색 아이콘 */}
                    <span
                        className="
                            pointer-events-none
                            absolute right-3 top-1/2 -translate-y-1/2
                            flex h-7 w-7 items-center justify-center
                        "
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-6 h-6"
                            fill="none"
                            stroke="#C4C7CE"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="6" />
                            <line x1="16" y1="16" x2="21" y2="21" />
                        </svg>
                    </span>
                </div>

                {/* 상세 주소 입력 */}
                <input
                    type="text"
                    name={detailName}
                    value={detailValue || ""}
                    onChange={onChange}
                    placeholder="상세 주소 (건물명, 동·층·호수 등)"
                    className={clsx(
                        INPUT_BASE_CLASS,
                        "border-secondary"
                    )}
                />
            </div>

            {/* 주소 검색 모달 – 카카오 우편번호 UI embed */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-paper rounded-card shadow-card w-full max-w-[480px] p-6">
                        <h3 className="text-title-md text-text-black mb-2">
                            도로명 주소 검색
                        </h3>
                        <p className="text-body-sm text-text-sub mb-4">
                            검색 결과에서 주소를 선택하면 자동으로 입력됩니다.
                        </p>

                        <div className="w-full h-[360px] mb-4">
                            <div
                                id="popup-postcode-container"
                                className="w-full h-full border border-secondary rounded-[12px] overflow-hidden bg-white"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="
                w-full h-[40px]
                rounded-[999px]
                border border-secondary
                text-label-md text-text-sub
                hover:bg-secondary-light
                transition
              "
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </InputWrapper>
    );
};
