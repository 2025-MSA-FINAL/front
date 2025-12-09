import { useEffect, useRef, useState } from "react";

export default function KakaoMap({
  //주소 기반 모드 (상세 페이지용)
  address,
  placeName,

  //좌표 기반 모드 (내 주변용)
  center, // { lat, lng } - 검색 기준 중심
  myLocation, // { lat, lng } - 내 현재 위치
  markers = [], // [{ id, lat, lng, title, thumbnail }]
  selectedPopupId,
  onMarkerClick,

  //뷰포트 기반 검색용
  onViewportChange, // { center, radiusKm } 콜백
  searchCircleCenter, // { lat, lng }
  searchCircleRadiusKm, // number, km
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  //좌표 모드용
  const popupMarkersRef = useRef([]); // [{ marker, infoWindow, id }]
  const myMarkerRef = useRef(null);
  const circleRef = useRef(null);

  //주소 모드용
  const addressMarkerRef = useRef(null);
  const addressInfoRef = useRef(null);

  //스크립트 로드 상태
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!window.kakao?.maps;
  });

  // 1) 카카오 스크립트 로드
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.kakao?.maps) return; // 이미 로드된 경우

    const apiKey = import.meta.env.VITE_KAKAO_MAP_KEY;
    if (!apiKey) {
      console.error("VITE_KAKAO_MAP_KEY가 설정되어 있지 않습니다.");
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => setIsKakaoLoaded(true));
    };
    script.onerror = () => {
      console.error("Kakao Maps 스크립트 로드 실패");
    };

    document.head.appendChild(script);
  }, []);

  // 2) 지도 초기화 (최초 1회)
  useEffect(() => {
    if (!isKakaoLoaded) return;
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const kakao = window.kakao;
    const defaultCenter = new kakao.maps.LatLng(37.5665, 126.9780);

    const initialCenter =
      center && center.lat && center.lng
        ? new kakao.maps.LatLng(center.lat, center.lng)
        : defaultCenter;

    const map = new kakao.maps.Map(containerRef.current, {
      center: initialCenter,
      level: 4,
    });
    mapRef.current = map;

    //뷰포트 변경 이벤트 (idle) - 최초 1회만 등록
    if (onViewportChange) {
      kakao.maps.event.addListener(map, "idle", () => {
        const c = map.getCenter();
        const b = map.getBounds();
        const ne = b.getNorthEast();

        const poly = new kakao.maps.Polyline({
          path: [c, ne],
        });
        //화면 전체 거리의 0.8배 정도만 반경으로 사용
        let distKm = (poly.getLength() / 1000) * 0.8;

        //너무 작거나 크지 않게 제한
        if (distKm < 0.5) distKm = 0.5;
        if (distKm > 50) distKm = 50;

        onViewportChange({
          center: { lat: c.getLat(), lng: c.getLng() },
          radiusKm: distKm,
        });
      });
    }
  }, [isKakaoLoaded]);

  // 3) 주소 기반 모드: 주소 → 좌표 변환 + 마커/인포윈도우
  useEffect(() => {
    if (!address) return;
    if (!isKakaoLoaded) return;
    if (!mapRef.current) return;
    if (!window.kakao?.maps?.services) return;

    const kakao = window.kakao;
    const map = mapRef.current;

    // 이전 주소 마커/인포윈도우 정리
    if (addressMarkerRef.current) {
      addressMarkerRef.current.setMap(null);
      addressMarkerRef.current = null;
    }
    if (addressInfoRef.current) {
      addressInfoRef.current.close();
      addressInfoRef.current = null;
    }

    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result, status) => {
      if (status !== kakao.maps.services.Status.OK || !result[0]) return;

      const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

      const marker = new kakao.maps.Marker({
        map,
        position: coords,
      });
      addressMarkerRef.current = marker;

      if (placeName) {
        const content = `
          <div style="padding:6px 10px;font-size:13px;">
            <strong>${placeName}</strong><br/>
            <span style="color:#666;">${address}</span>
          </div>
        `;
        const iw = new kakao.maps.InfoWindow({ content });
        iw.open(map, marker);
        addressInfoRef.current = iw;
      }

      map.setCenter(coords);
    });
  }, [address, placeName, isKakaoLoaded]);

  // 4) 좌표 기반 모드: center가 바뀔 때 지도 중심 이동
  useEffect(() => {
    if (!center) return;
    if (!mapRef.current) return;
    if (!window.kakao?.maps) return;
    if (address) return; // 주소 모드일 때는 무시

    const map = mapRef.current;
    const kakao = window.kakao;
    const newCenter = new kakao.maps.LatLng(center.lat, center.lng);
    map.panTo(newCenter);
  }, [center, address]);

  // 5) 좌표 기반 모드: 팝업 마커 + 인포윈도우
  useEffect(() => {
    if (!mapRef.current) return;
    if (!window.kakao?.maps) return;
    if (address) return; // 주소 모드일 땐 마커 안 찍음

    const kakao = window.kakao;
    const map = mapRef.current;

    //이전 마커/인포윈도우 정리
    popupMarkersRef.current.forEach((item) => {
      if (item.infoWindow) item.infoWindow.close();
      if (item.marker) item.marker.setMap(null);
    });
    popupMarkersRef.current = [];

    if (!markers || markers.length === 0) return;

    const POPUP_MARKER_SVG = `
      <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 1C9.48 1 5 5.48 5 11c0 7.5 10 18 10 18s10-10.5 10-18C25 5.48 20.52 1 15 1z" fill="#FF4E42" />
        <circle cx="15" cy="11" r="4.5" fill="white"/>
      </svg>
    `;
    const markerImage = new kakao.maps.MarkerImage(
      "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(POPUP_MARKER_SVG),
      new kakao.maps.Size(30, 30),
      { offset: new kakao.maps.Point(15, 30) }
    );

    markers.forEach((m) => {
      if (!m.lat || !m.lng) return;

      const position = new kakao.maps.LatLng(m.lat, m.lng);
      const marker = new kakao.maps.Marker({
        position,
        image: markerImage,
        zIndex: 2,
      });
      marker.setMap(map);

      const iwContent = `
        <div
          style="
            padding:6px 10px;
            font-size:12px;
            line-height:1.4;
            max-width:180px;

            white-space:normal;
            word-break:keep-all;

            display:-webkit-box;
            -webkit-line-clamp:2;
            -webkit-box-orient:vertical;
            overflow:hidden;
            text-overflow:ellipsis;

            text-align:center;
          "
        >
          ${m.title ?? ""}
        </div>
      `;
      const infoWindow = new kakao.maps.InfoWindow({
        content: iwContent,
      });

      kakao.maps.event.addListener(marker, "mouseover", () => {
        infoWindow.open(map, marker);
      });
      kakao.maps.event.addListener(marker, "mouseout", () => {
        infoWindow.close();
      });
      kakao.maps.event.addListener(marker, "click", () => {
        if (onMarkerClick) onMarkerClick(m.id);
      });

      popupMarkersRef.current.push({ marker, infoWindow, id: m.id });
    });

    // ❌ setBounds 제거: 내 주변 검색에서는 사용자가 맞춰둔 뷰 유지
  }, [markers, onMarkerClick, address]);

  // 6) 내 위치 마커
  useEffect(() => {
    if (!isKakaoLoaded) return;
    if (!mapRef.current) return;
    if (!window.kakao?.maps) return;

    const map = mapRef.current;
    const kakao = window.kakao;

    //기존 내 위치 마커 제거
    if (myMarkerRef.current) {
      myMarkerRef.current.setMap(null);
      myMarkerRef.current = null;
    }

    if (!myLocation) return;

    const MY_MARKER_SVG = `
      <svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
        <circle cx="13" cy="13" r="9" fill="#2F80ED" stroke="white" stroke-width="4" />
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

  // 7) 검색 반경 원(circle)
  useEffect(() => {
    if (!mapRef.current) return;
    if (!window.kakao?.maps) return;

    const kakao = window.kakao;
    const map = mapRef.current;

    if (circleRef.current) {
      circleRef.current.setMap(null);
      circleRef.current = null;
    }

    if (!searchCircleCenter || !searchCircleRadiusKm) return;

    const circle = new kakao.maps.Circle({
      center: new kakao.maps.LatLng(
        searchCircleCenter.lat,
        searchCircleCenter.lng
      ),
      radius: searchCircleRadiusKm * 1000,
      strokeWeight: 2,
      strokeColor: "#2F80ED",
      strokeOpacity: 0.8,
      strokeStyle: "solid",
      fillColor: "#2F80ED",
      fillOpacity: 0.14,
    });
    circle.setMap(map);
    circleRef.current = circle;
  }, [searchCircleCenter, searchCircleRadiusKm]);

  // 8) 선택된 팝업 포커스 (선택 시 지도 중심 + InfoWindow)
  useEffect(() => {
    if (selectedPopupId == null) return;
    if (!mapRef.current) return;

    const map = mapRef.current;
    const target = popupMarkersRef.current.find(
      (item) => item.id === selectedPopupId
    );
    if (!target || !target.marker) return;

    const pos = target.marker.getPosition();
    map.setCenter(pos);

    if (target.infoWindow) {
      target.infoWindow.open(map, target.marker);
    }
  }, [selectedPopupId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-card border border-secondary-light shadow-card"
    />
  );
}
