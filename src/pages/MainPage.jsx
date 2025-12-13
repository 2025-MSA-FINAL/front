import React, { useEffect, useMemo, useState } from "react";
import ghost1 from "../assets/ghost2.png";
import image1 from "../assets/dummy/image1.jpg";
import image2 from "../assets/dummy/image2.webp";
import image3 from "../assets/dummy/image3.jpeg";
import image4 from "../assets/dummy/image4.png";
import image5 from "../assets/dummy/image5.png";
import image6 from "../assets/dummy/image6.jpg";
import image7 from "../assets/dummy/image7.jpg";

/**
 * ✅ 반응형 레이아웃 값 계산
 * - 카드 폭/간격/hero 높이를 화면 크기에 맞춰 자동 조절
 * - 인디케이터 겹침/천장붙음 방지:
 *   1) 카드 absolute 기준을 top/left 50%로 중앙 고정
 *   2) hero 하단에 indicatorSafeSpace만큼 공간 확보
 *   3) 카드 중심을 safeSpace 기준으로 살짝만 위/아래 보정(centerNudge)
 */
function useHeroLayout() {
  const [w, setW] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1200));

  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const bp = w < 640 ? "m" : w < 1024 ? "t" : "d";

  const cfg =
    bp === "m"
      ? {
          cardW: 268,
          step1: 244,
          step2: 400,
          step3: 515,

          heroVH: 63,
          heroMin: 565,
          heroMax: 720,

          // ✅ 인디케이터가 들어갈 하단 안전영역
          indicatorSafeSpace: 82,

          // ✅ 인디케이터 위치: 살짝 위로
          indicatorBottom: 28,

          // ✅ 카드 중심 보정 (너무 위로 뜨지 않게 살짝 아래로)
          centerNudge: 10,

          padY: "py-6",
        }
      : bp === "t"
      ? {
          cardW: 325,
          step1: 315,
          step2: 520,
          step3: 675,

          heroVH: 65,
          heroMin: 615,
          heroMax: 805,

          indicatorSafeSpace: 90,
          indicatorBottom: 30,
          centerNudge: 12,

          padY: "py-7",
        }
      : {
          cardW: 380,
          step1: 360,
          step2: 610,
          step3: 780,

          heroVH: 68,
          heroMin: 665,
          heroMax: 870,

          indicatorSafeSpace: 98,
          indicatorBottom: 32,
          centerNudge: 14,

          padY: "py-8",
        };

  return { w, bp, cfg };
}

function MainPage() {
  const posters = useMemo(
    () => [
      { id: 1, img: image1, title: "팝마트 윈터 빌리지", date: "25.12.01 - 12.31", place: "서울 성동구" },
      { id: 2, img: image2, title: "나 혼자만 레벨업", date: "25.12.13 - 03.01", place: "서울 마포구" },
      { id: 3, img: image3, title: "새로 가챠 팝업", date: "25.11.21 - 12.14", place: "서울 광진구" },
      { id: 4, img: image4, title: "오프라인 팝업 스토어", date: "25.12.05 - 12.25", place: "서울 강남구" },
      { id: 5, img: image5, title: "브랜드 쇼케이스", date: "25.12.10 - 12.31", place: "서울 용산구" },
      { id: 6, img: image6, title: "콜라보 한정 굿즈전", date: "25.12.18 - 01.05", place: "서울 종로구" },
      { id: 7, img: image7, title: "아트 토이 페스티벌", date: "25.12.20 - 01.12", place: "서울 송파구" },
    ],
    []
  );

  const { cfg } = useHeroLayout();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % posters.length);
    }, 3500);
    return () => clearInterval(id);
  }, [posters.length]);

  const go = (idx) => setActive(idx);

  const getOffset = (index) => {
    const n = posters.length;
    let diff = index - active;
    if (diff > n / 2) diff -= n;
    if (diff < -n / 2) diff += n;
    return diff;
  };

  const heroHeightStyle = {
    height: `${cfg.heroVH}vh`,
    minHeight: `${cfg.heroMin}px`,
    maxHeight: `${cfg.heroMax}px`,
  };

  // ✅ 카드 세로 중심 보정: indicatorSafeSpace의 절반만큼 위로 당기면 인디케이터와 겹치기 쉬워짐
  // -> centerNudge(+)로 살짝 아래로 내려서 "천장 붙음"을 없앰
  const baseCardY = -Math.round(cfg.indicatorSafeSpace / 2) + cfg.centerNudge;

  return (
    <main className="min-h-[calc(100vh-88px)] bg-secondary-light pb-16">
      {/* =========================
          HERO
         ========================= */}
      <section className="relative w-full">
        <div
          className="w-full relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #4a148c 0%, #6a1b9a 30%, #7b1fa2 60%, #8e24aa 100%)",
          }}
        >
          {/* ✅ active 포스터를 배경으로 깔기 */}
          <div className="absolute inset-0">
            <img
              src={posters[active]?.img}
              alt=""
              className="w-full h-full object-cover scale-110 blur-2xl opacity-35"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-purple-950/35 to-purple-950/75" />
          </div>

          {/* 별 입자 */}
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(255,255,255,0.9) 1px, transparent 1px),
                radial-gradient(circle at 60% 70%, rgba(255,255,255,0.7) 1.5px, transparent 1.5px),
                radial-gradient(circle at 80% 20%, rgba(255,255,255,0.8) 1px, transparent 1px),
                radial-gradient(circle at 30% 80%, rgba(255,255,255,0.6) 2px, transparent 2px),
                radial-gradient(circle at 90% 60%, rgba(255,255,255,0.7) 1px, transparent 1px),
                radial-gradient(circle at 15% 50%, rgba(255,255,255,0.9) 1.5px, transparent 1.5px),
                radial-gradient(circle at 45% 15%, rgba(255,255,255,0.8) 1px, transparent 1px),
                radial-gradient(circle at 70% 85%, rgba(255,255,255,0.6) 1.5px, transparent 1.5px),
                radial-gradient(circle at 25% 60%, rgba(255,255,255,0.7) 1px, transparent 1px),
                radial-gradient(circle at 85% 40%, rgba(255,255,255,0.9) 2px, transparent 2px),
                radial-gradient(circle at 50% 50%, rgba(255,255,255,0.5) 1px, transparent 1px),
                radial-gradient(circle at 35% 25%, rgba(255,255,255,0.7) 1.5px, transparent 1.5px),
                radial-gradient(circle at 75% 45%, rgba(255,255,255,0.8) 1px, transparent 1px),
                radial-gradient(circle at 10% 70%, rgba(255,255,255,0.6) 1px, transparent 1px),
                radial-gradient(circle at 95% 30%, rgba(255,255,255,0.7) 1.5px, transparent 1.5px)
              `,
              backgroundSize:
                "150px 150px, 200px 200px, 130px 130px, 180px 180px, 160px 160px, 190px 190px, 170px 170px, 210px 210px, 140px 140px, 220px 220px, 160px 160px, 180px 180px, 200px 200px, 150px 150px, 190px 190px",
              backgroundPosition:
                "0 0, 40px 60px, 130px 20px, 70px 100px, 160px 80px, 20px 140px, 100px 30px, 180px 120px, 50px 90px, 140px 50px, 80px 70px, 120px 10px, 30px 110px, 170px 40px, 60px 130px",
            }}
          />

          {/* 빛 번짐 */}
          <div
            className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-purple-400/20 blur-[100px] animate-pulse"
            style={{ animationDuration: "4s" }}
          />
          <div
            className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full bg-pink-400/15 blur-[120px] animate-pulse"
            style={{ animationDuration: "5s" }}
          />

          {/* 하단 무대 그라데이션 */}
          <div className="absolute inset-x-0 bottom-0 h-[36%] bg-gradient-to-t from-purple-950/75 to-transparent" />

          <div className={`relative mx-auto w-full max-w-[1200px] px-4 sm:px-6 ${cfg.padY}`}>
            {/* ✅ indicatorSafeSpace 만큼 아래 공간 확보 */}
            <div
              className="relative"
              style={{
                ...heroHeightStyle,
                paddingBottom: `${cfg.indicatorSafeSpace}px`,
              }}
            >
              {/* ✅ 카드들은 항상 중앙 기준으로 배치 (천장 붙음 방지 핵심) */}
              {posters.map((p, idx) => {
                const d = getOffset(idx);
                const isVisible = Math.abs(d) <= 3;

                const translateX =
                  d === 0
                    ? 0
                    : d === -1
                    ? -cfg.step1
                    : d === 1
                    ? cfg.step1
                    : d === -2
                    ? -cfg.step2
                    : d === 2
                    ? cfg.step2
                    : d === -3
                    ? -cfg.step3
                    : cfg.step3;

                const scale =
                  d === 0 ? 1.12 : Math.abs(d) === 1 ? 0.92 : Math.abs(d) === 2 ? 0.78 : 0.68;
                const opacity =
                  d === 0 ? 1 : Math.abs(d) === 1 ? 0.6 : Math.abs(d) === 2 ? 0.32 : 0.18;
                const z = d === 0 ? 40 : Math.abs(d) === 1 ? 30 : Math.abs(d) === 2 ? 20 : 10;

                return (
                  <div
                    key={p.id}
                    className={`absolute transition-all duration-700 ease-in-out ${isVisible ? "block" : "hidden"}`}
                    style={{
                      top: "50%",
                      left: "50%",
                      transform: `translate(-50%, -50%) translateX(${translateX}px) translateY(${baseCardY}px) scale(${scale})`,
                      opacity,
                      zIndex: z,
                    }}
                  >
                    <div
                      className="relative aspect-[3/4] rounded-[24px] overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1"
                      style={{
                        width: `${cfg.cardW}px`,
                        boxShadow:
                          d === 0
                            ? "0 22px 60px rgba(0,0,0,0.55), 0 0 0 2px rgba(255,255,255,0.20)"
                            : "0 14px 38px rgba(0,0,0,0.42)",
                      }}
                    >
                      <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/18 to-transparent" />

                      <div className="absolute left-5 right-5 bottom-5">
                        <p className="text-white text-[15px] sm:text-[16px] font-bold drop-shadow-lg">
                          {p.title}
                        </p>
                        <p className="text-purple-200 text-[12px] sm:text-[13px] mt-1.5 font-medium">
                          {p.date}
                        </p>
                        <p className="text-white/90 text-[12px] sm:text-[13px] mt-1">{p.place}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ✅ 인디케이터: 겹치지 않게 safeSpace 내부에서 살짝 위 */}
              <div
                className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 z-50 bg-white/10 backdrop-blur-xl px-4 py-2.5 rounded-full border border-white/20 shadow-lg"
                style={{ bottom: `${cfg.indicatorBottom}px` }}
              >
                {posters.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`slide-${i}`}
                    onClick={() => go(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === active
                        ? "w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                        : "w-2 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 퀵슬롯 */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 md:translate-y-2/3 w-full px-4 sm:px-6 z-50">
          <div
            className="mx-auto w-full max-w-[1400px] md:max-w-[1100px] bg-paper rounded-card ring-2 ring-primary/20"
            style={{ boxShadow: "0 10px 40px rgba(195, 61, 255, 0.15)" }}
          >
            <div className="flex flex-col md:flex-row md:items-center px-5 sm:px-8 md:px-12 py-4 sm:py-6 md:py-7 gap-5 md:gap-0">
              <div className="flex items-center gap-4 min-w-0 md:min-w-[200px] md:ml-8">
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shrink-0 overflow-visible"
                  style={{
                    background:
                      "white"
                  }}
                >
                  <img src={ghost1} alt="ghost" className="w-full h-full object-contain" />
                </div>

                <div className="leading-tight">
                  <p className="text-[15px] sm:text-[16px] font-semibold text-text-black">팝업스토어 안내</p>
                  <p className="text-[13px] sm:text-[14px] text-text-sub">팝스팟 도우미</p>
                </div>
              </div>

              <div className="hidden md:block h-12 w-[1px] bg-gradient-to-b from-transparent via-secondary to-transparent mx-5" />

              <div className="flex-1">
                <div className="grid grid-cols-2 gap-6 sm:gap-8 md:flex md:justify-center md:gap-30">
                  <MenuItem label="팝업리스트" />
                  <MenuItem label="AI 챗봇" />
                  <MenuItem label="팝업등록" />
                  <MenuItem label="마이페이지" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          SEARCH BAR
         ========================= */}
      <section className="pt-24 md:pt-30 pb-10">
        <div className="flex justify-center mt-6 md:mt-8">
          <div className="w-full max-w-[980px] px-4 sm:px-6 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="팝업스토어를 검색해보세요."
              className="flex-1 h-[48px] bg-paper rounded-full px-6 text-[14px] text-text-black placeholder:text-text-sub outline-none ring-2 ring-secondary-light focus:ring-2 focus:ring-primary transition-all"
              style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}
            />

            <button
              type="button"
              aria-label="search"
              className="
                w-full sm:w-[48px] h-[48px]
                rounded-full
                flex items-center justify-center
                transition-all duration-200
                hover:scale-105
                active:scale-95
              "
              style={{
                background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
                boxShadow: "0 4px 14px rgba(195, 61, 255, 0.25)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                <path
                  d="M16.6725 16.6412L21 21M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* RECENT VIEWED */}
        <div className="mt-8 md:mt-10 flex justify-center">
          <div className="w-full max-w-[1400px] px-4 sm:px-6">
            <div className="bg-paper rounded-card px-6 sm:px-8 py-7 sm:py-8" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}>
              <div className="flex justify-between items-center mb-5 sm:mb-6">
                <h2 className="text-[16px] font-bold text-primary-dark">최근 본 팝업</h2>
                <span className="text-[13px] text-primary hover:text-primary-dark transition-colors cursor-pointer font-medium">
                  전체보기 &gt;
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                {[
                  { img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=600&fit=crop" },
                  { img: "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=400&h=600&fit=crop" },
                  { img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=600&fit=crop" },
                  { img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=600&fit=crop" },
                ].map((item, i) => (
                  <div key={i} className="group cursor-pointer transition-transform hover:scale-105">
                    <div
                      className="w-full aspect-[3/4] rounded-[18px] overflow-hidden transition-all group-hover:ring-2 group-hover:ring-primary"
                      style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}
                    >
                      <img src={item.img} alt={`poster-${i}`} className="w-full h-full object-cover" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* POPULAR */}
        <div className="mt-8 md:mt-10 flex justify-center">
          <div className="w-full max-w-[1400px] px-4 sm:px-6">
            <div className="bg-paper rounded-card px-6 sm:px-8 py-7 sm:py-8" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}>
              <div className="flex justify-between items-center mb-5 sm:mb-6">
                <h2 className="text-[16px] font-bold text-primary-dark">인기 팝업</h2>
                <span className="text-[13px] text-primary hover:text-primary-dark transition-colors cursor-pointer font-medium">
                  전체보기 &gt;
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                {[
                  { img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=600&fit=crop" },
                  { img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=600&fit=crop" },
                  { img: "https://images.unsplash.com/photo-1557821552-17105176677c?w=400&h=600&fit=crop" },
                  { img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop" },
                ].map((item, i) => (
                  <div key={i} className="group cursor-pointer transition-transform hover:scale-105">
                    <div
                      className="w-full aspect-[3/4] rounded-[18px] overflow-hidden transition-all group-hover:ring-2 group-hover:ring-primary"
                      style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}
                    >
                      <img src={item.img} alt={`poster-${i}`} className="w-full h-full object-cover" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="h-10 md:h-0" />
      </section>
    </main>
  );
}

function MenuItem({ label }) {
  return (
    <div className="flex flex-col items-center gap-2 group cursor-pointer">
      <div className="w-12 h-12 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg">
        {label === "마이페이지" ? (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
            <path
              d="M17 21C17 18.2386 14.7614 16 12 16C9.23858 16 7 18.2386 7 21M17 21H17.8031C18.921 21 19.48 21 19.9074 20.7822C20.2837 20.5905 20.5905 20.2837 20.7822 19.9074C21 19.48 21 18.921 21 17.8031V6.19691C21 5.07899 21 4.5192 20.7822 4.0918C20.5905 3.71547 20.2837 3.40973 19.9074 3.21799C19.4796 3 18.9203 3 17.8002 3H6.2002C5.08009 3 4.51962 3 4.0918 3.21799C3.71547 3.40973 3.40973 3.71547 3.21799 4.0918C3 4.51962 3 5.08009 3 6.2002V17.8002C3 18.9203 3 19.4796 3.21799 19.9074C3.40973 20.2837 3.71547 20.5905 4.0918 20.7822C4.5192 21 5.07899 21 6.19691 21H7M17 21H7M12 13C10.3431 13 9 11.6569 9 10C9 8.34315 10.3431 7 12 7C13.6569 7 15 8.34315 15 10C15 11.6569 13.6569 13 12 13Z"
              stroke="#FF2A7E"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : label === "AI 챗봇" ? (
          <svg viewBox="0 0 24 24" data-name="025_SCIENCE" id="_025_SCIENCE" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
            <defs>
              <style>{`.cls-1{fill:#B7F731;}`}</style>
            </defs>
            <path
              className="cls-1"
              d="M16,13H8a3,3,0,0,1-3-3V6A3,3,0,0,1,8,3h8a3,3,0,0,1,3,3v4A3,3,0,0,1,16,13ZM8,5A1,1,0,0,0,7,6v4a1,1,0,0,0,1,1h8a1,1,0,0,0,1-1V6a1,1,0,0,0-1-1Z"
            />
            <path
              className="cls-1"
              d="M10,9a1.05,1.05,0,0,1-.71-.29A1,1,0,0,1,10.19,7a.6.6,0,0,1,.19.06.56.56,0,0,1,.17.09l.16.12A1,1,0,0,1,10,9Z"
            />
            <path
              className="cls-1"
              d="M14,9a1,1,0,0,1-.71-1.71,1,1,0,0,1,1.42,1.42,1,1,0,0,1-.16.12.56.56,0,0,1-.17.09.6.6,0,0,1-.19.06Z"
            />
            <path className="cls-1" d="M12,4a1,1,0,0,1-1-1V2a1,1,0,0,1,2,0V3A1,1,0,0,1,12,4Z" />
            <path className="cls-1" d="M9,22a1,1,0,0,1-1-1V18a1,1,0,0,1,2,0v3A1,1,0,0,1,9,22Z" />
            <path className="cls-1" d="M15,22a1,1,0,0,1-1-1V18a1,1,0,0,1,2,0v3A1,1,0,0,1,15,22Z" />
            <path className="cls-1" d="M15,19H9a1,1,0,0,1-1-1V12a1,1,0,0,1,1-1h6a1,1,0,0,1,1,1v6A1,1,0,0,1,15,19Zm-5-2h4V13H10Z" />
            <path className="cls-1" d="M5,17a1,1,0,0,1-.89-.55,1,1,0,0,1,.44-1.34l4-2a1,1,0,1,1,.9,1.78l-4,2A.93.93,0,0,1,5,17Z" />
            <path className="cls-1" d="M19,17a.93.93,0,0,1-.45-.11l-4-2a1,1,0,1,1,.9-1.78l4,2a1,1,0,0,1,.44,1.34A1,1,0,0,1,19,17Z" />
          </svg>
        ) : label === "팝업등록" ? (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.87617 3.75H19.1238L21 8.86683V10.5C21 11.2516 20.7177 11.9465 20.25 12.4667V21H3.75V12.4667C3.28234 11.9465 3 11.2516 3 10.5V8.86683L4.87617 3.75ZM18.1875 13.3929C18.3807 13.3929 18.5688 13.3731 18.75 13.3355V19.5H15V15H9L9 19.5H5.25V13.3355C5.43122 13.3731 5.61926 13.3929 5.8125 13.3929C6.63629 13.3929 7.36559 13.0334 7.875 12.4667C8.38441 13.0334 9.11371 13.3929 9.9375 13.3929C10.7613 13.3929 11.4906 13.0334 12 12.4667C12.5094 13.0334 13.2387 13.3929 14.0625 13.3929C14.8863 13.3929 15.6156 13.0334 16.125 12.4667C16.6344 13.0334 17.3637 13.3929 18.1875 13.3929ZM10.5 19.5H13.5V16.5H10.5L10.5 19.5ZM19.5 9.75V10.5C19.5 11.2965 18.8856 11.8929 18.1875 11.8929C17.4894 11.8929 16.875 11.2965 16.875 10.5V9.75H19.5ZM19.1762 8.25L18.0762 5.25H5.92383L4.82383 8.25H19.1762ZM4.5 9.75V10.5C4.5 11.2965 5.11439 11.8929 5.8125 11.8929C6.51061 11.8929 7.125 11.2965 7.125 10.5V9.75H4.5ZM8.625 9.75V10.5C8.625 11.2965 9.23939 11.8929 9.9375 11.8929C10.6356 11.8929 11.25 11.2965 11.25 10.5V9.75H8.625ZM12.75 9.75V10.5C12.75 11.2965 13.3644 11.8929 14.0625 11.8929C14.7606 11.8929 15.375 11.2965 15.375 10.5V9.75H12.75Z"
              fill="#45DFD3"
            />
          </svg>
        ) : label === "팝업리스트" ? (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
            <path
              d="M9 11.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm2-1a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1zm1 2a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2h-3zm0 3a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2h-3zm-2-2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
              fill="#FFD93D"
            />
            <path
              d="M9 2a1 1 0 0 0-1 1H6a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2a1 1 0 0 0-1-1H9zm7 3h2v15H6V5h2v1a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V5zm-6 0V4h4v1h-4z"
              fill="#FFD93D"
            />
          </svg>
        ) : (
          <span className="text-[11px] text-text-sub">SVG</span>
        )}
      </div>

      <span className="text-[13px] text-text-black group-hover:text-primary transition-colors font-medium">{label}</span>
    </div>
  );
}

export default MainPage;
