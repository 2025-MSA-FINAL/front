import React, { useState } from "react";
import useManagerPopupDetailPage from "../../hooks/useManagerPopupDetailPage";
import PopupDetailTemplate from "../../components/popup/PopupDetailTemplate";
import ManagerPopupDetailActions from "../../components/manager/ManagerPopupDetailActions";
import ManagerReservationTable from "../../components/manager/ManagerReservationTable";
import ManagerDetailTabs from "../../components/manager/ManagerDetailTabs.jsx"; // [New]
import ManagerReportSection from "../../components/manager/report/ManagerReportSection"; // [New]

export default function ManagerPopupDetailPage() {
  const vm = useManagerPopupDetailPage();

  //탭 상태 관리
  const [activeTab, setActiveTab] = useState("RESERVATION");

  const actions = (
    <ManagerPopupDetailActions
      onClickViewUserPage={vm.handleClickViewUserPage}
      onClickEdit={vm.handleClickEdit}
      onClickDelete={vm.handleClickDelete}
      deleting={vm.deleting}
    />
  );

  const bottomSection = (
    <div className="mt-24">
      {/* 탭 버튼 영역 */}
      <ManagerDetailTabs activeTab={activeTab} onChange={setActiveTab} />

      {/* 탭 내용 영역 */}
      {activeTab === "RESERVATION" ? (
        <ManagerReservationTable
          reservations={vm.reservations}
          page={vm.reservationPage}
          totalPages={vm.reservationTotalPages}
          loading={vm.reservationsLoading}
          error={vm.reservationsError}
          onChangePage={vm.setReservationPage}
          onRetry={vm.handleRetryReservations}
        />
      ) : (
        <ManagerReportSection popupId={vm.popup?.popId} />
      )}
    </div>
  );

  return (
    <PopupDetailTemplate
      loading={vm.loading}
      error={vm.error}
      navigate={vm.navigate}
      popup={vm.popup}
      statusLabel={vm.statusLabel}
      dateRange={vm.dateRange}
      aiSummaryText={vm.aiSummaryText}
      isFree={vm.isFree}
      actions={actions}
      bottomSection={bottomSection}
    />
  );
}