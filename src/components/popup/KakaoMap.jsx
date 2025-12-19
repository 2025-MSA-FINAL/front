import { useEffect, useRef, useState, useCallback } from "react";

export default function KakaoMap({
  // 주소 기반 모드 (상세 페이지용)
  address,
  placeName,

  // 좌표 기반 모드 (내 주변용)
  center, // { lat, lng } - 검색 기준 중심
  myLocation, // { lat, lng } - 내 현재 위치
  markers = [], // [{ id, lat, lng, title, thumbnail }]
  selectedPopupId,
  onMarkerClick,

  onOpenDetail, // (id) => void

  // 뷰포트 기반 검색용
  onViewportChange, // { center, radiusKm } 콜백
  searchCircleCenter, // { lat, lng }
  searchCircleRadiusKm, // number
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  // 좌표 모드용
  // [{ idStr, idRaw, title, thumbnail, marker }]
  const popupMarkersRef = useRef([]);
  const myMarkerRef = useRef(null);
  const circleRef = useRef(null);

  // 주소 모드용
  const addressMarkerRef = useRef(null);
  const addressInfoRef = useRef(null);

  // 공용 인포윈도우(카드 표시용) 1개
  const popupInfoWindowRef = useRef(null);

  // 팝업 마커 이미지 캐시(기본/선택)
  const popupMarkerImagesRef = useRef({ normal: null, selected: null });

  // 최신 콜백 ref로 유지 (이벤트 리스너에서 stale 방지)
  const onViewportChangeRef = useRef(onViewportChange);
  const onMarkerClickRef = useRef(onMarkerClick);
  const onOpenDetailRef = useRef(onOpenDetail);

  useEffect(() => {
    onViewportChangeRef.current = onViewportChange;
  }, [onViewportChange]);

  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  useEffect(() => {
    onOpenDetailRef.current = onOpenDetail;
  }, [onOpenDetail]);

  // 스크립트 로드 상태
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!window.kakao?.maps;
  });

  // ===== 유틸: 팝업 마커 이미지 만들기 =====
  const getPopupMarkerImage = useCallback((isSelected) => {
    const kakao = window.kakao;
    if (!kakao?.maps) return null;

    const key = isSelected ? "selected" : "normal";
    if (popupMarkerImagesRef.current[key])
      return popupMarkerImagesRef.current[key];

    const fill = isSelected ? "#7C3AED" : "#FF4E42";
    const stroke = isSelected ? "#4C1D95" : "#B91C1C";

    const svg = `
      <svg width="38" height="44" viewBox="0 0 38 44" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 1C11.8 1 6 6.8 6 14c0 10.6 13 28.5 13 28.5S32 24.6 32 14C32 6.8 26.2 1 19 1z"
              fill="${fill}" stroke="${stroke}" stroke-width="1.5" />
        <circle cx="19" cy="14" r="6.2" fill="#ffffff" opacity="0.95"/>
        <circle cx="19" cy="14" r="3.2" fill="${stroke}" opacity="0.35"/>
      </svg>
    `;

    const img = new kakao.maps.MarkerImage(
      "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
      new kakao.maps.Size(38, 44),
      { offset: new kakao.maps.Point(19, 44) }
    );

    popupMarkerImagesRef.current[key] = img;
    return img;
  }, []);

  // ===== 유틸: 카드형 인포윈도우 열기(썸네일+제목+버튼) =====
  const openPopupCard = useCallback(({ title, thumbnail, idRaw }, marker) => {
    const map = mapRef.current;
    const iw = popupInfoWindowRef.current;
    if (!map || !iw || !marker) return;

    const card = document.createElement("div");
    card.style.cssText =
      "display:flex;gap:10px;align-items:center;" +
      "padding:10px 10px;" +
      "border-radius:14px;" +
      "background:#ffffff;" +
      "box-shadow:0 8px 22px rgba(0,0,0,0.12);" +
      "border:1px solid rgba(0,0,0,0.06);" +
      "min-width:280px;" +     
      "max-width:320px;" +        
      "cursor:pointer;" +
      "user-select:none;";

    // 좌측 썸네일
    const thumbWrap = document.createElement("div");
    thumbWrap.style.cssText =
      "width:56px;height:56px;border-radius:12px;overflow:hidden;" +
      "flex:0 0 56px;background:linear-gradient(135deg,#f3f4f6,#e5e7eb);";

    if (thumbnail) {
      const img = document.createElement("img");
      img.style.cssText =
        "width:100%;height:100%;object-fit:cover;display:block;";
      img.alt = title ?? "popup";
      img.src = thumbnail;
      img.referrerPolicy = "no-referrer";
      img.onerror = () => {
        img.remove();
        const ph = document.createElement("div");
        ph.style.cssText =
          "width:100%;height:100%;display:flex;align-items:center;justify-content:center;" +
          "font-weight:900;color:#6b7280;font-size:12px;";
        ph.textContent = "POP";
        thumbWrap.appendChild(ph);
      };
      thumbWrap.appendChild(img);
    } else {
      const ph = document.createElement("div");
      ph.style.cssText =
        "width:100%;height:100%;display:flex;align-items:center;justify-content:center;" +
        "font-weight:900;color:#6b7280;font-size:12px;";
      ph.textContent = "POP";
      thumbWrap.appendChild(ph);
    }

    // 우측 텍스트 + 버튼
    const right = document.createElement("div");
    right.style.cssText =
      "display:flex;flex-direction:column;gap:8px;min-width:0;flex:1;";

    const titleEl = document.createElement("div");
    titleEl.style.cssText =
      "font-size:13px;font-weight:900;line-height:1.25;" +
      "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:190px;";
    titleEl.textContent = title ?? "";

    const subRow = document.createElement("div");
    subRow.style.cssText =
      "display:flex;align-items:center;justify-content:space-between;gap:10px;" +
      "flex-wrap:nowrap;"; 

    const hintEl = document.createElement("div");
    hintEl.style.cssText =
      "font-size:11px;color:#6b7280;line-height:1.2;white-space:nowrap;";
    hintEl.textContent = "선택됨";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.style.cssText =
      "padding:6px 10px;" +
      "border-radius:999px;" +
      "border:1px solid rgba(0,0,0,0.08);" +
      "background:#111827;" +
      "color:#ffffff;" +
      "font-size:11px;" +
      "font-weight:800;" +
      "cursor:pointer;" +
      "white-space:nowrap;" +      
      "flex-shrink:0;" +         
      "line-height:1;" +           
      "display:inline-flex;" +   
      "align-items:center;" +       
      "justify-content:center;";   

    btn.textContent = "자세히 보기";

    // 버튼 클릭 → 상세로 이동
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (idRaw != null) onOpenDetailRef.current?.(idRaw);
    };

    // 카드 클릭 → 선택 상태 유지(하이라이트/목록 동기화)
    card.onclick = () => {
      if (idRaw != null) onMarkerClickRef.current?.(idRaw);
    };

    subRow.appendChild(hintEl);
    subRow.appendChild(btn);

    right.appendChild(titleEl);
    right.appendChild(subRow);

    card.appendChild(thumbWrap);
    card.appendChild(right);

    iw.setContent(card);
    iw.open(map, marker);
  }, []);

  // 1) 카카오 스크립트 로드
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.kakao?.maps) return;

    const apiKey = import.meta.env.VITE_KAKAO_MAP_KEY;
    if (!apiKey) {
      console.error("VITE_KAKAO_MAP_KEY가 설정되어 있지 않습니다.");
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${apiKey}&libraries=services,clusterer,drawing`;

    script.onload = () => {
      window.kakao.maps.load(() => setIsKakaoLoaded(true));
    };

    script.onerror = () => {
      console.error("카카오 지도 스크립트 로드 실패");
    };

    document.head.appendChild(script);
  }, []);

  const centerLat = center?.lat;
  const centerLng = center?.lng;

  // 2) 지도 초기화 (최초 1회)
  useEffect(() => {
    if (!isKakaoLoaded) return;
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const kakao = window.kakao;
    const defaultCenter = new kakao.maps.LatLng(37.5665, 126.978);

    const initialCenter =
      centerLat != null && centerLng != null
        ? new kakao.maps.LatLng(centerLat, centerLng)
        : defaultCenter;

    const map = new kakao.maps.Map(containerRef.current, {
      center: initialCenter,
      level: 4,
    });
    mapRef.current = map;

    // 공용 InfoWindow 1개 생성 + 지도 클릭 시 닫기
    popupInfoWindowRef.current = new kakao.maps.InfoWindow({ zIndex: 10 });
    kakao.maps.event.addListener(map, "click", () => {
      popupInfoWindowRef.current?.close();
    });

    // 뷰포트 변경 이벤트 (idle)
    kakao.maps.event.addListener(map, "idle", () => {
      const cb = onViewportChangeRef.current;
      if (!cb) return;

      const c = map.getCenter();
      const b = map.getBounds();
      const ne = b.getNorthEast();

      const poly = new kakao.maps.Polyline({ path: [c, ne] });

      let distKm = (poly.getLength() / 1000) * 0.75;
      if (distKm < 0.1) distKm = 0.1;
      if (distKm > 50) distKm = 50;

      cb({
        center: { lat: c.getLat(), lng: c.getLng() },
        radiusKm: distKm,
      });
    });
  }, [isKakaoLoaded, centerLat, centerLng]);

  // 2.5) 지도 컨테이너 사이즈/레이아웃 변경 시 relayout (하단 잘림 방지)
  useEffect(() => {
    if (!isKakaoLoaded) return;
    if (!mapRef.current) return;
    if (!containerRef.current) return;
    if (!window.kakao?.maps) return;

    const map = mapRef.current;

    const relayout = () => {
      try {
        const c = map.getCenter();
        map.relayout();
        if (c) map.setCenter(c);
      } catch {
        // ignore
      }
    };

    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(relayout);
    } else {
      setTimeout(relayout, 0);
    }

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => relayout());
      ro.observe(containerRef.current);
    }

    window.addEventListener("resize", relayout);
    return () => {
      window.removeEventListener("resize", relayout);
      if (ro) ro.disconnect();
    };
  }, [isKakaoLoaded]);

  // 3) 주소 기반 모드
  useEffect(() => {
    if (!isKakaoLoaded) return;
    if (!mapRef.current) return;
    if (!window.kakao?.maps) return;
    if (!address) return;

    const map = mapRef.current;
    const kakao = window.kakao;

    popupInfoWindowRef.current?.close();

    if (addressInfoRef.current) {
      addressInfoRef.current.close();
      addressInfoRef.current = null;
    }
    if (addressMarkerRef.current) {
      addressMarkerRef.current.setMap(null);
      addressMarkerRef.current = null;
    }

    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result, status) => {
      if (status !== kakao.maps.services.Status.OK || !result[0]) return;

      const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

      const marker = new kakao.maps.Marker({ map, position: coords });
      addressMarkerRef.current = marker;

      if (placeName) {
        const content = `
          <div style="padding:6px 8px; font-size:12px; line-height:1.2;">
            <b>${placeName}</b>
          </div>
        `;
        const infoWindow = new kakao.maps.InfoWindow({ content });
        infoWindow.open(map, marker);
        addressInfoRef.current = infoWindow;
      }

      map.setCenter(coords);
    });
  }, [address, placeName, isKakaoLoaded]);

  // 4) 좌표 기반 모드: center 변경 시 지도 중심 이동
  useEffect(() => {
    if (!center) return;
    if (!mapRef.current) return;
    if (!window.kakao?.maps) return;
    if (address) return;

    const map = mapRef.current;
    const kakao = window.kakao;
    const newCenter = new kakao.maps.LatLng(center.lat, center.lng);
    map.panTo(newCenter);
  }, [center, address]);

  // 5) 팝업 마커 표시(커스텀) + 클릭 시 카드 즉시 표시
  useEffect(() => {
    if (!isKakaoLoaded) return;
    if (!mapRef.current) return;
    if (!window.kakao?.maps) return;
    if (address) return;

    const kakao = window.kakao;
    const map = mapRef.current;

    popupInfoWindowRef.current?.close();

    // 기존 팝업 마커 제거
    popupMarkersRef.current.forEach((item) => item.marker?.setMap(null));
    popupMarkersRef.current = [];

    const normalImg = getPopupMarkerImage(false);

    markers.forEach((m) => {
      const idStr = String(m.id);

      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(m.lat, m.lng),
        image: normalImg || undefined,
        zIndex: 2,
      });
      marker.setMap(map);

      kakao.maps.event.addListener(marker, "click", () => {
        openPopupCard({ title: m.title, thumbnail: m.thumbnail, idRaw: m.id }, marker);
        onMarkerClickRef.current?.(m.id);
      });

      popupMarkersRef.current.push({
        idStr,
        idRaw: m.id,
        title: m.title,
        thumbnail: m.thumbnail,
        marker,
      });
    });
  }, [markers, address, isKakaoLoaded, getPopupMarkerImage, openPopupCard]);

  // 6) 내 위치 마커 표시
  useEffect(() => {
    if (!isKakaoLoaded) return;
    if (!mapRef.current) return;
    if (!window.kakao?.maps) return;

    const map = mapRef.current;
    const kakao = window.kakao;

    if (myMarkerRef.current) {
      myMarkerRef.current.setMap(null);
      myMarkerRef.current = null;
    }
    if (!myLocation) return;

    const MY_MARKER_SVG = `
      <svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
        <circle cx="13" cy="13" r="11" fill="#3b82f6" opacity="0.85"/>
        <circle cx="13" cy="13" r="5" fill="#ffffff"/>
      </svg>
    `;
    const myImage = new kakao.maps.MarkerImage(
      "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(MY_MARKER_SVG),
      new kakao.maps.Size(26, 26),
      { offset: new kakao.maps.Point(13, 13) }
    );

    const marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(myLocation.lat, myLocation.lng),
      image: myImage,
      zIndex: 3,
    });
    marker.setMap(map);
    myMarkerRef.current = marker;
  }, [myLocation, isKakaoLoaded]);

  // 7) 검색 원(반경) 표시
  useEffect(() => {
    if (!isKakaoLoaded) return;
    if (!mapRef.current) return;
    if (!window.kakao?.maps) return;
    if (!searchCircleCenter || !searchCircleRadiusKm) return;
    if (address) return;

    const map = mapRef.current;
    const kakao = window.kakao;

    if (circleRef.current) {
      circleRef.current.setMap(null);
      circleRef.current = null;
    }

    const circle = new kakao.maps.Circle({
      center: new kakao.maps.LatLng(searchCircleCenter.lat, searchCircleCenter.lng),
      radius: searchCircleRadiusKm * 1000,
      strokeWeight: 2,
      strokeColor: "#2563eb",
      strokeOpacity: 0.9,
      strokeStyle: "solid",
      fillColor: "#60a5fa",
      fillOpacity: 0.15,
      zIndex: 1,
    });

    circle.setMap(map);
    circleRef.current = circle;

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    };
  }, [searchCircleCenter, searchCircleRadiusKm, isKakaoLoaded, address]);

  // 8) 선택된 팝업 id 변경 시: pan + 카드 표시 + 선택 마커 강조
  useEffect(() => {
    if (!isKakaoLoaded) return;
    if (!mapRef.current) return;
    if (!window.kakao?.maps) return;
    if (address) return;

    const map = mapRef.current;
    const selectedIdStr = selectedPopupId == null ? null : String(selectedPopupId);

    const normalImg = getPopupMarkerImage(false);
    const selectedImg = getPopupMarkerImage(true);

    popupMarkersRef.current.forEach((x) => {
      const isSel = selectedIdStr != null && x.idStr === selectedIdStr;
      x.marker?.setImage((isSel ? selectedImg : normalImg) || undefined);
      x.marker?.setZIndex(isSel ? 6 : 2);
    });

    if (!selectedIdStr) return;

    const target = popupMarkersRef.current.find((x) => x.idStr === selectedIdStr);
    if (!target) return;

    map.panTo(target.marker.getPosition());
    openPopupCard(
      { title: target.title, thumbnail: target.thumbnail, idRaw: target.idRaw },
      target.marker
    );
  }, [selectedPopupId, markers, isKakaoLoaded, address, getPopupMarkerImage, openPopupCard]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-card border border-secondary-light shadow-card"
    />
  );
}
