import { useEffect, useRef, useState } from "react";

export default function KakaoMap({ address, placeName }) {
  const container = useRef(null);

  // 1. 카카오 객체 유무 확인 (초기값 함수로 설정해 불필요한 리렌더링 방지)
  const [isMapLoaded, setIsMapLoaded] = useState(() => !!window.kakao?.maps);

  // 2. 스크립트 동적 로드 (.env 키 사용)
  useEffect(() => {
    if (isMapLoaded) return;

    const script = document.createElement("script");
    const apiKey = import.meta.env.VITE_KAKAO_MAP_KEY; 
    
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        setIsMapLoaded(true);
      });
    };

    document.head.appendChild(script);
  }, [isMapLoaded]);

  // 3. 지도 그리기 (스크립트 로드 완료 후 실행)
  useEffect(() => {
    // 로드가 안 됐거나 카카오 객체가 없으면 중단
    if (!isMapLoaded || !window.kakao || !window.kakao.maps) return;

    const options = {
      center: new window.kakao.maps.LatLng(33.450701, 126.570667), // 임시 중심좌표
      level: 3, // 확대 레벨
    };
    const map = new window.kakao.maps.Map(container.current, options);

    // 주소-좌표 변환 객체 생성
    const geocoder = new window.kakao.maps.services.Geocoder();

    // 주소로 좌표 검색
    geocoder.addressSearch(address, function (result, status) {
      // 정상적으로 검색이 완료됐으면
      if (status === window.kakao.maps.services.Status.OK) {
        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

        // 결과값으로 받은 위치를 마커로 표시
        const marker = new window.kakao.maps.Marker({
          map: map,
          position: coords,
        });

        // 인포윈도우로 장소에 대한 설명 표시
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="width:150px;text-align:center;padding:6px 0;font-size:12px;">${placeName}</div>`,
        });
        infowindow.open(map, marker);

        // 지도의 중심을 결과값으로 받은 위치로 이동
        map.setCenter(coords);
      }
    });
  }, [isMapLoaded, address, placeName]);

  return (
    <div 
      ref={container} 
      className="w-full h-full rounded-[20px] border border-secondary-light shadow-sm"
    />
  );
}