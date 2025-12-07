import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

import ManagerProfileSection from "../../components/manager/ManagerProfileSection";
import ManagerMyPopupListSection from "../../components/manager/ManagerMyPopupListSection";

export default function ManagerMyPage() {
    const navigate = useNavigate();
    const authUser = useAuthStore((s) => s.user);
    const initialized = useAuthStore((s) => s.initialized);
    const fetchMe = useAuthStore((s) => s.fetchMe);

    //로그인 & 권한 체크 가드
    useEffect(() => {
        if (!initialized) {
            fetchMe();
            return;
        }
        if (initialized && !authUser) {
            alert("로그인이 필요합니다.");
            navigate("/login", { replace: true });
            return;
        }
        if (initialized && authUser && authUser.role !== "MANAGER") {
            alert("매니저 전용 페이지입니다.");
            navigate("/", { replace: true });
        }
    }, [initialized, authUser, fetchMe, navigate]);

    //렌더링
    return (
        <main className="min-h-[calc(100vh-88px)] bg-secondary-light px-4 py-10 flex flex-col items-center gap-16">
            {/* 상단 프로필 영역 */}
            <ManagerProfileSection />

            {/* 하단 팝업 리스트 영역 */}
            <ManagerMyPopupListSection />
        </main>
    );
}