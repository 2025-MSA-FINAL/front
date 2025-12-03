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
          <TabButton
            active={activeTab === "reservation"}
            icon="📋"
            label="예약한 리스트"
            activeUnderlineClass="border-primary"
            onClick={() => setActiveTab("reservation")}
          />
          <TabButton
            active={activeTab === "wishlist"}
            icon="❤"
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

// 탭 버튼 (찜한 리스트 하트는 항상 빨간색으로)
function TabButton({ active, icon, label, onClick, activeUnderlineClass }) {
  const isWishlist = label === "찜한 리스트";

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
      <span
        className={`text-[15px] ${
          active ? "text-text-black" : "text-text-sub"
        } ${isWishlist ? "text-red-500" : ""}`}
        style={isWishlist ? { color: "#ff4b4b" } : undefined}
      >
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

export default ListSection;
