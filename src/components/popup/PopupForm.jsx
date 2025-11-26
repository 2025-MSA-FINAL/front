import React from "react";
import { usePopupForm } from "../../hooks/usePopupForm";
import { ThumbnailUploader, DetailImageUploader } from "./ImageUploader";
import {
    TextInput,
    DateInput,
    SelectInput,
    PriceInput,
    TextArea,
    TagInput,
    RadioGroup,
    AddressInput,
} from "../form/FormFields";
import PrimaryButton from "../button/PrimaryButton";
import OutlineButton from "../button/OutlineButton";

const PopupForm = () => {
    const {
        form,
        errors,
        touched,
        loading,
        handleChange,
        handleBlur,
        handleRadioChange,
        handleImageUpload,
        moveDetailImage,
        addTag,
        removeTag,
        handleSubmit,
        markFieldTouched,
        isUploading,
        maxDetailImages,
        handleRemoveDetailImage,
    } = usePopupForm();


    //const locationTouched = touched.popLocation;
    const dateTouched = touched.popStartDate || touched.popEndDate;

    return (
        <div
            className="
                w-full 
                max-w-[1200px]
                mx-auto
                bg-paper rounded-card shadow-card
                px-8 py-10
                sm:px-12 sm:py-12
                xl:px-16 xl:py-14
                flex flex-col xl:flex-row
                gap-10 xl:gap-24
            "
        >
            {/* 왼쪽: 이미지 업로드 */}
            <div
                className="
                    w-full
                    max-w-[420px] mx-auto
                    xl:w-[420px] xl:max-w-none xl:mx-0
                    2xl:w-[460px]
                    xl:flex-shrink-0
                "
            >
                <ThumbnailUploader
                    previewUrl={form.popThumbnail}
                    onUpload={handleImageUpload}
                    error={errors.popThumbnail}
                    touched={touched.popThumbnail}
                    isUploading={isUploading}
                />

                <DetailImageUploader
                    images={form.popImages}
                    onUpload={handleImageUpload}
                    onRemove={handleRemoveDetailImage}
                    onMove={moveDetailImage}
                    error={errors.popImages}
                    touched={touched.popImages}
                    isUploading={isUploading}
                    maxCount={maxDetailImages}
                />
            </div>
            {/* 오른쪽: 입력 폼 */}
            <div
                className="
                    w-full
                    max-w-[560px]
                    mt-10 xl:mt-0
                    mx-auto
                    xl:mx-0 xl:ml-auto
                "
            >
                <TextInput
                    label="팝업 스토어 이름"
                    name="popName"
                    value={form.popName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="텍스트 입력"
                    required
                    error={errors.popName}
                    touched={touched.popName}
                />

                <DateInput
                    label="팝업 스토어 기간"
                    startDate={form.popStartDate}
                    endDate={form.popEndDate}
                    onChange={handleChange}
                    onBlurStart={handleBlur}
                    onBlurEnd={handleBlur}
                    required
                    error={errors.popDateRange}
                    touched={dateTouched}
                />

                <AddressInput
                    label="팝업 스토어 장소"
                    addressName="popLocation"
                    detailName="locationDetail"
                    addressValue={form.popLocation}
                    detailValue={form.locationDetail}
                    onChange={handleChange}
                    required
                    error={errors.popLocation}
                    touched={touched.popLocation}
                />




                <TextArea
                    label="팝업 스토어 설명"
                    name="popDescription"
                    value={form.popDescription}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="설명을 입력해 주세요"
                    required
                    error={errors.popDescription}
                    touched={touched.popDescription}
                />

                <PriceInput
                    label="팝업 스토어 가격"
                    name="popPrice"
                    value={form.popPrice}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    error={errors.popPrice}
                    touched={touched.popPrice}
                />

                <TagInput
                    label="팝업 스토어 태그 (10개 이하)"
                    tags={form.hashtags}
                    onAdd={addTag}
                    onRemove={removeTag}
                    onBlur={() => markFieldTouched("hashtags")}
                    required
                    error={errors.hashtags}
                    touched={touched.hashtags}
                />

                <TextInput
                    label="홈페이지 링크"
                    name="popInstaUrl"
                    value={form.popInstaUrl}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="링크 입력"
                    error={errors.popInstaUrl}
                    touched={touched.popInstaUrl}
                />

                <RadioGroup
                    label="팝업 스토어 예약 유무"
                    name="popIsReservation"
                    value={form.popIsReservation}
                    onChange={handleRadioChange}
                    required
                    error={errors.popIsReservation}
                    touched={touched.popIsReservation}
                />

                {/* 버튼 영역 */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-12 sm:mt-16">
                    <OutlineButton
                        type="button"
                        onClick={() => window.history.back()}
                        fullWidth
                        className="sm:w-[140px]"
                        disabled={loading}
                    >
                        취소
                    </OutlineButton>
                    <PrimaryButton
                        type="button"
                        onClick={handleSubmit}
                        loading={loading}
                        fullWidth
                        className="sm:w-[160px]"
                        disabled={loading || isUploading}
                    >
                        등록
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
};

export default PopupForm;
