import useManagerPopupDetailPage from "../../hooks/useManagerPopupDetailPage";
import PopupDetailTemplate from "../../components/popup/PopupDetailTemplate";
import ManagerPopupDetailActions from "../../components/manager/ManagerPopupDetailActions";
import ManagerReservationTable from "../../components/manager/ManagerReservationTable";

export default function ManagerPopupDetailPage() {
  const vm = useManagerPopupDetailPage();

  const actions = (
    <ManagerPopupDetailActions
      onClickViewUserPage={vm.handleClickViewUserPage}
      onClickEdit={vm.handleClickEdit}
      onClickDelete={vm.handleClickDelete}
      deleting={vm.deleting}
    />
  );

  const bottomSection = (
    <ManagerReservationTable
      reservations={vm.reservations}
      page={vm.reservationPage}
      totalPages={vm.reservationTotalPages}
      loading={vm.reservationsLoading}
      error={vm.reservationsError}
      onChangePage={vm.setReservationPage}
      onRetry={vm.handleRetryReservations}
    />
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
