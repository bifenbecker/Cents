import {connect} from "react-redux";
import Drycleaning from "../components/business-owner/global-settings/productsandservices/dry-cleaning/drycleaning";
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
  fetchServiceDetails,
} from "../api/business-owner/drycleaning";
// import {fetchServiceCategories} from "../api/business-owner/drycleaning";
import _ from "lodash";

const drycleaningServicesAT = actionTypes.businessOwner.globalSettings.drycleaning;
const drycleaningServicesNamespacer = createNamespacer("BO-DRYCLEANING");

const mapStateToProps = (state) => {
  let mapped = {
    ...state.businessOwner.globalSettings.drycleaning,
  };
  // delete mapped.activeServiceDetails
  delete mapped.newServicePriceItems;
  return mapped;
};

const fetchServices = async (dispatch, params) => {
  try {
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CALL_PROGRESS
      ),
      payload: true,
    });

    const response = await fetchServiceCategories(params);
    const catList = await getServicesCategoryList();

    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_ALL_DRYCLEANING_SERVICES
      ),
      payload: response?.data?.categories[0],
    });

    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CATEGORY_LIST
      ),
      payload: catList.data,
    });

    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CALL_PROGRESS
      ),
      payload: false,
    });

    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_ERROR
      ),
      payload: "",
    });

    dispatch({
      type: drycleaningServicesNamespacer(drycleaningServicesAT.SET_ARCHIVE_ERROR),
      payload: "",
    });
  } catch (error) {
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_ERROR
      ),
      payload: _.get(error, "response.data.error", "Something went wrong."),
    });

    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CALL_PROGRESS
      ),
      payload: false,
    });
  }
};

const updateServices = async (dispatch) => {
  try {
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CALL_PROGRESS
      ),
      payload: true,
    });
    const catList = await fetchServiceCategories();
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.UPDATE_DRYCLEANING_SERVICE_LIST
      ),
      payload: catList.data,
    });

    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CATEGORY_LIST
      ),
      payload: catList.data,
    });

    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CALL_PROGRESS
      ),
      payload: false,
    });

    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_ERROR
      ),
      payload: "",
    });

    dispatch({
      type: drycleaningServicesNamespacer(drycleaningServicesAT.SET_ARCHIVE_ERROR),
      payload: "",
    });
  } catch (error) {
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_ERROR
      ),
      payload: _.get(error, "response.data.error", "Something went wrong."),
    });

    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CALL_PROGRESS
      ),
      payload: false,
    });
  }
};

const fetchPrices = async (dispatch) => {
  try {
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CALL_PROGRESS
      ),
      payload: true,
    });
    const prices = await getPricingStructure();
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_PRICING_TYPES
      ),
      payload: prices,
    });
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CALL_PROGRESS
      ),
      payload: false,
    });
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_ERROR
      ),
      payload: "",
    });
  } catch (error) {
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_ERROR
      ),
      payload: _.get(error, "response.data.error", "Something went wrong."),
    });

    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CALL_PROGRESS
      ),
      payload: false,
    });
  }
};

const fetchNewServices = async (dispatch) => {
  try {
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CALL_PROGRESS
      ),
      payload: true,
    });
    const catList = await fetchServiceCategories();

    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_TOP_LEVEL_STATE
      ),
      payload: catList.data,
    });

    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CALL_PROGRESS
      ),
      payload: false,
    });

    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_ERROR
      ),
      payload: "",
    });
  } catch (error) {
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_ERROR
      ),
      payload: _.get(error, "response.data.error", "Something went wrong."),
    });

    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CALL_PROGRESS
      ),
      payload: false,
    });
  }
};

const fetchCategoriesForServices = async (dispatch, id) => {
  try {
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CALL_PROGRESS
      ),
      payload: true,
    });
    const services = await fetchServiceCategoriesForService(id);
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICE_CATEGORY
      ),
      payload: services,
    });
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CALL_PROGRESS
      ),
      payload: false,
    });
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_ERROR
      ),
      payload: "",
    });
  } catch (error) {
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_ERROR
      ),
      payload: _.get(error, "response.data.error", "Something went wrong."),
    });

    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CALL_PROGRESS
      ),
      payload: false,
    });
  }
};

const addNewCategory = async (serviceDetails, dispatch) => {
  let errorFrom;
  try {
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_CALL_PROGRESS
      ),
      payload: true,
    });
    errorFrom = "create-category";
    const responseFromCreateNewSubcategory = await createOrUpdateNewServiceSubcategory(
      serviceDetails
    );
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CALL_PROGRESS
      ),
      payload: true,
    });
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_NEW_DRYCLEANING_CATEGORY_ID
      ),
      payload: responseFromCreateNewSubcategory?.data?.category?.id,
    });
    errorFrom = "get-category";
    const responseFromFetchAllServices = await fetchServiceCategoriesForService(1);
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CALL_PROGRESS
      ),
      payload: false,
    });

    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_CALL_PROGRESS
      ),
      payload: false,
    });
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.UPDATE_DRYCLEANING_SERVICE_CATEGORY
      ),
      payload: responseFromFetchAllServices?.data?.categories,
    });

    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_ERROR
      ),
      payload: "",
    });

    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_SHOW_NEW_CATEGORY_SCREEN_IN_DETAILS
      ),
      payload: false,
    });
  } catch (error) {
    if (errorFrom === "create-category") {
      dispatch({
        type: drycleaningServicesNamespacer(
          drycleaningServicesAT.SET_DRYCLEANING_SERVICES_ERROR
        ),
        payload: _.get(error, "response.data.error", "Something went wrong in the get."),
      });
    } else if (errorFrom === "get-category") {
      dispatch({
        type: drycleaningServicesNamespacer(
          drycleaningServicesAT.SET_DRYCLEANING_SERVICES_ERROR
        ),
        payload: _.get(
          error,
          "response.data.error",
          "Something went wrong in the set section."
        ),
      });
    }
    dispatch({
      type: drycleaningServicesAT(
        drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_CALL_PROGRESS
      ),
      payload: false,
    });
  }
};

const fetchDryCleaningServiceDetails = async (dispatch, serviceId) => {
  dispatch({
    type: drycleaningServicesNamespacer(
      drycleaningServicesAT.SET_DRYCLEANING_SERVICE_DETAILS_CALL_IN_PROGRESS
    ),
    payload: true,
  });
  try {
    let response = await fetchServiceDetails(serviceId);
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_ACTIVE_DRYCLEANING_SERVICE_DETAILS
      ),
      payload: response.data,
    });
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICE_DETAILS_CALL_IN_PROGRESS
      ),
      payload: false,
    });
  } catch (e) {
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICE_DETAILS_ERROR
      ),
      payload: _.get(e, "response.data.error", "Something went wrong"),
    });
    dispatch({
      type: drycleaningServicesNamespacer(
        drycleaningServicesAT.SET_DRYCLEANING_SERVICE_DETAILS_CALL_IN_PROGRESS
      ),
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
        type: drycleaningServicesNamespacer(
          drycleaningServicesAT.SET_ACTIVE_DRYCLEANING_SERVICE
        ),
        payload: id,
      });
    },

    handleServiceSearch: async (searchText) => {
      dispatch({
        type: drycleaningServicesNamespacer(
          drycleaningServicesAT.SET_DRYCLEANING_SERVICE_SEARCH_TEXT
        ),
        payload: searchText,
      });
    },

    showHideNewServiceWizard: (value) => {
      dispatch({
        type: drycleaningServicesNamespacer(
          drycleaningServicesAT.SET_SHOW_DRYCLEANING_NEW_SERVICE_WIZARD
        ),
        payload: value,
      });
    },

    setActiveRoundedTab: (tab) => {
      dispatch({
        type: drycleaningServicesNamespacer(drycleaningServicesAT.SET_ACTIVE_ROUNDED_TAB),
        payload: tab,
      });
    },

    setSearchInProgress: (value) => {
      dispatch({
        type: drycleaningServicesNamespacer(drycleaningServicesAT.SET_SEARCH_IN_PROGRESS),
        payload: value,
      });
    },

    handleTabChange: (tab) => {
      dispatch({
        type: drycleaningServicesNamespacer(drycleaningServicesAT.SET_ACTIVE_TAB),
        payload: tab,
      });
    },

    showHideAddModifierScreen: (value, isUpdate) => {
      dispatch({
        type: drycleaningServicesNamespacer(
          drycleaningServicesAT.SHOW_HIDE_ADD_MODIFIER_SCREEN
        ),
        payload: value,
        isUpdate,
      });
    },

    setArchiveError: (value) => {
      dispatch({
        type: drycleaningServicesNamespacer(drycleaningServicesAT.SET_ARCHIVE_ERROR),
        payload: value,
      });
    },

    archiveService: async (serviceId, params) => {
      try {
        await archieveService(serviceId);
      } catch (error) {
        dispatch({
          type: drycleaningServicesNamespacer(drycleaningServicesAT.SET_ARCHIVE_ERROR),
          payload: error?.response?.data?.error || "Something went wrong!",
        });
      }
      fetchDryCleaningServiceDetails(dispatch, serviceId);
      fetchServices(dispatch, params);
    },

    createOrUpdateModifier: async (requestPayload, isUpdate) => {
      dispatch({
        type: drycleaningServicesNamespacer(
          drycleaningServicesAT.SET_CREATE_MODIFIER_CALL_PROGRESS
        ),
        payload: true,
      });
      try {
        if (isUpdate) {
          await updateExistingModifier(requestPayload);
        } else {
          await createNewModifier(requestPayload);
        }
        dispatch({
          type: drycleaningServicesNamespacer(
            drycleaningServicesAT.SET_CREATE_MODIFIER_CALL_ERROR
          ),
          payload: "",
        });

        dispatch({
          type: drycleaningServicesNamespacer(
            drycleaningServicesAT.SHOW_HIDE_ADD_MODIFIER_SCREEN
          ),
          payload: false,
          isUpdate: false,
        });
      } catch (e) {
        dispatch({
          type: drycleaningServicesNamespacer(
            drycleaningServicesAT.SET_CREATE_MODIFIER_CALL_ERROR
          ),
          payload: e?.response?.data?.error || "Something went wrong!",
        });
      } finally {
        dispatch({
          type: drycleaningServicesNamespacer(
            drycleaningServicesAT.SET_CREATE_MODIFIER_CALL_PROGRESS
          ),
          payload: false,
        });
      }
    },
    setServicesCategories: (categories) => {
      dispatch({
        type: drycleaningServicesNamespacer(
          drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CATEGORIES
        ),
        payload: categories,
      });
    },

    setServicesSubcategories: (subservices) => {
      dispatch({
        type: drycleaningServicesNamespacer(
          drycleaningServicesAT.SET_DRYCLEANING_SERVICES_SUBSERVICES
        ),
        payload: subservices,
      });
    },
    handleShowNewCategoryScreenInDetails: (value) => {
      dispatch({
        type: drycleaningServicesNamespacer(
          drycleaningServicesAT.SET_SHOW_NEW_CATEGORY_SCREEN_IN_DETAILS
        ),
        payload: value,
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Drycleaning);
