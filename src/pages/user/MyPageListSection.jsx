// src/pages/user/MyPageListSection.jsx
import ReservationListSection from "./MyPageReservationListSection.jsx";
import WishlistListSection from "./MyPageWishlistListSection.jsx";

function ListSection({ authUser, activeTab, setActiveTab }) {
  return (
    <div className="w-full max-w-5xl mt-12">
      {/* 예약 / 찜 리스트 */}
      <section>
        {/* 탭 영역 */}
        <div className="flex justify-center gap-12 text-[15px] mb-4 border-b border-secondary">
          
          {/* ================================
              변경됨: 예약 탭 아이콘 → 새 SVG 
              ================================ */}
          <TabButton
            active={activeTab === "reservation"}
            icon={
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-4 h-4 text-primary"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3 1H1V3H3V1Z"></path>
                <path d="M3 5H1V7H3V5Z"></path>
                <path d="M1 9H3V11H1V9Z"></path>
                <path d="M3 13H1V15H3V13Z"></path>
                <path d="M15 1H5V3H15V1Z"></path>
                <path d="M15 5H5V7H15V5Z"></path>
                <path d="M5 9H15V11H5V9Z"></path>
                <path d="M15 13H5V15H15V13Z"></path>
              </svg>
            }
            label="예약한 리스트"
            activeUnderlineClass="border-primary"
            onClick={() => setActiveTab("reservation")}
          />

          {/* ================================
              변경됨: 찜 리스트 하트 → 보라색 하트
              ================================ */}
          <TabButton
            active={activeTab === "wishlist"}
            icon={
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 fill-primary stroke-primary"
                strokeWidth="2"
              >
                <path d="M12 21.1c-.4 0-.75-.12-1.03-.34C7.3 17.7 4 14.8 4 11.15 4 8.6 5.9 6.8 8.4 6.8c1.4 0 2.7.7 3.6 1.9.9-1.2 2.2-1.9 3.6-1.9 2.5 0 4.4 1.8 4.4 4.35 0 3.65-3.3 6.55-6.97 9.61-.28.22-.63.34-1.03.34z" />
              </svg>
            }
            label="찜한 리스트"
            activeUnderlineClass="border-primary"
            onClick={() => setActiveTab("wishlist")}
          />
        </div>

        {activeTab === "reservation" && (
          <ReservationListSection authUser={authUser} />
        )}

        {activeTab === "wishlist" && (
          <WishlistListSection authUser={authUser} />
        )}
      </section>
    </div>
  );
}

/* =========================
   공용 컴포넌트들 (리스트 전용)
   ========================= */

function TabButton({ active, icon, label, onClick, activeUnderlineClass }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 pb-3 -mb-px border-b-2 ${
        active
          ? `${activeUnderlineClass} text-text-black`
          : "border-transparent text-text-sub"
      }`}
    >
      {/* 변경됨: icon이 이제 문자열이 아니라 SVG이므로 바로 렌더링 */}
      <span
        className={`text-[15px] flex items-center ${
          active ? "text-text-black" : "text-text-sub"
        }`}
      >
        {icon}
      </span>

      <span>{label}</span>
    </button>
  );
}

export default ListSection;
