import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

import KakaoMap from "../../components/popup/KakaoMap";
import MapPopupListItem from "../../components/popup/MapPopupListItem";

import { fetchNearbyPopupsApi, togglePopupWishlistApi } from "../../api/popupApi";

function PopupNearbyPage() {
  const [myLocation, setMyLocation] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  const [nearbyPopups, setNearbyPopups] = useState([]);
  const [isNearbyLoading, setIsNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState(null);

  const [selectedPopupId, setSelectedPopupId] = useState(null);
  const [wishlistLoadingId, setWishlistLoadingId] = useState(null);

  // 서버 검색 기준
  const [searchCenter, setSearchCenter] = useState(null);
  const [searchRadiusKm, setSearchRadiusKm] = useState(null);

  // 지도에서 움직인 "후보" 뷰포트 (다시 검색 버튼용)
  const [pendingViewport, setPendingViewport] = useState(null);
  const [hasInitializedViewport, setHasInitializedViewport] = useState(false);

  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

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
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  // 위치 얻으면 최초 검색 조건 세팅
  useEffect(() => {
    if (!myLocation) return;

    setSearchCenter((prev) =>
      prev ?? { lat: myLocation.lat, lng: myLocation.lng }
    );
    setSearchRadiusKm((prev) => prev ?? 0.7);
    setHasInitializedViewport(true);
  }, [myLocation]);

  // 근처 팝업 호출
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
        setNearbyError(
          e.response?.status === 401
            ? "로그인이 필요한 기능입니다."
            : "팝업을 불러오는 중 오류가 발생했어요."
        );
      } finally {
        setIsNearbyLoading(false);
      }
    };

    fetchNearby();
  }, [searchCenter, searchRadiusKm]);

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

  const handleToggleWishlist = async (popupId) => {
    if (!popupId || wishlistLoadingId) return;
    try {
      setWishlistLoadingId(popupId);
      const result = await togglePopupWishlistApi(popupId);
      setNearbyPopups((prev) =>
        prev.map((item) =>
          item.popId === popupId ? { ...item, isLiked: result.isLiked } : item
        )
      );
    } catch (e) {
      if (
        e.response?.status === 401 &&
        window.confirm("로그인이 필요합니다. 이동할까요?")
      ) {
        window.location.href = "/login";
      }
    } finally {
      setWishlistLoadingId(null);
    }
  };

  // 지도 뷰포트 변경(센터/줌) -> 후보로 저장
  const handleViewportChange = useCallback(
    (viewport) => {
      setPendingViewport(viewport);

      // (위치 못 얻었거나 초기값 없는 경우) 최초 1회는 뷰포트로 검색 조건 세팅
      if (!hasInitializedViewport) {
        setSearchCenter(viewport.center);
        setSearchRadiusKm(viewport.radiusKm);
        setHasInitializedViewport(true);
      }
    },
    [hasInitializedViewport]
  );

  // 내 위치 기준으로 보기: "현재 뷰포트(줌) 반경" 유지 + 중심만 내 위치로
  const handleRecenterToMyPos = () => {
    if (!myLocation) return;

    const currentRadius = pendingViewport?.radiusKm ?? searchRadiusKm ?? 0.7;

    setSearchCenter({ lat: myLocation.lat, lng: myLocation.lng });
    setSearchRadiusKm(currentRadius);
    setPendingViewport(null);
    setSelectedPopupId(null);
  };

  const centerMoved =
    !!pendingViewport &&
    (!searchCenter ||
      Math.abs(pendingViewport.center.lat - searchCenter.lat) > 0.0005 ||
      Math.abs(pendingViewport.center.lng - searchCenter.lng) > 0.0005);

  const radiusChanged =
    !!pendingViewport &&
    (!searchRadiusKm ||
      Math.abs((pendingViewport.radiusKm ?? 0) - (searchRadiusKm ?? 0)) > 0.05);

  const showRecenterButton =
    hasInitializedViewport && pendingViewport && (centerMoved || radiusChanged);

  return (
    <main className="h-[calc(100dvh-88px)] md:h-[calc(100vh-88px)] px-3 py-4 md:px-4 md:py-6 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col gap-4 h-full">
        <header className="flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div>
            <h1 className="text-[22px] font-bold text-text-black">내 주변 팝업</h1>
            <p className="text-[13px] text-text-sub mt-1">
              지금 보고 있는 지도 중심 기준 약 {(searchRadiusKm ?? 0.7).toFixed(1)}
              km 반경 안의 팝업을 보여드려요.
            </p>

            {locationError && (
              <p className="text-[12px] text-accent-pink mt-1">{locationError}</p>
            )}
          </div>

          <div className="text-[13px] text-text-sub" role="status" aria-live="polite">
            {isLocationLoading
              ? "위치 확인 중..."
              : isNearbyLoading
              ? "불러오는 중..."
              : nearbyError
              ? nearbyError
              : `이 지역 팝업 ${nearbyPopups.length}개`}
          </div>
        </header>

        <section className="flex flex-col md:flex-row gap-3 md:gap-4 flex-1 min-h-0">
          {/* 지도 영역 */}
          <div className="order-1 md:order-2 relative w-full flex-none h-[42vh] min-h-[240px] md:h-auto md:flex-1 min-h-0">
            <div className="w-full h-full rounded-card overflow-hidden border border-secondary-light bg-paper">
              <KakaoMap
                center={searchCenter || myLocation || undefined}
                myLocation={myLocation || undefined}
                markers={markers}
                selectedPopupId={selectedPopupId}
                onMarkerClick={(id) => setSelectedPopupId(id)}
                onOpenDetail={(id) => navigate(`/popup/${id}`)}
                onViewportChange={handleViewportChange}
                searchCircleCenter={searchCenter}
                searchCircleRadiusKm={searchRadiusKm}
              />
            </div>

            {showRecenterButton && (
              <button
                type="button"
                onClick={() => {
                  setSearchCenter(pendingViewport.center);
                  setSearchRadiusKm(pendingViewport.radiusKm);
                  setPendingViewport(null);
                }}
                className="absolute left-1/2 -translate-x-1/2 top-4 z-10 bg-paper text-text-black border border-secondary-light px-4 py-2 rounded-full text-[12px] shadow-card hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                이 지역에서 다시 검색
              </button>
            )}

            {myLocation && (
              <button
                type="button"
                onClick={handleRecenterToMyPos}
                className="absolute right-4 bottom-4 z-10 bg-paper text-text-black border border-secondary-light px-3 py-2 rounded-full text-[11px] shadow-card hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                내 위치 기준으로 보기
              </button>
            )}
          </div>

          {/* 목록 영역 */}
          <aside className="order-2 md:order-1 bg-paper rounded-card shadow-card border border-secondary-light overflow-hidden flex flex-col flex-1 min-h-0 w-full md:w-[360px] md:flex-none md:shrink-0">
            <div className="px-4 py-2 border-b border-secondary-light font-semibold text-[13px] text-text-black">
              목록
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {!isNearbyLoading && nearbyPopups.length === 0 && (
                <p className="text-[13px] text-text-sub">
                  이 지역에는 아직 등록된 팝업이 없어요.
                </p>
              )}

              {nearbyPopups.map((popup) => (
                <MapPopupListItem
                  key={popup.popId}
                  popup={popup}
                  isSelected={popup.popId === selectedPopupId}
                  onFocusOnMap={() => setSelectedPopupId(popup.popId)}
                  onOpenDetail={(id) => navigate(`/popup/${id}`)}
                  onToggleWishlist={handleToggleWishlist}
                  isWishlistLoading={wishlistLoadingId === popup.popId}
                  userRole={user?.role}
                />
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default PopupNearbyPage;
