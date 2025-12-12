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
          ${/* 1.56 : 살짝 쫀득 */ ""}
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
  isLoggedIn,
  chatRooms = [],
  chatLoading = false,
  onJoinChatRoom,
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
            <div className="bg-white rounded-[20px] border border-secondary-light p-4 md:p-6 min-h-[260px] flex flex-col gap-4">
              {/* 1) 비로그인: 로그인 유도 */}
              {!isLoggedIn && (
                <div className="flex flex-col items-center justify-center flex-1 text-text-sub gap-3 py-8">
                  <span className="text-4xl mb-1">🔒</span>
                  <p className="text-[14px] md:text-[15px] text-center">
                    로그인하면 이 팝업과 관련된 채팅방 목록을 볼 수 있어요.
                  </p>
                </div>
              )}

              {/* 2) 로그인 + 로딩 중 */}
              {isLoggedIn && chatLoading && (
                <div className="flex flex-col items-center justify-center flex-1 text-text-sub gap-3 py-8">
                  <span className="text-4xl mb-1 animate-pulse">💬</span>
                  <p className="text-[14px] md:text-[15px]">
                    채팅방 목록을 불러오는 중입니다...
                  </p>
                </div>
              )}

              {/* 3) 로그인 + 로딩 끝 + 방 없음 */}
              {isLoggedIn && !chatLoading && chatRooms.length === 0 && (
                <div className="flex flex-col items-center justify-center flex-1 text-text-sub gap-3 py-8">
                  <span className="text-4xl mb-1">😌</span>
                  <p className="text-[14px] md:text-[15px] text-center">
                    아직 이 팝업과 관련된 채팅방이 없어요.
                    <br />
                    조금만 기다리면 누군가가 먼저 방을 만들지도 몰라요!
                  </p>
                </div>
              )}

              {/* 4) 로그인 + 로딩 끝 + 방 있음 */}
              {isLoggedIn && !chatLoading && chatRooms.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-[14px] text-text-sub mb-1">
                    이 팝업과 관련된 채팅방이에요. 관심 가는 방에 참여해 보세요!
                  </p>

                  <ul className="flex flex-col gap-3">
                    {chatRooms.map((room) => {
                      const isJoined = !!room.joined;

                      return (
                        <li
                          key={room.gcrId}
                          className="border border-secondary-light rounded-[16px] px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                        >
                          <div className="flex-1">
                            <h3 className="text-[15px] md:text-[16px] font-semibold text-text-black">
                              {room.title}
                            </h3>
                            {room.description && (
                              <p className="text-[13px] text-text-sub mt-1 line-clamp-2">
                                {room.description}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-2 mt-2 text-[12px] text-text-sub">
                              <span>
                                인원 {room.currentUserCnt ?? 0} /{" "}
                                {room.maxUserCnt ?? 0}
                              </span>

                              {room.limitGender &&
                                room.limitGender !== "NONE" && (
                                  <span className="px-2 py-[2px] rounded-full bg-secondary-light/20 text-secondary">
                                    성별 제한:{" "}
                                    {room.limitGender === "MALE"
                                      ? "남성"
                                      : room.limitGender === "FEMALE"
                                      ? "여성"
                                      : room.limitGender}
                                  </span>
                                )}

                              {(room.minAge || room.maxAge) && (
                                <span className="px-2 py-[2px] rounded-full bg-secondary-light/20 text-secondary">
                                  나이 {room.minAge ?? "?"} ~{" "}
                                  {room.maxAge ?? "?"}세
                                </span>
                              )}

                              {/* 참여중 뱃지 */}
                              {isJoined && (
                                <span className="px-2 py-[2px] rounded-full bg-primary/10 text-primary font-medium">
                                  참여중
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              className="px-3 py-2 rounded-full text-[13px] font-medium bg-primary text-white md:min-w-[96px]"
                              onClick={() =>
                                isJoined
                                  ? onJoinChatRoom?.(room.gcrId, {
                                      alreadyJoined: true,
                                    })
                                  : onJoinChatRoom?.(room.gcrId)
                              }
                            >
                              {isJoined ? "채팅 입장" : "참여하기"}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
