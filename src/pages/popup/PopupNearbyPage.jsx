import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

import KakaoMap from "../../components/popup/KakaoMap";
import MapPopupListItem from "../../components/popup/MapPopupListItem";

import {
  fetchNearbyPopupsApi,
  togglePopupWishlistApi,
} from "../../api/popupApi";

function PopupNearbyPage() {
  // ===========================
  // 1. 상태
  // ===========================
  const [myLocation, setMyLocation] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  const [nearbyPopups, setNearbyPopups] = useState([]);
  const [isNearbyLoading, setIsNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState(null);


  const [selectedPopupId, setSelectedPopupId] = useState(null);

  const [wishlistLoadingId, setWishlistLoadingId] = useState(null);

  // 뷰포트 기반 검색용
  const [searchCenter, setSearchCenter] = useState(null);      // 현재 검색 기준 중심
  const [searchRadiusKm, setSearchRadiusKm] = useState(null);  // 현재 검색 반경(km)
  const [pendingViewport, setPendingViewport] = useState(null); // 지도에서 바뀐 후보 뷰포트
  const [hasInitializedViewport, setHasInitializedViewport] = useState(false); // 최초 1회만 자동 반영

  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  // ===========================
  // 2. 현재 위치 가져오기
  // ===========================
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("이 브라우저에서는 위치 정보를 사용할 수 없어요.");
      setIsLocationLoading(false);
      return;
    }

    setIsLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMyLocation({ lat: latitude, lng: longitude });
        setIsLocationLoading(false);
      },
      (err) => {
        console.error(err);
        setLocationError(
          "위치 정보를 가져오지 못했어요. 브라우저 권한을 확인해주세요."
        );
        setIsLocationLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    if (!myLocation) return;

    setSearchCenter((prev) => prev ?? { lat: myLocation.lat, lng: myLocation.lng });
    setSearchRadiusKm((prev) => prev ?? 0.7);
    setHasInitializedViewport(true);
  }, [myLocation]);

  // ===========================
  // 3. /nearby 조회 (검색 기준 중심+반경 기준)
  // ===========================
  useEffect(() => {
    if (!searchCenter || !searchRadiusKm) return;

    const fetchNearby = async () => {
      setIsNearbyLoading(true);
      setNearbyError(null);

      try {
        const data = await fetchNearbyPopupsApi({
          latitude: searchCenter.lat,
          longitude: searchCenter.lng,
          radiusKm: searchRadiusKm,
        });
        setNearbyPopups(data || []);
      } catch (e) {
        console.error(e);
        if (e.response?.status === 401) {
          setNearbyError("권한이 없거나 로그인이 필요한 기능입니다.");
        } else {
          setNearbyError(
            "이 지역의 팝업을 불러오는 중 오류가 발생했어요."
          );
        }
      } finally {
        setIsNearbyLoading(false);
      }
    };

    fetchNearby();
  }, [searchCenter, searchRadiusKm]);

  // 지도에 넘길 마커 데이터
  const markers = useMemo(
    () =>
      nearbyPopups.map((p) => ({
        id: p.popId,
        lat: p.popLatitude,
        lng: p.popLongitude,
        title: p.popName,
        thumbnail: p.popThumbnail,
      })),
    [nearbyPopups]
  );

  const hasPopups = nearbyPopups && nearbyPopups.length > 0;

  // ===========================
  // 4. 찜 토글
  // ===========================
  const handleToggleWishlist = async (popupId) => {
    if (!popupId || wishlistLoadingId) return;

    try {
      setWishlistLoadingId(popupId);
      const result = await togglePopupWishlistApi(popupId);
      const { isLiked } = result;

      setNearbyPopups((prev) =>
        prev.map((item) =>
          item.popId === popupId ? { ...item, isLiked } : item
        )
      );
    } catch (e) {
      if (e.response?.status === 401) {
        if (
          window.confirm(
            "로그인이 필요한 기능입니다. 로그인 페이지로 이동할까요?"
          )
        ) {
          window.location.href = "/login";
        }
      } else {
        alert("찜 처리 중 오류가 발생했어요.");
      }
    } finally {
      setWishlistLoadingId(null);
    }
  };

  // ===========================
  // 5. 리스트/지도 이벤트
  // ===========================
  const handleMarkerClick = useCallback((popupId) => {
    setSelectedPopupId(popupId);
  }, []);

  const handleOpenDetail = useCallback(
    (popupId) => {
      navigate(`/popup/${popupId}`);
    },
    [navigate]
  );

  // 지도 뷰포트가 바뀔 때 콜백 (참조 고정)
  const handleViewportChange = useCallback((viewport) => {
    // 항상 "후보 뷰포트"는 저장 (이 지역에서 다시 검색 버튼용)
    setPendingViewport(viewport);

    setSearchCenter((prev) => {
      if (prev) return prev;
      setHasInitializedViewport(true);
      return viewport.center;
    });
    setSearchRadiusKm((prev) => (prev ?? viewport.radiusKm));
  }, []);

  // 현재 검색 범위와 뷰포트가 거의 같으면 버튼 숨기기 (optional)
  const showRecenterButton =
    hasInitializedViewport &&
    pendingViewport &&
    (!searchCenter ||
      !searchRadiusKm ||
      Math.abs(pendingViewport.center.lat - searchCenter.lat) > 0.0005 ||
      Math.abs(pendingViewport.center.lng - searchCenter.lng) > 0.0005 ||
      Math.abs(pendingViewport.radiusKm - searchRadiusKm) > 0.2);

  // ===========================
  // 6. 렌더링
  // ===========================
  const radiusLabel =
    searchRadiusKm != null
      ? `약 ${searchRadiusKm.toFixed(1)}km 반경`
      : "일정 반경";

  return (
    <main className="min-h-[calc(100vh-88px)] px-4 py-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        {/* 헤더 */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-bold text-text-black">
              내 주변 팝업
            </h1>
            <p className="text-[13px] text-text-sub mt-1">
              지금 보고 있는 지도 중심을 기준으로 {radiusLabel} 안의 팝업을
              보여드려요.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[13px] text-text-sub">
            {isNearbyLoading
              ? "이 지역의 팝업을 불러오는 중..."
              : hasPopups
              ? `이 지역의 팝업 ${nearbyPopups.length}개`
              : "이 지역에는 아직 등록된 팝업이 없어요."}
          </div>
        </header>

        {/* 위치 오류 표시 */}
        {locationError && (
          <div className="bg-[#fff4f4] border border-[#ffd6d6] text-[#c0392b] text-[13px] px-4 py-3 rounded-[12px] flex items-center justify-between">
            <span>{locationError}</span>
            <button
              type="button"
              onClick={requestLocation}
              className="text-[13px] font-semibold underline"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 본문: 사이드바 + 지도 */}
        <section className="flex gap-4 h-[600px]">
          {/* 사이드바 (항상 열림) */}
          <aside className="bg-paper rounded-card shadow-card border border-secondary-light overflow-hidden flex flex-col w-[360px] opacity-100">
            <div className="flex items-center justify-between px-4 py-2 border-b border-secondary-light">
              <span className="text-[13px] font-semibold text-text-black">
                이 지역의 팝업 목록
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {isNearbyLoading && (
                <p className="text-[13px] text-text-sub">
                  이 지역의 팝업을 불러오는 중입니다...
                </p>
              )}

              {!isNearbyLoading && !hasPopups && (
                <p className="text-[13px] text-text-sub">
                  이 지역에는 아직 등록된 팝업이 없어요.
                </p>
              )}

              {!isNearbyLoading &&
                hasPopups &&
                nearbyPopups.map((popup) => (
                  <MapPopupListItem
                    key={popup.popId}
                    popup={popup}
                    isSelected={popup.popId === selectedPopupId}
                    onFocusOnMap={() => handleMarkerClick(popup.popId)}
                    onOpenDetail={() => handleOpenDetail(popup.popId)}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlistLoading={wishlistLoadingId === popup.popId}
                    userRole={user?.role}
                  />
                ))}
            </div>
          </aside>

          {/* 지도 영역 */}
          <div className="relative flex-1">
            <div className="w-full h-full rounded-card overflow-hidden border border-secondary-light bg-secondary-light">
              <KakaoMap
                center={searchCenter || myLocation || undefined}
                myLocation={myLocation || undefined}
                markers={markers}
                selectedPopupId={selectedPopupId}
                onMarkerClick={handleMarkerClick}
                onViewportChange={handleViewportChange}
                searchCircleCenter={searchCenter}
                searchCircleRadiusKm={searchRadiusKm}
              />
            </div>

            {/* 이 지역에서 다시 검색 버튼 - 상단 중앙 */}
            {showRecenterButton && (
              <button
                type="button"
                onClick={() => {
                  if (!pendingViewport) return;
                  setSearchCenter(pendingViewport.center);
                  setSearchRadiusKm(pendingViewport.radiusKm);
                  setPendingViewport(null);
                }}
                className="absolute left-1/2 -translate-x-1/2 top-4 z-10 bg-paper border border-secondary-light rounded-full px-4 py-2 text-[12px] shadow-card hover:bg-secondary-light"
              >
                이 지역에서 다시 검색
              </button>
            )}

            {/* 내 위치로 돌아가기 */}
            {myLocation && (
              <button
                type="button"
                onClick={() => {
                  setSearchCenter({ lat: myLocation.lat, lng: myLocation.lng });
                  setSearchRadiusKm(3);
                  setPendingViewport(null);
                  setSelectedPopupId(null);
                }}
                className="absolute right-4 bottom-4 z-10 bg-paper border border-secondary-light rounded-full px-3 py-2 text-[11px] shadow-card hover:bg-secondary-light"
              >
                내 위치 기준으로 보기
              </button>
            )}

            {isLocationLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-paper/60 text-[13px] text-text-sub">
                현재 위치를 확인하는 중입니다...
              </div>
            )}

            {nearbyError && (
              <div className="absolute left-4 bottom-4 bg-[#fff4f4] border border-[#ffd6d6] text-[#c0392b] text-[12px] px-3 py-2 rounded-[12px] shadow-card">
                {nearbyError}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default PopupNearbyPage;
