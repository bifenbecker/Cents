import React, {useEffect, useReducer} from "react";
import {useDispatch, useSelector} from "react-redux";

import {
  getMachines,
  getMachineStats,
  getMachineDetails,
} from "../../../api/business-owner/machines";

import reducer, {initialState} from "./reducer";
import actionTypes from "../../../actionTypes";
import {WIZARD_TYPES} from "./constants";
import {createNamespacer} from "../../../utils/reducers";
import usePusher from "../../../hooks/usePusher";

import {AddNewMachine, RunMachine} from "./wizards";
import Card from "../../commons/card/card";
import BlockingLoader from "../../commons/blocking-loader/blocking-loader";
import MachineStats from "./machine-stats/machine-stats";
import MachinesList from "./machines-list/machines-list";
import DevicesList from "./devices-list/devices-list";
import DeviceDetails from "./device-details/device-details";
import MachineDetails from "./machine-details/machine-details";

const BoDashboardNamespacer = createNamespacer("BUSINESS_OWNER_DASHBOARD");

const Machines = () => {
  const locations = useSelector((state) => ({
    selected: state?.businessOwner?.dashboard?.selectedLocations,
    all: state?.businessOwner?.dashboard?.allLocations?.locations,
  }));
  const globalDispatch = useDispatch();

  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    selectedStores: locations.selected,
  });

  const pusherClient = usePusher();

  useEffect(() => {
    let storeChannels = [];
    // Connect to channels only if there are machines or devices.
    if (pusherClient) {
      state.selectedStores.forEach((storeId) => {
        storeChannels.push(pusherClient.subscribe(`private-store-${storeId}`));
      });
      storeChannels.forEach((channel) =>
        channel.bind("pusher:subscription_error", (error) => {
          console.warn("Could not subscribe to", channel?.name, error);
        })
      );
      pusherClient.bind("device-status-updated", (data) => {
        dispatch({
          type: "UPDATE_DEVICE_STATUS",
          payload: data,
        });
        fetchMachineStats({storeIds: state.selectedStores});
      });
      pusherClient.bind("devices-bulk-paired", (data) => {
        dispatch({
          type: "ADD_PAIRED_DEVICES_TO_MACHINES",
          payload: data,
        });
        fetchMachineStats({storeIds: state.selectedStores});
      });
      pusherClient.bind("machine-unpaired", (data) => {
        dispatch({
          type: "UNPAIR_MACHINE_AND_UPDATE_MACHINE_STATE",
          payload: data,
        });
        fetchMachineStats({storeIds: state.selectedStores});
      });
    }
    return () => {
      if (storeChannels.length && pusherClient) {
        pusherClient.unbind("device-status-updated");
        pusherClient.unbind("devices-bulk-paired");
        pusherClient.unbind("machine-unpaired");
        storeChannels.forEach((ch) => ch.unsubscribe());
        storeChannels = [];
      }
    };
  }, [state.selectedStores, pusherClient]);

  const fetchMachines = async (params) => {
    try {
      // Page number will already be set prior to this.
      // But we shall use this page number here to set proper loading states.
      dispatch({type: "FETCHING_MACHINES", payload: {page: params?.page || 1}});
      const res = await getMachines(params);
      dispatch({type: "FETCH_MACHINES_SUCCESS", payload: res?.data || {}});
      // Set the selected machine as first one in the list,
      // only if it is the first page.
      if (!params?.page || params?.page === 1) {
        dispatch({
          type: "SET_SELECTED_MACHINE_ID",
          payload: res?.data?.machines?.[0]?.id || null,
          retainWizard: true,
        });
      }
    } catch (e) {
      dispatch({
        type: "FETCH_MACHINES_FAILURE",
        payload: {
          error: e?.response?.data?.error || e?.message,
        },
      });
    }
  };

  const fetchMachineStats = async (params) => {
    try {
      dispatch({type: "FETCHING_MACHINE_STATS"});
      const res = await getMachineStats(params);
      dispatch({type: "FETCH_MACHINE_STATS_SUCCESS", payload: res?.data || {}});
    } catch (e) {
      dispatch({
        type: "FETCH_MACHINE_STATS_FAILURE",
        payload: {
          error: e?.response?.data?.error || e?.message,
        },
      });
    }
  };

  const fetchMachineDetails = (machineId) => {
    if (machineId) {
      dispatch({type: "FETCH_SELECTED_MACHINE"});
      getMachineDetails(machineId)
        .then(({data: {result: details}}) => {
          dispatch({type: "UPDATE_SELECTED_MACHINE_DATA", payload: details || {}});
        })
        .catch((e) => {
          dispatch({
            type: "FETCH_SELECTED_MACHINE_FAILURE",
            payload: {
              error: e?.response?.data?.error || e?.message,
            },
          });
        });
    }
  };

  useEffect(() => {
    dispatch({type: "LOCATIONS_CHANGED", payload: locations.selected});
  }, [locations.selected]);

  useEffect(() => {
    // Make API call
    // 1. If there are no selected stores
    // 2. If we are not on devices page and locations are changed.
    // 3. If searchbar is closed and dependencies change.
    // 4. If search bar is open, then make API call only if keyword is there.
    if (
      state.selectedStores?.length &&
      !state.showDevices &&
      (!state.machines.showSearchBar || state.machines.keyword)
    ) {
      fetchMachines({
        storeIds: state.selectedStores,
        type: state.machines.keyword ? null : state.machines.type,
        keyword: state.machines.keyword,
        page: state.machines.page,
      });
    }
  }, [
    state.showDevices,
    state.selectedStores,
    state.machines.type,
    state.machines.keyword,
    state.machines.page,
    state.machines.showSearchBar,
  ]);

  useEffect(() => {
    fetchMachineStats({storeIds: state.selectedStores});
  }, [state.selectedStores]);

  useEffect(() => {
    if (
      state.selectedMachine.id &&
      state.selectedMachine.id !== state.selectedMachine.data?.id
    ) {
      fetchMachineDetails(state.selectedMachine.id);
    }
  }, [state.selectedMachine.id, state.selectedMachine.data]);

  return (
    <div className="machines-container">
      <Card className="store-info-card">
        <MachineStats stats={state?.stats} />
      </Card>
      <Card className="machine-list-card">
        {state.showDevices ? (
          <DevicesList
            devices={state?.devices}
            selectedDevice={state?.selectedDevice}
            locations={state.selectedStores}
            allLocations={locations.all}
            dispatch={dispatch}
          />
        ) : (
          <MachinesList
            locations={locations}
            dispatch={dispatch}
            machines={state.machines}
            stats={state.stats}
            selectedMachineId={state.selectedMachine?.id}
            onReload={async () => {
              if (state?.machines?.page === 1) {
                await fetchMachines({
                  storeIds: state.selectedStores,
                  type: state.machines.keyword ? null : state.machines.type,
                  keyword: state.machines.keyword,
                  page: 1,
                });
              } else {
                // Else, reset the state to init state and fetch details.
                dispatch({type: "RESET_MACHINES_PAGE"});
              }
            }}
          />
        )}
      </Card>
      <Card className="machine-info-card">
        {state.devices?.loading ||
        state.machines?.loading ||
        state?.selectedMachine?.loading ? (
          <BlockingLoader />
        ) : state.wizardType === WIZARD_TYPES.addMachine ? (
          <AddNewMachine
            locations={locations}
            dispatch={dispatch}
            currentMachineTabType={state?.machines?.type}
            onLocationSelect={(id) =>
              globalDispatch({
                type: BoDashboardNamespacer(
                  actionTypes.businessOwner.dashboard.SET_SELECTED_LOCATIONS
                ),
                payload: [id],
              })
            }
            onMachineAdd={async (machine) => {
              // If the machines state is same to the initial state,
              // then just fetch the machines again.
              // Because calling dispatch will not trigger this API
              if (
                !state?.machines?.showSearchBar &&
                !state?.machines?.keyword &&
                state?.machines?.page === 1 &&
                machine?.type === state?.machines?.type
              ) {
                await fetchMachines({
                  storeIds: state?.selectedStores,
                  type: machine?.type,
                  keyword: null,
                  page: 1,
                });
              } else {
                // Else, reset the state to init state and fetch details.
                dispatch({
                  type: "SET_MACHINE_TYPE_TAB",
                  payload: machine?.type,
                });
              }
            }}
          />
        ) : state.wizardType === WIZARD_TYPES.runMachine ? (
          <RunMachine
            dispatch={dispatch}
            selectedMachine={state.selectedMachine.data}
            onRunMachineSuccess={(machineId) => {
              fetchMachineDetails(machineId);
              fetchMachineStats({storeIds: state?.selectedStores});
            }}
          />
        ) : state?.selectedDevice?.id ? (
          <DeviceDetails deviceInfo={state?.selectedDevice} dispatch={dispatch} />
        ) : state?.selectedMachine?.id && state?.selectedMachine?.data?.id ? (
          <MachineDetails
            state={state}
            selectedMachineID={state.selectedMachine?.id}
            fetchMachineDetails={fetchMachineDetails}
            dispatch={dispatch}
          />
        ) : (
          <div className="centered-right-card-text">
            {state?.showDevices
              ? "Please select a device"
              : state?.machines?.showSearchBar
              ? "Please enter search text"
              : "Please select a machine"}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Machines;
