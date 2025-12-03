import PopupRoomItem from "../common/PopupRoomItem";
import groupChat from "../../../assets/groupChat.png";
import privateChat from "../../../assets/privateChat.png";

export default function PopupRoomSection() {
  const mockPopupRooms = [
    { id: 1, name: "무모한 몬치치 투어", img: groupChat },
    { id: 2, name: "젤리캣 스페이스 팝업스토어", img: privateChat },
    { id: 3, name: "다마고치 팝업스토어", img: groupChat },
    { id: 4, name: "토니모리 <주토피아> 팝업•••", img: privateChat },
    { id: 5, name: "텔레토비 팝업스토어", img: groupChat },
    { id: 6, name: "SSEBONGRAMA 어쩌다•••", img: groupChat },
    { id: 7, name: "똥마카세 짬뽕 포차 팝업스•••", img: privateChat },
    { id: 8, name: "똥마카세 짬뽕 포차 팝업스•••", img: privateChat },
    { id: 9, name: "똥마카세 짬뽕 포차 팝업스•••", img: privateChat },
    { id: 10, name: "똥마카세 짬뽕 포차 팝업스•••", img: privateChat },
    { id: 11, name: "똥마카세 짬뽕 포차 팝업스•••", img: privateChat },
  ];

  return (
    <section
      className="
        w-full h-full 
        bg-primary-light 
        rounded-[30px] 
        p-4 
        flex flex-col
      "
    >
      {/* 스크롤 영역 */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col gap-4">
        {mockPopupRooms.map((popup) => (
          <PopupRoomItem key={popup.id} name={popup.name} img={popup.img} />
        ))}
      </div>
    </section>
  );
}
