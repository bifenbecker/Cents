import {createNamespacer, createReducer} from "../../utils/reducers";
import actionTypes from "../../actionTypes";

const BoDashboardNamespacer = createNamespacer("BUSINESS_OWNER_DASHBOARD");

const initialState = {
  locationList: [],
  locationCallInProgress: false,
  isLocationsEmpty: false,
  selectedLocation: null,
  selectedLocations: [],
  allLocations: {
    regions: [],
    locations: [],
    storesWithoutRegions: [],
    needsRegions: false,
  },
  totalLocations: [],
};

const handlers = {
  [BoDashboardNamespacer(actionTypes.businessOwner.dashboard.SET_LOCATIONS_LIST)]: (
    state,
    action
  ) => {
    if (state.selectedLocation === null && action.payload && action.payload.length > 0) {
      return {
        ...state,
        locationList: action.payload,
        selectedLocation: {
          label: action.payload[0].address,
          value: action.payload[0].id,
        },
      };
    } else {
      return {
        ...state,
        locationList: action.payload,
      };
    }
  },
  [BoDashboardNamespacer(actionTypes.businessOwner.dashboard.SET_LOCATIONS_EMPTY)]: (
    state,
    action
  ) => {
    return {
      ...state,
      isLocationsEmpty: action.payload,
    };
  },

  [BoDashboardNamespacer(actionTypes.businessOwner.dashboard.SET_SELECTED_LOCATION)]: (
    state,
    action
  ) => {
    return {
      ...state,
      selectedLocation: action.payload,
    };
  },
  [BoDashboardNamespacer(actionTypes.businessOwner.dashboard.SET_DEVICE_LIST)]: (
    state,
    action
  ) => {
    return {
      ...state,
      deviceList: action.payload,
    };
  },

  [BoDashboardNamespacer(actionTypes.businessOwner.dashboard.SET_MACHINE_LIST)]: (
    state,
    action
  ) => {
    return {
      ...state,
      machineList: action.payload,
    };
  },

  [BoDashboardNamespacer(
    actionTypes.businessOwner.dashboard.SET_LOCATION_CALL_PROGRESS
  )]: (state, action) => {
    return {
      ...state,
      locationCallInProgress: action.payload,
    };
  },

  [BoDashboardNamespacer(actionTypes.businessOwner.dashboard.RESET_DASHBOARD_DATA)]: (
    state,
    action
  ) => {
    return {
      ...initialState,
    };
  },

  [BoDashboardNamespacer(actionTypes.businessOwner.dashboard.SET_ALL_LOCATIONS)]: (
    state,
    action
  ) => {
    let selectedLocations = action.payload?.locations?.map((location) => location.id);
    let totalLocations = action.payload?.locations?.map((location) => location.id);

    let assignedRegions = [];
    if (!action.payload?.isOwner) {
      assignedRegions = action.payload?.regions
        ?.map((region) => {
          let assignedDistricts = region.districts
            .map((district) => {
              let assignedStores = district?.stores?.filter((store) =>
                selectedLocations.includes(store.id)
              );
              return assignedStores?.length
                ? {...district, stores: assignedStores}
                : null;
            })
            ?.filter((district) => district);
          return assignedDistricts?.length
            ? {...region, districts: assignedDistricts}
            : null;
        })
        ?.filter((region) => region);
    } else {
      assignedRegions = action.payload?.regions;
    }

    const assignedStoresWithoutRegions = action.payload?.storesWithoutRegions?.filter(
      (store) => selectedLocations.includes(store?.id)
    );

    return {
      ...state,
      allLocations: {
        ...action.payload,
        regions: assignedRegions,
        storesWithoutRegions: assignedStoresWithoutRegions,
      },
      selectedLocations: selectedLocations || [],
      totalLocations: totalLocations || [],
    };
  },

  [BoDashboardNamespacer(actionTypes.businessOwner.dashboard.SET_SELECTED_LOCATIONS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      selectedLocations: action.payload,
    };
  },
};

export default createReducer(initialState, handlers, ["BUSINESS_OWNER_DASHBOARD"]);
