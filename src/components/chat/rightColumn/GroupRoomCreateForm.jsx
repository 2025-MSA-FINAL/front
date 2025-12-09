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
  const [isOpen, setIsOpen] = useState(false);

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
    else if (num < 3 || num > 300)
      (e.maxUserCnt = "3명 이상 300명이하 입력해주세요."), (ok = false);

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

    const { fetchRooms } = useChatStore.getState();
    await fetchRooms();

    await fetchPopupRooms(selectedPopup.popId);
    closeCreateForm();
  };

  return (
    <div className="w-full h-full gap-3 flex flex-col justify-center items-center p-6">
      {/* HEADER */}
      <h2 className="text-[26px] font-bold text-white tracking-tight mt-4 drop-shadow-lg">
        {selectedPopup?.popName ?? ""}
      </h2>

      {/* TOP CARDS */}
      <div className="grid grid-cols-2 gap-10 w-full max-w-[900px] mt-10">
        {/* LEFT CARD */}
        <div className="p-6 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg">
          <h3 className="font-bold text-sm text-white mb-3">기본 정보</h3>

          {/* TITLE */}
          <label className="text-xs text-white/80">채팅방 이름</label>
          <input
            className={`w-full mt-1 p-2 rounded-lg bg-white/10 text-white placeholder-white/40
              text-sm outline-none focus:ring-2 focus:ring-primary 
              ${
                errors.title
                  ? "border border-accent-pink"
                  : "border border-white/20"
              }`}
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

          {/* MAX USERS */}
          <label className="block mt-4 text-xs text-white/80">
            인원 수 (3 - 300)
          </label>
          <input
            type="number"
            className={`w-full mt-1 p-2 rounded-lg bg-white/10 text-white placeholder-white/40
                text-sm outline-none focus:ring-2 focus:ring-primary no-number-spin
                ${
                  errors.maxUserCnt
                    ? "border border-accent-pink"
                    : "border border-white/20"
                }`}
            value={maxUserCnt}
            onChange={(e) => {
              setMaxUserCnt(e.target.value);
              if (errors.maxUserCnt) setErrors({ ...errors, maxUserCnt: "" });
            }}
          />
          {errors.maxUserCnt && (
            <p className="text-accent-pink text-xs mt-1">{errors.maxUserCnt}</p>
          )}
        </div>

        {/* RIGHT CARD */}
        <div className="relative p-6 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg">
          <img
            src={ghost3}
            className="absolute right-2 top-2 w-[55px] opacity-[0.05]"
          />

          <h3 className="font-bold text-sm text-white mb-3">채팅방 설명</h3>

          <textarea
            className={`w-full p-3 rounded-lg h-[120px] bg-white/10 text-white
              placeholder-white/40 text-sm resize-none outline-none
              focus:ring-2 focus:ring-primary chat-textarea-scroll
              ${
                errors.description
                  ? "border border-accent-pink"
                  : "border border-white/20"
              }`}
            placeholder="텍스트 입력 (최대 255자)"
            value={description}
            onChange={(e) => {
              if (e.target.value.length > 255) return;
              setDescription(e.target.value);
              if (errors.description) setErrors({ ...errors, description: "" });
            }}
          />

          <div className="text-xs text-white/50 text-right mt-1">
            {description.length} / 255
          </div>
        </div>
      </div>

      {/* ENTRY LIMIT */}
      <div className="w-full max-w-[900px] mt-10 p-6 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg">
        <h3 className="font-bold text-sm text-white mb-3">입장 제한</h3>

        <div className="grid grid-cols-2 gap-10">
          {/* GENDER */}
          {/* GENDER */}
          <div className="relative z-[50]">
            <label className="text-xs text-white/80">성별 제한</label>

            {/* 트리거 버튼 */}
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="
      mt-1 w-full px-3 py-2
      rounded-lg bg-white/20 backdrop-blur-md
      text-white text-sm font-medium
      border border-white/30
      flex items-center justify-between
      focus:ring-2 focus:ring-primary transition
    "
            >
              <span>
                {gender === "NONE"
                  ? "무관"
                  : gender === "MALE"
                  ? "남자"
                  : "여자"}
              </span>

              {/* 화살표 */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`
        w-4 h-4 text-white/70 transition-transform duration-200
        ${isOpen ? "rotate-180" : "rotate-0"}
      `}
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* 드롭다운 메뉴 */}
            {isOpen && (
              <>
                {/* 외부 클릭 감지 */}
                <div
                  className="fixed inset-0 z-[40]"
                  onClick={() => setIsOpen(false)}
                />

                <ul
                  className="
          absolute left-0 top-full w-full
          bg-white/25 backdrop-blur-xl
          border border-white/40
          shadow-hover rounded-lg
          overflow-hidden z-[60]
          animate-fade-up
        "
                  style={{ animationDuration: "0.2s" }}
                >
                  {[
                    { value: "NONE", label: "무관" },
                    { value: "MALE", label: "남자" },
                    { value: "FEMALE", label: "여자" },
                  ].map((opt) => (
                    <li
                      key={opt.value}
                      onClick={() => {
                        setGender(opt.value);
                        setIsOpen(false);
                      }}
                      className={`
              px-4 py-3 cursor-pointer transition
              text-sm
              ${
                gender === opt.value
                  ? "bg-primary-light/20 text-white font-bold"
                  : "text-white/90 hover:bg-white/20"
              }
            `}
                    >
                      {opt.label}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* AGE RANGE SLIDER */}
          <div>
            <label className="text-xs text-white/80">연령 제한</label>
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
                railStyle={{ backgroundColor: "rgba(255,255,255,0.25)" }}
              />

              <div className="flex justify-between text-white/70 font-semibold text-xs mt-2">
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
          mt-10 w-[180px] py-3 rounded-full font-semibold
          bg-white/20 text-white border border-white/40
          backdrop-blur-xl
          hover:bg-accent-lemon-soft hover:text-[#363636]
    hover:shadow-[0_10px_32px_rgba(255,241,200,0.45)]
    hover:-translate-y-0.5
          shadow-lg
          transition-all duration-200
          active:scale-95
        "
      >
        생성하기
      </button>
    </div>
  );
}
