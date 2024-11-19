import {createNamespacer, createReducer} from "../../../utils/reducers";
import sortBy from "lodash/sortBy";
import _ from "lodash";
import actionTypes from "../../../actionTypes";
import {servicesAndProductsTabValues} from "../../../constants";
import {curateShiftsAndTimings} from "../../../components/business-owner/global-settings/locations/utils/location";

const BoGlobalSettingsNamespacer = createNamespacer("BUSINESS_OWNER_GS_LOCATIONS");

const sortAscByName = (values) => {
  return sortBy(values, [(value) => value.name.toLowerCase()]);
};

const initialState = {
  list: [],
  needsRegions: false,
  showFullPageError: false,
  fullServiceError: "",

  selectedLocation: null, // id of the selected location

  isLocationCallInProgress: false,
  showShiftsScreen: false,
  isShiftsCallInProgress: false,
  // This will be used for holding all user changes
  selectedLocationShiftsData: null,
  // This will be set only on GET call from server
  unTouchedSelectedLocationShiftsData: null,
  selectedShiftIndex: 0,
  shiftsError: "",
  shiftsUpdateOrCreateError: "",
  districts: [],
  districtsCallInProgress: false,
  refreshLocations: false,
  regions: [],
  regionsCallInProgress: false,
  locationsWithOutHub: [],
  regionsWithOutHub: [],
  isWithOutHubCallInProgress: false,
  showServicePricesScreen: false,
  showProductPricesScreen: false,
  servicesError: "",
  isServiceCallInProgress: false,
  activeLocationServices: [],
  isLocationDetailsLoading: false,
  locationDetailsError: "",
  refreshLocationDetails: false,
  activeServicesAndProductsTab: servicesAndProductsTabValues.PER_POUND,
  servicePriceUpdateError: "",

  // Add or update Location Form And Steps
  saveLocationCallInProgress: false,
  showSaveLocationScreen: false,
  addLocationStep: 1,
  errorMessage: "",
  isEdit: false,
  newTaxRateWhileLocationCreation: null,

  // Tax related fields.
  showAddTaxScreen: false,

  // Fetch all taxes
  taxesCallInProgress: false,
  taxRatesList: [],

  // Add tax rate
  newTaxRateCallInprogress: false,
  taxErrorMessage: "",

  // Add tax rate to selected location
  taxUpdateCallInProgress: false,

  // Change processing step
  processingUpdateCallInProgress: false,

  // Toggle Menu boolean field
  showThreeDotMenuOpen: false,

  // ESD registration screen
  showEsdRegistrationScreen: false,
  esdErrorMessage: null,

  // Reset Password Screen
  showResetPasswordScreen: false,
  showPasswordForm: false,
  resetPasswordApiError: "",
  resetPasswordLoading: false,

  //Checked In Employee List
  showCheckedInEmployees: false,
  fetchCheckedInEmployeesApiError: "",
  fetchCheckedInEmployeesLoading: false,
  checkedInEmployees: [],

  // Delivery Settings
  deliveryWizard: "",
  editDeliverySettingsScreenType: "",

  deliverySettings: null,
  showDeliverySettingsScreen: false,
  deliverySettingsApiError: "",
  deliverySettingsLoading: false,
};

const handlers = {
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_LOCATION_LIST
  )]: (state, action) => {
    return {
      ...state,
      list: action.payload.allLocations,
      needsRegions: action.payload.needsRegions,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_LOCATION_ERROR
  )]: (state, action) => {
    return {
      ...state,
      showFullPageError: action.payload.showFullPageError,
      errorMessage: action.payload.errorMessage,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.RESET_LOCATION_ERROR
  )]: (state, action) => {
    return {
      ...state,
      showFullPageError: initialState.showFullPageError,
      errorMessage: initialState.errorMessage,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.APPEND_TO_LOCATION_LIST
  )]: (state, action) => {
    let updatedLocationList = state.list.slice();
    updatedLocationList.push(action.payload);
    return {
      ...state,
      list: updatedLocationList,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.UPDATE_LOCATION_LIST
  )]: (state, action) => {
    let updatedLocationList = state.list.slice();
    let updateIndex = -1;

    for (let i = 0; i < updatedLocationList.length; i++) {
      if (updatedLocationList[i].id === action.payload.id) {
        updateIndex = i;
        break;
      }
    }
    if (updateIndex > -1) {
      updatedLocationList.splice(updateIndex, 1, action.payload);
    }

    return {
      ...state,
      list: updatedLocationList,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_SELECTED_LOCATION
  )]: (state, action) => {
    return {
      ...state,
      selectedLocation: action.payload,
      showSaveLocationScreen: false,
      showShiftsScreen: false,
      showServicePricesScreen: false,

      // Delivery Settings state
      showDeliverySettingsScreen: false,
      deliverySettings: {},
      deliveryWizard: "",
      editDeliverySettingsScreenType: null,

      activeLocationServices: initialState.activeLocationServices,
      servicesError: initialState.servicesError,
      locationDetailsError: "",
      fullServiceError: "",
      showAddTaxScreen: false,
      taxErrorMessage: "",
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SHOW_CREATE_SCREEN
  )]: (state, action) => {
    return {
      ...state,
      showSaveLocationScreen: true,
      isEdit: initialState.isEdit,
      selectedLocation: initialState.selectedLocation,
      showShiftsScreen: initialState.showShiftsScreen,
      showServicePricesScreen: false,
      showAddTaxScreen: false,
      taxErrorMessage: "",
      newTaxRateWhileLocationCreation: null,
      locationDetailsError: "",
      deliverySettings: {},
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SHOW_EDIT_SCREEN
  )]: (state, action) => {
    return {
      ...state,
      showSaveLocationScreen: true,
      isEdit: true,
      showShiftsScreen: initialState.showShiftsScreen,
      showServicePricesScreen: false,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_LOCATION_LIST_PROGRESS
  )]: (state, action) => {
    return {
      ...state,
      isLocationCallInProgress: action.payload,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.RESET_FULL_LOCATION
  )]: (state, action) => {
    return Object.assign({}, initialState);
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_SHIFTS_VISIBILITY
  )]: (state, action) => {
    return {
      ...state,
      showShiftsScreen: action.payload,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_ACTIVE_SHIFT_TAB
  )]: (state, action) => {
    return {
      ...state,
      selectedShiftIndex: action.payload,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.TOGGLE_SHIFT_CHECKBOX
  )]: (state, action) => {
    let shiftsData = {...state.selectedLocationShiftsData};

    let shifts = shiftsData.shifts.slice();
    // TODO: Remove this code once API changes are done. And uncomment the below code.
    // const prevIsActiveState = shifts[action.payload.shiftIndex].timings[action.payload.dayIndex].isActive;
    // shifts[action.payload.shiftIndex].timings[action.payload.dayIndex].isActive = !prevIsActiveState

    // if (prevIsActiveState) {
    //     shifts[action.payload.shiftIndex].timings[action.payload.dayIndex].startTime = null;
    //     shifts[action.payload.shiftIndex].timings[action.payload.dayIndex].endTime = null;
    // }

    shifts[action.payload.shiftIndex].timings[action.payload.dayIndex].isActive = !shifts[
      action.payload.shiftIndex
    ].timings[action.payload.dayIndex].isActive;

    return {
      ...state,
      selectedLocationShiftsData: {...shiftsData, shifts},
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_SHIFT_TIME
  )]: (state, action) => {
    let shiftsData = {...state.selectedLocationShiftsData};

    const {shiftIndex, dayIndex, key, value} = action.payload;
    let shifts = shiftsData.shifts.slice();

    shifts[shiftIndex].timings[dayIndex][key] = value;

    return {
      ...state,
      selectedLocationShiftsData: {...shiftsData, shifts},
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.APPLY_TIMING_TO_ALL
  )]: (state, action) => {
    let shiftsData = {...state.selectedLocationShiftsData};

    let shifts = shiftsData.shifts.slice();
    let shift = shifts[action.payload.shiftIndex];

    shift.timings = action.payload.newTimings;

    shifts[action.payload.shiftIndex] = shift;

    return {
      ...state,
      selectedLocationShiftsData: {...shiftsData, shifts},
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.RESET_SHIFT
  )]: (state, action) => {
    const shiftIndex = action.payload.shiftIndex;
    const shiftsData = {...state.selectedLocationShiftsData};
    let shifts = shiftsData.shifts.slice();
    if (!shifts[shiftIndex]) {
      return {
        ...state,
      };
    }
    shifts[shiftIndex] = _.cloneDeep(
      state.unTouchedSelectedLocationShiftsData.shifts[shiftIndex]
    );

    return {
      ...state,
      selectedLocationShiftsData: {...shiftsData, shifts},
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.RESET_ALL_SHIFTS_CHANGES
  )]: (state, action) => {
    const shiftsData = {...state.selectedLocationShiftsData};
    let shifts = state.unTouchedSelectedLocationShiftsData.shifts.slice();

    return {
      ...state,
      selectedLocationShiftsData: {...shiftsData, shifts},
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_SHIFTS_CALL_IN_PROGRESS
  )]: (state, action) => {
    return {
      ...state,
      isShiftsCallInProgress: action.payload,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_SHIFTS
  )]: (state, action) => {
    const shiftsResponse = {...action.payload};

    shiftsResponse.shifts = curateShiftsAndTimings(shiftsResponse.shifts || [], {
      overlapping: true,
    });

    return {
      ...state,
      selectedLocationShiftsData: _.cloneDeep(shiftsResponse),
      unTouchedSelectedLocationShiftsData: _.cloneDeep(shiftsResponse),
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.RESET_SHIFTS_TO_INIT
  )]: (state, action) => {
    return {
      ...state,
      showShiftsScreen: action.payload,
      isShiftsCallInProgress: initialState.isShiftsCallInProgress,
      selectedLocationShiftsData: initialState.selectedLocationShiftsData,
      unTouchedSelectedLocationShiftsData:
        initialState.unTouchedSelectedLocationShiftsData,
      selectedShiftIndex: initialState.selectedShiftIndex,
      shiftsError: initialState.shiftsError,
      shiftsUpdateOrCreateError: initialState.shiftsUpdateOrCreateError,
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_SHIFTS_ERROR
  )]: (state, action) => {
    return {
      ...state,
      shiftsError: action.payload,
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_SHIFTS_UPDATE_OR_CREATE_ERROR
  )]: (state, action) => {
    return {
      ...state,
      shiftsUpdateOrCreateError: action.payload,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_DISTRICTS
  )]: (state, action) => {
    return {
      ...state,
      districts: action.payload,
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_DISTRICTS_CALL_IN_PROGRESS
  )]: (state, action) => {
    return {
      ...state,
      districtsCallInProgress: action.payload,
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_REGIONS
  )]: (state, action) => {
    return {
      ...state,
      regions: action.payload,
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_DISTRICTS_CALL_IN_PROGRESS
  )]: (state, action) => {
    return {
      ...state,
      regionsCallInProgress: action.payload,
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_REFRESH_LOCATIONS
  )]: (state, action) => {
    return {
      ...state,
      refreshLocations: action.payload,
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations
      .SET_LOCATIONS_AND_REGIONS_WITHOUT_HUB
  )]: (state, action) => {
    return {
      ...state,
      ...action.payload,
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_WITHOUT_HUB_CALL_IN_PROGRESS
  )]: (state, action) => {
    return {
      ...state,
      isWithOutHubCallInProgress: action.payload,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SHOW_SERVICE_PRICE_SCREEN
  )]: (state, action) => {
    return {
      ...state,
      showServicePricesScreen: true,
      fullServiceError: "",
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_DELIVERY_SETTINGS_CALL_PROGRESS
  )]: (state, action) => {
    return {
      ...state,
      deliverySettingsApiError: "",
      deliverySettingsLoading: action.payload,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_DELIVERY_SETTINGS
  )]: (state, action) => {
    return {
      ...state,
      deliverySettings: action.payload,
      deliverySettingsApiError: "",
      deliverySettingsLoading: false,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_DELIVERY_SETTINGS_ERROR
  )]: (state, action) => {
    return {
      ...state,
      deliverySettingsApiError: action.payload,
      deliverySettingsLoading: false,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SHOW_DELIVERY_SETTINGS_SCREEN
  )]: (state, action) => {
    return {
      ...state,
      showServicePricesScreen: false,
      showShiftsScreen: false,
      showProductPricesScreen: false,
      showDeliverySettingsScreen: true,
      fullServiceError: "",
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SHOW_DETAILS_SCREEN
  )]: (state, action) => {
    return {
      ...state,
      showServicePricesScreen: false,
      showShiftsScreen: false,
      showProductPricesScreen: false,
      showDeliverySettingsScreen: false,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SHOW_PRODUCT_PRICES_SCREEN
  )]: (state, action) => {
    return {
      ...state,
      showServicePricesScreen: false,
      showShiftsScreen: false,
      showProductPricesScreen: true,
      fullServiceError: "",
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_SERVICES_CALL_ERROR
  )]: (state, action) => {
    return {
      ...state,
      servicesError: action.payload,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_SERVICES_CALL_LOADING
  )]: (state, action) => {
    return {
      ...state,
      isServiceCallInProgress: action.payload,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_ACTIVE_LOCATION_SERVICES
  )]: (state, action) => {
    return {
      ...state,
      activeLocationServices: action.payload,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.UPDATE_SERVICE_PRICE
  )]: (state, action) => {
    let {activeLocationServices} = state;
    let {categoryId, serviceId, field, value} = action.payload;
    let categoryIndex = activeLocationServices.findIndex(
      (category) => categoryId === category.id
    );
    let category = activeLocationServices[categoryIndex];
    let serviceIndex = category.services.findIndex((service) => service.id === serviceId);
    let service = category.services[serviceIndex];
    let price = service.prices[0]; // Assuming exactly one prices comes in this array
    price[field] = value;
    activeLocationServices[categoryIndex].services[serviceIndex].prices[0] = {...price};

    return {
      ...state,
      activeLocationServices: [...activeLocationServices],
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.CLOSE_SERVICE_PRICE
  )]: (state, action) => {
    return {
      ...state,
      showServicePricesScreen: false,
      activeLocationServices: initialState.activeLocationServices,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_LOCATION_DETAILS_LOADING
  )]: (state, action) => {
    return {
      ...state,
      isLocationDetailsLoading: action.payload,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_LOCATION_DETAILS_ERROR
  )]: (state, action) => {
    return {
      ...state,
      locationDetailsError: action.payload,
      isLocationDetailsLoading: false,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.REFRESH_ACTIVE_LOCATION_DETAILS
  )]: (state, action) => {
    return {
      ...state,
      refreshLocationDetails: action.payload,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_FULL_SERVICE_LIST_ERROR
  )]: (state, action) => {
    return {
      ...state,
      fullServiceError: action.payload,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations
      .SET_SERVICES_AND_PRODUCTS_ACTIVE_TAB
  )]: (state, action) => {
    return {
      ...state,
      activeServicesAndProductsTab: action.payload,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_SERVICE_PRICES_UPDATE_ERROR
  )]: (state, action) => {
    return {
      ...state,
      servicePriceUpdateError: action.payload,
    };
  },

  // Fetch Tax Rates List

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_TAXRATES_CALL_IN_PROGRESS
  )]: (state, action) => {
    return {
      ...state,
      taxesCallInProgress: action.payload,
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_TAXES_LIST
  )]: (state, action) => {
    const taxRatesList = sortAscByName(action.payload);
    return {
      ...state,
      taxRatesList,
    };
  },

  // Add tax rate to location

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.TAX_SETTINGS_UPDATE_IN_PROGRESS
  )]: (state, action) => {
    return {
      ...state,
      taxUpdateCallInProgress: action.payload,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations
      .PROCESSING_SETTINGS_UPDATE_IN_PROGRESS
  )]: (state, action) => {
    return {
      ...state,
      processingUpdateCallInProgress: action.payload,
    };
  },

  // Three dot menu

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SHOW_THREE_DOT_MENU
  )]: (state, action) => {
    return {
      ...state,
      showThreeDotMenuOpen: action.payload,
    };
  },

  // ESD Registration Screen

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SHOW_ESD_REGISTRATION_SCREEN
  )]: (state, action) => {
    return {
      ...state,
      showEsdRegistrationScreen: action.payload,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_ESD_VALUES
  )]: (state, action) => {
    let selectedLocation = {...state.selectedLocation};
    let esdReader = selectedLocation.esdReader;
    esdReader[action.payload.field] = action.payload.value;
    return {
      ...state,
      esdReader,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_ESD_ERROR
  )]: (state, action) => {
    return {
      ...state,
      esdErrorMessage: action.payload,
    };
  },

  // Reset Password Screen

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_SHOW_RESET_PASSWORD_SCREEN
  )]: (state, action) => {
    // Whenever reset password screen is called or closed,
    // reset the entire data
    return {
      ...state,
      showResetPasswordScreen: action.payload,
      showPasswordForm: false,
      resetPasswordApiError: "",
      resetPasswordLoading: false,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_SHOW_PASSWORD_FORM
  )]: (state, action) => {
    // Whenever reset password form is called or closed,
    // reset the entire data
    return {
      ...state,
      showPasswordForm: action.payload,
      resetPasswordApiError: "",
      resetPasswordLoading: false,
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.RESET_PASSWORD_API_STARTED
  )]: (state, _action) => {
    return {
      ...state,
      resetPasswordApiError: "",
      resetPasswordLoading: true,
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.RESET_PASSWORD_API_SUCCESS
  )]: (state, _action) => {
    return {
      ...state,
      resetPasswordApiError: "",
      showPasswordForm: false,
      resetPasswordLoading: false,
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.RESET_PASSWORD_API_FAILURE
  )]: (state, action) => {
    return {
      ...state,
      resetPasswordApiError: action.payload,
      resetPasswordLoading: false,
    };
  },

  //Checked In Employee Screen

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations
      .SET_SHOW_CHECKED_IN_EMPLOYEES_SCREEN
  )]: (state, action) => {
    return {
      ...state,
      showCheckedInEmployees: action.payload,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.FETCH_CHECKED_IN_EMPLOYEES_STARTED
  )]: (state, action) => {
    return {
      ...state,
      fetchCheckedInEmployeesLoading: action.payload,
      fetchCheckedInEmployeesApiError: "",
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.FETCH_CHECKED_IN_EMPLOYEES_SUCCESS
  )]: (state, action) => {
    return {
      ...state,
      showCheckedInEmployees: true,
      checkedInEmployees: action.payload,
      fetchCheckedInEmployeesApiError: "",
      fetchCheckedInEmployeesLoading: false,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.FETCH_CHECKED_IN_EMPLOYEES_FAILURE
  )]: (state, action) => {
    return {
      ...state,
      fetchCheckedInEmployeesApiError: action.payload,
      fetchCheckedInEmployeesLoading: false,
    };
  },

  // Add Tax Rate Screen

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SHOW_HIDE_ADD_TAXRATE_SCREEN
  )]: (state, action) => {
    return {
      ...state,
      showAddTaxScreen: action.payload,
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.ADD_TAX_RATE_API_STARTED
  )]: (state, _action) => {
    return {
      ...state,
      newTaxRateCallInprogress: true,
      taxErrorMessage: "",
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.ADD_TAX_RATE_API_SUCCESS
  )]: (state, _action) => {
    return {
      ...state,
      showAddTaxScreen: false,
      newTaxRateCallInprogress: false,
      taxErrorMessage: "",
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.APPEND_TO_TAX_LIST
  )]: (state, action) => {
    let updatedTaxList = state.taxRatesList.slice();
    const {selectedLocation} = state;
    if (selectedLocation) {
      selectedLocation.taxRate = {...action.payload};
    }
    updatedTaxList.push(action.payload);

    return {
      ...state,
      taxRatesList: sortAscByName(updatedTaxList),
      selectedLocation,
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.ADD_TAX_RATE_API_FAILURE
  )]: (state, action) => {
    return {
      ...state,
      taxErrorMessage: action.payload,
      newTaxRateCallInprogress: false,
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.EXIT_ADD_TAX_RATE_SCREEN
  )]: (state, _action) => {
    return {
      ...state,
      showAddTaxScreen: false,
      newTaxRateCallInprogress: false,
      taxErrorMessage: initialState.taxErrorMessage,
    };
  },

  // Add Location Screens

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.CHANGE_ADD_LOCATION_STEP
  )]: (state, action) => {
    return {
      ...state,
      addLocationStep: action.payload,
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.CLOSE_ADD_LOCATION_SCREEN
  )]: (state, _action) => {
    return {
      ...state,
      selectedLocation: null,
      isEdit: false,
      saveLocationCallInProgress: false,
      showSaveLocationScreen: false,
      addLocationStep: 1,
      errorMessage: "",
      newTaxRateWhileLocationCreation: null,
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations
      .SET_NEW_TAX_RATE_WHILE_LOCATION_CREATION
  )]: (state, action) => {
    return {
      ...state,
      newTaxRateWhileLocationCreation: action.payload,
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.CLOSE_EDIT_LOCATION_SCREEN
  )]: (state, _action) => {
    return {
      ...state,
      isEdit: false,
      saveLocationCallInProgress: false,
      showSaveLocationScreen: false,
      errorMessage: "",
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SAVE_LOCATION_API_STARTED
  )]: (state, _action) => {
    return {
      ...state,
      saveLocationCallInProgress: true,
      showFullPageError: false,
      errorMessage: "",
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SAVE_LOCATION_API_SUCCESS
  )]: (state, _action) => {
    return {
      ...state,
      saveLocationCallInProgress: false,
      showSaveLocationScreen: false,
      isEdit: false,
      addLocationStep: 1,
      showFullPageError: false,
      errorMessage: "",
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SAVE_LOCATION_API_FAILURE
  )]: (state, action) => {
    return {
      ...state,
      saveLocationCallInProgress: false,
      showFullPageError: false,
      errorMessage: action.payload,
    };
  },

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SELECTED_LOCATION_FIELD_CHANGE
  )]: (state, action) => {
    return {
      ...state,
      selectedLocation: {
        ...state.selectedLocation,
        [action.payload.field]: action.payload.value,
      },
    };
  },

  // Delivery Settings

  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations.SET_DELIVERY_WIZARD_TYPE
  )]: (state, action) => {
    return {
      ...state,
      showDeliverySettingsScreen: action.payload
        ? state.showDeliverySettingsScreen
        : true,
      deliveryWizard: action.payload,
      editDeliverySettingsScreenType: null,
    };
  },
  [BoGlobalSettingsNamespacer(
    actionTypes.businessOwner.globalSettings.locations
      .SET_EDIT_DELIVERY_SETTINGS_SCREEN_TYPE
  )]: (state, action) => {
    return {
      ...state,
      showDeliverySettingsScreen: action.payload
        ? state.showDeliverySettingsScreen
        : true,
      deliveryWizard: null,
      editDeliverySettingsScreenType: action.payload,
    };
  },
};

//fullServiceError

export default createReducer(initialState, handlers, ["BUSINESS_OWNER_GS_LOCATIONS"]);
