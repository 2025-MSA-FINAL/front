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

  // ⭐ 팝업 선택되면 그 팝업의 그룹채팅방 목록 불러오기
  useEffect(() => {
    if (selectedPopup) {
      fetchPopupRooms(selectedPopup.popId);
    }
  }, [selectedPopup, fetchPopupRooms]);

  return (
    <section
      className="
        w-full h-full
        bg-primary-soft2/80
        rounded-[30px]
        p-4 flex flex-col shadow-card
      "
    >
      {/* ---------------------------- */}
      {/* HEADER */}
      {/* ---------------------------- */}
      <div className="flex items-center justify-between mb-4 w-full overflow-hidden">
        {/* Back Button + Popup Name */}
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

        {/* Create Button */}
        <div
          onClick={() => openCreateForm()}
          className="
            group relative flex-shrink-0 cursor-pointer ml-3
            transition-transform duration-[220ms]
            [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]
            hover:-translate-y-[2px] hover:scale-[1.015]
            active:translate-y-[1px] active:scale-[0.985]
          "
        >
          <div className="relative w-[136px] h-[40px]">
            <div
              className="
                absolute top-[7px] left-[20px]
                w-[110px] h-[32px]
                bg-white rounded-[10px] border border-[#dddfe2]
                transition-colors duration-[220ms]
                [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]
                group-hover:border-primary-light
                group-hover:shadow-hover
              "
            />

            <img
              src={ghost3}
              alt="ghost-create"
              className="
                absolute top-1 left-4 w-[37px] h-[37px] object-cover
                transition-transform duration-[220ms]
                [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]
                group-hover:scale-[1.05]
              "
            />

            <div
              className="
                absolute top-[16px] left-[62px]
                text-accent-pink text-[14px] font-semibold
                whitespace-nowrap leading-none
                transition-colors duration-200
                group-hover:text-accent-pink
              "
            >
              채팅 생성
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------- */}
      {/* GROUP ROOM LIST */}
      {/* ---------------------------- */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col gap-4">
        {loading && (
          <div className="flex justify-center items-center w-full h-full">
            <LoadingSpinner />
          </div>
        )}

        {!loading && popupRooms.length === 0 && (
          <div className="text-center text-secondary-dark">
            이 팝업에는 채팅방이 없습니다.
          </div>
        )}

        {!loading &&
          popupRooms.map((room) => (
            <div
              key={room.gcrId}
              className="
                group relative w-full 
                rounded-2xl px-4 py-4 
                cursor-pointer flex items-center justify-between
                transition-all duration-200 ease-out
                bg-white/55 backdrop-blur-xl
                border border-primary-soft2/80
                shadow-[0_4px_12px_rgba(180, 140, 255, 0.23)]
                hover:shadow-[0_10px_24px_rgba(180, 140, 255, 0.32)]
                hover:-translate-y-[2px]
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
              <div
                className="
                  absolute inset-0 rounded-2xl opacity-0
                  group-hover:opacity-100
                  bg-white/35 backdrop-blur-xl
                  border border-white/30
                  transition-all duration-200
                "
              />

              <div className="flex items-center gap-3 overflow-hidden flex-1 relative z-10">
                {room.joined ? (
                  <LockOpenIcon className="w-6 h-6 text-secondary-dark shrink-0" />
                ) : (
                  <LockClosedIcon className="w-6 h-6 text-secondary-dark shrink-0" />
                )}

                <p className="font-semibold text-text-black text-[15px] truncate w-full">
                  {room.title}
                </p>
              </div>

              <span
                className={`
                  relative z-10 px-4 py-1 rounded-full shrink-0 text-[13px] font-bold
                  transition
                  ${
                    room.joined
                      ? "bg-accent-lemon-soft/70 text-text-black"
                      : "bg-accent-pink/65 text-text-white"
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
