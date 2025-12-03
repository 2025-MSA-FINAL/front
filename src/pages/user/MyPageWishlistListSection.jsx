// src/pages/user/MyPageWishlistListSection.jsx
import { useEffect, useState } from "react";
import { apiClient } from "../../api/authApi";
import {
  toggleWishlistApi,
  deleteAllWishlistApi,
  deleteCloseWishlistApi,
} from "../../api/myPageApi";
import FilterDropdown from "../../components/FilterDropdown";
import Pagination from "../../components/Pagination";

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

function WishlistListSection({ authUser }) {
  // =========================
  // 찜 리스트 페이징 상태
  // =========================
  const [wishlistPage, setWishlistPage] = useState(0); // 0-based
  const [wishlistPageData, setWishlistPageData] = useState({
    content: [],
    pageNumber: 0,
    pageSize: PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
  });
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // 찜: 상태(전체/예정/진행중/종료) + 정렬(최신/오래된)
  const [wishlistStatusFilter, setWishlistStatusFilter] = useState("ALL");
  const [wishlistSortOrder, setWishlistSortOrder] = useState("DESC");

  // =========================
  // 찜 리스트 API 호출
  // =========================
  const loadWishlistPage = async (page) => {
    if (!authUser) return;
    setWishlistLoading(true);
    try {
      const res = await apiClient.get("/api/users/me/wishlist", {
        params: {
          page,
          size: PAGE_SIZE,
          status: wishlistStatusFilter, // ✅ Enum 이름과 매칭
          sortDir: wishlistSortOrder,
        },
      });
      setWishlistPageData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setWishlistLoading(false);
    }
  };

  // 페이지 / 필터 / 정렬 변경 시 데이터 로드
  useEffect(() => {
    if (!authUser) return;
    loadWishlistPage(wishlistPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, wishlistPage, wishlistStatusFilter, wishlistSortOrder]);

  // ✅ 찜한 목록 전체 삭제
  const handleDeleteAllWishlist = async () => {
    if (
      !window.confirm("찜한 팝업 전체를 삭제하시겠습니까? 되돌릴 수 없습니다.")
    ) {
      return;
    }
    try {
      await deleteAllWishlistApi();
      setWishlistPage(0);
      setWishlistPageData((prev) => ({
        ...prev,
        content: [],
        pageNumber: 0,
        totalElements: 0,
        totalPages: 0,
      }));
    } catch (e) {
      console.error(e);
      alert(
        e?.response?.data?.message ??
          "전체 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    }
  };

  // ✅ 종료된 팝업만 전체 삭제
  const handleDeleteCloseWishlist = async () => {
    if (!window.confirm("종료된 팝업만 모두 삭제하시겠습니까?")) {
      return;
    }
    try {
      await deleteCloseWishlistApi();
      // 프론트에서 현재 페이지에서 종료된 것만 제거
      setWishlistPageData((prev) => {
        const filtered = prev.content.filter(
          (it) => it.popupStatus !== "ENDED"
        );
        return {
          ...prev,
          content: filtered,
          // totalElements는 정확히 맞추긴 어렵지만 대략 줄여 줌
          totalElements:
            prev.totalElements - (prev.content.length - filtered.length),
        };
      });
    } catch (e) {
      console.error(e);
      alert(
        e?.response?.data?.message ??
          "종료된 팝업 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    }
  };

  // ✅ 찜 리스트에서 하트 눌렀을 때: 찜 토글 API 호출 후, 해제된 경우 목록에서 제거
  const handleToggleWishlistFromMyPage = async (popupId) => {
    try {
      const { isLiked } = await toggleWishlistApi(popupId);

      // false면 해제된 상태이므로 리스트에서 제거
      if (!isLiked) {
        setWishlistPageData((prev) => ({
          ...prev,
          content: prev.content.filter((it) => it.popupId !== popupId),
          totalElements:
            prev.totalElements > 0 ? prev.totalElements - 1 : prev.totalElements,
        }));
      }
    } catch (e) {
      console.error(e);
      alert(
        e?.response?.data?.message ??
          "찜 해제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    }
  };

  return (
    <>
      {/* 찜 리스트 상단: 상태 필터 + 정렬 + 기존 삭제 버튼 유지 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2 text-[13px] text-text-sub">
        <div className="flex gap-2">
          <FilterDropdown
            value={wishlistStatusFilter}
            onChange={(val) => {
              setWishlistStatusFilter(val);
              setWishlistPage(0);
            }}
            options={[
              { value: "ALL", label: "전체" },
              { value: "UPCOMING", label: "오픈 예정" },
              { value: "ONGOING", label: "진행중" },
              { value: "ENDED", label: "종료" },
            ]}
          />
          <FilterDropdown
            value={wishlistSortOrder}
            onChange={(val) => {
              setWishlistSortOrder(val);
              setWishlistPage(0);
            }}
            options={[
              { value: "DESC", label: "최신순" },
              { value: "ASC", label: "오래된순" },
            ]}
          />
        </div>

        <div className="flex justify-end text-[13px] text-text-sub gap-2 pr-1">
          <button
            type="button"
            className="hover:text-primary-dark whitespace-nowrap"
            onClick={handleDeleteCloseWishlist}
          >
            종료된 팝업 전체삭제
          </button>
          <span className="text-secondary-dark">|</span>
          <button
            type="button"
            className="hover:text-primary-dark whitespace-nowrap"
            onClick={handleDeleteAllWishlist}
          >
            목록 전체 삭제
          </button>
        </div>
      </div>

      {/* 리스트 – 카드 2열 */}
      <div className="mt-4">
        {wishlistLoading && (
          <div className="text-center text-[14px] text-text-sub py-6">
            로딩 중...
          </div>
        )}
        {!wishlistLoading && wishlistPageData.content.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wishlistPageData.content.map((item) => (
              <WishlistRow
                key={item.popupId}
                item={item}
                onToggleWishlist={handleToggleWishlistFromMyPage}
              />
            ))}
          </div>
        )}
        {!wishlistLoading && wishlistPageData.content.length === 0 && (
          <div className="bg-paper rounded-[18px] px-6 py-6 text-center text-[14px] text-text-sub border border-secondary-light">
            찜한 팝업이 없습니다.
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {wishlistPageData.totalPages > 1 && (
        <Pagination
          page={wishlistPageData.pageNumber}
          totalPages={wishlistPageData.totalPages}
          onChange={(nextPage) => setWishlistPage(nextPage)}
        />
      )}
    </>
  );
}

/* =========================================
   찜 리스트 카드 – 이미지 왼쪽, 설명 박스 오른쪽
   ========================================= */
function WishlistRow({ item, onToggleWishlist }) {
  const { date: startDate } = formatDateTime(item.startDate);
  const { date: endDate } = formatDateTime(item.endDate);

  const period =
    startDate !== "-" && endDate !== "-" ? `${startDate} ~ ${endDate}` : "-";

  const statusLabel =
    item.popupStatus === "ENDED"
      ? "종료"
      : item.popupStatus === "UPCOMING"
      ? "예정"
      : "진행중";

  const isEnded = item.popupStatus === "ENDED";

  return (
    <div className="flex gap-4 min-w-0">
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

          <div className="mt-2 text-[13px] text-text-sub whitespace-nowrap overflow-hidden text-ellipsis">
            <span className="font-medium text-text-black mr-1">장소</span>
            {item.popupLocation ?? "-"}
          </div>

          <div className="text-[13px] text-text-sub whitespace-nowrap overflow-hidden text-ellipsis">
            <span className="font-medium text-text-black mr-1">기간</span>
            {period}
          </div>

          <div className="text-[13px] text-text-sub whitespace-nowrap overflow-hidden text-ellipsis">
            <span className="font-medium text-text-black mr-1">가격</span>
            {item.popPrice != null ? `${formatPrice(item.popPrice)}원` : "-"}
          </div>
        </div>

        {/* 상태 + 하트 */}
        <div className="mt-2 flex items-center justify-between">
          <span
            className={`inline-flex items-center rounded-full px-3 py-0.5 text-[12px] border ${
              isEnded
                ? "border-secondary-dark text-secondary-dark"
                : "border-primary text-primary"
            }`}
          >
            {statusLabel}
          </span>

          <button
            type="button"
            className="text-[18px] text-red-500 hover:scale-110 transition-transform"
            onClick={() => onToggleWishlist(item.popupId)}
          >
            ❤
          </button>
        </div>
      </div>
    </div>
  );
}

export default WishlistListSection;
