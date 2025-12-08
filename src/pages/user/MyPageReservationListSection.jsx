// src/pages/user/MyPageReservationListSection.jsx
import { useEffect, useState } from "react";
import { apiClient } from "../../api/authApi";
import FilterDropdown from "../../components/FilterDropdown";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom"; // ✅ 추가

const PAGE_SIZE = 6;

function formatPrice(value) {
  if (typeof value !== "number") return value;
  return value.toLocaleString("ko-KR");
}

function formatDateTime(dateTimeString) {
  if (!dateTimeString) return { date: "-", time: "-" };
  const d = new Date(dateTimeString);
  if (Number.isNaN(d.getTime())) return { date: "-", time: "-" };

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return {
    date: `${year}.${month}.${day}`,
    time: `${hours}:${minutes}`,
  };
}

function ReservationListSection({ authUser }) {
  // =========================
  // 예약 리스트 페이징 상태
  // =========================
  const [reservationPage, setReservationPage] = useState(0); // 0-based
  const [reservationPageData, setReservationPageData] = useState({
    content: [],
    pageNumber: 0,
    pageSize: PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
  });
  const [reservationLoading, setReservationLoading] = useState(false);

  // 예약: 상태(전체/예약완료/취소됨) + 정렬(최신/오래된)
  const [reservationStatusFilter, setReservationStatusFilter] =
    useState("ALL");
  const [reservationSortOrder, setReservationSortOrder] = useState("DESC"); // DESC: 최신순, ASC: 오래된순

  // =========================
  // 예약 리스트 API 호출
  // =========================
  const loadReservationPage = async (page) => {
    if (!authUser) return;
    setReservationLoading(true);
    try {
      const res = await apiClient.get("/api/users/me/reservations", {
        params: {
          page,
          size: PAGE_SIZE,
          status: reservationStatusFilter, // ✅ Enum 이름과 매칭
          sortDir: reservationSortOrder,
        },
      });
      setReservationPageData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setReservationLoading(false);
    }
  };

  // 페이지 / 필터 / 정렬 변경 시 데이터 로드
  useEffect(() => {
    if (!authUser) return;
    loadReservationPage(reservationPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, reservationPage, reservationStatusFilter, reservationSortOrder]);

  return (
    <>
      {/* 예약 리스트 상단: 상태 필터 + 정렬 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2 text-[13px] text-text-sub">
        <div className="flex gap-2">
          <FilterDropdown
            value={reservationStatusFilter}
            onChange={(val) => {
              setReservationStatusFilter(val);
              setReservationPage(0);
            }}
            options={[
              { value: "ALL", label: "전체" },
              { value: "CONFIRMED", label: "예약 완료" },
              { value: "CANCELLED", label: "예약 취소" },
            ]}
          />
          <FilterDropdown
            value={reservationSortOrder}
            onChange={(val) => {
              setReservationSortOrder(val);
              setReservationPage(0);
            }}
            options={[
              { value: "DESC", label: "최신순" },
              { value: "ASC", label: "오래된순" },
            ]}
          />
        </div>
        <div className="text-[12px] text-secondary-dark">
          총 {reservationPageData.totalElements}개
        </div>
      </div>

      {/* 리스트 – 카드 2열 */}
      <div className="mt-4">
        {reservationLoading && (
          <div className="text-center text-[14px] text-text-sub py-6">
            로딩 중...
          </div>
        )}
        {!reservationLoading && reservationPageData.content.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reservationPageData.content.map((item) => (
              <ReservationRow key={item.reservationId} item={item} />
            ))}
          </div>
        )}
        {!reservationLoading && reservationPageData.content.length === 0 && (
          <div className="bg-paper rounded-[18px] px-6 py-6 text-center text-[14px] text-text-sub border border-secondary-light">
            예약한 팝업이 없습니다.
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {reservationPageData.totalPages > 1 && (
        <Pagination
          page={reservationPageData.pageNumber}
          totalPages={reservationPageData.totalPages}
          onChange={(nextPage) => setReservationPage(nextPage)}
        />
      )}
    </>
  );
}

/* =========================================
   예약 리스트 카드 – 이미지 왼쪽, 설명 박스 오른쪽
   ========================================= */
function ReservationRow({ item }) {
  const navigate = useNavigate(); // ✅ 추가
  const { date, time } = formatDateTime(item.reserveDateTime);

  const isCancelled = item.reserveStatus === false;
  const statusLabel = isCancelled ? "취소됨" : "예약 완료";

  const handleCardClick = () => {
    // ✅ 상세 페이지 이동
    navigate(`/popup/${item.popupId}`);
  };

  return (
    <div
      className="flex gap-4 min-w-0 h-[190px] cursor-pointer"
      onClick={handleCardClick}
    >
      {/* 이미지 영역 */}
      <div className="w-[140px] h-full flex-shrink-0">
        <div className="w-full h-full rounded-[18px] bg-secondary-light overflow-hidden">
          {item.popupThumbnail ? (
            <img
              src={item.popupThumbnail}
              alt={item.popupName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-secondary-dark text-[13px]">
              이미지
            </div>
          )}
        </div>
      </div>

      {/* 설명 박스 */}
      <div className="flex-1 min-w-0 bg-paper rounded-[18px] border border-secondary-light px-4 py-3 flex flex-col justify-between shadow-card">
        {/* 위쪽 정보 */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="font-semibold text-[16px] text-text-black truncate">
            {item.popupName}
          </div>

          <div className="mt-2 text-[13px] text-text-sub">
            <span className="font-medium text-text-black mr-1">예약일</span>
            {date}
            <span className="mx-2 text-secondary-dark">|</span>
            {time}
          </div>

          <div className="text-[13px] text-text-sub">
            <span className="font-medium text-text-black mr-1">장소</span>
            {item.popupLocation ?? "-"}
          </div>

          <div className="text-[13px] text-text-sub">
            <span className="font-medium text-text-black mr-1">인원</span>
            {item.reserveUserCount}명
            <span className="mx-2 text-secondary-dark">|</span>
            <span className="font-medium text-text-black mr-1">가격</span>
            {formatPrice(item.price)}원
          </div>
        </div>

        {/* 상태 버튼 영역 */}
        <div className="mt-2 flex items-center justify-between">
          <span
            className={`inline-flex items-center rounded-full px-3 py-0.5 text-[12px] border ${
              isCancelled
                ? "border-secondary-dark text-secondary-dark"
                : "border-primary text-primary"
            }`}
          >
            {statusLabel}
          </span>

          {!isCancelled && (
            <button
              type="button"
              className="text-[12px] text-text-sub hover:text-primary-dark"
              onClick={(e) => {
                e.stopPropagation(); // ✅ 카드 클릭 막기
                // 여기 나중에 실제 "취소하기" 로직 붙이면 됨
              }}
            >
              취소하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReservationListSection;
