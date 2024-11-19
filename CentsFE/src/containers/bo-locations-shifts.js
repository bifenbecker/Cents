import { connect } from "react-redux";
import get from "lodash/get";
import { createNamespacer } from "../utils/reducers";
import * as locationsApi from "../api/business-owner/locations";
import actionTypes from "../actionTypes";

import LocationShifts from "../components/business-owner/global-settings/locations/location-shifts/location-shifts";

const locationsAT = actionTypes.businessOwner.globalSettings.locations;
const BoLocationsNamespacer = createNamespacer("BUSINESS_OWNER_GS_LOCATIONS");

const mapStateToProps = (state) => {
  const {
    businessOwner: {
      globalSettings: {
        locations: {
          shiftsError,
          selectedLocation,
          selectedShiftIndex,
          isShiftsCallInProgress,
          shiftsUpdateOrCreateError,
          selectedLocationShiftsData,
        },
      },
    },
  } = state;

  return {
    shifts: selectedLocationShiftsData?.shifts,
    shiftIndex: selectedShiftIndex,
    shiftsError,
    selectedLocation,
    selectedShiftIndex,
    isShiftsCallInProgress,
    shiftsUpdateOrCreateError,
    selectedLocationShiftsData,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    hideShiftScreen: async () => {
      dispatch({
        type: BoLocationsNamespacer(locationsAT.RESET_SHIFTS_TO_INIT),
      });
      dispatch({
        type: BoLocationsNamespacer(locationsAT.SET_REFRESH_LOCATIONS),
        payload: true,
      });
    },

    handleShiftChange: (shiftIndex) => {
      dispatch({
        type: BoLocationsNamespacer(locationsAT.SET_ACTIVE_SHIFT_TAB),
        payload: shiftIndex,
      });
      dispatch({
        type: BoLocationsNamespacer(
          locationsAT.SET_SHIFTS_UPDATE_OR_CREATE_ERROR
        ),
        payload: "",
      });
    },

    handleShiftCheckboxClick: (shiftIndex, dayIndex) => {
      dispatch({
        type: BoLocationsNamespacer(locationsAT.TOGGLE_SHIFT_CHECKBOX),
        payload: {
          shiftIndex,
          dayIndex,
        },
      });
    },

    handleShiftTimingChange: (shiftIndex, dayIndex, key, value) => {
      dispatch({
        type: BoLocationsNamespacer(locationsAT.SET_SHIFT_TIME),
        payload: {
          shiftIndex,
          dayIndex,
          key,
          value,
        },
      });
    },

    updateShiftTimings: (shiftIndex, newTimings) => {
      dispatch({
        type: BoLocationsNamespacer(locationsAT.APPLY_TIMING_TO_ALL),
        payload: {
          shiftIndex,
          newTimings,
        },
      });
    },

    resetShift: (shiftIndex) => {
      dispatch({
        type: BoLocationsNamespacer(locationsAT.RESET_SHIFT),
        payload: {
          shiftIndex,
        },
      });
    },

    resetAllShifts: () => {
      dispatch({
        type: BoLocationsNamespacer(locationsAT.RESET_ALL_SHIFTS_CHANGES),
      });
    },

    updateOrCreateShift: async (shift, storeId) => {
      dispatch({
        type: BoLocationsNamespacer(locationsAT.SET_SHIFTS_CALL_IN_PROGRESS),
        payload: true,
      });
      try {
        const newShift = { ...shift };
        if (!shift.id) {
          // Removing "+ " from name in payload
          newShift.name = newShift.name.replace("+ ", "");
        }

        // Send timings that has id or that are only active.
        newShift.timings = newShift.timings.filter((t) => t.id || t.isActive);
        newShift.timings = newShift.timings.map((data) => {
          delete data.deliveryTimingSettings;
          return data;
        });

        await locationsApi.updateOrCreateShift(newShift, storeId);

        dispatch({
          type: BoLocationsNamespacer(
            locationsAT.SET_SHIFTS_UPDATE_OR_CREATE_ERROR
          ),
          payload: "",
        });
        // Call is successfull - so refresh data
        try {
          const shiftsResponse = await locationsApi.fetchShifts({
            storeId: storeId,
          });
          dispatch({
            type: BoLocationsNamespacer(locationsAT.SET_SHIFTS),
            payload: shiftsResponse.data,
          });
        } catch (error) {
          console.warn("Error fetching shifts - ", error);
          dispatch({
            type: BoLocationsNamespacer(locationsAT.SET_SHIFTS_ERROR),
            payload: error.message,
          });
        }
      } catch (error) {
        dispatch({
          type: BoLocationsNamespacer(
            locationsAT.SET_SHIFTS_UPDATE_OR_CREATE_ERROR
          ),
          payload: get(error, "response.data.error")
            ? error.response.data.error
            : error.message,
        });
      }

      dispatch({
        type: BoLocationsNamespacer(locationsAT.SET_SHIFTS_CALL_IN_PROGRESS),
        payload: false,
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LocationShifts);
