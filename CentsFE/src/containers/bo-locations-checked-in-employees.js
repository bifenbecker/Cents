import {connect} from "react-redux";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";
import * as TeamMembers from "../api/business-owner/teams";
import CheckedInEmployees from "../components/business-owner/global-settings/locations/checked-in-employees/checked-in-employees";

const locationsAT = actionTypes.businessOwner.globalSettings.locations;
const BoLocationsNamespacer = createNamespacer("BUSINESS_OWNER_GS_LOCATIONS");

const mapStateToProps = (state) => {
  const {
    businessOwner: {
      globalSettings: {
        locations: {
          selectedLocation,
          setShowCheckedInEmployees,
          fetchCheckedInEmployeesApiError,
          fetchCheckedInEmployeesLoading,
          checkedInEmployees,
          isLocationDetailsLoading,
        },
      },
    },
  } = state;
  return {
    location: selectedLocation,
    setShowCheckedInEmployees,
    isLocationDetailsLoading,
    fetchCheckedInEmployeesApiError,
    fetchCheckedInEmployeesLoading,
    checkedInEmployees,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    refreshActiveLocation: () => {
      dispatch({
        type: BoLocationsNamespacer(locationsAT.REFRESH_ACTIVE_LOCATION_DETAILS),
        payload: true,
      });
    },
    onSetShowCheckedInEmployees: async (value) => {
      dispatch({
        type: BoLocationsNamespacer(locationsAT.SET_SHOW_CHECKED_IN_EMPLOYEES_SCREEN),
        payload: value,
      });

      if (!value) {
        dispatch({
          type: BoLocationsNamespacer(locationsAT.REFRESH_ACTIVE_LOCATION_DETAILS),
          payload: true,
        });
      }
    },
    onFetchCheckedInEmployees: async (locationID) => {
      try {
        dispatch({
          type: BoLocationsNamespacer(locationsAT.FETCH_CHECKED_IN_EMPLOYEES_STARTED),
        });

        const checkedInEmployeesList = await TeamMembers.fetchCheckedInEmployees(
          locationID
        );

        dispatch({
          type: BoLocationsNamespacer(locationsAT.FETCH_CHECKED_IN_EMPLOYEES_SUCCESS),
          payload: checkedInEmployeesList.data.fullnames,
        });
      } catch (error) {
        dispatch({
          type: BoLocationsNamespacer(locationsAT.FETCH_CHECKED_IN_EMPLOYEES_FAILURE),
          payload: error?.response?.data?.error || error.message,
        });
      }
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CheckedInEmployees);
