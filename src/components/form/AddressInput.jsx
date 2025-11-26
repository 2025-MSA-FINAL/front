// src/components/form/AddressInput.jsx
import React, { useState } from "react";

const AddressInput = ({
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

  const handleAddressSelect = (fullAddress) => {
    // 나중에 카카오 주소 검색에서 선택된 주소를 여기로 넣으면 됨
    if (onChange) {
      onChange({
        target: {
          name: addressName,
          value: fullAddress,
        },
      });
    }
    setIsOpen(false);
    setTouched(true);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setTouched(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const borderClass = hasError ? "border-primary" : "border-secondary";

  return (
    <div className="mb-8">
      <label className="block text-title-md text-text-black mb-2">
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </label>

      <div className="flex flex-col gap-2">
        {/* 주소 한 줄 (도로명) */}
        <div className="relative">
          <input
            type="text"
            name={addressName}
            value={addressValue || ""}
            readOnly
            placeholder="도로명 주소를 검색해 주세요"
            className={`
              w-full h-[50px] px-4 pr-28
              border-[1.5px] ${borderClass} rounded-[16px]
              text-body-md text-text-black
              bg-white outline-none
              focus:border-primary
              placeholder-[#E3E5E8]
              cursor-pointer
            `}
            onClick={handleOpen}
          />
          <button
            type="button"
            onClick={handleOpen}
            className="
              absolute right-3 top-1/2 -translate-y-1/2
              h-8 px-3 rounded-full
              text-label-md font-medium
              text-primary
              border border-primary/40
              bg-primary-light/40
              hover:bg-primary-light
              transition
            "
          >
            주소 검색
          </button>
        </div>

        {/* 상세 주소 (동/층/호수 등) */}
        <input
          type="text"
          name={detailName}
          value={detailValue || ""}
          onChange={onChange}
          placeholder="상세 주소 (건물명, 동·층·호수 등)"
          className="
            w-full h-[50px] px-4
            border-[1.5px] border-secondary rounded-[16px]
            text-body-md text-text-black
            bg-white outline-none
            focus:border-primary
            placeholder-[#E3E5E8]
          "
        />

        {hasError && (
          <p className="text-label-sm text-primary mt-1">
            팝업 스토어 장소를 선택해 주세요.
          </p>
        )}
      </div>

      {/* 주소 검색 모달 (카카오 우편번호 들어갈 자리) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-paper rounded-card shadow-card w-full max-w-[480px] p-6">
            <h3 className="text-title-md text-text-black mb-2">
              도로명 주소 검색
            </h3>
            <p className="text-body-sm text-text-sub mb-4">
              여기에는 나중에 카카오 주소 검색(우편번호) 컴포넌트가 들어갈 예정이에요.
            </p>

            {/* 임시 예시 버튼 – 나중에 실제 검색 결과 클릭 시 이 함수를 호출하면 됨 */}
            <button
              type="button"
              onClick={() =>
                handleAddressSelect("서울특별시 중구 을지로 00 카카오빌딩")
              }
              className="
                w-full h-[44px] mb-3
                rounded-[12px]
                bg-primary-light/60
                text-body-md text-text-black
                hover:bg-primary-light
                transition
              "
            >
              예시 주소 선택하기
            </button>

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
    </div>
  );
};

export default AddressInput;