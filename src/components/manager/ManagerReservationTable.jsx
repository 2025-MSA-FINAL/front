import React from "react";
import Pagination from "../Pagination";

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPhone(num) {
  if (!num) return "-";
  const only = String(num).replace(/[^0-9]/g, "");
  if (only.length === 11) {
    return only.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  if (only.length === 10) {
    return only.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  return num;
}

function getStatusLabel(status) {
  if (status === true) {
    return "예약 확정";
  } else if (status === false) {
    return "예약 취소";
  }
  return "-";
}

export default function ManagerReservationTable({
  reservations,
  page,
  totalPages,
  loading,
  error,
  onChangePage,
  onRetry,
}) {
  const hasData = reservations && reservations.length > 0;

  return (
    <section className="mt-16 mb-24">
      <header className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-[20px] font-bold text-text-black">
            예약자 목록
          </h2>
          <p className="mt-1 text-[13px] text-text-sub">
            해당 팝업을 예약한 고객 정보를 확인할 수 있어요.
          </p>
        </div>
      </header>

      <div className="bg-white rounded-[20px] border border-secondary-light px-6 py-5">
        {/* 로딩 */}
        {loading && !hasData && !error && (
          <div className="py-16 text-center text-text-sub">
            예약자 목록을 불러오는 중입니다...
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div className="py-10 flex flex-col items-center gap-3 text-center">
            <p className="text-[14px] text-text-sub">{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-4 py-2 text-[13px] rounded-full border border-secondary hover:bg-secondary-light"
              >
                다시 시도하기
              </button>
            )}
          </div>
        )}

        {/* 데이터 없음 */}
        {!loading && !error && !hasData && (
          <div className="py-16 text-center text-text-sub">
            아직 예약한 고객이 없습니다.
          </div>
        )}

        {/* 테이블 */}
        {!loading && !error && hasData && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[13px]">
              <thead>
                <tr className="border-b border-secondary-light text-text-sub">
                  <th className="py-3 pr-4 text-left font-normal">이름</th>
                  <th className="py-3 pr-4 text-left font-normal">전화번호</th>
                  <th className="py-3 pr-4 text-left font-normal">인원</th>
                  <th className="py-3 pr-4 text-left font-normal">예약일시</th>
                  <th className="py-3 pr-4 text-left font-normal">
                    예약 생성시간
                  </th>
                  <th className="py-3 pr-4 text-left font-normal">상태</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((item) => (
                  <tr
                    key={item.reservationId}
                    className="border-b border-secondary-light last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 pr-4 text-text-black font-medium">
                      {item.userName ?? "-"}
                    </td>
                    <td className="py-3 pr-4 text-text-black">
                      {formatPhone(item.userPhone)}
                    </td>
                    {/* 인원수 처리 */}
                    <td className="py-3 pr-4 text-text-black">
                      {item.userCount ? `${item.userCount}명` : "-"}
                    </td>
                    <td className="py-3 pr-4 text-text-black">
                      {formatDateTime(item.reservedDateTime)}
                    </td>
                    <td className="py-3 pr-4 text-text-sub">
                      {formatDateTime(item.createdAt)}
                    </td>
                    {/* 상태 라벨 적용 */}
                    <td className="py-3 pr-4 font-medium">
                      <span
                        className={`
                          ${item.status === false ? "text-text-sub" : "text-primary"}
                        `}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={onChangePage}
            />
          </div>
        )}
      </div>
    </section>
  );
}
