import {connect} from "react-redux";
import ServiceModifiers from "../components/business-owner/global-settings/legacy_services/service-modifiers";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";
import {
  fetchModifiersList,
  toggleModifierIsFeatured as toggleModifier,
} from "../api/business-owner/services";

let oldServicesNameSpacer = createNamespacer("BO-LEGACY-SERVICES");
let oldServicesAT = actionTypes.businessOwner.globalSettings.oldServices;

const mapStateToProps = (state) => {
  const {
    businessOwner: {
      globalSettings: {
        oldServices: {
          showAddModifierScreen,
          modifiersListCallInProgress,
          modifiersCallError,
          modifiers,
          activeServiceId,
        },
      },
    },
  } = state;
  return {
    showAddModifierScreen,
    modifiersListCallInProgress,
    modifiersCallError,
    modifiers,
    activeServiceId,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    showHideAddModifierScreen: (value, isUpdate) => {
      dispatch({
        type: oldServicesNameSpacer(oldServicesAT.SHOW_HIDE_ADD_MODIFIER_SCREEN),
        payload: value,
        isUpdate,
      });
    },

    fetchModifiers: async (serviceId) => {
      dispatch({
        type: oldServicesNameSpacer(oldServicesAT.SET_MODIFIERS_CALL_PROGRESS),
        payload: true,
      });

      try {
        const response = await fetchModifiersList(serviceId);

        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_MODIFIERS_LIST),
          payload: response.data.modifiers,
        });
        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_MODIFIERS_CALL_ERROR),
          payload: "",
        });
      } catch (e) {
        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_MODIFIERS_CALL_ERROR),
          payload: e?.response?.data?.error || "Something went wrong!",
        });
      } finally {
        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.SET_MODIFIERS_CALL_PROGRESS),
          payload: false,
        });
      }
    },

    toggleModifierIsFeatured: async ({isFeatured, serviceModifierId}) => {
      try {
        await toggleModifier({isFeatured, serviceModifierId});
        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.TOGGLE_MODIFIER_IS_FEATURED),
          payload: {isFeatured, serviceModifierId},
        });
      } catch (e) {
        dispatch({
          type: oldServicesNameSpacer(oldServicesAT.TOGGLE_MODIFIER_ERROR),
          payload: e?.response?.data || {error: "Something went wrong!"},
        });
      }
    },

    clearModifiers: () => {
      dispatch({
        type: oldServicesNameSpacer(oldServicesAT.CLEAR_MODIFIERS),
      });
    },

    setUpdateValues: ({name, price, modifierId}) => {
      dispatch({
        type: oldServicesNameSpacer(oldServicesAT.SET_UPDATE_VALUES),
        payload: {name, price, modifierId},
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ServiceModifiers);
