// src/pages/user/UserIntroductionSection.jsx
import { useEffect, useState } from "react";
import { updateIntroductionApi } from "../../api/myPageApi";

function UserIntroductionSection({ authUser, setUser, showToast }) {
  // ✅ 자기소개 상태 (백엔드 필드: introduction)
  const [intro, setIntro] = useState(authUser?.introduction ?? "");
  const [introSaving, setIntroSaving] = useState(false);

  // authUser 변경 시 자기소개 동기화
  useEffect(() => {
    setIntro(authUser?.introduction ?? "");
  }, [authUser]);

  // 자기소개 저장
  const handleSaveIntro = async () => {
    if (!authUser) return;

    try {
      if (!intro || intro.trim().length === 0) {
        const ok = window.confirm("자기소개를 비워둘까요?");
        if (!ok) return;
      }

      setIntroSaving(true);

      // 전용 API로 자기소개만 PATCH
      await updateIntroductionApi({ introduction: intro });

      // 전역 유저 상태 업데이트
      setUser({ introduction: intro });

      showToast?.("자기소개가 저장되었습니다.", "success");
    } catch (err) {
      showToast?.(
        err?.response?.data?.message ??
          "자기소개 저장 중 오류가 발생했습니다.",
        "error"
      );
    } finally {
      setIntroSaving(false);
    }
  };

  return (
    <div className="mt-6 w-full max-w-[560px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[14px] font-medium text-text-black">
          자기소개
        </span>
        <span className="text-[12px] text-text-sub"></span>
      </div>

      <div className="bg-paper rounded-[18px] border border-secondary-light px-4 py-3 shadow-card">
        <textarea
          className="w-full min-h-[80px] max-h-[160px] resize-none rounded-[10px] border border-secondary bg-paper px-3 py-2 text-[14px] focus:outline-none focus:border-primary"
          placeholder="예) 팝업투어를 좋아하는 20대 직장인입니다 🙂"
          maxLength={500}
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
        />
        <div className="mt-2 flex items-center justify-between text-[12px] text-text-sub">
          <span>{intro.length} / 500</span>
          <button
            type="button"
            onClick={handleSaveIntro}
            disabled={introSaving}
            className="min-w-[80px] h-[32px] rounded-[10px] bg-primary text-white text-[12px] hover:bg-primary-dark disabled:opacity-60"
          >
            {introSaving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserIntroductionSection;
