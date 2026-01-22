import { Client } from "@stomp/stompjs";
import { WS_BASE } from "../utils/env";

let stompClient = null;

export function connectStomp() {
  return new Promise((resolve) => {
    stompClient = new Client({
      brokerURL: WS_BASE,  // ★ WebSocket 직접 연결
      reconnectDelay: 5000,
      debug: (str) => console.log("[STOMP]", str),

      onConnect: () => {
        console.log("📡 STOMP connected!");
        resolve();
      },

      onStompError: (frame) => {
        console.error("❌ STOMP error:", frame);
      },
    });

    stompClient.activate();
  });
}

export function getStompClient() {
  return stompClient;
}


/**
 * STOMP 연결 여부 반환
 */
export function isStompConnected() {
  return !!(stompClient && stompClient.connected);
}

/**
 * 공용 메시지 publish
 * - 기본 destination: "/pub/chat/message"
 * - 백엔드 ChatMessageRequest 스펙:
 *   { roomType, roomId, senderId, messageType, content }
 *
 * 필요하면 destination을 override 할 수도 있게 옵션 제공
 */
export function publishChatMessage({
  roomType,
  roomId,
  senderId,
  messageType = "TEXT",
  content = "",
  destination = "/pub/chat/message",
}) {
  if (!isStompConnected()) {
    console.warn("⚠️ 소켓이 연결되지 않아 메시지를 전송할 수 없습니다.");
    return;
  }

  if (!roomType) {
    console.warn("⚠️ roomType 이 없습니다. (예: 'GROUP' | 'PRIVATE')");
    return;
  }

  if (!roomId) {
    console.warn("⚠️ roomId 가 없습니다. 메시지를 보낼 수 없어요.");
    return;
  }

  if (!senderId) {
    console.warn("⚠️ senderId 가 없습니다. 메시지를 보낼 수 없어요.");
    return;
  }

  const body = {
    roomType,
    roomId,
    senderId,
    messageType,
    content: typeof content === "string" ? content : JSON.stringify(content),
  };

  console.log("📤 채팅 메시지 전송:", { destination, body });

  stompClient.publish({
    destination,
    body: JSON.stringify(body),
  });
}

/**
 * 특정 채팅방으로 "팝업 카드" 메시지 전송
 * - messageType: "POPUP"
 * - content: PopupDetailPage에서 만든 popupData(JSON 문자열)
 *
 * MessageItem.jsx 에서:
 *  - msg.messageType === "POPUP" 체크
 *  - JSON.parse(msg.content) 해서 popName/popThumbnail/popLocation/popId 사용
 */
export function publishPopupShare(roomType, roomId, senderId, popupData) {
  publishChatMessage({
    roomType,
    roomId,
    senderId,
    messageType: "POPUP",
    content: JSON.stringify(popupData ?? {}),
    destination: "/pub/chat/message",
  });
}

/**
 * popup 객체 키가 제각각일 수 있어서 pop* 형태로 정규화 후 전송
 * - popupData를 이미 { popId, popName, popThumbnail, popLocation }로 만들어서 쓰면
 *   publishPopupShare(...)를 바로 쓰는 걸 추천.
 */
export function publishPopupShareToRoom(roomType, roomId, senderId, popup) {
  if (!popup) {
    console.warn("⚠️ popup 데이터가 없습니다. 팝업 공유 메시지를 보낼 수 없어요.");
    return;
  }

  const popupPayload = {
    popId: popup.popId ?? popup.popupId ?? popup.id,
    popName: popup.popName ?? popup.name,
    popThumbnail: popup.popThumbnail ?? popup.thumbnailUrl ?? popup.thumbnail,
    popLocation: popup.popLocation ?? popup.location,
  };

  publishPopupShare(roomType, roomId, senderId, popupPayload);
}

/**
 * subscribe 헬퍼
 * - destination은 프로젝트 설정에 따라 다르므로, 그대로 문자열로 받아서 subscribe만 제공
 */
export function subscribe(destination, onMessage, headers = {}) {
  if (!isStompConnected()) {
    console.warn("⚠️ 소켓이 연결되지 않아 subscribe 할 수 없습니다.");
    return null;
  }

  return stompClient.subscribe(
    destination,
    (msg) => {
      try {
        const payload = msg?.body ? JSON.parse(msg.body) : null;
        onMessage?.(payload, msg);
      } catch (e) {
        console.error("❌ STOMP message parse error:", e, msg?.body);
        onMessage?.(msg?.body, msg);
      }
    },
    headers
  );
}
