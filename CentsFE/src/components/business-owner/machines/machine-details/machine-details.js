import React, {useCallback, useEffect, useState} from "react";
import {UncontrolledPopover} from "reactstrap";
import cx from "classnames";

import {VIEW_MACHINE_TABS} from "../constants";
import {
  DEVICE_STATUSES,
  DEVICE_STATUSES_MAP,
  WIZARD_TYPES,
  MACHINE_TYPES,
} from "../constants";
import {generateConnectionLogsReport} from "../../../../utils/reports";

import {
  getMachineTurns,
  downloadConnectionLogs,
  resetTurns,
  resetCoins,
} from "../../../../api/business-owner/machines";

import TabSwitcher from "../../../commons/tab-switcher/tab-switcher";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import DetailsTab from "./details-tab";
import TurnsTab from "./turns-tab";
import StatusIndicator from "../../../commons/statusIndicator/statusIndicator";
// import TurnDetails from "../turn-details/turn-details";
import UnpairConfirmationPopup from "../unpair-confirmation-popup/unpair-confirmation-popup";

const machineTabs = [
  {
    value: VIEW_MACHINE_TABS.details,
    label: VIEW_MACHINE_TABS.details,
  },
  {
    value: VIEW_MACHINE_TABS.turns,
    label: VIEW_MACHINE_TABS.turns,
  },
];
const MachineDetails = ({state, dispatch, fetchMachineDetails}) => {
  const selectedMachineState = state.selectedMachine;
  const machineDetails = selectedMachineState.data;
  const [unpairConfirmationPopup, setUnpairConfirmationPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const toggleShowMenu = (showMenu) => {
    dispatch({
      type: "UPDATE_SELECTED_MACHINE_STATE_FIELD",
      payload: {field: "showMenu", value: showMenu},
    });
  };

  const fetchTurns = useCallback(
    async (machineId, params) => {
      try {
        dispatch({type: "FETCHING_MACHINE_TURNS", payload: {page: params.page || 1}});
        const res = await getMachineTurns(machineId, params);
        dispatch({type: "FETCH_MACHINE_TURNS_SUCCESS", payload: res?.data || {}});
      } catch (e) {
        dispatch({
          type: "FETCH_MACHINE_TURNS_FAILURE",
          payload: {error: e?.response?.data?.error || e?.message},
        });
      }
    },
    [dispatch]
  );

  const downloadConnectionLogsReport = async () => {
    try {
      setLoading(true);
      const reportData = await downloadConnectionLogs(machineDetails?.id);
      await generateConnectionLogsReport(
        reportData,
        "Cents_Machine_Connection_logs_Report"
      );
    } catch (error) {
      setError(error?.response?.data?.error);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const resetMachineTurns = async () => {
    try {
      setLoading(true);
      const resp = await resetTurns(machineDetails?.id);
      if (resp?.data?.success) {
        fetchMachineDetails(machineDetails?.id);
      }
    } catch (error) {
      setError(error?.response?.data?.error);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const resetTotalCoins = async () => {
    try {
      setLoading(true);
      const resp = await resetCoins(machineDetails?.id);
      if (resp?.data?.success) {
        dispatch({
          type: "UPDATE_SELECTED_MACHINE_DATA_FIELD",
          payload: {field: "totalCoinsUsed", value: 0},
        });
      }
    } catch (error) {
      setError(error?.response?.data?.error);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const renderDeviceStatusMessage = () => {
    switch (machineDetails?.device?.status) {
      case DEVICE_STATUSES.OFFLINE:
        return (
          <span className="device-info">
            ({"Device #" + machineDetails?.device?.name + " was connected"})
          </span>
        );
      case DEVICE_STATUSES.IN_USE:
      case DEVICE_STATUSES.ONLINE:
        return (
          <span className="device-info">
            (Device #{machineDetails?.device?.name?.toUpperCase()})
          </span>
        );
      default:
        return (
          <span className="device-info">Machine not connected to a Cents device</span>
        );
    }
  };

  const isRunMachineDisabled = (machineDetails) => {
    if (machineDetails?.model?.type === MACHINE_TYPES.washer) {
      return machineDetails?.device?.status !== DEVICE_STATUSES.ONLINE;
    } else {
      return ![DEVICE_STATUSES.ONLINE, DEVICE_STATUSES.IN_USE].includes(
        machineDetails?.device?.status
      );
    }
  };

  const renderThreeDotMenu = () => {
    return (
      <UncontrolledPopover
        trigger="legacy"
        placement="bottom-end"
        target="three-dot-menu-machines"
        isOpen={selectedMachineState.showMenu}
        toggle={() => toggleShowMenu(!selectedMachineState.showMenu)}
      >
        {machineDetails.device?.isPaired ? (
          <p
            className={`${
              [DEVICE_STATUSES.IN_USE, DEVICE_STATUSES.OFFLINE].includes(
                machineDetails?.device?.status
              )
                ? "disable"
                : null
            }`}
            onClick={() => {
              setUnpairConfirmationPopup(true);
              toggleShowMenu(false);
            }}
          >
            Unpair
          </p>
        ) : null}
        <p
          className={`${isRunMachineDisabled(machineDetails) ? "disable" : null}`}
          onClick={() => {
            dispatch({
              type: "OPEN_WIZARD",
              payload: WIZARD_TYPES.runMachine,
            });
            toggleShowMenu(false);
          }}
        >
          Run Machine
        </p>
        {machineDetails.device?.isPaired ? (
          <>
            <p
              onClick={() => {
                downloadConnectionLogsReport();
                toggleShowMenu(false);
              }}
            >
              Download Connection Logs
            </p>
            <p
              onClick={() => {
                resetMachineTurns();
                toggleShowMenu(false);
              }}
            >
              Reset Machine Turns
            </p>
            <p
              onClick={() => {
                resetTotalCoins();
                toggleShowMenu(false);
              }}
            >
              Reset Total Coins
            </p>
          </>
        ) : null}
      </UncontrolledPopover>
    );
  };

  useEffect(() => {
    if (
      state.selectedMachine.data.id &&
      state.selectedMachine.tab === VIEW_MACHINE_TABS.turns
    ) {
      fetchTurns(state.selectedMachine.data.id, {page: state.selectedMachineTurns.page});
    }
  }, [
    state.selectedMachine.tab,
    state.selectedMachine.data.id,
    state.selectedMachineTurns.page,
    fetchTurns,
  ]);

  // TODO: TURN VIEW IMPLEMENTATION
  // if (state.selectedTurn.id) {
  //   return <TurnDetails selectedTurn={state.selectedTurn} dispatch={dispatch} />;
  // }

  return (
    <div className="cents-card right-card">
      {(selectedMachineState.loading ||
        selectedMachineState.error ||
        loading ||
        error) && <BlockingLoader error={selectedMachineState.error || error} />}
      {unpairConfirmationPopup && (
        <UnpairConfirmationPopup
          machineId={machineDetails.id}
          dispatch={dispatch}
          machineName={`${machineDetails?.prefix}-${machineDetails?.name}`}
          setUnpairConfirmationPopup={setUnpairConfirmationPopup}
        />
      )}
      <div className="machine-info-container">
        <div className="device-info-header">
          <p>
            {machineDetails.prefix}-{machineDetails.name}
          </p>
          {machineDetails.device?.status === DEVICE_STATUSES.IN_USE && (
            <span className="machine-badge active">In Use</span>
          )}
          <div className="machine-info-right-menu">
            <div className="machine-menu-icon-container">
              <img alt="" className="machine-menu-icon" />
              <div
                className={cx(
                  "machine-menu-icon",
                  "three-dot-menu machine",
                  selectedMachineState.showMenu && "open"
                )}
                id="three-dot-menu-machines"
              />
            </div>
            {renderThreeDotMenu()}
          </div>
        </div>
        <div className="machine-info-content">
          <div className="section tabs-section">
            <TabSwitcher
              tabs={machineTabs}
              activeTab={selectedMachineState.tab}
              onTabClick={(tab) => {
                dispatch({
                  type: "UPDATE_SELECTED_MACHINE_STATE_FIELD",
                  payload: {field: "tab", value: tab},
                });
              }}
            />
          </div>
          <div className="scroll-area">
            {state.selectedMachine.tab === VIEW_MACHINE_TABS.details ? (
              <DetailsTab machineDetails={machineDetails} dispatch={dispatch} />
            ) : (
              <TurnsTab turns={state.selectedMachineTurns} dispatch={dispatch} />
            )}
          </div>
        </div>
        <div className="machine-status-info">
          <StatusIndicator status={machineDetails.device?.status || "device_unpaired"} />
          <span className="status">
            {DEVICE_STATUSES_MAP[machineDetails.device?.status] || "NO DEVICE PAIRED"}
          </span>
          {renderDeviceStatusMessage()}
        </div>
      </div>
    </div>
  );
};
export default MachineDetails;
