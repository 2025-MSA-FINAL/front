const THEME_KEY = "theme";
const THEMES = ["light", "dark", "high-contrast", "cb-safe"];

/**
 * localStorage 에서 저장된 테마 가져오기
 */
function getSavedTheme() {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved && THEMES.includes(saved)) return saved;
  } catch {
    // private 모드 등 에러 무시
  }
  return null;
}

/**
 * 시스템 다크모드 선호 감지
 */
function detectSystemTheme() {
  if (typeof window === "undefined") return "light";
  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

/**
 * 실제 DOM(html)에 data-theme 속성 적용
 */
function applyThemeToDom(theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = theme;
}

/**
 * 초기 테마 설정 (앱 시작 시 1번 실행)
 */
export function initTheme() {
  const saved = getSavedTheme();
  const theme = saved ?? detectSystemTheme();

  applyThemeToDom(theme);

  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    //무시
  }

  return theme;
}

/**
 * 유저가 테마를 바꿀 때 호출할 함수
 */
export function setTheme(theme) {
  if (!THEMES.includes(theme)) return;

  applyThemeToDom(theme);

  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    //무시
  }
}

/**
 * 현재 DOM 기준 테마 가져오기 (NavBar 등에서 초기값으로 사용)
 */
export function getCurrentTheme() {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme || "light";
}

/**
 * 외부에서 사용할 수 있도록 테마 리스트도 내보내기 (UI 만들 때 사용)
 */
export const AVAILABLE_THEMES = [
  { id: "light", label: "라이트" },
  { id: "dark", label: "다크" },
  { id: "high-contrast", label: "고대비" },
  { id: "cb-safe", label: "색약" },
];
