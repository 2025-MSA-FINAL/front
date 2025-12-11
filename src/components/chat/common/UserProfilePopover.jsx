import { useEffect, useRef, useState } from "react";
import { startPrivateChat, getMiniUserProfile } from "../../../api/chatApi";
import { useChatStore } from "../../../store/chat/chatStore";
import privateChatIcon from "../../../assets/privateChat.png";

export default function UserProfilePopover({
  userId,
  anchorRef,
  open,
  onClose,
  scrollParentRef, // 👈 새로 추가됨
}) {
  const popRef = useRef(null);
  const [user, setUser] = useState(null);

  const { addOrSelectPrivateRoom } = useChatStore();

  /* 외부 클릭 감지 */
  useEffect(() => {
    if (!open) return;

    const handler = (e) => {
      if (
        popRef.current &&
        !popRef.current.contains(e.target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, anchorRef, onClose]);

  /* Mini Profile 불러오기 */
  useEffect(() => {
    if (!open || !userId) return;

    const load = async () => {
      try {
        const data = await getMiniUserProfile(userId);
        setUser(data);
      } catch {
        setUser({
          nickname: "알 수 없음",
          profileImage: privateChatIcon,
          introduction: "",
        });
      }
    };
    load();
  }, [open, userId]);

  /* Popover 위치 계산 */
  useEffect(() => {
    if (
      !open ||
      !anchorRef?.current ||
      !popRef.current ||
      !scrollParentRef?.current
    )
      return;

    const triggerRect = anchorRef.current.getBoundingClientRect();
    const containerRect = scrollParentRef.current.getBoundingClientRect();
    const pop = popRef.current;

    const popWidth = pop.offsetWidth;
    const popHeight = pop.offsetHeight;

    // 기본 위치: 오른쪽 배치
    let left = triggerRect.right - containerRect.left + 40;
    let top =
      triggerRect.top -
      containerRect.top +
      triggerRect.height / 40 -
      popHeight / 50;

    // 오른쪽 벗어나면 왼쪽으로
    if (left + popWidth > containerRect.width - 20) {
      left = triggerRect.left - containerRect.left - popWidth - 16;
    }

    // 위치 제한 값 정의
    const topLimit = 100; // 화면 상단에서 여유 공간
    const middleLimit = containerRect.height / 4 - popHeight / 100; // 중앙 보정
    const bottomLimit = containerRect.height - popHeight + 80; // 입력창 위 보정

    if (top < topLimit) {
      top = Math.min(middleLimit, bottomLimit);
    } else if (top > bottomLimit) {
      top = bottomLimit;
    } else {
      top = Math.min(top, middleLimit);
    }

    pop.style.position = "absolute";
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
  }, [open, anchorRef, scrollParentRef]);

  /* 전체 스크롤 잠금 */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      if (scrollParentRef?.current)
        scrollParentRef.current.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (scrollParentRef?.current)
        scrollParentRef.current.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (scrollParentRef?.current)
        scrollParentRef.current.style.overflow = "auto";
    };
  }, [open]);

  if (!open || !user) return null;

  return (
    <div
      ref={popRef}
      className="fixed z-[9999] w-[350px] rounded-3xl px-7 py-7
                 bg-white/95 backdrop-blur-xl border border-gray-200 shadow-lg
                 flex flex-col items-center gap-3"
    >
      <img
        src={user.profileImage || privateChatIcon}
        className="w-20 h-20 rounded-full object-cover shadow"
      />

      <h2 className="text-xl font-bold text-text-black">
        {user.nickname || "알 수 없음"}
      </h2>

      <p className="text-sm text-text-sub text-center whitespace-pre-line px-2">
        {user.introduction || "자기소개가 없습니다."}
      </p>

      <button
        onClick={async () => {
          try {
            const roomId = await startPrivateChat({ targetUserId: userId });
            addOrSelectPrivateRoom({
              roomId,
              roomType: "PRIVATE",
              roomName: user.nickname,
              otherUserNickname: user.nickname,
              otherUserProfileImage: user.profileImage,
            });
            onClose();
          } catch (e) {
            console.error("1:1 채팅 시작 실패", e);
          }
        }}
        className="mt-3 w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition"
      >
        1:1 채팅
      </button>
    </div>
  );
}
