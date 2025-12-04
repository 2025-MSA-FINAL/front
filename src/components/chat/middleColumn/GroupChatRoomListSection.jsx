import { useEffect } from "react";
import { useChatPopupStore } from "../../../store/chat/chatPopupStore";
import { useChatStore } from "../../../store/chat/chatStore";
import ghost3 from "../../../assets/ghost3.png";
import BackArrowIcon from "../icons/BackArrowIcon";
import LockClosedIcon from "../icons/LockClosedIcon";
import LockOpenIcon from "../icons/LockOpenIcon";

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
  const { exitRoom } = useChatStore();
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
        bg-rose-200/40
        rounded-[30px]
        p-4 flex flex-col
      "
    >
      {/* ---------------------------- */}
      {/* HEADER */}
      {/* ---------------------------- */}
      <div className="flex items-center justify-between mb-4 w-full overflow-hidden">
        {/* 왼쪽 영역: 뒤로가기 + 팝업명 */}
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

        {/* CREATE BUTTON */}
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
            {/* 하얀 박스 */}
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

            {/* 고스트 이미지 */}
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

            {/* 텍스트 */}
            <div
              className="
                absolute top-[16px] left-[62px]
                text-primary-dark text-[14px] font-semibold
                whitespace-nowrap leading-none
                transition-colors duration-200
                group-hover:text-primary-dark
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
          <div className="text-center text-gray-700">불러오는 중...</div>
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
                w-full bg-white 
                rounded-[16px] shadow-card 
                px-4 py-3
                flex items-center justify-between
              "
            >
              {/* -------------------------- */}
              {/* LEFT: ICON + TITLE (ellipsis) */}
              {/* -------------------------- */}
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                {/* LOCK ICON */}
                {room.joined ? (
                  <LockOpenIcon className="w-6 h-6 text-secondary-dark shrink-0" />
                ) : (
                  <LockClosedIcon className="w-6 h-6 text-secondary-dark shrink-0" />
                )}

                {/* TITLE — ellipsis */}
                <p className="font-semibold text-text-sub text-[15px] truncate w-full">
                  {room.title}
                </p>
              </div>

              {/* -------------------------- */}
              {/* RIGHT: BUTTON */}
              {/* -------------------------- */}
              {room.joined ? (
                <button
                  className="
      px-4 py-1 rounded-full shrink-0
      bg-accent-aqua/50 text-accent-aqua
      text-sm font-bold
    "
                  onClick={async () => {
                    const detail = await fetchRoomDetail(room.gcrId); // 상세조회
                    const { selectRoom } = useChatStore.getState();
                    selectRoom(detail);
                  }}
                >
                  참여 중
                </button>
              ) : (
                <button
                  onClick={() => {
                    exitRoom();
                    fetchRoomDetail(room.gcrId);
                  }}
                  className="
                    px-4 py-1 rounded-full shrink-0
                    bg-primary-light text-primary-dark
                    text-sm font-bold
                    hover:bg-primary transition
                  "
                >
                  참여
                </button>
              )}
            </div>
          ))}
      </div>
    </section>
  );
}
