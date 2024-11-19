import {connect} from "react-redux";
import ServiceModifiers from "../components/business-owner/global-settings/services/service-modifiers";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";
import {
  fetchModifiersList,
  toggleModifierIsFeatured as toggleModifier,
} from "../api/business-owner/services";

const servicesAT = actionTypes.businessOwner.globalSettings.services;
const servicesNamespacer = createNamespacer("BO-SERVICES");

const mapStateToProps = (state) => {
  const {
    businessOwner: {
      globalSettings: {
        services: {
          showAddModifierScreen,
          modifiersListCallInProgress,
          modifiersCallError,
          modifiers,
          modifiersRefresh,
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
    modifiersRefresh,
    activeServiceId,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    showHideAddModifierScreen: (value, isUpdate) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SHOW_HIDE_ADD_MODIFIER_SCREEN),
        payload: value,
        isUpdate,
      });
    },

    fetchModifiers: async (serviceId) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_MODIFIERS_CALL_PROGRESS),
        payload: true,
      });

      try {
        const response = await fetchModifiersList(serviceId);

        dispatch({
          type: servicesNamespacer(servicesAT.SET_MODIFIERS_LIST),
          payload: response.data.modifiers,
        });
        dispatch({
          type: servicesNamespacer(servicesAT.SET_MODIFIERS_CALL_ERROR),
          payload: "",
        });
      } catch (e) {
        dispatch({
          type: servicesNamespacer(servicesAT.SET_MODIFIERS_CALL_ERROR),
          payload: e?.response?.data?.error || "Something went wrong!",
        });
      } finally {
        dispatch({
          type: servicesNamespacer(servicesAT.SET_MODIFIERS_CALL_PROGRESS),
          payload: false,
        });
      }
    },

    toggleModifierIsFeatured: async ({isFeatured, serviceModifierId}) => {
      try {
        await toggleModifier({isFeatured, serviceModifierId});
        dispatch({
          type: servicesNamespacer(servicesAT.TOGGLE_MODIFIER_IS_FEATURED),
          payload: {isFeatured, serviceModifierId},
        });
      } catch (e) {
        dispatch({
          type: servicesNamespacer(servicesAT.TOGGLE_MODIFIER_ERROR),
          payload: e?.response?.data || {error: "Something went wrong!"},
        });
      }
    },

    clearModifiers: () => {
      dispatch({
        type: servicesNamespacer(servicesAT.CLEAR_MODIFIERS),
      });
    },

    setUpdateValues: ({name, price, modifierId}) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_UPDATE_VALUES),
        payload: {name, price, modifierId},
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ServiceModifiers);
