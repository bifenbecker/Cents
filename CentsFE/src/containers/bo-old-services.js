import {connect} from "react-redux";
import OldServices from "../components/business-owner/global-settings/legacy_services/oldServices";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";
import {
  fetchAllServices,
  getServicesCategoryList,
  createNewModifier,
  updateExistingModifier,
  archieveService,
} from "../api/business-owner/services";
import _ from "lodash";

const mapStateToProps = (state) => {
  let mapped = {
    ...state.businessOwner.globalSettings.oldServices,
  };
  // delete mapped.activeServiceDetails
  delete mapped.newServicePriceItems;
  return mapped;
};

let oldServicesNameSpacer = createNamespacer("BO-LEGACY-SERVICES");
let oldServicesAT = actionTypes.businessOwner.globalSettings.oldServices;

const fetchServices = async (dispatch, params) => {
  try {
    dispatch({
      type: oldServicesNameSpacer(oldServicesAT.SET_SERVICES_CALL_PROGRESS),
      payload: true,
    });

    const response = await fetchAllServices(params);
    const catList = await getServicesCategoryList();

    dispatch({
      type: oldServicesNameSpacer(oldServicesAT.SET_ALL_SERVICES),
      payload: response.data,
    });

    dispatch({
      type: oldServicesNameSpacer(oldServicesAT.SET_SERVICES_CATEGORY_LIST),
      payload: catList.data,
    });

    dispatch({
      type: oldServicesNameSpacer(oldServicesAT.SET_SERVICES_CALL_PROGRESS),
      payload: false,
    });

    dispatch({
      type: oldServicesNameSpacer(oldServicesAT.SET_SERVICES_ERROR),
      payload: "",
    });

    dispatch({
      type: oldServicesNameSpacer(oldServicesAT.SET_ARCHIVE_ERROR),
      payload: "",
    });
  } catch (error) {
    dispatch({
      type: oldServicesNameSpacer(oldServicesAT.SET_SERVICES_ERROR),
      payload: _.get(error, "response.data.error", "Something went wrong."),
    });

    dispatch({
      type: oldServicesNameSpacer(oldServicesAT.SET_SERVICES_CALL_PROGRESS),
      payload: false,
    });
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllServicesList: (params) => {
      fetchServices(dispatch, params);
    },

    setActiveService: async (id) => {
      dispatch({
        type: oldServicesNameSpacer(oldServicesAT.SET_ACTIVE_SERVICE),
        payload: id,
      });
    },

    handleServiceSearch: async (searchText) => {
      dispatch({
        type: oldServicesNameSpacer(oldServicesAT.SET_SERVICE_SEARCH_TEXT),
        payload: searchText,
      });
    },

    showHideNewServiceWizard: (value) => {
      dispatch({
        type: oldServicesNameSpacer(oldServicesAT.SET_SHOW_NEW_SERVICE_WIZARD),
        payload: value,
      });
    },

    setActiveRoundedTab: (tab) => {
      dispatch({
        type: oldServicesNameSpacer(oldServicesAT.SET_ACTIVE_ROUNDED_TAB),
        payload: tab,
      });
    },

    setSearchInProgress: (value) => {
      dispatch({
        type: oldServicesNameSpacer(oldServicesAT.SET_SEARCH_IN_PROGRESS),
        payload: value,
      });
    },

    handleTabChange: (tab) => {
      dispatch({
        type: oldServicesNameSpacer(oldServicesAT.SET_ACTIVE_TAB),
        payload: tab,
      });
    },

    showHideAddModifierScreen: (value, isUpdate) => {
      dispatch({
        type: oldServicesNameSpacer(oldServicesAT.SHOW_HIDE_ADD_MODIFIER_SCREEN),
        payload: value,
        isUpdate,
      });
    },

    setArchiveError: (value) => {
      dispatch({
        type: oldServicesNameSpacer(oldServicesAT.SET_ARCHIVE_ERROR),
        payload: value,
      });
    },

    archiveService: async (serviceId, params) => {
      try {
        await archieveService(serviceId);
      } catch (error) {
        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_ARCHIVE_ERROR),
          payload: error?.response?.data?.error || "Something went wrong!",
        });
      }
      fetchServices(dispatch, params);
    },

    createOrUpdateModifier: async (requestPayload, isUpdate) => {
      dispatch({
        type: oldServicesNameSpacer(oldServicesAT.SET_CREATE_MODIFIER_CALL_PROGRESS),
        payload: true,
      });
      try {
        let response;
        if (isUpdate) {
          response = await updateExistingModifier(requestPayload);
        } else {
          response = await createNewModifier(requestPayload);
        }
        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_CREATE_MODIFIER_CALL_ERROR),
          payload: "",
        });

        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SHOW_HIDE_ADD_MODIFIER_SCREEN),
          payload: false,
          isUpdate: false,
        });
      } catch (e) {
        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_CREATE_MODIFIER_CALL_ERROR),
          payload: e?.response?.data?.error || "Something went wrong!",
        });
      } finally {
        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_CREATE_MODIFIER_CALL_PROGRESS),
          payload: false,
        });
      }
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(OldServices);
