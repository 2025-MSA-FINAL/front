import React, { useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import {
  createGroupChatRoom,
  getGroupChatRoomDetail,
} from "../../../api/chatApi";
import { useChatPopupStore } from "../../../store/chat/chatPopupStore";
import { useChatStore } from "../../../store/chat/chatStore";
import ghost3 from "../../../assets/ghost3.png";

export default function GroupRoomCreateForm() {
  const { selectedPopup, closeCreateForm, fetchPopupRooms } =
    useChatPopupStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxUserCnt, setMaxUserCnt] = useState("");
  const [gender, setGender] = useState("NONE");
  const [ageRange, setAgeRange] = useState([0, 100]);

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    maxUserCnt: "",
  });

  // -------------------------------
  // VALIDATION
  // -------------------------------
  const validate = () => {
    let newErrors = { title: "", description: "", maxUserCnt: "" };
    let isValid = true;

    if (!title.trim())
      (newErrors.title = "채팅방 이름을 입력해주세요."), (isValid = false);

    if (!description.trim())
      (newErrors.description = "채팅방 설명을 입력해주세요."),
        (isValid = false);
    else if (description.length > 255)
      (newErrors.description = "채팅방 설명은 255자 이하입니다."),
        (isValid = false);

    const num = Number(maxUserCnt);
    if (!num)
      (newErrors.maxUserCnt = "인원 수를 입력해주세요."), (isValid = false);
    else if (num < 3 || num > 300)
      (newErrors.maxUserCnt = "인원 수는 3~300명입니다."), (isValid = false);

    setErrors(newErrors);
    return isValid;
  };

  // -------------------------------
  // SUBMIT
  // -------------------------------
  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      popId: selectedPopup.popId,
      title,
      description,
      maxUserCnt: Number(maxUserCnt),
      limitGender: gender,
      minAge: ageRange[0],
      maxAge: ageRange[1],
    };

    // ⭐ 1) 방 생성 → gcrId 반환
    const newRoomId = await createGroupChatRoom(payload);
    if (!newRoomId) return;

    // ⭐ 2) 새 방 상세 조회
    const detail = await getGroupChatRoomDetail(newRoomId);

    // ⭐ 3) activeChatRoom 즉시 변경 → MessageChatSection으로 이동
    const { selectRoom } = useChatStore.getState();
    selectRoom(detail);

    // ⭐ 4) 팝업의 방 리스트 새로고침
    await fetchPopupRooms(selectedPopup.popId);

    // ⭐ 5) 생성 폼 닫기
    closeCreateForm();
  };

  return (
    <div className="w-full h-full justify-center flex flex-col items-center justify-center p-8 bg-paper-light rounded-xl">
      {/* HEADER */}
      <h2 className="text-[30px] font-bold text-black mb-13 tracking-tight">
        {selectedPopup?.popName ?? ""}
      </h2>

      {/* TOP CARDS */}
      <div className="grid grid-cols-2 gap-8 w-full max-w-[950px] h-[340px]">
        {/* LEFT CARD */}
        <div
          className="
          relative p-8 rounded-[22px]
          bg-black/60 backdrop-blur-xl
          border border-white/10
          shadow-[0_4px_18px_rgba(0,0,0,0.35)]
          transition-all
        "
        >
          <h3 className="font-bold text-[17px] text-primary-light mb-6">
            기본 정보
          </h3>

          {/* TITLE INPUT */}
          <div className="mb-7">
            <label className="text-[15px] font-semibold text-white">
              채팅방 이름
            </label>
            <input
              className={`
                w-full mt-2 p-3 rounded-xl border
                bg-white/10 text-white placeholder-white/50
                focus:ring-2 focus:ring-primary-dark outline-none
                transition-all
                ${errors.title ? "border-accent-pink" : "border-white/20"}
              `}
              placeholder="텍스트 입력"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: "" });
              }}
            />
            {errors.title && (
              <p className="text-accent-pink text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* MAX USER */}
          <div>
            <label className="text-[15px] font-semibold text-white">
              인원 수
            </label>
            <input
              type="number"
              className={`
                w-full mt-2 p-3 rounded-xl border
                bg-white/10 text-white placeholder-white/50
                focus:ring-2 focus:ring-primary-dark outline-none
                [&::-webkit-inner-spin-button]:appearance-none
                [&::-webkit-outer-spin-button]:appearance-none
                appearance-textfield
                ${errors.maxUserCnt ? "border-accent-pink" : "border-white/20"}
              `}
              placeholder="3 ~ 300"
              value={maxUserCnt}
              onChange={(e) => {
                setMaxUserCnt(e.target.value);
                if (errors.maxUserCnt) setErrors({ ...errors, maxUserCnt: "" });
              }}
            />
            {errors.maxUserCnt && (
              <p className="text-accent-pink text-sm mt-1">
                {errors.maxUserCnt}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT CARD */}
        <div
          className="
          relative p-8 rounded-[22px]
          bg-black/60 backdrop-blur-xl
          border border-white/10 shadow-[0_4px_18px_rgba(0,0,0,0.35)]
          transition-all overflow-hidden
        "
        >
          <img
            src={ghost3}
            className="absolute right-4 top-3 w-[70px] opacity-[0.05]"
          />

          <h3 className="font-bold text-[17px] text-primary-light mb-6">
            채팅방 설명
          </h3>

          <textarea
            className={`
              w-full p-3 rounded-xl h-[200px] border
              bg-white/10 text-white placeholder-white/50
              resize-none overflow-y-auto focus:ring-2 focus:ring-primary-dark
              outline-none
              ${errors.description ? "border-accent-pink" : "border-white/20"}
            `}
            value={description}
            placeholder="텍스트 입력 (최대 255자)"
            onChange={(e) => {
              if (e.target.value.length > 255) return;
              setDescription(e.target.value);
              if (errors.description) setErrors({ ...errors, description: "" });
            }}
          />

          <div className="flex justify-between text-sm mt-2">
            {errors.description && (
              <p className="text-accent-pink">{errors.description}</p>
            )}
            <p className="text-white/50">{description.length} / 255</p>
          </div>
        </div>
      </div>

      {/* ENTRY LIMIT CARD */}
      <div
        className="
        w-full max-w-[950px] mt-10 p-8 rounded-[22px]
        bg-black/60 backdrop-blur-xl shadow-[0_4px_18px_rgba(0,0,0,0.35)]
        border border-white/10
      "
      >
        <div className="text-[17px] font-bold text-primary-light mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary-light"></span>
          입장 제한
        </div>

        <div className="grid grid-cols-2 gap-10">
          {/* GENDER */}
          <div>
            <label className="text-[15px] font-semibold text-white">
              성별 제한
            </label>
            <select
              className="
                w-full mt-2 p-3 rounded-xl border bg-white/10
                text-secondary-light cursor-pointer border-white/20
                focus:ring-2 focus:ring-primary-dark outline-none
              "
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option className="text-black" value="NONE">
                무관
              </option>
              <option className="text-black" value="MALE">
                남자
              </option>
              <option className="text-black" value="FEMALE">
                여자
              </option>
            </select>
          </div>

          {/* AGE SLIDER */}
          <div>
            <label className="text-[15px] font-semibold text-white">
              연령 제한
            </label>

            <div className="mt-4">
              <Slider
                range
                min={0}
                max={100}
                value={ageRange}
                onChange={setAgeRange}
                trackStyle={[{ background: "var(--color-primary)" }]}
                handleStyle={[
                  {
                    backgroundColor: "#fff",
                    borderColor: "var(--color-primary)",
                  },
                  {
                    backgroundColor: "#fff",
                    borderColor: "var(--color-primary)",
                  },
                ]}
                railStyle={{ backgroundColor: "var(--color-primary-light)" }}
              />

              <div className="flex justify-between text-primary-light font-bold mt-2">
                <span>{ageRange[0]}세</span>
                <span>{ageRange[1]}세</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <button
        onClick={handleSubmit}
        className="
          mt-12 w-[180px] py-3 rounded-full font-bold
          text-text-sub border-2 border-primary-light
          hover:brightness-110 hover:bg-primary-light/50 hover:text-text-black transition-all
          shadow-brand active:scale-[0.97]
        "
      >
        생성하기
      </button>
    </div>
  );
}
