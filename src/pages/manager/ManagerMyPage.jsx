import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";
import {
    fetchManagerProfileApi,
    fetchManagerPopupListApi,
    updateManagerEmailApi,
    updateManagerPhoneApi,
    changeManagerPasswordApi,
} from "../../api/managerApi";
import {
    uploadProfileImageApi,
    updateProfileApi,
} from "../../api/myPageApi";
import { fetchMeApi } from "../../api/authApi";

import ManagerProfileCard from "../../components/manager/ManagerProfileCard";
import ManagerPopupStatusTabs from "../../components/manager/ManagerPopupStatusTabs";
import ManagerPopupGrid from "../../components/manager/ManagerPopupGrid";

const PAGE_SIZE = 8;

export default function ManagerMyPage() {
    const navigate = useNavigate();
    const authUser = useAuthStore((s) => s.user);
    const setUser = useAuthStore((s) => s.setUser);
    const initialized = useAuthStore((s) => s.initialized);
    const fetchMe = useAuthStore((s) => s.fetchMe);

    const [profile, setProfile] = useState(null);

    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(0);

    const [popupPageData, setPopupPageData] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [popupLoading, setPopupLoading] = useState(false);
    const [popupError, setPopupError] = useState(null);

    // 프로필 이미지 관련
    const [profileImage, setProfileImage] = useState(
        () => authUser?.profileImage ?? null
    );
    const [profileUploading, setProfileUploading] = useState(false);
    const fileInputRef = useRef(null);


    // --------------------------
    // 0) 로그인 / 권한 가드
    // --------------------------
    useEffect(() => {
        // 1) 아직 로그인 상태 체크(fetchMe) 안 했으면 먼저 호출
        if (!initialized) {
            fetchMe();
            return;
        }

        // 2) 체크 끝났는데 user가 없으면  로그인 페이지로
        if (initialized && !authUser) {
            alert("로그인이 필요합니다.");
            navigate("/login", { replace: true });
            return;
        }

        // 3) 로그인은 했는데 매니저가 아니면  메인으로
        if (initialized && authUser && authUser.role !== "MANAGER") {
            alert("매니저 전용 페이지입니다.");
            navigate("/", { replace: true });
        }
    }, [initialized, authUser, fetchMe, navigate]);


    // --------------------------
    // 1) 프로필 로딩
    // --------------------------
    useEffect(() => {
        if (!authUser) return;

        const loadProfile = async () => {
            setProfileLoading(true);
            try {
                const data = await fetchManagerProfileApi();
                setProfile(data);
            } catch (err) {
                console.error(err);
                const status = err?.response?.status;
                if (status === 403) {
                    alert("매니저 권한이 없습니다.");
                    navigate("/", { replace: true });
                }
            } finally {
                setProfileLoading(false);
            }
        };

        loadProfile();
    }, [authUser, navigate]);

    // 프로필 정보가 바뀌면 이미지도 동기화 (profile > authUser 순서로)
    useEffect(() => {
        if (profile?.profileImage) {
            setProfileImage(profile.profileImage);
        } else if (authUser?.profileImage) {
            setProfileImage(authUser.profileImage);
        }
    }, [profile, authUser]);

    // --------------------------
    // 2) 프로필 수정 핸들러
    // --------------------------
    const handleEditEmail = async () => {
        if (!profile) return;
        const next = window.prompt("새 이메일을 입력하세요.", profile.email ?? "");
        if (!next || next === profile.email) return;

        try {
            await updateManagerEmailApi({ email: next });
            setProfile((prev) => (prev ? { ...prev, email: next } : prev));
            setUser({ email: next }); // 전역 authUser 동기화
            alert("이메일이 변경되었습니다.");
        } catch (err) {
            console.error(err);
            const msg =
                err?.response?.data?.message ?? "이메일 변경 중 오류가 발생했습니다.";
            alert(msg);
        }
    };

    const handleEditPhone = async () => {
        if (!profile) return;
        const next = window.prompt(
            "새 휴대폰 번호를 입력하세요.",
            profile.phone ?? ""
        );
        if (!next || next === profile.phone) return;

        try {
            await updateManagerPhoneApi({ phone: next });
            setProfile((prev) => (prev ? { ...prev, phone: next } : prev));
            setUser({ phone: next });
            alert("휴대폰 번호가 변경되었습니다.");
        } catch (err) {
            console.error(err);
            const msg =
                err?.response?.data?.message ??
                "휴대폰 번호 변경 중 오류가 발생했습니다.";
            alert(msg);
        }
    };

    const handleChangePassword = async () => {
        const currentPassword = window.prompt("현재 비밀번호를 입력하세요.");
        if (!currentPassword) return;
        const newPassword = window.prompt("새 비밀번호를 입력하세요.");
        if (!newPassword) return;

        try {
            await changeManagerPasswordApi({ currentPassword, newPassword });
            alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
        } catch (err) {
            console.error(err);
            const msg =
                err?.response?.data?.message ??
                "비밀번호 변경 중 오류가 발생했습니다.";
            alert(msg);
        }
    };

    // --------------------------
    // 2-1) 프로필 이미지 수정 핸들러
    // --------------------------
    const handleClickProfileEdit = () => {
        if (profileUploading) return;
        fileInputRef.current?.click();
    };

    const handleProfileFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setProfileUploading(true);

            // 1) 이미지 업로드 
            const uploaded = await uploadProfileImageApi(file);
            // uploaded 안에 url/key 등이 있다고 가정하고 그대로 updateProfileApi에 전달
            await updateProfileApi(uploaded);

            // 2) 내 정보 다시 조회해서 전역/로컬 동기화
            const me = await fetchMeApi();
            setUser(me);
            setProfileImage(me.profileImage ?? null);
        } catch (err) {
            console.error(err);
            const msg =
                err?.response?.data?.message ??
                "프로필 이미지 변경 중 오류가 발생했습니다.";
            alert(msg);
        } finally {
            setProfileUploading(false);
            e.target.value = "";
        }
    };

    const handleResetProfileImage = async () => {
        if (!window.confirm("기본 프로필 이미지로 변경하시겠습니까?")) return;

        try {
            setProfileUploading(true);

            await updateProfileApi({ url: null, key: null });

            const me = await fetchMeApi();
            setUser(me);
            setProfileImage(me.profileImage ?? null);
        } catch (err) {
            console.error(err);
            const msg =
                err?.response?.data?.message ??
                "프로필 이미지를 기본으로 되돌리는 중 오류가 발생했습니다.";
            alert(msg);
        } finally {
            setProfileUploading(false);
        }
    };

    // --------------------------
    // 3) 팝업 목록 로딩
    // --------------------------
    const loadPopupList = async (pageParam = page, statusParam = statusFilter) => {
        setPopupLoading(true);
        setPopupError(null);
        try {
            const data = await fetchManagerPopupListApi({
                page: pageParam,
                size: PAGE_SIZE,
                status: statusParam,
                sortDir: "DESC",
            });
            setPopupPageData(data);
        } catch (err) {
            console.error(err);
            const status = err?.response?.status;
            if (status === 403) {
                alert("매니저 권한이 없습니다.");
                navigate("/", { replace: true });
                return;
            }
            setPopupError(
                err?.response?.data?.message ??
                "팝업 목록을 불러오는 중 오류가 발생했습니다."
            );
        } finally {
            setPopupLoading(false);
        }
    };

    useEffect(() => {
        if (!authUser) return;
        loadPopupList(page, statusFilter);
    }, [authUser, page, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChangeStatus = (nextStatus) => {
        setStatusFilter(nextStatus);
        setPage(0);
    };

    const handleChangePage = (nextPage) => {
        setPage(nextPage);
    };

    const handleClickPopup = (popId) => {
        navigate(`/manager/popup/${popId}`);
    };

    // --------------------------
    // 4) 렌더
    // --------------------------
    return (
        <main className="min-h-[calc(100vh-88px)] bg-secondary-light pb-20">
            {/* 페이지 타이틀 */}
            <header className="max-w-[900px] mx-auto px-4 pt-10">
                <h1 className="text-[24px] font-bold text-text-black mb-2">
                    나의 팝업 목록
                </h1>
                <p className="text-[13px] text-text-sub">
                    매니저 계정으로 등록한 팝업 스토어를 한눈에 확인하고 관리할 수 있어요.
                </p>
            </header>

            {/* 프로필 카드 */}
            {profileLoading ? (
                <section className="w-full max-w-3xl mx-auto mt-10 px-4">
                    <div className="h-[260px] rounded-[36px] bg-secondary-light animate-pulse" />
                </section>
            ) : (
                <>
                    {/* 숨겨진 파일 인풋 – 프로필 사진 수정용 */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfileFileChange}
                    />

                    <section className="mt-10 px-4">
                        <ManagerProfileCard
                            brandName={profile?.brandName}
                            email={profile?.email}
                            phone={profile?.phone}
                            profileImageUrl={profileImage}
                            profileUploading={profileUploading}
                            onClickProfileEdit={handleClickProfileEdit}
                            onResetProfileImage={handleResetProfileImage}
                            onEditEmail={handleEditEmail}
                            onEditPhone={handleEditPhone}
                            onChangePassword={handleChangePassword}
                        />
                    </section>
                </>
            )}

            {/* 상태 탭 */}
            <ManagerPopupStatusTabs value={statusFilter} onChange={handleChangeStatus} />

            {/* 팝업 그리드 */}
            <ManagerPopupGrid
                pageData={popupPageData}
                loading={popupLoading}
                error={popupError}
                onRetry={() => loadPopupList(0, statusFilter)}
                onChangePage={handleChangePage}
                onClickItem={handleClickPopup}
            />
        </main>
    );
}
