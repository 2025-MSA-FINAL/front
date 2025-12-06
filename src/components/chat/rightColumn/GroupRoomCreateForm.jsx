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

  const validate = () => {
    let e = { title: "", description: "", maxUserCnt: "" };
    let ok = true;

    if (!title.trim()) (e.title = "채팅방 이름을 입력해주세요."), (ok = false);

    if (!description.trim())
      (e.description = "채팅방 설명을 입력해주세요."), (ok = false);
    else if (description.length > 255)
      (e.description = "255자 이하입니다."), (ok = false);

    const num = Number(maxUserCnt);
    if (!num) (e.maxUserCnt = "인원 수 입력"), (ok = false);
    else if (num < 3 || num > 300) (e.maxUserCnt = "3~300명"), (ok = false);

    setErrors(e);
    return ok;
  };

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

    const newRoomId = await createGroupChatRoom(payload);
    if (!newRoomId) return;

    const detail = await getGroupChatRoomDetail(newRoomId);

    const { selectRoom } = useChatStore.getState();
    selectRoom(detail);

    await fetchPopupRooms(selectedPopup.popId);

    closeCreateForm();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 rounded-2xl">
      {/* HEADER */}
      <h2 className="text-[30px] font-bold text-black mb-8 tracking-tight">
        {selectedPopup?.popName ?? ""}
      </h2>

      {/* TOP CARDS */}
      <div className="grid grid-cols-2 gap-10 w-full max-w-[850px] mt-8">
        {/* LEFT CARD */}
        <div className="relative p-5 rounded-[18px] bg-black/60 backdrop-blur-xl border border-white/10 shadow-md">
          <h3 className="font-bold text-[15px] text-primary-light mb-4">
            기본 정보
          </h3>

          {/* TITLE INPUT */}
          <div className="mb-5">
            <label className="text-[14px] font-semibold text-white">
              채팅방 이름
            </label>
            <input
              className={`w-full mt-1 p-2 rounded-lg border bg-white/10 text-white placeholder-white/50
                text-[14px]
                focus:ring-2 focus:ring-primary-dark outline-none
                ${errors.title ? "border-accent-pink" : "border-white/20"}`}
              placeholder="텍스트 입력"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: "" });
              }}
            />
            {errors.title && (
              <p className="text-accent-pink text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* MAX USER */}
          <div>
            <label className="text-[14px] font-semibold text-white">
              인원 수
            </label>
            <input
              type="number"
              className={`w-full mt-1 p-2 rounded-lg border bg-white/10 text-white placeholder-white/50
                text-[14px]
                focus:ring-2 focus:ring-primary-dark outline-none
                ${
                  errors.maxUserCnt ? "border-accent-pink" : "border-white/20"
                }`}
              placeholder="3 ~ 300"
              value={maxUserCnt}
              onChange={(e) => {
                setMaxUserCnt(e.target.value);
                if (errors.maxUserCnt) setErrors({ ...errors, maxUserCnt: "" });
              }}
            />
            {errors.maxUserCnt && (
              <p className="text-accent-pink text-xs mt-1">
                {errors.maxUserCnt}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="relative p-5 rounded-[18px] bg-black/60 backdrop-blur-xl border border-white/10 shadow-md overflow-hidden">
          <img
            src={ghost3}
            className="absolute right-3 top-2 w-[55px] opacity-[0.05]"
          />

          <h3 className="font-bold text-[15px] text-primary-light mb-4">
            채팅방 설명
          </h3>

          <textarea
            className={`w-full p-2 rounded-lg h-[120px] border
              bg-white/10 text-white placeholder-white/50 text-[14px]
              resize-none focus:ring-2 focus:ring-primary-dark outline-none
              ${errors.description ? "border-accent-pink" : "border-white/20"}`}
            value={description}
            placeholder="텍스트 입력 (최대 255자)"
            onChange={(e) => {
              if (e.target.value.length > 255) return;
              setDescription(e.target.value);
              if (errors.description) setErrors({ ...errors, description: "" });
            }}
          />

          <div className="flex justify-between text-xs mt-1">
            {errors.description && (
              <p className="text-accent-pink">{errors.description}</p>
            )}
            <p className="text-white/50">{description.length} / 255</p>
          </div>
        </div>
      </div>

      {/* ENTRY LIMIT CARD */}
      <div className="w-full max-w-[850px] mt-6 p-6 rounded-[18px] bg-black/60 backdrop-blur-xl border border-white/10 shadow-md">
        <div className="text-[15px] font-bold text-primary-light mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary-light"></span>
          입장 제한
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* GENDER */}
          <div>
            <label className="text-[14px] font-semibold text-white">
              성별 제한
            </label>
            <select
              className="w-full mt-1 p-2 rounded-lg border bg-white/10 text-secondary-light text-[14px]
                cursor-pointer border-white/20
                focus:ring-2 focus:ring-primary-dark outline-none"
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
            <label className="text-[14px] font-semibold text-white">
              연령 제한
            </label>

            <div className="mt-3">
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

              <div className="flex justify-between text-primary-light font-bold text-xs mt-1">
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
        className="mt-8 w-[160px] py-2 rounded-full font-bold
        text-text-sub border-2 border-primary-light
        hover:brightness-110 hover:bg-primary-light/50 hover:text-text-black transition-all
        shadow-brand active:scale-[0.97]"
      >
        생성하기
      </button>
    </div>
  );
}
