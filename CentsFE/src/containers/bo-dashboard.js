import {connect} from "react-redux";
import actionTypes from "../actionTypes";
import {createNamespacer} from "../utils/reducers";
import BoDashboard from "../components/business-owner/dashboard";
import * as locationsApi from "../api/business-owner/locations";
import _ from "lodash";
import {ROLES} from "../constants";
import {getParsedLocalStorageData} from "../utils/functions";
import {SESSION_ENV_KEY} from "../utils/config";

const boDashboardNameSpacer = createNamespacer("BUSINESS_OWNER_DASHBOARD");

const ordersAT = actionTypes.businessOwner.orders;
const ordersNamespacer = createNamespacer("BO-ORDERS");

const mapStateToProps = (state) => ({
  dashboard: state.businessOwner.dashboard,
});

const mapDispatchToProps = (dispatch) => ({
  fetchLocations: async () => {
    const isOwner = getParsedLocalStorageData(SESSION_ENV_KEY)?.roleName === ROLES.owner;
    try {
      dispatch({
        type: boDashboardNameSpacer(
          actionTypes.businessOwner.dashboard.SET_LOCATION_CALL_PROGRESS
        ),
        payload: true,
      });
      const regionsPromise = locationsApi.fetchRegions();
      const locationsPromise = isOwner
        ? locationsApi.fetchLocations()
        : locationsApi.fetchAssignedLocations();

      const [regionsResp, locationsResp] = await Promise.all([
        regionsPromise,
        locationsPromise,
      ]);

      dispatch({
        type: boDashboardNameSpacer(
          actionTypes.businessOwner.dashboard.SET_ALL_LOCATIONS
        ),
        payload: {
          locations: _.get(
            locationsResp,
            isOwner ? "data.allLocations" : "data.assignedLocations",
            []
          ),
          regions: _.get(regionsResp, "data.regions", []),
          storesWithoutRegions: _.get(regionsResp, "data.stores", []),
          needsRegions: _.get(locationsResp, "data.needsRegions"),
          isOwner,
        },
      });
      dispatch({
        type: boDashboardNameSpacer(
          actionTypes.businessOwner.dashboard.SET_IS_LOCATIONS_EMPTY
        ),
        payload: false,
      });

      dispatch({
        type: boDashboardNameSpacer(
          actionTypes.businessOwner.dashboard.SET_LOCATIONS_ERROR
        ),
        payload: "",
      });
      dispatch({
        type: boDashboardNameSpacer(
          actionTypes.businessOwner.dashboard.SET_LOCATION_CALL_PROGRESS
        ),
        payload: false,
      });
    } catch (error) {
      dispatch({
        type: boDashboardNameSpacer(
          actionTypes.businessOwner.dashboard.SET_LOCATIONS_ERROR
        ),
        payload: error.message,
      });
      dispatch({
        type: boDashboardNameSpacer(
          actionTypes.businessOwner.dashboard.SET_LOCATION_CALL_PROGRESS
        ),
        payload: false,
      });
    }
  },

  handleLocationChange: (location) => {
    dispatch({
      type: boDashboardNameSpacer(
        actionTypes.businessOwner.dashboard.SET_SELECTED_LOCATION
      ),
      payload: location,
    });
    dispatch({
      type: ordersNamespacer(ordersAT.SET_ACTIVE_STATUS),
      payload: "active",
    });
  },

  handleLocationsChange: (locationArray) => {
    dispatch({
      type: boDashboardNameSpacer(
        actionTypes.businessOwner.dashboard.SET_SELECTED_LOCATIONS
      ),
      payload: locationArray,
    });
  },

  resetDashboard: () => {
    dispatch({
      type: boDashboardNameSpacer(
        actionTypes.businessOwner.dashboard.RESET_DASHBOARD_DATA
      ),
    });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(BoDashboard);
