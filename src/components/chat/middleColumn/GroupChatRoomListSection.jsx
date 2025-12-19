import { useEffect } from "react";
import { useChatPopupStore } from "../../../store/chat/chatPopupStore";
import { useChatStore } from "../../../store/chat/chatStore";
import ghost3 from "../../../assets/ghost3.png";
import BackArrowIcon from "../icons/BackArrowIcon";
import LockClosedIcon from "../icons/LockClosedIcon";
import LockOpenIcon from "../icons/LockOpenIcon";
import LoadingSpinner from "../../common/LoadingSpinner";

export default function GroupChatRoomListSection() {
  const {
    selectedPopup,
    popupRooms,
    fetchPopupRooms,
    resetPopup,
    loading,
    openCreateForm,
    fetchRoomDetail,
  } = useChatPopupStore();

  const { exitRoom, selectRoom } = useChatStore();

  // 선택된 팝업의 방 목록 불러오기
  useEffect(() => {
    if (selectedPopup) fetchPopupRooms(selectedPopup.popId);
  }, [selectedPopup, fetchPopupRooms]);

  return (
    <section
      className="
    w-full min-h-full
    bg-primary-soft2
    rounded-[24px]
    p-3 lg:p-4
    flex flex-col
    border border-primary-soft
    shadow-[0_2px_8px_rgba(0,0,0,0.06)]
  "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 w-full overflow-hidden">
        {/* Back + Popup Title */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={resetPopup}
            className="
              text-text-black text-[20px]
              px-2 py-1 rounded-md
              hover:bg-white/40 transition
            "
          >
            <BackArrowIcon className="w-5 h-5" stroke="currentColor" />
          </button>

          <p className="font-bold text-[18px] text-text-black truncate">
            {selectedPopup?.popName}
          </p>
        </div>

        {/* ⭐ 채팅 생성 버튼 (ghost3 위치 절대 변경 X) */}
        <div
          onClick={() => openCreateForm()}
          className="
            group relative flex-shrink-0 cursor-pointer ml-3
            transition-transform duration-200
            hover:-translate-y-[2px] active:translate-y-[1px]
          "
        >
          <div className="relative w-[136px] h-[40px]">
            {/* 버튼 바디 (Flat White + Soft Border) */}
            <div
              className="
                absolute top-[7px] left-[20px]
                w-[110px] h-[32px]
                bg-white border border-primary-soft
                rounded-[10px]
                shadow-[0_2px_6px_rgba(0,0,0,0.05)]
                transition-all
                group-hover:border-primary-light
                group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]
              "
            />

            {/* ghost3 — 위치/크기 수정 금지 */}
            <img
              src={ghost3}
              alt="ghost-create"
              className="
                absolute top-1 left-4 w-[37px] h-[37px] object-cover
                transition-transform duration-200
                group-hover:scale-[1.05]
              "
            />

            {/* 텍스트 */}
            <div
              className="
                absolute top-[16px] left-[62px]
                text-primary-dark text-[14px] font-semibold
                whitespace-nowrap leading-none
              "
            >
              채팅 생성
            </div>
          </div>
        </div>
      </div>

      {/* GROUP ROOM LIST */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col gap-3">
        {loading && (
          <div className="flex justify-center items-center w-full h-full">
            <LoadingSpinner />
          </div>
        )}

        {!loading && popupRooms.length === 0 && (
          <div className="text-center text-secondary-dark text-[15px] mt-4">
            이 팝업에는 채팅방이 없습니다.
          </div>
        )}

        {!loading &&
          popupRooms.map((room) => (
            <div
              key={room.gcrId}
              className="
                group relative w-full
                rounded-2xl px-3 lg:px-4 py-3 lg:py-4
                flex items-center justify-between
                cursor-pointer
                transition-all duration-200 ease-out

                bg-white
                border border-primary-soft
                shadow-[0_2px_6px_rgba(0,0,0,0.05)]

                hover:-translate-y-[2px]
                hover:shadow-[0_6px_14px_rgba(0,0,0,0.08)]
                hover:border-primary-light
              "
              onClick={async () => {
                if (room.joined) {
                  const detail = await fetchRoomDetail(room.gcrId);
                  selectRoom(detail);
                  return;
                }

                exitRoom();
                await fetchRoomDetail(room.gcrId);
              }}
            >
              {/* 아이콘 */}
              <div className="flex items-center gap-3 relative z-10 flex-1 min-w-0">
                {room.joined ? (
                  <LockOpenIcon className="w-6 h-6 text-secondary-dark" />
                ) : (
                  <LockClosedIcon className="w-6 h-6 text-secondary-dark" />
                )}

                <p
                  className="
      font-semibold text-text-black text-[15px]
      truncate overflow-hidden whitespace-nowrap
    "
                >
                  {room.title}
                </p>
              </div>

              {/* 참여 여부 뱃지 */}
              <span
                className={`
                  px-4 py-1 rounded-full text-[13px] font-bold shrink-0
                  ${
                    room.joined
                      ? "bg-accent-lemon-soft text-text-black"
                      : "bg-accent-pink-soft text-text-black"
                  }
                `}
              >
                {room.joined ? "참여 중" : "입장"}
              </span>
            </div>
          ))}
      </div>
    </section>
  );
}
