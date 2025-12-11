// src/utils/env.js
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

const WS_BASE =
  import.meta.env.VITE_WS_BASE_URL ??
  API_BASE.replace(/^http/, "ws") + "/ws-stomp";

export { API_BASE, WS_BASE };
