import {createNamespacer, createReducer} from "../../../utils/reducers";
import actionTypes from "../../../actionTypes";
import {sortBy} from "lodash";

const initialState = {
  drycleaningServicesList: [],
  drycleaningServicesListCopy: [],
  drycleaningServicesListError: "",
  getAllDrycleaningServicesCallInProgress: false,
  activeServiceId: null,
  addNewServiceCallInProgress: false,
  addNewServiceError: "",
  showNewServiceWizard: false,
  activeServiceDetails: null,
  isServiceDetailsLoading: false,
  serviceDetailsError: "",
  isInServiceEditMode: false,
  showNewServicesPricingScreen: false,
  pricePerLocationCallInProgress: false,
  drycleaningServicesCategoryList: {},
  searchText: "",
  roundedTabs: [
    {label: "/Lb", value: "per-pound"},
    {label: "Fixed", value: "fixed-price"},
  ],
  activeRoundedTab: "per-pound",
  searchInProgress: false,
  serviceDetailsUpdateInProgress: false,
  serviceDetailsUpdateError: "",
  activeTab: "details",
  hasMinPriceUpdating: false,
  drycleaningServicesPricesError: "",
  newServicePricingCallProgress: false,
  newServicePricingError: "",
  newServicePriceItems: null,
  newServicePricingLocationList: null,
  newServiceName: "",
  numberOfActivePriceUpdates: 0,
  archiveError: "",
  newdrycleaningServicesList: [],
  drycleaningServicesCategories: [],
  drycleaningServicesSubcategories: [],
  pricingTypes: [],
  showNewCategoryScreen: false,
  showNewCategoryScreenInDetails: false,
  newCategoryError: "",
  categoryForAService: [],
  newCategoryId: "",
  servicesRefresh: false,
  drycleaningSearchResults: [],
};

const nameSpace = "BO-DRYCLEANING";
const drycleaningServicesNamespacer = createNamespacer(nameSpace);
const drycleaningServicesAT = actionTypes.businessOwner.globalSettings.drycleaning;

const handlers = {
  [drycleaningServicesNamespacer(drycleaningServicesAT.SET_ALL_DRYCLEANING_SERVICES)]: (
    state,
    action
  ) => {
    let {serviceCategories} = action.payload;
    if (!serviceCategories) {
      return state;
    }

    serviceCategories.sort((a, b) => {
      if (a.category > b.category) {
        return -1;
      } else if (a.category < b.category) {
        return 1;
      } else return 0;
    });

    if (serviceCategories.length > 0 && serviceCategories[0].services) {
      serviceCategories[0].services.sort((a, b) => {
        const nameA = a.name.toLowerCase(),
          nameB = b.name.toLowerCase();
        if (nameA < nameB)
          //sort string ascending
          return -1;
        if (nameA > nameB) return 1;
        return 0; //default return value (no sorting)
      });
    }

    if (serviceCategories.length > 1 && serviceCategories[1].services) {
      serviceCategories[1].services.sort((a, b) => {
        let nameA = a.name.toLowerCase(),
          nameB = b.name.toLowerCase();
        if (nameA < nameB)
          //sort string ascending
          return -1;
        if (nameA > nameB) return 1;
        return 0; //default return value (no sorting)
      });
    }

    let drycleaningServicesList = {
      serviceCategories,
    };

    let activeRoundedTab;

    drycleaningServicesList = sortBy(drycleaningServicesList.serviceCategories, (o) =>
      o.category.toLowerCase()
    );

    return {
      ...state,
      drycleaningServicesList,
      drycleaningServicesListCopy: drycleaningServicesList,
      activeRoundedTab:
        state.activeRoundedTab === "per-pound"
          ? drycleaningServicesList[0]?.services?.length !== 0
            ? "per-pound"
            : drycleaningServicesList[1]?.services?.length !== 0
            ? "fixed-price"
            : activeRoundedTab
          : drycleaningServicesList[1]?.services?.length !== 0
          ? "fixed-price"
          : drycleaningServicesList[0]?.services?.length !== 0
          ? "per-pound"
          : activeRoundedTab,
      activeServiceId: !(
        state.activeRoundedTab === "fixed-price" &&
        drycleaningServicesList[1]?.services?.length !== 0
      )
        ? drycleaningServicesList[0]?.services?.length !== 0
          ? drycleaningServicesList[0]?.services[0]?.id
          : drycleaningServicesList[1]?.services?.length !== 0
          ? drycleaningServicesList[1]?.services[0]?.id
          : null
        : drycleaningServicesList[1]?.services[0]?.id,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CATEGORY_LIST
  )]: (state, action) => {
    let fixedPriceId;
    let perPoundId;
    action.payload.categories.forEach((categoryItem) => {
      if (categoryItem.category === "FIXED_PRICE") {
        fixedPriceId = categoryItem.id;
      } else if (categoryItem.category === "PER_POUND") {
        perPoundId = categoryItem.id;
      }
    });
    return {
      ...state,
      drycleaningServicesCategoryList: {fixedPriceId, perPoundId},
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CALL_PROGRESS
  )]: (state, action) => {
    return {
      ...state,
      getAllDrycleaningServicesCallInProgress: action.payload,
    };
  },

  [drycleaningServicesNamespacer(drycleaningServicesAT.SET_DRYCLEANING_SERVICES_ERROR)]: (
    state,
    action
  ) => {
    return {
      ...state,
      drycleaningServicesListError: action.payload,
    };
  },

  [drycleaningServicesNamespacer(drycleaningServicesAT.SET_ACTIVE_DRYCLEANING_SERVICE)]: (
    state,
    action
  ) => {
    return {
      ...state,
      activeServiceId: action.payload,
      showNewServiceWizard: false,
      isInServiceEditMode: false,
      showNewServicesPricingScreen: false,
      activeTab: "details",
      // showNewServicesPricingScreen: false,
      // newServicePriceItems: null
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_CALL_PROGRESS
  )]: (state, action) => {
    return {
      ...state,
      addNewServiceCallInProgress: action.payload,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_ERROR
  )]: (state, action) => {
    return {
      ...state,
      addNewServiceError: action.payload,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_SHOW_DRYCLEANING_NEW_SERVICE_WIZARD
  )]: (state, action) => {
    let additionalStateValue = {};
    let {newServicePriceItems, activeRoundedTab} = state;

    if (action.payload) {
      additionalStateValue.activeServiceId = null;
    } else {
      if (
        state.activeServiceId === null &&
        state.drycleaningServicesList.categories?.length > 0
      ) {
        additionalStateValue.activeServiceId =
          state.drycleaningServicesList.categories[0].services.length !== 0
            ? state.drycleaningServicesList.categories[0].services[0].id
            : state.drycleaningServicesList.categories[1].services.length !== 0
            ? state.drycleaningServicesList.categories[1].services[0].id
            : null;
      }
      newServicePriceItems = null;
      activeRoundedTab = "per-pound";
    }
    return {
      ...state,
      showNewServiceWizard: action.payload,
      isInServiceEditMode: false,
      showNewServicesPricingScreen: false,
      ...additionalStateValue,
      addNewServiceError: "",
      newServicePriceItems,
      activeRoundedTab,
      allSelected: false,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_ACTIVE_DRYCLEANING_SERVICE_DETAILS
  )]: (state, action) => {
    return {
      ...state,
      activeServiceDetails: action.payload,
      showNewServicesPricingScreen: false,
      newServicePriceItems: null,
      serviceDetailsUpdateError: initialState.serviceDetailsUpdateError,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_DRYCLEANING_SERVICE_DETAILS_CALL_IN_PROGRESS
  )]: (state, action) => {
    return {
      ...state,
      isServiceDetailsLoading: action.payload,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_DRYCLEANING_SERVICE_DETAILS_ERROR
  )]: (state, action) => {
    return {
      ...state,
      serviceDetailsError: action.payload,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_SHOW_UPDATE_DRYCLEANING_SERVICE
  )]: (state, action) => {
    return {
      ...state,
      isInServiceEditMode: true,
      showNewServiceWizard: true,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_SHOW_DRYCLEANING_SERVICE_PRICES_SCREEN
  )]: (state, action) => {
    return {
      ...state,
      showNewServicesPricingScreen: action.payload,
      showNewServiceWizard: false,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.UPDATE_DRYCLEANING_SERVICES_PRICE_PER_LOCATION
  )]: (state, action) => {
    let {activeServiceDetails} = state;
    let {value, storeId, field} = action.payload;
    let index = activeServiceDetails.prices.findIndex(
      (priceDetail) => priceDetail.storeId === storeId
    );
    activeServiceDetails.prices[index] = {
      ...activeServiceDetails.prices[index],
      [field]: value,
    };

    return {
      ...state,
      activeServiceDetails: {...activeServiceDetails},
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_PER_LOCATION_DRYCLEANING_SERVICE_PRICES_CALL_PROGRESS
  )]: (state, action) => {
    return {
      ...state,
      pricePerLocationCallInProgress: action.payload,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.TOGGLE_MINIMUM_IN_PRICE_PER_LOCATION
  )]: (state, action) => {
    let {activeServiceDetails} = state;
    activeServiceDetails.hasMinPrice = action.payload;

    return {
      ...state,
      activeServiceDetails: {...activeServiceDetails},
    };
  },

  [drycleaningServicesNamespacer(drycleaningServicesAT.APPLY_TO_ALL)]: (
    state,
    action
  ) => {
    let referencePrice = action.payload;
    let activeServiceDetails = {...state.activeServiceDetails};
    activeServiceDetails.prices = activeServiceDetails.prices.map((price) => {
      return {
        ...price,
        minPrice: Number(referencePrice.minPrice),
        minQty: Number(referencePrice.minQty),
        storePrice: Number(referencePrice.storePrice),
        isTaxable: referencePrice.isTaxable,
      };
    });
    return {
      ...state,
      activeServiceDetails,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_ACTIVE_ID
  )]: (state, action) => {
    let {drycleaningServicesCategoryList} = state;
    let activeServiceId = action.payload.id;
    let activeRoundedTab =
      drycleaningServicesCategoryList.fixedPriceId === action.payload.serviceCategoryId
        ? "fixed-price"
        : "per-pound";

    return {
      ...state,
      activeServiceId,
      showNewServiceWizard: false,
      showNewServicesPricingScreen: false,
      activeRoundedTab,
      newServicePriceItems: null,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_DRYCLEANING_SERVICE_SEARCH_TEXT
  )]: (state, action) => {
    let {drycleaningServicesListCopy} = state;
    let searchText = action.payload;
    let activeServiceId;

    if (!(drycleaningServicesListCopy?.length > 0)) {
      return {
        ...state,
        searchText,
      };
    }
    const allServices = drycleaningServicesListCopy.map((item) => item.services).flat();
    const searchResultsList = allServices.filter((service) => {
      const nameInLowerCase = service.name.toLowerCase();
      const searchTextInLowerCase = searchText.toLowerCase();
      return nameInLowerCase.indexOf(searchTextInLowerCase) > -1;
    });
    if (searchText === "") {
      if (state.searchInProgress) {
        activeServiceId = null;
      } else {
        activeServiceId = searchResultsList.length !== 0 ? searchResultsList[0].id : null;
      }
    } else {
      activeServiceId = searchResultsList.length !== 0 ? searchResultsList[0].id : null;
    }
    return {
      ...state,
      drycleaningSearchResults: searchResultsList,
      searchText,
      activeServiceId,
      activeTab: "details",
    };
  },

  [drycleaningServicesNamespacer(drycleaningServicesAT.SET_ACTIVE_ROUNDED_TAB)]: (
    state,
    action
  ) => {
    let activeServiceId;
    let {drycleaningServicesList} = state;

    /*  Change the active service id on tab switch */

    if (action.payload === "per-pound") {
      activeServiceId =
        drycleaningServicesList.categories?.length > 0 &&
        drycleaningServicesList.categories[0].services.length > 0
          ? drycleaningServicesList.categories[0].services[0].id
          : null;
    } else {
      activeServiceId =
        drycleaningServicesList.categories?.length > 1 &&
        drycleaningServicesList.categories[1].services.length !== 0
          ? drycleaningServicesList.categories[1].services[0].id
          : null;
    }

    return {
      ...state,
      activeRoundedTab: action.payload,
      activeServiceId,
      showNewServiceWizard: false,
      activeTab: "details",
      showNewServicesPricingScreen: false,
      allSelected: false,
      newServicePriceItems: null,
    };
  },

  [drycleaningServicesNamespacer(drycleaningServicesAT.SET_SEARCH_IN_PROGRESS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      searchInProgress: action.payload,
      activeTab: "details",
      activeServiceId: initialState.activeServiceId,
      activeServiceDetails: initialState.activeServiceDetails,
      showNewServiceWizard: false,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.UPDATE_ACTIVE_DRYCLEANING_SERVICE_DETAIL
  )]: (state, action) => {
    return {
      ...state,
      activeServiceDetails: {
        ...state.activeServiceDetails,
        [action.payload.field]: action.payload.value,
      },
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.UPDATE_DRYCLEANING_SERVICE_NAME_IN_LIST
  )]: (state, action) => {
    let newServiceList = {...state.drycleaningServicesList};
    let catIndex, servIndex;
    for (let i = 0; i < newServiceList.categories.length; i++) {
      let category = newServiceList.categories[i];
      let tempSerIndex = category.services.findIndex(
        (service) => service.id === action.payload.id
      );

      if (tempSerIndex !== -1) {
        catIndex = i;
        servIndex = tempSerIndex;
      }
    }

    if (catIndex > -1 && servIndex > -1) {
      newServiceList.categories[catIndex].services[servIndex] = {
        ...newServiceList.categories[catIndex].services[servIndex],
        name: action.payload.value,
      };
      return {
        ...state,
        drycleaningServicesList: newServiceList,
      };
    }
    return {
      ...state,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_DRYCLEANING_SERVICE_DETAILS_UPDATE_IN_PROGRESS
  )]: (state, action) => {
    return {
      ...state,
      serviceDetailsUpdateInProgress: action.payload,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_DRYCLEANING_SERVICE_DETAILS_UPDATE_ERROR
  )]: (state, action) => {
    return {
      ...state,
      serviceDetailsUpdateError: action.payload,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_DRYCLEANING_SERVICE_DETAILS_UPDATED_ID
  )]: (state, action) => {
    let serviceList = state.drycleaningServicesList;
    let drycleaningServicesListCopy = state.drycleaningServicesListCopy;

    for (let category of serviceList) {
      if (category.id === action.payload.serviceCategoryId) {
        for (let service of category.services) {
          if (service.id === action.payload.id) {
            service.id = action.payload.id;
            service.name = action.payload.name;
            service.description = action.payload.description;
          }
        }
      }
    }

    serviceList.forEach((category) => {
      category.services.sort((a, b) => {
        const nameA = a.name.toLowerCase(),
          nameB = b.name.toLowerCase();
        if (nameA < nameB)
          //sort string ascending
          return -1;
        if (nameA > nameB) return 1;
        return 0; //default return value (no sorting)
      });
    });

    for (let category of drycleaningServicesListCopy) {
      if (category.id === action.payload.serviceCategoryId) {
        for (let service of category.services) {
          if (service.id === action.payload.prevId) {
            service.id = action.payload.id;
            service.name = action.payload.name;
            service.description = action.payload.description;
          }
        }
      }
    }

    drycleaningServicesListCopy.forEach((category) => {
      category.services.sort((a, b) => {
        const nameA = a.name.toLowerCase(),
          nameB = b.name.toLowerCase();
        if (nameA < nameB)
          //sort string ascending
          return -1;
        if (nameA > nameB) return 1;
        return 0; //default return value (no sorting)
      });
    });

    return {
      ...state,
      activeServiceDetails: action.payload,
      drycleaningServicesList: serviceList,
      drycleaningServicesListCopy,
      activeServiceId: action.payload.id,
    };
  },

  [drycleaningServicesNamespacer(drycleaningServicesAT.SET_ACTIVE_TAB)]: (
    state,
    action
  ) => {
    return {
      ...state,
      activeTab: action.payload,
      serviceDetailsUpdateError: initialState.serviceDetailsUpdateError,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_HAS_MIN_PRICE_UPDATE_IN_PROGRESS
  )]: (state, action) => {
    return {
      ...state,
      hasMinPriceUpdating: action.payload,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_PER_LOCATION_DRYCLEANING_SERVICE_PRICES_ERROR
  )]: (state, action) => {
    return {
      ...state,
      drycleaningServicesPricesError: action.payload,
    };
  },

  // New Service Wizard price per location case reducer functions below :

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_SHOW_NEW_DRYCLEANING_SERVICE_PRICING_SCREEN
  )]: (state, action) => {
    return {
      ...state,
      showNewServicesPricingScreen: action.payload,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_PRICING_CALL_PROGRESS
  )]: (state, action) => {
    return {
      ...state,
      newServicePricingCallProgress: action.payload,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_PRICING_LOCATIONS_ERROR
  )]: (state, action) => {
    return {
      ...state,
      newServicePricingError: action.payload,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_PRICING_LOCATIONS_LIST
  )]: (state, action) => {
    let newServicePricingLocationList = action.payload;
    newServicePricingLocationList.sort((a, b) => {
      const nameA = a.name.toLowerCase(),
        nameB = b.name.toLowerCase();
      if (nameA < nameB)
        //sort string ascending
        return -1;
      if (nameA > nameB) return 1;
      return 0; //default return value (no sorting)
    });

    const prices = newServicePricingLocationList.map((location, index) => {
      return {
        id: index + 1,
        storeId: location.id,
        storePrice: 0,
        isFeatured: false,
        minPrice: 0,
        minQty: 0,
        isTaxable: false,
        store: {
          name: location.name,
        },
      };
    });

    const newServicePriceItems = {hasMinPrice: true, prices};

    return {
      ...state,
      newServicePricingLocationList,
      newServicePriceItems,
    };
  },
  // handleChange case reducer function
  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_NEW_DRYCLEANING_SERVICE_PRICE_AT_LOCATION
  )]: (state, action) => {
    const {storeId, field, value} = action.payload;
    const {newServicePriceItems} = state;
    const itemIndex = newServicePriceItems.prices.findIndex(
      (price) => price.storeId === storeId
    );

    newServicePriceItems.prices[itemIndex] = {
      ...newServicePriceItems.prices[itemIndex],
      [field]: value,
    };

    const notAllSelected = newServicePriceItems.prices.some(
      (item) => item.isFeatured === false
    );

    return {
      ...state,
      newServicePriceItems: {
        ...newServicePriceItems,
        prices: [...newServicePriceItems.prices],
      },
      allSelected: notAllSelected ? false : true, // can be replaced with `allSelected: !notAllSelected` but this is easier to understand
    };
  },

  [drycleaningServicesNamespacer(drycleaningServicesAT.SET_MINIMUM_TOGGLE_VALUE)]: (
    state,
    action
  ) => {
    let {newServicePriceItems} = state;

    return {
      ...state,
      newServicePriceItems: {...newServicePriceItems, hasMinPrice: action.payload},
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_SELECT_ALL_DRYCLEANING_SERVICE_LOCATIONS
  )]: (state, action) => {
    let {newServicePriceItems} = state;
    let updatedPriceItems = newServicePriceItems.prices.map((item) => ({
      ...item,
      isFeatured: action.payload,
    }));
    return {
      ...state,
      newServicePriceItems: {...newServicePriceItems, prices: [...updatedPriceItems]},
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_APPLY_ALL_DRYCLEANING_SERVICE_PRICES
  )]: (state, action) => {
    let {newServicePriceItems} = state;
    let {minQty, minPrice, isTaxable, storePrice} = newServicePriceItems.prices[
      action?.payload || 0
    ];
    let updatedPriceItems = newServicePriceItems.prices.map((item) => ({
      ...item,
      minQty,
      minPrice,
      isTaxable,
      storePrice,
    }));

    return {
      ...state,
      newServicePriceItems: {...newServicePriceItems, prices: [...updatedPriceItems]},
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.UPDATE_DEFAULT_PRICE_ARRAY_OF_DRYCLEANING_SERVICE
  )]: (state, action) => {
    let drycleaningServicesList = {...state.drycleaningServicesList};
    let drycleaningServicesListCopy = {...state.drycleaningServicesListCopy};

    if (!drycleaningServicesList || !drycleaningServicesListCopy) {
      return state;
    }

    let newDefaultPrices = action.payload.prices.map((price) => Number(price.storePrice));
    newDefaultPrices = [...new Set(newDefaultPrices)];

    let listCategoryIndex = drycleaningServicesList.categories.findIndex(
      (cat) => cat.id === action.payload.serviceCategoryId
    );
    if (listCategoryIndex !== -1) {
      let listServiceIndex = drycleaningServicesList.categories[
        listCategoryIndex
      ].services.findIndex((service) => service.id === action.payload.serviceId);
      if (listServiceIndex !== -1) {
        let service =
          drycleaningServicesList.categories[listCategoryIndex].services[
            listServiceIndex
          ];

        drycleaningServicesList.categories[listCategoryIndex].services[
          listServiceIndex
        ] = {
          ...service,
          defaultPrice: newDefaultPrices,
        };
      }
    }

    let listCopyCategoryIndex = drycleaningServicesListCopy.categories.findIndex(
      (cat) => cat.id === action.payload.serviceCategoryId
    );
    if (listCopyCategoryIndex !== -1) {
      let listCopyServiceIndex = drycleaningServicesListCopy.categories[
        listCopyCategoryIndex
      ].services.findIndex((service) => service.id === action.payload.serviceId);
      if (listCopyServiceIndex !== -1) {
        let service =
          drycleaningServicesListCopy.categories[listCopyCategoryIndex].services[
            listCopyServiceIndex
          ];

        drycleaningServicesListCopy.categories[listCopyCategoryIndex].services[
          listCopyServiceIndex
        ] = {
          ...service,
          defaultPrice: newDefaultPrices,
        };
      }
    }

    return {
      ...state,
      drycleaningServicesList,
      drycleaningServicesListCopy,
    };
  },

  [drycleaningServicesNamespacer(drycleaningServicesAT.INCREMENT_PRICE_UPDATE_COUNTER)]: (
    state,
    action
  ) => {
    return {
      ...state,
      numberOfActivePriceUpdates: state.numberOfActivePriceUpdates + 1,
    };
  },

  [drycleaningServicesNamespacer(drycleaningServicesAT.DECREMENT_PRICE_UPDATE_COUNTER)]: (
    state,
    action
  ) => {
    return {
      ...state,
      numberOfActivePriceUpdates: state.numberOfActivePriceUpdates - 1,
    };
  },

  [drycleaningServicesNamespacer(drycleaningServicesAT.SET_ARCHIVE_ERROR)]: (
    state,
    action
  ) => {
    return {
      ...state,
      archiveError: action.payload,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_DRYCLEANING_SERVICES_TOP_LEVEL_STATE
  )]: (state, action) => {
    return {
      ...state,
      newdrycleaningServicesList: action.payload,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_DRYCLEANING_SERVICES_CATEGORIES
  )]: (state, action) => {
    return {
      ...state,
      drycleaningServicesCategories: action.payload,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_DRYCLEANING_SERVICES_PRICING_TYPES
  )]: (state, action) => {
    return {
      ...state,
      pricingTypes: action.payload,
    };
  },

  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_DRYCLEANING_SERVICES_SUBSERVICES
  )]: (state, action) => {
    return {
      ...state,
      drycleaningServicesSubcategories: action.payload,
    };
  },
  [drycleaningServicesNamespacer(drycleaningServicesAT.SET_SHOW_NEW_CATEGORY_SCREEN)]: (
    state,
    action
  ) => {
    return {
      ...state,
      showNewCategoryScreen: action.payload,
      newCategoryError: "",
    };
  },
  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_DRYCLEANING_SERVICE_CATEGORY
  )]: (state, action) => {
    return {
      ...state,
      categoryForAService: action.payload.data.categories,
    };
  },
  [drycleaningServicesNamespacer(
    drycleaningServicesAT.UPDATE_DRYCLEANING_SERVICE_CATEGORY
  )]: (state, action) => {
    return {
      ...state,
      categoryForAService: action.payload,
    };
  },
  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_NEW_DRYCLEANING_CATEGORY_ID
  )]: (state, action) => {
    return {
      ...state,
      newCategoryId: action.payload,
    };
  },
  [drycleaningServicesNamespacer(
    drycleaningServicesAT.UPDATE_DRYCLEANING_SERVICE_LIST
  )]: (state, action) => {
    return {
      ...state,
      newdrycleaningServicesList: action.payload,
    };
  },
  [drycleaningServicesNamespacer(
    drycleaningServicesAT.SET_SHOW_NEW_CATEGORY_SCREEN_IN_DETAILS
  )]: (state, action) => {
    return {
      ...state,
      showNewCategoryScreenInDetails: action.payload,
      newCategoryError: "",
    };
  },
  [drycleaningServicesNamespacer(drycleaningServicesAT.SET_SERVICES_REFRESH)]: (
    state,
    action
  ) => {
    return {
      ...state,
      servicesRefresh: action.payload,
    };
  },
};

export default createReducer(initialState, handlers, [nameSpace]);
