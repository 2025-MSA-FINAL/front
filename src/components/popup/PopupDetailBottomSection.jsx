import ThreeDImageCarousel from "./ThreeDImageCarousel";
import KakaoMap from "./KakaoMap";

const TABS = [
  { id: "DESCRIPTION", label: "상세 설명" },
  { id: "MAP", label: "지도" },
  { id: "CHAT", label: "채팅 목록" },
];

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative flex-1 pb-4 px-1
        text-[16px] font-bold text-center
        transition-colors duration-300
        outline-none select-none
        ${active ? "text-primary" : "text-text-sub hover:text-text-black"}
      `}
    >
      {/* 텍스트 스케일 애니메이션 */}
      <span
        className={`
          inline-block
          transition-transform duration-300
          ease-[cubic-bezier(0.34,1.56,0.64,1)] 
          ${/* 1.56 값을 줘서 살짝 팅겨나가는(쫀득한) 느낌을 줌 */ ""}
          ${active ? "scale-105" : "scale-100"}
        `}
      >
        {children}
      </span>
    </button>
  );
}

export default function PopupDetailBottomSection({
  activeTab,
  onChangeTab,
  descriptionParagraphs,
  images,
  location,
  popName,
}) {
  const activeIndexRaw = TABS.findIndex((tab) => tab.id === activeTab);
  const activeIndex = activeIndexRaw === -1 ? 0 : activeIndexRaw;

  return (
    <div className="mt-24">
      {/* 스타일 주입: 페이드인 애니메이션 정의 */}
      <style>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* --- 탭 헤더 --- */}
      <div className="mb-10 border-b border-secondary-light">
        <div className="relative flex w-full">
          {TABS.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => onChangeTab(tab.id)}
            >
              {tab.label}
            </TabButton>
          ))}

          {/* 슬라이딩 밑줄 */}
          <span
            className="
              absolute bottom-0 left-0
              h-[3px] bg-primary rounded-full
              transition-transform duration-500
              ease-[cubic-bezier(0.34,1.25,0.64,1)]
            "
            style={{
              width: `${100 / TABS.length}%`,
              transform: `translateX(${activeIndex * 100}%)`,
            }}
          />
        </div>
      </div>

      {/* --- 탭 콘텐츠 영역 --- */}
      <div key={activeTab} className="animate-fade-in-up min-h-[400px]">
        
        {/* 상세 설명 탭 */}
        {activeTab === "DESCRIPTION" && (
          <section>
            <div className="max-w-[1000px] mx-auto">
              <div className="bg-white rounded-[24px] px-8 py-8 mb-16 border border-secondary-light">
                {descriptionParagraphs && descriptionParagraphs.length > 0 ? (
                  descriptionParagraphs.map((para, idx) => (
                    <p
                      key={idx}
                      className="text-[16px] leading-[1.8] text-text-sub mb-4 last:mb-0 whitespace-pre-wrap"
                    >
                      {para}
                    </p>
                  ))
                ) : (
                  <p className="text-[14px] text-text-sub text-center py-10">
                    상세 설명이 아직 등록되지 않았어요. 😢
                  </p>
                )}
              </div>

              {images && images.length > 0 && (
                <div className="flex flex-col gap-8 mb-16">
                  <h3 className="text-[20px] font-bold text-text-black ml-2 text-center md:text-left">
                    팝업스토어 상세 이미지
                  </h3>
                  <div className="py-4">
                    <ThreeDImageCarousel images={images} />
                  </div>
                  <p className="text-center text-text-sub text-[14px]">
                    * 이미지를 클릭하여 확대할 수 있습니다.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 지도 탭 */}
        {activeTab === "MAP" && (
          <section className="mb-16">
            <div className="max-w-[1000px] mx-auto h-[400px]">
              {location ? (
                <KakaoMap address={location} placeName={popName} />
              ) : (
                <div className="h-full bg-paper-light rounded-[20px] flex flex-col items-center justify-center text-text-sub border border-secondary-light">
                  <span className="text-4xl mb-2">📍</span>
                  <p>등록된 주소 정보가 없습니다.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 채팅 탭 */}
        {activeTab === "CHAT" && (
          <section className="mb-16">
            <div className="h-[300px] bg-white rounded-[20px] flex flex-col items-center justify-center text-text-sub border border-secondary-light">
              <span className="text-4xl mb-2">💬</span>
              <p>채팅 목록은 추후 연동 예정입니다.</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}