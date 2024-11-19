import {connect} from "react-redux";
import curry from "lodash/curry";
import Locations from "../components/business-owner/global-settings/locations/locations";
import actionTypes from "../actionTypes";
import {createNamespacer} from "../utils/reducers";
import * as locationsApi from "../api/business-owner/locations";
import * as taxesApi from "../api/business-owner/taxes";
import get from "lodash/get";
import Axios from "axios";
import * as yup from "yup";
import {setDeliveryWizard} from "./bo-locations-delivery-settings";

const BoLocationsNamespacer = createNamespacer("BUSINESS_OWNER_GS_LOCATIONS");

const dcaLicenseValidation = yup
  .string()
  .max(15)
  .matches(/^$|^(?!.*[-]{2})(?=.*[A-Za-z\d]$)[A-Za-z\d][A-Za-z\d-]*$/, "Invalid Format");

const setSelectedLocation = async (location, dispatch) => {
  if (!location) {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_SELECTED_LOCATION
      ),
      payload: location,
    });
    return;
  }

  try {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.REFRESH_ACTIVE_LOCATION_DETAILS
      ),
      payload: false,
    });
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_LOCATION_DETAILS_LOADING
      ),
      payload: true,
    });
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_SELECTED_LOCATION
      ),
      payload: location,
    });

    const res = await locationsApi.fetchLocationDetails(location.id);
    const locationDetails = res.data.details;

    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_SELECTED_LOCATION
      ),
      payload: locationDetails,
    });
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.RESET_SHIFTS_TO_INIT
      ),
    });
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_LOCATION_DETAILS_LOADING
      ),
      payload: false,
    });
  } catch (e) {
    // Error handling
    if (Axios.isCancel(e)) {
      // Don't set error as the request is cancelled and is not a real error.
      return;
    }
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_LOCATION_DETAILS_ERROR
      ),
      payload: get(e, "response.data.error", "Something went wrong"),
    });
  }
};

const selectedLocationInlineChange = async (
  dispatch,
  setFieldError,
  location,
  field,
  value
) => {
  const updatedLocation = {...location, [field]: value};
  const body = field === "taxRate" ? {taxRateId: value.id} : {[field]: value};

  dispatch({
    type: BoLocationsNamespacer(
      actionTypes.businessOwner.globalSettings.locations.TAX_SETTINGS_UPDATE_IN_PROGRESS
    ),
    payload: true,
  });

  try {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_SELECTED_LOCATION
      ),
      payload: updatedLocation,
    });

    await taxesApi.updateLocationTaxRate({id: location.id}, body);

    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.UPDATE_LOCATION_LIST
      ),
      payload: updatedLocation,
    });

    setFieldError(field, false);
  } catch (e) {
    // Couldn't update data - reverting changes
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_SELECTED_LOCATION
      ),
      payload: {
        ...location,
      },
    });
    setFieldError(field);
  } finally {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.TAX_SETTINGS_UPDATE_IN_PROGRESS
      ),
      payload: false,
    });
  }
};

const mapStateToProps = (state) => ({
  locations: state.businessOwner.globalSettings.locations,
});

const mapDispatchToProps = (dispatch) => ({
  onFetchLocations: async (shouldSetSelectedLocation, currentSelectedLocation) => {
    //Make API call and set locations state

    try {
      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_LOCATION_LIST_PROGRESS
        ),
        payload: true,
      });
      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_REFRESH_LOCATIONS
        ),
        payload: false,
      });

      const res = await locationsApi.fetchLocations();

      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_LOCATION_LIST_PROGRESS
        ),
        payload: false,
      });
      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_LOCATION_LIST
        ),
        payload: res.data,
      });

      // Setting default location if not already set
      if (shouldSetSelectedLocation) {
        const selectedLoc = res.data.allLocations[0];

        setSelectedLocation(selectedLoc, dispatch);

        if (selectedLoc?.id) {
          // Setting the locations without hub
          try {
            dispatch({
              type: BoLocationsNamespacer(
                actionTypes.businessOwner.globalSettings.locations
                  .SET_WITHOUT_HUB_CALL_IN_PROGRESS
              ),
              payload: true,
            });

            const locationsWithOutHubResp = await locationsApi.fetchLocationsWithoutHub(
              selectedLoc?.id
            );

            dispatch({
              type: BoLocationsNamespacer(
                actionTypes.businessOwner.globalSettings.locations
                  .SET_LOCATIONS_AND_REGIONS_WITHOUT_HUB
              ),
              payload: {
                locationsWithOutHub: locationsWithOutHubResp.data.locations,
                regionsWithOutHub: locationsWithOutHubResp.data.regions,
              },
            });
            dispatch({
              type: BoLocationsNamespacer(
                actionTypes.businessOwner.globalSettings.locations
                  .SET_WITHOUT_HUB_CALL_IN_PROGRESS
              ),
              payload: false,
            });
          } catch (e) {
            console.warn("Failed to fetch locations without hub");

            dispatch({
              type: BoLocationsNamespacer(
                actionTypes.businessOwner.globalSettings.locations
                  .SET_LOCATIONS_AND_REGIONS_WITHOUT_HUB
              ),
              payload: {
                locationsWithOutHub: [],
                regionsWithOutHub: [],
              },
            });
            dispatch({
              type: BoLocationsNamespacer(
                actionTypes.businessOwner.globalSettings.locations
                  .SET_WITHOUT_HUB_CALL_IN_PROGRESS
              ),
              payload: false,
            });
          }
        }
      } else if (currentSelectedLocation) {
        const newSelectedLocation = res.data.allLocations.find(
          (loc) => loc.id === currentSelectedLocation.id
        );

        if (newSelectedLocation) {
          setSelectedLocation(newSelectedLocation, dispatch);
        }
      }

      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.RESET_LOCATION_ERROR
        ),
      });
    } catch (error) {
      //SET ERROR

      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_LOCATION_ERROR
        ),
        payload: {
          errorMessage: error.message,
          showFullPageError: true,
        },
      });

      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_LOCATION_LIST_PROGRESS
        ),
        payload: false,
      });
    }
  },

  onFetchDistricts: async () => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_DISTRICTS_CALL_IN_PROGRESS
      ),
      payload: true,
    });

    //TODO- Try catch for error handling
    const res = await locationsApi.fetchDistricts();

    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_DISTRICTS_CALL_IN_PROGRESS
      ),
      payload: false,
    });

    // Dispatch data to set in store
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_DISTRICTS
      ),
      payload: get(res, "data.districts", []),
    });
  },

  onFetchRegions: async () => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_REGIONS_CALL_IN_PROGRESS
      ),
      payload: true,
    });

    //TODO- Try catch for error handling
    const res = await locationsApi.fetchRegions();

    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_REGIONS_CALL_IN_PROGRESS
      ),
      payload: false,
    });

    // Dispatch data to set in store
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_REGIONS
      ),
      payload: get(res, "data.regions", []),
    });
  },

  onSetSelectedLocation: async (location) => {
    setSelectedLocation(location, dispatch);

    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations
          .SET_LOCATIONS_AND_REGIONS_WITHOUT_HUB
      ),
      payload: {
        locationsWithOutHub: [],
        regionsWithOutHub: [],
      },
    });
    // update locationsWithOutHub for selected location
    try {
      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations
            .SET_WITHOUT_HUB_CALL_IN_PROGRESS
        ),
        payload: true,
      });

      const res = await locationsApi.fetchLocationsWithoutHub(location.id);

      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations
            .SET_LOCATIONS_AND_REGIONS_WITHOUT_HUB
        ),
        payload: {
          locationsWithOutHub: res.data.locations,
          regionsWithOutHub: res.data.regions,
        },
      });
      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations
            .SET_WITHOUT_HUB_CALL_IN_PROGRESS
        ),
        payload: false,
      });
    } catch (e) {
      console.warn("Failed to fetch locations without hub");

      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations
            .SET_LOCATIONS_AND_REGIONS_WITHOUT_HUB
        ),
        payload: {
          locationsWithOutHub: [],
          regionsWithOutHub: [],
        },
      });
      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations
            .SET_WITHOUT_HUB_CALL_IN_PROGRESS
        ),
        payload: false,
      });
    }
  },

  onShowCreateLocationScreen: () => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SHOW_CREATE_SCREEN
      ),
    });
  },

  onEditLocation: (location) => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SHOW_EDIT_SCREEN
      ),
      payload: location,
    });
  },

  onUpdateLocationInfo: async (locationInfo) => {
    const {address, name, zipCode, state, districtId, phoneNumber, city} = locationInfo;

    const updateLocationPayload = {
      address,
      name,
      zipCode,
      state,
      districtId,
      phoneNumber,
      city,
    };

    try {
      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SAVE_LOCATION_API_STARTED
        ),
        payload: true,
      });

      const res = await locationsApi.updateLocationInfo(updateLocationPayload, {
        id: locationInfo.id,
      });

      if (res.status === 200 && res.data.success) {
        dispatch({
          type: BoLocationsNamespacer(
            actionTypes.businessOwner.globalSettings.locations.SAVE_LOCATION_API_SUCCESS
          ),
        });

        dispatch({
          type: BoLocationsNamespacer(
            actionTypes.businessOwner.globalSettings.locations.UPDATE_LOCATION_LIST
          ),
          payload: locationInfo,
        });

        dispatch({
          type: BoLocationsNamespacer(
            actionTypes.businessOwner.globalSettings.locations.SET_SELECTED_LOCATION
          ),
          payload: locationInfo,
        });
      } else {
        dispatch({
          type: BoLocationsNamespacer(
            actionTypes.businessOwner.globalSettings.locations.SAVE_LOCATION_API_FAILURE
          ),
          payload: "Something went wrong",
        });
      }
    } catch (error) {
      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SAVE_LOCATION_API_FAILURE
        ),
        payload: error?.response?.data?.error || error?.message,
      });
    }
  },

  onResetFullLocationState: () => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.RESET_FULL_LOCATION
      ),
    });
  },

  onShowHideShiftsScreen: async (showShiftsScreen, locationId) => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_SHIFTS_VISIBILITY
      ),
      payload: showShiftsScreen,
    });

    // if Show - make shifts api call
    if (showShiftsScreen) {
      try {
        dispatch({
          type: BoLocationsNamespacer(
            actionTypes.businessOwner.globalSettings.locations.SET_SHIFTS_CALL_IN_PROGRESS
          ),
          payload: true,
        });

        const res = await locationsApi.fetchShifts({storeId: locationId});

        dispatch({
          type: BoLocationsNamespacer(
            actionTypes.businessOwner.globalSettings.locations.SET_SHIFTS_CALL_IN_PROGRESS
          ),
          payload: false,
        });
        dispatch({
          type: BoLocationsNamespacer(
            actionTypes.businessOwner.globalSettings.locations.SET_SHIFTS
          ),
          payload: res.data,
        });
        dispatch({
          type: BoLocationsNamespacer(
            actionTypes.businessOwner.globalSettings.locations.SET_SHIFTS_ERROR
          ),
          payload: "",
        });
      } catch (error) {
        console.warn("Error fetching shifts - ", error);

        dispatch({
          type: BoLocationsNamespacer(
            actionTypes.businessOwner.globalSettings.locations.SET_SHIFTS_CALL_IN_PROGRESS
          ),
          payload: false,
        });
        dispatch({
          type: BoLocationsNamespacer(
            actionTypes.businessOwner.globalSettings.locations.SET_SHIFTS_ERROR
          ),
          payload: get(error, "response.data.error")
            ? get(error, "response.data.error")
            : error.message,
        });
      }
    }
    // Else clear shifts data
    else {
      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.RESET_SHIFTS_TO_INIT
        ),
      });
      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_REFRESH_LOCATIONS
        ),
        payload: true,
      });
    }
  },

  resetAllShifts: () => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.RESET_ALL_SHIFTS_CHANGES
      ),
    });
  },

  onUpdateHubSetting: async (location, isHub, locationsServed) => {
    // Set loader for setting changes
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_SETTINGS_UPDATE_IN_PROGRESS
      ),
      payload: true,
    });
    // Make post call to change setting
    try {
      const updatedLocation = {
        ...location,
        isHub,
        locationsServed,
      };

      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_SELECTED_LOCATION
        ),
        payload: updatedLocation,
      });

      await locationsApi.updateHubSettings(
        // Query
        {
          id: location.id,
        },
        // Body
        {
          isHub,
          locationsServed,
        }
      );

      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.UPDATE_LOCATION_LIST
        ),
        payload: updatedLocation,
      });
    } catch (e) {
      // Couldn't update data - reverting changes
      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_SELECTED_LOCATION
        ),
        payload: {
          ...location,
        },
      });
    }

    // Set refresh locations flag
    // Set loader to false
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_SETTINGS_UPDATE_IN_PROGRESS
      ),
      payload: false,
    });
  },

  // updateBagTracking: async (location, isBagTrackingEnabled) => {
  //     // Set loader for setting changes
  //     dispatch({
  //         type: BoLocationsNamespacer(actionTypes.businessOwner.globalSettings.locations.SET_SETTINGS_UPDATE_IN_PROGRESS),
  //         payload: true,
  //     })
  //     // Make post call to change setting
  //     try{
  //         let updatedLocation = {
  //             ...location,
  //             isBagTrackingEnabled,
  //         };
  //         dispatch({
  //             type: BoLocationsNamespacer(actionTypes.businessOwner.globalSettings.locations.SET_SELECTED_LOCATION),
  //             payload: updatedLocation
  //         })

  //         await locationsApi.updateBagTracking(
  //             location.id,
  //             isBagTrackingEnabled
  //         );

  //         dispatch({
  //             type: BoLocationsNamespacer(actionTypes.businessOwner.globalSettings.locations.UPDATE_LOCATION_LIST),
  //             payload: updatedLocation,
  //         })
  //     }
  //     catch(e){
  //         // Couldn't update data - reverting changes
  //         dispatch({
  //             type: BoLocationsNamespacer(actionTypes.businessOwner.globalSettings.locations.SET_SELECTED_LOCATION),
  //             payload: {
  //                 ...location
  //             }
  //         })
  //     }

  //     // Set refresh locations flag
  //     // Set loader to false
  //     dispatch({
  //         type: BoLocationsNamespacer(actionTypes.businessOwner.globalSettings.locations.SET_SETTINGS_UPDATE_IN_PROGRESS),
  //         payload: false,
  //     })
  // },

  onUpdateIsIntakeOnly: async (location, isIntakeOnly) => {
    // Set loader for setting changes
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_SETTINGS_UPDATE_IN_PROGRESS
      ),
      payload: true,
    });

    const type = isIntakeOnly ? "INTAKE_ONLY" : "STORE";

    try {
      const updatedLocation = {
        ...location,
        type,
        isIntakeOnly,
      };

      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_SELECTED_LOCATION
        ),
        payload: updatedLocation,
      });

      await locationsApi.updateIntakeOnly(location.id, isIntakeOnly);

      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.UPDATE_LOCATION_LIST
        ),
        payload: updatedLocation,
      });
    } catch (e) {
      // Couldn't update data - reverting changes
      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_SELECTED_LOCATION
        ),
        payload: {
          ...location,
        },
      });
    }

    // Set loader to false
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_SETTINGS_UPDATE_IN_PROGRESS
      ),
      payload: false,
    });
  },

  onUpdateIsResidential: async (location, value) => {
    // Set loader for setting changes
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_SETTINGS_UPDATE_IN_PROGRESS
      ),
      payload: true,
    });

    const type = value ? "RESIDENTIAL" : "INTAKE_ONLY";

    try {
      const updatedLocation = {
        ...location,
        type,
      };

      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_SELECTED_LOCATION
        ),
        payload: updatedLocation,
      });

      await locationsApi.updateIsResidential(
        location.id
        // type
      );

      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.UPDATE_LOCATION_LIST
        ),
        payload: updatedLocation,
      });
    } catch (e) {
      // Couldn't update data - reverting changes
      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_SELECTED_LOCATION
        ),
        payload: {
          ...location,
        },
      });
    }
    // Set loader to false
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_SETTINGS_UPDATE_IN_PROGRESS
      ),
      payload: false,
    });
  },

  onUpdateLocationSettings: async (location, field, value) => {
    // Set loader for setting changes
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations
          .PROCESSING_SETTINGS_UPDATE_IN_PROGRESS
      ),
      payload: true,
    });
    // Make post call to change setting
    try {
      let updatedLocation = {
        ...location,
        [field]: value,
      };
      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_SELECTED_LOCATION
        ),
        payload: updatedLocation,
      });

      await locationsApi.updateLocationSettings(location.id, {
        [field]: value,
      });
    } catch (e) {
      // Couldn't update data - reverting changes
      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_SELECTED_LOCATION
        ),
        payload: {
          ...location,
        },
      });
    } finally {
      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations
            .PROCESSING_SETTINGS_UPDATE_IN_PROGRESS
        ),
        payload: false,
      });
    }
  },

  updateIsFullService: async (location, offersFullService) => {
    // Set loader for setting changes
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_SETTINGS_UPDATE_IN_PROGRESS
      ),
      payload: true,
    });
    // Make post call to change setting
    try {
      const updatedLocation = {
        ...location,
        offersFullService,
      };

      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_SELECTED_LOCATION
        ),
        payload: updatedLocation,
      });

      await locationsApi.updateOffersFullService(location.id, offersFullService);

      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.UPDATE_LOCATION_LIST
        ),
        payload: updatedLocation,
      });

      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_FULL_SERVICE_LIST_ERROR
        ),
        payload: "",
      });
    } catch (e) {
      // Couldn't update data - reverting changes
      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_SELECTED_LOCATION
        ),
        payload: {
          ...location,
        },
      });

      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_FULL_SERVICE_LIST_ERROR
        ),
        payload: get(e, "response.data.error", "Something went wrong"),
      });
    }

    // Set refresh locations flag
    // Set loader to false
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_SETTINGS_UPDATE_IN_PROGRESS
      ),
      payload: false,
    });
  },

  onShowServicePricesScreen: () => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SHOW_SERVICE_PRICE_SCREEN
      ),
    });
  },

  onShowDetailsScreen: () => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SHOW_DETAILS_SCREEN
      ),
    });
  },

  showProductPricesScreen: () => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SHOW_PRODUCT_PRICES_SCREEN
      ),
    });
  },

  showHideAddTaxRateScreen: (value) => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SHOW_HIDE_ADD_TAXRATE_SCREEN
      ),
      payload: value,
    });
  },

  onAddNewTaxRate: () => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SHOW_HIDE_ADD_TAXRATE_SCREEN
      ),
      payload: true,
    });
  },

  onFetchTaxRates: async () => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_TAXRATES_CALL_IN_PROGRESS
      ),
      payload: true,
    });
    try {
      const res = await taxesApi.fetchTaxRates();

      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SHOW_HIDE_ADD_TAXRATE_SCREEN
        ),
        payload: false,
      });

      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_TAXES_LIST
        ),
        payload: get(res, "data.taxes", []),
      });
      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_TAXRATES_CALL_IN_PROGRESS
        ),
        payload: false,
      });
    } catch (e) {
      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_TAXRATES_CALL_IN_PROGRESS
        ),
        payload: false,
      });
      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_TAXES_LIST
        ),
        payload: [],
      });
    }
  },

  onHandleSelectedLocationInlineSave: async (setFieldError, location, field, value) => {
    if (field === "dcaLicense") {
      try {
        await dcaLicenseValidation.validate(value);
      } catch (e) {
        setFieldError(field, "Invalid format");
        return;
      }
    }
    selectedLocationInlineChange(dispatch, setFieldError, location, field, value);
  },

  onHandleSaveTaxRate: async (
    setFieldError,
    location,
    selectedTaxrateId,
    taxRatesList
  ) => {
    selectedLocationInlineChange(
      dispatch,
      setFieldError,
      location,
      "taxRate",
      taxRatesList.find((taxrate) => taxrate.id === selectedTaxrateId)
    );
  },

  handleFieldChange: (_location, field, value) => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SELECTED_LOCATION_FIELD_CHANGE
      ),
      payload: {field, value},
    });
  },

  onUpdateEsdSettings: async (location, settings) => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_SETTINGS_UPDATE_IN_PROGRESS
      ),
      payload: true,
    });
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_ESD_ERROR
      ),
      payload: null,
    });

    try {
      await locationsApi.registerCashCardSettings(location.id, settings);

      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_REFRESH_LOCATIONS
        ),
        payload: true,
      });

      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SHOW_ESD_REGISTRATION_SCREEN
        ),
        payload: false,
      });
    } catch (error) {
      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_ESD_ERROR
        ),
        payload: error.message,
      });

      const res = await locationsApi.fetchLocationDetails(location.id);

      dispatch({
        type: BoLocationsNamespacer(
          actionTypes.businessOwner.globalSettings.locations.SET_SELECTED_LOCATION
        ),
        payload: res.data.details,
      });
    }

    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_SETTINGS_UPDATE_IN_PROGRESS
      ),
      payload: false,
    });
  },

  onToggleThreeDotMenu: async (toggle) => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SHOW_THREE_DOT_MENU
      ),
      payload: toggle,
    });
  },

  onCloseThreeDotMenuAndScreens: async () => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SHOW_THREE_DOT_MENU
      ),
      payload: false,
    });
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_SHOW_RESET_PASSWORD_SCREEN
      ),
      payload: false,
    });
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SHOW_ESD_REGISTRATION_SCREEN
      ),
      payload: false,
    });
  },

  onShowEsdRegistrationScreen: async (value) => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SHOW_ESD_REGISTRATION_SCREEN
      ),
      payload: value,
    });
  },

  setHasEsdEnabled: async (location, value) => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_HAS_ESD_ENABLED
      ),
      payload: value,
    });

    const updatedLocation = {
      ...location,
      hasEsdEnabled: value,
    };

    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_SELECTED_LOCATION
      ),
      payload: updatedLocation,
    });

    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.UPDATE_LOCATION_LIST
      ),
      payload: updatedLocation,
    });
  },

  setHasCciEnabled: async (location, value) => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_HAS_CCI_ENABLED
      ),
      payload: value,
    });

    const updatedLocation = {
      ...location,
      hasCciEnabled: value,
    };

    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_SELECTED_LOCATION
      ),
      payload: updatedLocation,
    });

    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.UPDATE_LOCATION_LIST
      ),
      payload: updatedLocation,
    });
  },

  esdFormChangeHandler: (field, evt) => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_ESD_VALUES
      ),
      payload: {
        field,
        value: evt.target.value,
      },
    });
  },

  onCancelEsdRegistration: async (location) => {
    const res = await locationsApi.fetchLocationDetails(location.id);

    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_SELECTED_LOCATION
      ),
      payload: res.data.details,
    });

    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SHOW_ESD_REGISTRATION_SCREEN
      ),
      payload: false,
    });
  },

  onSetShowResetPasswordScreen: (value) => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_SHOW_RESET_PASSWORD_SCREEN
      ),
      payload: value,
    });
  },

  onSetShowCheckedInEmployees: (value) => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations
          .SET_SHOW_CHECKED_IN_EMPLOYEES_SCREEN
      ),
      payload: value,
    });
  },

  onCloseEditLocationScreen: () => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.CLOSE_EDIT_LOCATION_SCREEN
      ),
    });
  },

  // Delivery Settings

  onShowDeliverySettingsScreen: () => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SHOW_DELIVERY_SETTINGS_SCREEN
      ),
    });
  },

  onCloseDeliveryWizard: () => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SET_DELIVERY_WIZARD_TYPE
      ),
      payload: null,
    });
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SHOW_DELIVERY_SETTINGS_SCREEN
      ),
    });
  },

  onSetDeliveryWizard: curry(setDeliveryWizard)(dispatch),

  onCloseEditDeliverySettingsScreen: () => {
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations
          .SET_EDIT_DELIVERY_SETTINGS_SCREEN_TYPE
      ),
      payload: null,
    });
    dispatch({
      type: BoLocationsNamespacer(
        actionTypes.businessOwner.globalSettings.locations.SHOW_DELIVERY_SETTINGS_SCREEN
      ),
    });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Locations);
