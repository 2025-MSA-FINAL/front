import { create } from "zustand";

export const useChatMessageStore = create((set, get) => ({
  // 방별 상태 저장
  // key: `${roomType}-${roomId}`
  roomState: {},

  /* ---------------------------
    입장 시 초기화 (딱 1번)
    - entryReadMessageId: "여기까지읽음" 기준 (고정)
    - myLastReadMessageId: 내 실시간 읽음 (변할 수 있음)
    - otherLastReadMessageId: 상대 실시간 읽음 (변할 수 있음)
    - initialUnreadIndex: "여기까지읽음" 표시 위치 (고정)
  --------------------------- */
  initRoomReadState: ({
    roomType,
    roomId,
    entryReadMessageId,
    myLastReadMessageId,
    otherLastReadMessageId,
    participants,
    formattedMessages,
    currentUserId, 
  }) => {
    const key = `${roomType}-${roomId}`;

  let initialUnreadIndex = null;

  if (entryReadMessageId > 0) {
    const entryMsg = formattedMessages.find(
      (m) => typeof m.cmId === "number" && m.cmId === entryReadMessageId
    );

    const entryIsMine = entryMsg?.senderId === currentUserId;

    // ⭐ 마지막 읽은 메시지가 "내가 보낸 것"이 아닐 때만 divider 생성
    if (!entryIsMine) {
      const idx = formattedMessages.findIndex(
        (m) => typeof m.cmId === "number" && m.cmId > entryReadMessageId
      );
      initialUnreadIndex = idx !== -1 ? idx : null;
    }
  }


    set((state) => ({
      roomState: {
        ...state.roomState,
        [key]: {
          entryReadMessageId: entryReadMessageId ?? 0, // 고정
          myLastReadMessageId: myLastReadMessageId ?? entryReadMessageId ?? 0,
          otherLastReadMessageId: otherLastReadMessageId ?? 0,
          participants: participants ?? [],
          initialUnreadIndex,
          didInit: true,
        },
      },
    }));

    return initialUnreadIndex;
  },

  /* ---------------------------
    READ 이벤트 처리 (실시간 갱신)
    - entryReadMessageId/initialUnreadIndex는 절대 건드리지 않음
  --------------------------- */
  applyReadEvent: ({ roomType, roomId, readerUserId, lastReadMessageId, currentUserId }) => {
    const key = `${roomType}-${roomId}`;
    const prev = get().roomState[key];
    if (!prev) return;

    const rid = Number(readerUserId);
    const lr = Number(lastReadMessageId);
    

    set((state) => {
      const cur = state.roomState[key];
      if (!cur) return state;

      if (rid === Number(currentUserId)) {
      // 내가 마지막까지 읽었으면 divider 제거
      if (lr >= cur.entryReadMessageId) {
        return {
          roomState: {
            ...state.roomState,
            [key]: {
              ...cur,
              myLastReadMessageId: lr,
              initialUnreadIndex: null,
            },
          },
        };
      }
    }

      // PRIVATE: 내/상대 lastRead만 갱신
      if (roomType === "PRIVATE") {
        return {
          roomState: {
            ...state.roomState,
            [key]: {
              ...cur,
              myLastReadMessageId: rid === Number(currentUserId) ? lr : cur.myLastReadMessageId,
              otherLastReadMessageId: rid !== Number(currentUserId) ? lr : cur.otherLastReadMessageId,
            },
          },
        };
      }

      // GROUP: participants의 lastReadMessageId 업데이트 + 내/상대 2명일 경우 otherLastRead도 반영
      const nextParticipants = (cur.participants ?? []).map((p) =>
        Number(p.userId) === rid ? { ...p, lastReadMessageId: lr } : p
      );

      let nextMy = cur.myLastReadMessageId;
      let nextOther = cur.otherLastReadMessageId;

      if (rid === Number(currentUserId)) nextMy = lr;
     else if (roomType === "GROUP" && nextParticipants?.length === 2) nextOther = lr;

      return {
        roomState: {
          ...state.roomState,
          [key]: {
            ...cur,
            participants: nextParticipants,
            myLastReadMessageId: nextMy,
            otherLastReadMessageId: nextOther,
          },
        },
      };
    });
  },

  /* ---------------------------
    participants 갱신 (로드 시)
  --------------------------- */
  setParticipants: ({ roomType, roomId, participants }) => {
    const key = `${roomType}-${roomId}`;
    const prev = get().roomState[key] ?? {};
    set((state) => ({
      roomState: {
        ...state.roomState,
        [key]: { ...prev, participants: participants ?? [] },
      },
    }));
  },

  /* ---------------------------
    방 나갈 때 정리(선택)
  --------------------------- */
  clearRoomState: ({ roomType, roomId }) => {
    const key = `${roomType}-${roomId}`;
    set((state) => {
      const next = { ...state.roomState };
      delete next[key];
      return { roomState: next };
    });
  },

  /* getter */
  getRoomKey: (roomType, roomId) => `${roomType}-${roomId}`,



  resetInitialUnreadIndex: ({ roomType, roomId }) => {
  const key = `${roomType}-${roomId}`;
  const prev = get().roomState[key];
  if (!prev) return;

  set(state => ({
    roomState: {
      ...state.roomState,
      [key]: { ...prev, initialUnreadIndex: null },
    },
  }));
},
}));
