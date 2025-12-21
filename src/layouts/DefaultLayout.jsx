// src/layouts/DefaultLayout.jsx
import { Outlet } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Navbar from "../components/NavBar.jsx";

export default function DefaultLayout() {
  const [hideNavbar, setHideNavbar] = useState(false);

  const lastYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const getScrollY = (evt) => {
      // 1) 일반 window 스크롤
      const winY =
        window.scrollY ??
        document.documentElement.scrollTop ??
        document.body.scrollTop ??
        0;

      // 2) overflow:auto 컨테이너 스크롤도 잡기
      const t = evt?.target;
      const elY =
        t && t !== document && t !== window && typeof t.scrollTop === "number"
          ? t.scrollTop
          : 0;

      return Math.max(winY, elY);
    };

    lastYRef.current = getScrollY();
    setHideNavbar(false);

    const DELTA = 6;

    const onScroll = (e) => {
      if (tickingRef.current) return;

      tickingRef.current = true;
      window.requestAnimationFrame(() => {
        const y = getScrollY(e);
        const lastY = lastYRef.current;
        const diff = y - lastY;

        // 맨 위면 항상 표시
        if (y <= 0) {
          setHideNavbar(false);
          lastYRef.current = 0;
        } else {
          // 아래로 스크롤 => 숨김
          if (diff > DELTA) {
            setHideNavbar(true);
            lastYRef.current = y;
          }
          // 위로 스크롤 => 표시
          else if (diff < -DELTA) {
            setHideNavbar(false);
            lastYRef.current = y;
          }
        }

        tickingRef.current = false;
      });
    };

    // ✅ 어떤 요소에서 스크롤되든 잡히게 capture=true
    document.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });

    // 초기 동기화
    onScroll();

    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, []);

  return (
    <div className="min-h-screen text-text-black">
      <Navbar hidden={hideNavbar} />
      <Outlet />
    </div>
  );
}
