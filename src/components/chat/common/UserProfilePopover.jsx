import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { startPrivateChat, getMiniUserProfile } from "../../../api/chatApi";
import { useChatStore } from "../../../store/chat/chatStore";
import privateChatIcon from "../../../assets/privateChat.png";

/* --------------------------------------------------------
   📌 Follow Motion 설정
   -------------------------------------------------------- */
const lerp = (start, end, factor) => start + (end - start) * factor;
const FOLLOW_SPEED = 0.18;

export default function UserProfilePopover({
  userId,
  anchorRef,
  scrollParentRef,
  open,
  onClose,
}) {
  const popRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });

  // ⭐ 꼬리 방향을 위한 상태값 (렌더에서 ref 접근 금지 해결)
  const [side, setSide] = useState("right");

  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // 첫 프레임인지 체크하는 ref
  const firstFrameRef = useRef(true);

  const { addOrSelectPrivateRoom } = useChatStore();
  const portalRoot = document.getElementById("popover-root");

  /* --------------------------------------
      프로필 로드
  -------------------------------------- */
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

  /* ---------------------------------------
      외부 클릭 닫기
  --------------------------------------- */
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
  }, [open, anchorRef]);

  /* ---------------------------------------
      open 변경 시 초기 상태 리셋
  --------------------------------------- */
  useEffect(() => {
    if (open) {
      firstFrameRef.current = true;
      setTimeout(() => {
        setReady(false);
      }, 0);
    }
  }, [open]);

  /* ======================================================
      위치 계산 + Follow Motion + 자동 close
  ====================================================== */
  const updatePosition = () => {
    if (!open) return;
    if (!anchorRef?.current || !popRef.current) return;

    const trigger = anchorRef.current.getBoundingClientRect();
    const pop = popRef.current;

    /* 1) 화면 밖이면 닫기 */
    const outOfScreen =
      trigger.bottom < 0 ||
      trigger.top > window.innerHeight ||
      trigger.right < 0 ||
      trigger.left > window.innerWidth;

    if (outOfScreen) return onClose();

    /* 2) 메시지 영역 밖이면 닫기 */
    if (scrollParentRef?.current) {
      const scrollBox = scrollParentRef.current.getBoundingClientRect();
      const out =
        trigger.bottom < scrollBox.top || trigger.top > scrollBox.bottom;
      if (out) return onClose();
    }

    /* 3) Popover 크기 측정 */
    pop.style.visibility = "hidden";
    pop.style.left = "-9999px";
    pop.style.top = "-9999px";

    const rect = pop.getBoundingClientRect();
    const popW = rect.width;
    const popH = rect.height;

    /* 4) 기본 위치: 오른쪽 */
    let targetX = trigger.right + 12;
    let targetY = trigger.top + trigger.height / 2 - popH / 2;

    /* 오른쪽 공간 부족 → 왼쪽으로 */
    let onLeft = false;
    if (targetX + popW > window.innerWidth - 10) {
      targetX = trigger.left - popW - 12;
      onLeft = true;
    }
    if (targetX < 10) targetX = 10;

    /* Y Clamp */
    if (targetY < 10) targetY = 10;
    if (targetY + popH > window.innerHeight - 10) {
      targetY = window.innerHeight - popH - 10;
    }

    /* 꼬리 상태 저장 → 렌더링 시 ref 접근 불필요 */
    setSide(onLeft ? "left" : "right");

    /* Follow Motion */
    const current = posRef.current;

    let newX, newY;

    if (firstFrameRef.current) {
      newX = targetX;
      newY = targetY;
      firstFrameRef.current = false;
    } else {
      newX = lerp(current.x, targetX, FOLLOW_SPEED);
      newY = lerp(current.y, targetY, FOLLOW_SPEED);
    }

    posRef.current = { x: newX, y: newY };

    pop.style.left = `${newX}px`;
    pop.style.top = `${newY}px`;
    pop.style.visibility = "visible";

    if (!ready) setReady(true);
  };

  /* Follow Motion Loop */
  useEffect(() => {
    if (!open) return;

    let frame;
    const loop = () => {
      updatePosition();
      frame = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(frame);
  }, [open]);

  if (!open || !user) return null;

  /* ======================================================
      Tail + Kakao-style Popover
  ====================================================== */

  const tailStyle =
    side === "left"
      ? {
          right: "-24px",
          borderColor: "transparent transparent transparent white",
          borderLeftColor: "white",
        }
      : {
          left: "-24px",
          borderColor: "transparent white transparent transparent",
          borderRightColor: "white",
        };

  return createPortal(
    <div
      ref={popRef}
      className={`fixed z-[9999] w-[350px] rounded-3xl px-7 py-7
        bg-white shadow-lg backdrop-blur-xl border border-gray-200
        flex flex-col items-center gap-3 origin-center
        ${ready ? "animate-kakao-pop" : ""}`}
    >
      {/* 꼬리 */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-0 h-0 border-[12px]"
        style={tailStyle}
      />

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
    </div>,
    portalRoot
  );
}
