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
