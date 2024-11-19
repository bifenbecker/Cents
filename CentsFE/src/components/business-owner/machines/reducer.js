import {MACHINE_TYPES, VIEW_MACHINE_TABS, WIZARD_TYPES} from "./constants";
import {
  getUpdatedMachinesList,
  unpairMachineAndUpdateList,
  updatePairedMachinesList,
} from "./utils";

// TODO: Remove states from here if they can be managed locally.
export const initialState = {
  selectedStores: [],
  // takes user to devices list modal when set
  showDevices: false,

  // machines list state
  machines: {
    list: [],
    loading: false,
    error: "",
    page: 1,
    hasMore: false,
    keyword: null,
    type: MACHINE_TYPES.washer,
    showSearchBar: false,
    loadingMore: false,
    newMachinesCount: 0,
  },
  // header bar with machine stats
  stats: {
    data: {},
    loading: false,
    error: "",
  },
  // device list
  devices: {
    list: [],
    loading: false,
    error: "",
    page: 1,
    hasMore: false,
    loadingMore: false,
  },

  // show selected machine details
  selectedMachine: {
    id: null,
    data: {},
    error: "",
    loading: false,
    tab: VIEW_MACHINE_TABS.details,
    showMenu: false,
  },
  selectedMachineTurns: {
    list: [],
    loading: false,
    page: 1,
    error: "",
    hasMore: false,
    loadingMore: false,
  },
  selectedTurn: {
    id: null,
    data: {},
    loading: false,
    error: "",
  },
  // show selected device details
  selectedDevice: {},
  // wizard types- add and run a machine, pair machine and device
  wizardType: null,
};

export default (state, action) => {
  switch (action.type) {
    case "LOCATIONS_CHANGED":
      return {
        ...initialState,
        machines: {
          ...initialState.machines,
          loading: true,
          type:
            state.wizardType === WIZARD_TYPES.addMachine
              ? state.machines.type
              : initialState.machines.type,
        },
        selectedStores: action.payload,
        showDevices: state.showDevices && action.payload?.length === 1,
        wizardType:
          state.wizardType === WIZARD_TYPES.addMachine ? state.wizardType : null,
      };
    case "OPEN_WIZARD":
      return {
        ...state,
        wizardType: action.payload,
        machines: {
          ...state.machines,
          showSearchBar:
            action.payload === WIZARD_TYPES.runMachine
              ? state.machines.showSearchBar
              : false,
          keyword:
            action.payload === WIZARD_TYPES.runMachine ? state.machines.keyword : null,
        },
        selectedMachine: {
          ...state.selectedMachine,
          showMenu: false,
        },
      };
    case "CLOSE_WIZARD":
      return {...state, wizardType: null};
    case "TOGGLE_DEVICE_LIST":
      return {
        ...initialState,
        selectedStores: state.selectedStores,
        stats: state.stats,
        showDevices: !state.showDevices,
      };
    case "FETCHING_DEVICES":
      return {
        ...state,
        devices: {
          ...state.devices,
          loading: action.payload.page === 1,
          loadingMore: action.payload.page > 1,
          page: action.payload.page,
          error: "",
        },
      };
    case "FETCH_DEVICES_SUCCESS":
      return {
        ...state,
        devices: {
          ...state.devices,
          list:
            state.devices.page > 1
              ? [...state.devices.list, ...(action.payload.devices || [])]
              : [...(action.payload.devices || [])],
          hasMore: action.payload.hasMore,
          loading: false,
          loadingMore: false,
          error: "",
        },
      };
    case "FETCH_DEVICES_FAILURE":
      return {
        ...state,
        devices: {
          ...state.devices,
          loading: false,
          loadingMore: false,
          error: action.payload.error,
        },
      };
    case "RESET_MACHINES_PAGE":
      return {
        ...state,
        machines: {
          ...state.machines,
          newMachinesCount: 0,
          page: 1,
          error: "",
        },
      };
    case "INCREMENT_MACHINES_PAGE":
      return {
        ...state,
        machines: {
          ...state.machines,
          page: state.machines.page + 1,
          error: "",
        },
      };
    case "MACHINE_TOGGLE_SEARCH_BAR":
      return {
        ...state,
        machines: {
          ...state.machines,
          list: [],
          showSearchBar: action.payload,
          keyword: null,
          page: 1,
          hasMore: false,
          error: "",
        },
        selectedMachine: {
          id: null,
          data: {},
          error: "",
          loading: false,
          tab: VIEW_MACHINE_TABS.details,
          showMenu: false,
        },
        selectedMachineTurns: {
          list: [],
          loading: false,
          page: 1,
          error: "",
          hasMore: false,
          loadingMore: false,
        },
        selectedTurn: {id: null, data: {}, loading: false, error: ""},
        selectedDevice: {},
        wizardType: null,
      };
    case "MACHINES_SET_KEYWORD":
      return {
        ...state,
        machines: {
          ...state.machines,
          page: 1,
          // Empty the list only if the current keyword and existing keyword are not the same.
          list:
            action.payload &&
            state.machines.keyword &&
            action.payload === state.machines.keyword
              ? state.machines.list
              : [],
          keyword: action.payload || null,
          hasMore: false,
          error: "",
        },
      };
    case "SET_MACHINE_TYPE_TAB":
      return {
        ...state,
        ...(state.machines.type !== action.payload
          ? {
              machines: {
                ...state.machines,
                list: [],
                page: 1,
                keyword: null,
                error: "",
                type: action.payload,
                loading: false,
                loadingMore: false,
                hasMore: false,
                showSearchBar: false,
                newMachinesCount: 0,
              },
              selectedMachine: {
                ...state.selectedMachine,
                showMenu: false,
              },
              wizardType: null,
            }
          : {}),
      };
    case "FETCHING_MACHINES":
      return {
        ...state,
        machines: {
          ...state.machines,
          loading: action.payload.page === 1,
          loadingMore: action.payload.page > 1,
          page: action.payload.page,
          newMachinesCount:
            state.machines.newMachinesCount && action.payload.page !== 1
              ? state.machines.newMachinesCount
              : 0,
          error: "",
        },
      };
    case "FETCH_MACHINES_SUCCESS":
      return {
        ...state,
        machines: {
          ...state.machines,
          list:
            state.machines.page > 1
              ? [...state.machines.list, ...(action.payload.machines || [])]
              : [...(action.payload.machines || [])],
          hasMore: action.payload.hasMore,
          loading: false,
          loadingMore: false,
          error: "",
        },
      };
    case "FETCH_MACHINES_FAILURE":
      return {
        ...state,
        machines: {
          ...state.machines,
          loading: false,
          loadingMore: false,
          error: action.payload.error,
        },
      };
    case "SET_SELECTED_MACHINE_ID":
      return {
        ...state,
        selectedMachine: {
          id: action.payload,
          data: {},
          error: "",
          loading: false,
          tab: VIEW_MACHINE_TABS.details,
          showMenu: false,
        },
        selectedMachineTurns: {
          list: [],
          loading: false,
          page: 1,
          error: "",
          hasMore: false,
          loadingMore: false,
        },
        selectedTurn: {data: {}, loading: false, error: ""},
        selectedDevice: {},
        wizardType:
          action.retainWizard && state.wizardType === WIZARD_TYPES.addMachine
            ? state.wizardType
            : null,
      };
    case "SET_SELECTED_DEVICE":
      return {...state, selectedDevice: action.payload};
    case "INCREMENT_DEVICE_PAGE":
      return {...state, devices: {...state.devices, page: state.devices.page + 1}};
    case "RESET_DEVICE_STATE":
      return {...state, devices: {...initialState.devices}};
    case "FETCHING_MACHINE_STATS":
      return {
        ...state,
        stats: {
          ...state.stats,
          loading: true,
          error: "",
        },
      };
    case "FETCH_MACHINE_STATS_SUCCESS":
      return {
        ...state,
        stats: {
          ...state.stats,
          data: {
            activeMachines: action.payload.activeMachines,
            inUseMachines: action.payload.inUseMachines,
            outOfServiceMachines: action.payload.outOfServiceMachines,
            unpairedDevices: action.payload.unpairedDevices || 0,
          },
          loading: false,
          error: "",
        },
      };
    case "FETCH_MACHINE_STATS_FAILURE":
      return {
        ...state,
        stats: {
          ...state.stats,
          loading: false,
          error: action.payload.error,
        },
      };
    case "INCREMENT_TURNS_PAGE":
      return {
        ...state,
        selectedMachineTurns: {
          ...state.selectedMachineTurns,
          page: state.selectedMachineTurns.page + 1,
        },
      };
    case "RESET_TURNS_PAGE":
      return {
        ...state,
        selectedMachineTurns: {
          ...state.selectedMachineTurns,
          page: 1,
        },
      };
    case "FETCHING_MACHINE_TURNS":
      return {
        ...state,
        selectedMachineTurns: {
          ...state.selectedMachineTurns,
          loading: action.payload.page === 1,
          loadingMore: action.payload.page > 1,
          page: action.payload.page,
          error: "",
        },
      };
    case "FETCH_MACHINE_TURNS_SUCCESS":
      return {
        ...state,
        selectedMachineTurns: {
          ...state.selectedMachineTurns,
          list:
            state.selectedMachineTurns.page > 1
              ? [...state.selectedMachineTurns.list, ...(action.payload.turns || [])]
              : [...action.payload.turns],
          hasMore: action.payload.hasMore,
          loading: false,
          loadingMore: false,
          error: "",
        },
      };
    case "FETCH_MACHINE_TURNS_FAILURE":
      return {
        ...state,
        selectedMachineTurns: {
          ...state.selectedMachineTurns,
          loading: false,
          loadingMore: false,
          error: action.payload.error,
        },
      };
    case "SET_SELECTED_TURN":
      return {
        ...state,
        selectedTurn: {
          id: action.payload,
          data: {},
          loading: true,
          error: "",
        },
      };
    case "CLOSE_SELECTED_TURN_POPUP":
      return {
        ...state,
        selectedTurn: {
          id: null,
          data: {},
          loading: false,
          error: "",
        },
      };
    case "FETCH_SELECTED_MACHINE":
      return {
        ...state,
        selectedMachine: {
          ...state.selectedMachine,
          loading: true,
        },
      };
    case "UPDATE_SELECTED_MACHINE_STATE_FIELD":
      return {
        ...state,
        selectedMachine: {
          ...state.selectedMachine,
          [action.payload.field]: action.payload.value,
        },
      };
    case "UPDATE_SELECTED_MACHINE_DATA_FIELD":
      return {
        ...state,
        selectedMachine: {
          ...state.selectedMachine,
          data: {
            ...state.selectedMachine.data,
            [action.payload.field]: action.payload.value,
          },
        },
      };
    case "FETCH_SELECTED_MACHINE_SUCCESS":
      return {
        ...state,
        selectedMachine: {
          ...state.selectedMachine,
          loading: false,
          data: action.payload,
          error: "",
        },
      };
    case "FETCH_SELECTED_MACHINE_FAILURE":
      return {
        ...state,
        selectedMachine: {
          ...state.selectedMachine,
          loading: false,
          error: action.payload.error,
        },
      };
    case "UPDATE_SELECTED_MACHINE_DATA":
      const list = [...(state.machines.list || [])];
      const idx = list.findIndex((m) => m?.id === action?.payload?.id);
      if (idx > -1) {
        list.splice(idx, 1, action.payload);
      }
      return {
        ...state,
        machines: {
          ...state.machines,
          list,
        },
        selectedMachine: {
          ...state.selectedMachine,
          data: action.payload,
          loading: false,
          error: "",
        },
      };
    case "UPDATE_DEVICE_STATUS":
      return {
        ...state,
        machines: {
          ...state.machines,
          list: getUpdatedMachinesList(state?.machines?.list, action?.payload || {}),
        },
        selectedMachine: {
          ...state.selectedMachine,
          // If the selectedMachine is same as the one changed,
          // 1. We need to refresh the selectedMachine data
          // 2. Close the menu
          showMenu:
            action?.payload?.machineId === state.selectedMachine?.data?.id
              ? false
              : state?.selectedMachine?.showMenu,
          data:
            action?.payload?.machineId === state.selectedMachine?.data?.id
              ? {}
              : state.selectedMachine?.data || {},
        },
      };
    case "ADD_PAIRED_DEVICES_TO_MACHINES":
      return {
        ...state,
        machines: {
          ...state.machines,
          list: updatePairedMachinesList(
            state?.machines?.list,
            action?.payload?.machines || []
          ),
          newMachinesCount: action?.payload?.newMachinesCount || 0,
        },
        selectedMachine: {
          ...state.selectedMachine,
          // If the selectedMachine is part of the paired machines,
          // 1. we need to refresh the selectedMachine data
          // 2. Close the menu
          showMenu:
            action?.payload?.machines?.findIndex(
              (m) => m.id === state.selectedMachine?.data?.id
            ) > -1
              ? false
              : state?.selectedMachine?.showMenu,
          data:
            action?.payload?.machines?.findIndex(
              (m) => m.id === state.selectedMachine?.data?.id
            ) > -1
              ? {}
              : state.selectedMachine?.data || {},
        },
      };
    case "UNPAIR_MACHINE_AND_UPDATE_MACHINE_STATE":
      const {machineId} = action?.payload || {};

      return {
        ...state,
        machines: {
          ...state.machines,
          list: unpairMachineAndUpdateList(state?.machines?.list, machineId),
        },
        selectedMachine: {
          ...state.selectedMachine,
          // If the selectedMachine is unpaired,
          // 1. we need to refresh the selectedMachine data
          // 2. Cloe the menu
          showMenu:
            state.selectedMachine?.data?.id === machineId
              ? false
              : state.selectedMachine?.showMenu,
          data:
            state.selectedMachine?.data?.id === machineId
              ? {}
              : state.selectedMachine?.data || {},
        },
      };
    default:
      return {...state};
  }
};
