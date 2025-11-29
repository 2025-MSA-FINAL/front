// src/pages/manager/ManagerInquiryPage.jsx
import { Link } from "react-router-dom";

import logo from "../../assets/logo.png";       // ✅ 추가됨
import ghost1 from "../../assets/ghost1.png";   // ✅ 추가됨

function ManagerInquiryPage() {
  return (
    <main className="min-h-[calc(100vh-88px)] flex items-center justify-center px-4 py-12 bg-secondary-light">
      <div className="flex max-w-[960px] w-full bg-paper rounded-card shadow-card overflow-hidden flex-col md:flex-row">
        {/* LEFT: 보라 영역 + 브랜드 설명 */}
        <section className="flex-[0.9] bg-primary-light flex flex-col items-center justify-center px-8 md:px-10 py-10 gap-4">

          {/* 👻 유령 이모티콘 → 이미지 (동그라미 배경 제거) */}
          <div className="w-[120px] h-[120px] flex items-center justify-center mb-4">
            <img src={ghost1} alt="ghost" className="w-[80px] h-[80px]" />
          </div>

          {/* ㅍㅅㅍ 텍스트 → logo.png 이미지 */}
          <img
            src={logo}
            alt="logo"
            className="w-[120px] object-contain"
          />

          <h3 className="mt-2 text-[18px] md:text-[20px] font-bold text-text-black text-center">
            매니저 계정이 필요하신가요?
          </h3>

          <p className="mt-2 text-[14px] text-text-black text-center leading-relaxed max-w-[280px]">
            팝업 스토어를 등록·관리하려는 브랜드·운영사·기획사들을 위해
            매니저 전용 계정을 제공하고 있습니다.
          </p>

          <p className="mt-2 text-[13px] text-text-sub text-left leading-relaxed max-w-[300px]">
            이런 경우, 매니저 계정 신청을 권장합니다.
            <br />
            · 정기적으로 팝업을 운영하는 브랜드
            <br />
            · 여러 매장·공간을 한 계정에서 관리하고 싶은 경우
            <br />
            · 예약/시간대 관리가 필요한 행사·전시 기획사
          </p>
        </section>

        {/* RIGHT: 문의 안내 & 예시 양식 */}
        <section className="flex-[1.2] bg-paper px-8 md:px-12 py-10">
          {/* 상단 헤더 */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-[20px] font-bold text-text-black">
              매니저 계정 문의 안내
            </h2>
            <Link
              to="/login"
              className="text-[13px] text-text-sub hover:text-primary-dark hover:underline whitespace-nowrap"
            >
              ← 로그인으로 돌아가기
            </Link>
          </div>

          <p className="text-[13px] text-text-sub leading-relaxed mb-6">
            아래 양식에 따라 이메일로 문의를 보내주세요.
            <br />
            검토 후 매니저 계정 생성 및 임시 비밀번호를 회신드립니다.
          </p>

          {/* 메일 제목 예시 */}
          <div className="mb-5">
            <div className="mb-1 text-[13px] font-semibold text-text-black">
              메일 제목 예시
            </div>
            <input
              className="w-full px-3 py-2.5 rounded-input border border-secondary text-[14px] text-text-black bg-secondary-light/40 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              defaultValue="[ㅍㅅㅍ 매니저 계정 문의] 업체명 / 담당자명"
              readOnly
            />
          </div>

          {/* 메일 본문 양식 */}
          <div className="mb-6">
            <div className="mb-1 text-[13px] font-semibold text-text-black">
              메일 본문 양식
            </div>
            <textarea
              className="w-full min-h-[220px] px-3 py-2.5 rounded-input border border-secondary text-[13px] text-text-black bg-secondary-light/40 outline-none resize-none focus:border-primary focus:ring-1 focus:ring-primary/20 leading-relaxed"
              defaultValue={`업체 / 브랜드명 :
담당자 이름 :
이메일 :
연락처 :
원하는 로그인 아이디 : (영문소문자+숫자 4~16자)

문의 유형 : 신규 / 계정 추가 / 재부여 / 기타 (직접 입력)

계정 사용 목적 : 팝업 예약 / 채팅 / 광고 / 기타

추가 요청사항 :`}
              readOnly
            />
          </div>

          {/* 안내 문구 */}
          <p className="text-[12px] text-text-sub leading-relaxed">
            * 보내주신 정보는 계정 생성 및 고객 응대 목적 외에는 사용되지
            않습니다.
            <br />
            * 운영 정책에 따라 매니저 계정 발급이 제한될 수 있습니다.
          </p>
        </section>
      </div>
    </main>
  );
}

export default ManagerInquiryPage;
