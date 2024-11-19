import {connect} from "react-redux";
import Services from "../components/business-owner/global-settings/services/services";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";
import {
  getServicesCategoryList,
  createNewModifier,
  updateExistingModifier,
  archieveService,
  getPricingStructure,
  fetchServiceCategoriesForService,
  fetchServiceCategories,
  createOrUpdateNewServiceSubcategory,
  updateServiceDetails,
  fetchServiceDetails,
} from "../api/business-owner/services";
import _ from "lodash";

const servicesAT = actionTypes.businessOwner.globalSettings.services;
const servicesNamespacer = createNamespacer("BO-SERVICES");

const mapStateToProps = (state) => {
  let mapped = {
    ...state.businessOwner.globalSettings.services,
  };
  // delete mapped.activeServiceDetails
  delete mapped.newServicePriceItems;
  return mapped;
};

const fetchServices = async (dispatch, params) => {
  try {
    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_CALL_PROGRESS),
      payload: true,
    });

    const response = await fetchServiceCategories(params);
    const catList = await getServicesCategoryList();

    dispatch({
      type: servicesNamespacer(servicesAT.SET_ALL_SERVICES),
      payload: response?.data?.categories[1] || {},
    });

    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_CATEGORY_LIST),
      payload: catList.data,
    });

    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_CALL_PROGRESS),
      payload: false,
    });

    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_ERROR),
      payload: "",
    });

    dispatch({
      type: servicesNamespacer(servicesAT.SET_ARCHIVE_ERROR),
      payload: "",
    });
  } catch (error) {
    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_ERROR),
      payload: _.get(error, "response.data.error", "Something went wrong."),
    });

    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_CALL_PROGRESS),
      payload: false,
    });
  }
};

const addNewCategory = async (serviceDetails, dispatch) => {
  let errorFrom;
  try {
    dispatch({
      type: servicesNamespacer(servicesAT.SET_NEW_SERVICE_CALL_PROGRESS),
      payload: true,
    });
    errorFrom = "create-category";
    const responseFromCreateNewSubcategory = await createOrUpdateNewServiceSubcategory(
      serviceDetails
    );
    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_CALL_PROGRESS),
      payload: true,
    });
    dispatch({
      type: servicesNamespacer(servicesAT.SET_NEW_CATEGORY_ID),
      payload: responseFromCreateNewSubcategory?.data?.category?.id,
    });
    errorFrom = "get-category";
    const responseFromFetchAllServices = await fetchServiceCategoriesForService(2);
    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_CALL_PROGRESS),
      payload: false,
    });

    dispatch({
      type: servicesNamespacer(servicesAT.SET_NEW_SERVICE_CALL_PROGRESS),
      payload: false,
    });
    dispatch({
      type: servicesNamespacer(servicesAT.UPDATE_SERVICE_CATEGORY),
      payload: responseFromFetchAllServices?.data?.categories,
    });

    dispatch({
      type: servicesNamespacer(servicesAT.SET_NEW_SERVICE_ERROR),
      payload: "",
    });

    dispatch({
      type: servicesNamespacer(servicesAT.SET_SHOW_NEW_CATEGORY_SCREEN_IN_DETAILS),
      payload: false,
    });
  } catch (error) {
    if (errorFrom === "create-category") {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_NEW_SERVICE_ERROR),
        payload: _.get(error, "response.data.error", "Something went wrong in the get."),
      });
    } else if (errorFrom === "get-category") {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_SERVICES_ERROR),
        payload: _.get(
          error,
          "response.data.error",
          "Something went wrong in the set section."
        ),
      });
    }

    dispatch({
      type: servicesNamespacer(servicesAT.SET_NEW_SERVICE_CALL_PROGRESS),
      payload: false,
    });
  }
};

const updateServices = async (dispatch) => {
  try {
    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_CALL_PROGRESS),
      payload: true,
    });
    const catList = await fetchServiceCategories();
    dispatch({
      type: servicesNamespacer(servicesAT.UPDATE_SERVICE_LIST),
      payload: catList.data,
    });

    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_CATEGORY_LIST),
      payload: catList.data,
    });

    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_CALL_PROGRESS),
      payload: false,
    });

    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_ERROR),
      payload: "",
    });

    dispatch({
      type: servicesNamespacer(servicesAT.SET_ARCHIVE_ERROR),
      payload: "",
    });
  } catch (error) {
    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_ERROR),
      payload: _.get(error, "response.data.error", "Something went wrong."),
    });

    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_CALL_PROGRESS),
      payload: false,
    });
  }
};

const fetchPrices = async (dispatch) => {
  try {
    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_CALL_PROGRESS),
      payload: true,
    });
    const prices = await getPricingStructure();
    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_PRICING_TYPES),
      payload: prices,
    });
    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_CALL_PROGRESS),
      payload: false,
    });
    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_ERROR),
      payload: "",
    });
  } catch (error) {
    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_ERROR),
      payload: _.get(error, "response.data.error", "Something went wrong."),
    });

    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_CALL_PROGRESS),
      payload: false,
    });
  }
};

const fetchNewServices = async (dispatch) => {
  try {
    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_CALL_PROGRESS),
      payload: true,
    });
    const catList = await fetchServiceCategories();
    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_TOP_LEVEL_STATE),
      payload: catList.data,
    });

    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_CALL_PROGRESS),
      payload: false,
    });

    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_ERROR),
      payload: "",
    });
  } catch (error) {
    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_ERROR),
      payload: _.get(error, "response.data.error", "Something went wrong."),
    });

    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_CALL_PROGRESS),
      payload: false,
    });
  }
};

const fetchCategoriesForServices = async (dispatch, id) => {
  try {
    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_CALL_PROGRESS),
      payload: true,
    });
    const services = await fetchServiceCategoriesForService(id);
    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICE_CATEGORY),
      payload: services,
    });
    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_CALL_PROGRESS),
      payload: false,
    });
    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_ERROR),
      payload: "",
    });
  } catch (error) {
    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_ERROR),
      payload: _.get(error, "response.data.error", "Something went wrong."),
    });

    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICES_CALL_PROGRESS),
      payload: false,
    });
  }
};

const fetchUpdatedServiceDetails = async (dispatch, serviceId) => {
  dispatch({
    type: servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_CALL_IN_PROGRESS),
    payload: true,
  });
  try {
    let response = await fetchServiceDetails(serviceId);
    dispatch({
      type: servicesNamespacer(servicesAT.SET_ACTIVE_SERVICE_DETAILS),
      payload: response.data,
    });
    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_CALL_IN_PROGRESS),
      payload: false,
    });
  } catch (e) {
    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_ERROR),
      payload: _.get(e, "response.data.error", "Something went wrong"),
    });
    dispatch({
      type: servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_CALL_IN_PROGRESS),
      payload: false,
    });
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllServicesList: (params) => {
      fetchServices(dispatch, params);
    },

    fetchPricesStructure: () => {
      fetchPrices(dispatch);
    },

    fetchAllNewServicesList: () => {
      fetchNewServices(dispatch);
    },
    fetchCategoriesForServices: async (id) => {
      fetchCategoriesForServices(dispatch, id);
    },
    updateServices: () => {
      updateServices(dispatch);
    },
    addNewCategory: (serviceDetails) => {
      addNewCategory(serviceDetails, dispatch);
    },
    setActiveService: async (id) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_ACTIVE_SERVICE),
        payload: id,
      });
    },

    handleServiceSearch: async (searchText) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_SERVICE_SEARCH_TEXT),
        payload: searchText,
      });
    },

    handleNewServiceSearch: async (searchText) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_CENTS20_SERVICE_SEARCH_TEXT),
        payload: searchText,
      });
    },

    showHideNewServiceWizard: (value) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_SHOW_NEW_SERVICE_WIZARD),
        payload: value,
      });
    },

    setActiveRoundedTab: (tab) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_ACTIVE_ROUNDED_TAB),
        payload: tab,
      });
    },

    setSearchInProgress: (value) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_SEARCH_IN_PROGRESS),
        payload: value,
      });
    },

    handleTabChange: (tab) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_ACTIVE_TAB),
        payload: tab,
      });
    },

    showHideAddModifierScreen: (value, isUpdate) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SHOW_HIDE_ADD_MODIFIER_SCREEN),
        payload: value,
        isUpdate,
      });
    },

    setArchiveError: (value) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_ARCHIVE_ERROR),
        payload: value,
      });
    },

    archiveService: async (serviceId, params) => {
      try {
        await archieveService(serviceId);
      } catch (error) {
        dispatch({
          type: servicesNamespacer(servicesAT.SET_ARCHIVE_ERROR),
          payload: error?.response?.data?.error || "Something went wrong!",
        });
      }
      fetchUpdatedServiceDetails(dispatch, serviceId);
      fetchServices(dispatch, params);
    },

    createOrUpdateModifier: async (requestPayload, isUpdate) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_CREATE_MODIFIER_CALL_PROGRESS),
        payload: true,
      });
      try {
        if (isUpdate) {
          updateExistingModifier(requestPayload);
        } else {
          createNewModifier(requestPayload);
          dispatch({
            type: servicesNamespacer(servicesAT.SET_MODIFIER_REFRESH),
            payload: true,
          });
        }
        dispatch({
          type: servicesNamespacer(servicesAT.SET_CREATE_MODIFIER_CALL_ERROR),
          payload: "",
        });

        dispatch({
          type: servicesNamespacer(servicesAT.SHOW_HIDE_ADD_MODIFIER_SCREEN),
          payload: false,
          isUpdate: false,
        });
      } catch (e) {
        dispatch({
          type: servicesNamespacer(servicesAT.SET_CREATE_MODIFIER_CALL_ERROR),
          payload: e?.response?.data?.error || "Something went wrong!",
        });
      } finally {
        dispatch({
          type: servicesNamespacer(servicesAT.SET_MODIFIER_REFRESH),
          payload: false,
        });
        dispatch({
          type: servicesNamespacer(servicesAT.SET_CREATE_MODIFIER_CALL_PROGRESS),
          payload: false,
        });
      }
    },
    setServicesCategories: (categories) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_SERVICES_CATEGORIES),
        payload: categories,
      });
    },

    setServicesSubcategories: (subservices) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_SERVICES_SUBSERVICES),
        payload: subservices,
      });
    },
    setCategoriesBasedOnDropdown: (services) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_ALL_SERVICES),
        payload: services,
      });
    },
    handleShowNewCategoryScreenInDetails: (value) => {
      dispatch({
        type: servicesNamespacer(servicesAT.SET_SHOW_NEW_CATEGORY_SCREEN_IN_DETAILS),
        payload: value,
      });
    },
    handleFieldChange: (id, field, value) => {
      dispatch({
        type: servicesNamespacer(servicesAT.UPDATE_ACTIVE_SERVICE_DETAIL),
        payload: {
          field,
          value,
        },
      });
    },
    handleSave: async (data, currentSearchText, searchInProgress) => {
      try {
        dispatch({
          type: servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_UPDATE_IN_PROGRESS),
          payload: true,
        });

        let processedData = {
          id: data.id,
          name: data.name,
          description: data.description,
          serviceCategoryId: data.serviceCategoryId,
          hasMinPrice: data.hasMinPrice,
          servicePricingStructureId: data.servicePricingStructureId,
          subcategory: data.subcategory,
        };
        let resp = await updateServiceDetails(processedData);
        dispatch({
          type: servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_UPDATED_ID),
          payload: _.get(resp, "data.service", {}),
        });

        if (searchInProgress) {
          dispatch({
            type: servicesNamespacer(servicesAT.SET_SERVICE_SEARCH_TEXT),
            payload: currentSearchText,
          });
        }

        dispatch({
          type: servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_UPDATE_IN_PROGRESS),
          payload: false,
        });
        dispatch({
          type: servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_UPDATE_ERROR),
          payload: "",
        });
      } catch (e) {
        // Handle error
        dispatch({
          type: servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_UPDATE_ERROR),
          payload: _.get(e, "response.data.error", "Something went wrong"),
        });
        dispatch({
          type: servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_UPDATE_IN_PROGRESS),
          payload: false,
        });
      }
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Services);
