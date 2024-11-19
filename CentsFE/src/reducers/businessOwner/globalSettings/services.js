import {createNamespacer, createReducer} from "../../../utils/reducers";
import actionTypes from "../../../actionTypes";
import {orderBy, sortBy} from "lodash";

const initialState = {
  servicesList: [],
  servicesListCopy: [],
  servicesListError: "",
  getAllServicesCallInProgress: false,
  activeServiceId: null,
  addNewServiceCallInProgress: false,
  addNewServiceError: "",
  showNewServiceWizard: false,
  activeServiceDetails: null,
  isServiceDetailsLoading: false,
  serviceDetailsError: "",
  isInServiceEditMode: false,
  showServicePricesScreen: false,
  pricePerLocationCallInProgress: false,
  servicesCategoryList: {},
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
  servicesPricesError: "",
  showNewServicesPricingScreen: false,
  newServicePricingCallProgress: false,
  newServicePricingError: "",
  newServicePriceItems: null,
  newServicePricingLocationList: null,
  newServiceName: "",
  numberOfActivePriceUpdates: 0,
  showAddModifierScreen: false,
  isModifierUpdate: false,
  modifiersListCallInProgress: false,
  modifiersCallError: "",
  modifiers: [],
  createModifierCallInProgress: false,
  createModifierError: "",
  toggleModifierError: "",
  updateModifierValues: null,
  archiveError: "",
  newServicesList: [],
  servicesCategories: [],
  servicesSubcategories: [],
  pricingTypes: [],
  showNewCategoryScreen: false,
  newCategoryError: "",
  showNewCategoryScreenInDetails: false,
  categoryForAService: [],
  newCategoryId: "",
  servicesRefresh: false,
  modifiersRefresh: false,
  servicesSearchResults: [],
};

const nameSpace = "BO-SERVICES";
const servicesNamespacer = createNamespacer(nameSpace);
const servicesAT = actionTypes.businessOwner.globalSettings.services;

const handlers = {
  [servicesNamespacer(servicesAT.SET_ALL_SERVICES)]: (state, action) => {
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
    let activeRoundedTab;
    let servicesList = action.payload.serviceCategories;
    let washandfold = {};
    let services = [];
    servicesList.forEach((item) => {
      if (item.category !== "PER_POUND") {
        services.push(item);
      } else {
        washandfold = item;
      }
    });
    services = sortBy(services, (o) => o.category.toLowerCase());
    services.unshift(washandfold);

    return {
      ...state,
      servicesList: services,
      servicesListCopy: services,
      activeRoundedTab:
        state.activeRoundedTab === "per-pound"
          ? services[0]?.services?.length !== 0
            ? "per-pound"
            : services[1]?.services?.length !== 0
            ? "fixed-price"
            : activeRoundedTab
          : services[1]?.services?.length !== 0
          ? "fixed-price"
          : services[0]?.services?.length !== 0
          ? "per-pound"
          : activeRoundedTab,
      activeServiceId: !(
        state.activeRoundedTab === "fixed-price" && services[1]?.services?.length !== 0
      )
        ? services[0]?.services?.length !== 0
          ? services[0]?.services[0]?.id
          : services[1]?.services?.length !== 0
          ? services[1]?.services[0]?.id
          : null
        : services[1]?.services[0]?.id,
    };
  },

  [servicesNamespacer(servicesAT.SET_SERVICES_CATEGORY_LIST)]: (state, action) => {
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
      servicesCategoryList: {fixedPriceId, perPoundId},
    };
  },

  [servicesNamespacer(servicesAT.SET_SERVICES_CALL_PROGRESS)]: (state, action) => {
    return {
      ...state,
      getAllServicesCallInProgress: action.payload,
    };
  },

  [servicesNamespacer(servicesAT.SET_SERVICES_ERROR)]: (state, action) => {
    return {
      ...state,
      servicesListError: action.payload,
    };
  },

  [servicesNamespacer(servicesAT.SET_ACTIVE_SERVICE)]: (state, action) => {
    return {
      ...state,
      activeServiceId: action.payload,
      showNewServiceWizard: false,
      isInServiceEditMode: false,
      showServicePricesScreen: false,
      activeTab: "details",
    };
  },

  [servicesNamespacer(servicesAT.SET_NEW_SERVICE_CALL_PROGRESS)]: (state, action) => {
    return {
      ...state,
      addNewServiceCallInProgress: action.payload,
    };
  },

  [servicesNamespacer(servicesAT.SET_NEW_SERVICE_ERROR)]: (state, action) => {
    return {
      ...state,
      addNewServiceError: action.payload,
    };
  },

  [servicesNamespacer(servicesAT.SET_SHOW_NEW_SERVICE_WIZARD)]: (state, action) => {
    let additionalStateValue = {};
    let {newServicePriceItems, activeRoundedTab} = state;

    if (action.payload) {
      additionalStateValue.activeServiceId = null;
    } else {
      if (state.activeServiceId === null && state.servicesList.categories?.length > 0) {
        additionalStateValue.activeServiceId =
          state.servicesList.categories[0].services.length !== 0
            ? state.servicesList.categories[0].services[0].id
            : state.servicesList.categories[1].services.length !== 0
            ? state.servicesList.categories[1].services[0].id
            : null;
      }
      newServicePriceItems = null;
      activeRoundedTab = "per-pound";
    }
    return {
      ...state,
      showNewServiceWizard: action.payload,
      isInServiceEditMode: false,
      showServicePricesScreen: false,
      ...additionalStateValue,
      addNewServiceError: "",
      newServicePriceItems,
      activeRoundedTab,
      allSelected: false,
    };
  },

  [servicesNamespacer(servicesAT.SET_ACTIVE_SERVICE_DETAILS)]: (state, action) => {
    return {
      ...state,
      activeServiceDetails: action.payload,
      showNewServicesPricingScreen: false,
      newServicePriceItems: null,
      serviceDetailsUpdateError: initialState.serviceDetailsUpdateError,
    };
  },

  [servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_CALL_IN_PROGRESS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      isServiceDetailsLoading: action.payload,
    };
  },

  [servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_ERROR)]: (state, action) => {
    return {
      ...state,
      serviceDetailsError: action.payload,
    };
  },

  [servicesNamespacer(servicesAT.SET_SHOW_UPDATE_SERVICE)]: (state, action) => {
    return {
      ...state,
      isInServiceEditMode: true,
      showNewServiceWizard: true,
    };
  },

  [servicesNamespacer(servicesAT.SET_SHOW_SERVICE_PRICES_SCREEN)]: (state, action) => {
    return {
      ...state,
      showServicePricesScreen: action.payload,
      showNewServiceWizard: false,
    };
  },

  [servicesNamespacer(servicesAT.UPDATE_SERVICES_PRICE_PER_LOCATION)]: (
    state,
    action
  ) => {
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

  [servicesNamespacer(servicesAT.SET_PER_LOCATION_SERVICE_PRICES_CALL_PROGRESS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      pricePerLocationCallInProgress: action.payload,
    };
  },

  [servicesNamespacer(servicesAT.TOGGLE_MINIMUM_IN_PRICE_PER_LOCATION)]: (
    state,
    action
  ) => {
    let {activeServiceDetails} = state;
    activeServiceDetails.hasMinPrice = action.payload;

    return {
      ...state,
      activeServiceDetails: {...activeServiceDetails},
    };
  },

  [servicesNamespacer(servicesAT.APPLY_TO_ALL)]: (state, action) => {
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

  [servicesNamespacer(servicesAT.SET_NEW_SERVICE_ACTIVE_ID)]: (state, action) => {
    let {servicesCategoryList} = state;
    let activeServiceId = action.payload.id;
    let activeRoundedTab =
      servicesCategoryList.fixedPriceId === action.payload.serviceCategoryId
        ? "fixed-price"
        : "per-pound";

    return {
      ...state,
      activeServiceId,
      showNewServiceWizard: false,
      showServicePricesScreen: false,
      activeRoundedTab,
      newServicePriceItems: null,
    };
  },

  [servicesNamespacer(servicesAT.SET_SERVICE_SEARCH_TEXT)]: (state, action) => {
    let {servicesListCopy, activeRoundedTab} = state;
    let searchText = action.payload;
    let activeServiceId;
    if (
      !(
        servicesListCopy.categories?.length > 0 && servicesListCopy.categories[0].services
      )
    ) {
      return {
        ...state,
        searchText,
      };
    }

    const perPoundFilteredList =
      servicesListCopy.categories?.length > 0 && servicesListCopy.categories[0].services
        ? servicesListCopy.categories[0].services.filter((perPoundService) => {
            const nameInLowerCase = perPoundService.name.toLowerCase();
            const searchTextInLowerCase = searchText.toLowerCase();
            return nameInLowerCase.indexOf(searchTextInLowerCase) > -1;
          })
        : [];

    const fixedPriceFilteredList =
      servicesListCopy.categories?.length > 1 && servicesListCopy.categories[1].services
        ? servicesListCopy.categories[1].services.filter((fixedPriceService) => {
            const nameInLowerCase = fixedPriceService.name.toLowerCase();
            const searchTextInLowerCase = searchText.toLowerCase();
            return nameInLowerCase.indexOf(searchTextInLowerCase) > -1;
          })
        : [];

    const filteredServicesList = {
      categories: [
        {
          ...servicesListCopy.categories[0],
          services: perPoundFilteredList,
        },
        {
          ...servicesListCopy.categories[1],
          services: fixedPriceFilteredList,
        },
      ],
    };

    if (searchText === "") {
      if (state.searchInProgress) {
        activeServiceId = null;
      } else if (activeRoundedTab === "per-pound") {
        activeServiceId =
          filteredServicesList.categories[0].services.length !== 0
            ? filteredServicesList.categories[0].services[0].id
            : null;
      } else {
        activeServiceId =
          filteredServicesList.categories[1].services.length !== 0
            ? filteredServicesList.categories[1].services[0].id
            : null;
      }
    } else {
      activeServiceId =
        filteredServicesList.categories[0].services.length !== 0
          ? filteredServicesList.categories[0].services[0].id
          : filteredServicesList.categories[1].services.length !== 0
          ? filteredServicesList.categories[1].services[0].id
          : null;
    }

    return {
      ...state,
      servicesList: filteredServicesList,
      searchText,
      activeServiceId,
      activeTab: "details",
    };
  },

  [servicesNamespacer(servicesAT.SET_CENTS20_SERVICE_SEARCH_TEXT)]: (state, action) => {
    let {servicesListCopy} = state;
    let searchText = action.payload;
    let activeServiceId;
    if (!(servicesListCopy?.length > 0)) {
      return {
        ...state,
        searchText,
      };
    }
    const allServices = servicesListCopy.map((item) => item.services).flat();
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
      servicesSearchResults: searchResultsList,
      searchText,
      activeServiceId,
      activeTab: "details",
    };
  },

  [servicesNamespacer(servicesAT.SET_ACTIVE_ROUNDED_TAB)]: (state, action) => {
    let activeServiceId;
    let {servicesList} = state;

    /*  Change the active service id on tab switch */

    if (action.payload === "per-pound") {
      activeServiceId =
        servicesList.categories?.length > 0 &&
        servicesList.categories[0].services.length > 0
          ? servicesList.categories[0].services[0].id
          : null;
    } else {
      activeServiceId =
        servicesList.categories?.length > 1 &&
        servicesList.categories[1].services.length !== 0
          ? servicesList.categories[1].services[0].id
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

  [servicesNamespacer(servicesAT.SET_SEARCH_IN_PROGRESS)]: (state, action) => {
    return {
      ...state,
      searchInProgress: action.payload,
      activeTab: "details",
      activeServiceId: initialState.activeServiceId,
      activeServiceDetails: initialState.activeServiceDetails,
      showNewServiceWizard: false,
    };
  },

  [servicesNamespacer(servicesAT.UPDATE_ACTIVE_SERVICE_DETAIL)]: (state, action) => {
    return {
      ...state,
      activeServiceDetails: {
        ...state.activeServiceDetails,
        [action.payload.field]: action.payload.value,
      },
    };
  },

  [servicesNamespacer(servicesAT.UPDATE_SERVICE_NAME_IN_LIST)]: (state, action) => {
    let newServiceList = {...state.servicesList};
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
        servicesList: newServiceList,
      };
    }
    return {
      ...state,
    };
  },

  [servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_UPDATE_IN_PROGRESS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      serviceDetailsUpdateInProgress: action.payload,
    };
  },

  [servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_UPDATE_ERROR)]: (state, action) => {
    return {
      ...state,
      serviceDetailsUpdateError: action.payload,
    };
  },

  [servicesNamespacer(servicesAT.SET_SERVICE_DETAILS_UPDATED_ID)]: (state, action) => {
    let serviceList = state.servicesList;
    let servicesListCopy = state.servicesListCopy;

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

    for (let category of servicesListCopy) {
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

    servicesListCopy.forEach((category) => {
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
      servicesList: serviceList,
      servicesListCopy,
      activeServiceId: action.payload.id,
    };
  },

  [servicesNamespacer(servicesAT.SET_ACTIVE_TAB)]: (state, action) => {
    return {
      ...state,
      activeTab: action.payload,
      serviceDetailsUpdateError: initialState.serviceDetailsUpdateError,
    };
  },

  [servicesNamespacer(servicesAT.SET_HAS_MIN_PRICE_UPDATE_IN_PROGRESS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      hasMinPriceUpdating: action.payload,
    };
  },

  [servicesNamespacer(servicesAT.SET_PER_LOCATION_SERVICE_PRICES_ERROR)]: (
    state,
    action
  ) => {
    return {
      ...state,
      servicesPricesError: action.payload,
    };
  },

  // New Service Wizard price per location case reducer functions below :

  [servicesNamespacer(servicesAT.SET_SHOW_NEW_SERVICE_PRICING_SCREEN)]: (
    state,
    action
  ) => {
    return {
      ...state,
      showNewServicesPricingScreen: action.payload,
    };
  },

  [servicesNamespacer(servicesAT.SET_NEW_SERVICE_PRICING_CALL_PROGRESS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      newServicePricingCallProgress: action.payload,
    };
  },

  [servicesNamespacer(servicesAT.SET_NEW_SERVICE_PRICING_LOCATIONS_ERROR)]: (
    state,
    action
  ) => {
    return {
      ...state,
      newServicePricingError: action.payload,
    };
  },

  [servicesNamespacer(servicesAT.SET_NEW_SERVICE_PRICING_LOCATIONS_LIST)]: (
    state,
    action
  ) => {
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
  [servicesNamespacer(servicesAT.SET_NEW_SERVICE_PRICE_AT_LOCATION)]: (state, action) => {
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

  [servicesNamespacer(servicesAT.SET_MINIMUM_TOGGLE_VALUE)]: (state, action) => {
    let {newServicePriceItems} = state;

    return {
      ...state,
      newServicePriceItems: {...newServicePriceItems, hasMinPrice: action.payload},
    };
  },

  [servicesNamespacer(servicesAT.SET_SELECT_ALL_SERVICE_LOCATIONS)]: (state, action) => {
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

  [servicesNamespacer(servicesAT.SET_APPLY_ALL_SERVICE_PRICES)]: (state, action) => {
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

  [servicesNamespacer(servicesAT.UPDATE_DEFAULT_PRICE_ARRAY_OF_SERVICE)]: (
    state,
    action
  ) => {
    let servicesList = {...state.servicesList};
    let servicesListCopy = {...state.servicesListCopy};

    if (!servicesList || !servicesListCopy) {
      return state;
    }

    let newDefaultPrices = action.payload.prices.map((price) => Number(price.storePrice));
    newDefaultPrices = [...new Set(newDefaultPrices)];

    let listCategoryIndex = servicesList.categories.findIndex(
      (cat) => cat.id === action.payload.serviceCategoryId
    );
    if (listCategoryIndex !== -1) {
      let listServiceIndex = servicesList.categories[
        listCategoryIndex
      ].services.findIndex((service) => service.id === action.payload.serviceId);
      if (listServiceIndex !== -1) {
        let service =
          servicesList.categories[listCategoryIndex].services[listServiceIndex];

        servicesList.categories[listCategoryIndex].services[listServiceIndex] = {
          ...service,
          defaultPrice: newDefaultPrices,
        };
      }
    }

    let listCopyCategoryIndex = servicesListCopy.categories.findIndex(
      (cat) => cat.id === action.payload.serviceCategoryId
    );
    if (listCopyCategoryIndex !== -1) {
      let listCopyServiceIndex = servicesListCopy.categories[
        listCopyCategoryIndex
      ].services.findIndex((service) => service.id === action.payload.serviceId);
      if (listCopyServiceIndex !== -1) {
        let service =
          servicesListCopy.categories[listCopyCategoryIndex].services[
            listCopyServiceIndex
          ];

        servicesListCopy.categories[listCopyCategoryIndex].services[
          listCopyServiceIndex
        ] = {
          ...service,
          defaultPrice: newDefaultPrices,
        };
      }
    }

    return {
      ...state,
      servicesList,
      servicesListCopy,
    };
  },

  [servicesNamespacer(servicesAT.INCREMENT_PRICE_UPDATE_COUNTER)]: (state, action) => {
    return {
      ...state,
      numberOfActivePriceUpdates: state.numberOfActivePriceUpdates + 1,
    };
  },

  [servicesNamespacer(servicesAT.DECREMENT_PRICE_UPDATE_COUNTER)]: (state, action) => {
    return {
      ...state,
      numberOfActivePriceUpdates: state.numberOfActivePriceUpdates - 1,
    };
  },

  [servicesNamespacer(servicesAT.SHOW_HIDE_ADD_MODIFIER_SCREEN)]: (state, action) => {
    return {
      ...state,
      showAddModifierScreen: action.payload,
      isModifierUpdate: action.isUpdate,
      createModifierError: "",
      modifiersCallError: "",
      toggleModifierError: "",
    };
  },

  [servicesNamespacer(servicesAT.SET_MODIFIERS_CALL_PROGRESS)]: (state, action) => {
    return {
      ...state,
      modifiersListCallInProgress: action.payload,
    };
  },

  [servicesNamespacer(servicesAT.SET_MODIFIERS_CALL_ERROR)]: (state, action) => {
    return {
      ...state,
      modifiersCallError: action.payload,
    };
  },

  [servicesNamespacer(servicesAT.SET_MODIFIERS_LIST)]: (state, action) => {
    const sortedModifiers = orderBy(
      action.payload,
      [(modifier) => modifier.name.toLowerCase()],
      ["asc"]
    );
    return {
      ...state,
      modifiersRefresh: true,
      modifiers: sortedModifiers,
    };
  },

  [servicesNamespacer(servicesAT.SET_CREATE_MODIFIER_CALL_PROGRESS)]: (state, action) => {
    return {
      ...state,
      createModifierCallInProgress: action.payload,
    };
  },

  [servicesNamespacer(servicesAT.SET_CREATE_MODIFIER_CALL_ERROR)]: (state, action) => {
    return {
      ...state,
      createModifierError: action.payload,
    };
  },

  [servicesNamespacer(servicesAT.TOGGLE_MODIFIER_IS_FEATURED)]: (state, action) => {
    const modifiers = [...state.modifiers];
    const {isFeatured, serviceModifierId} = action.payload;
    const index = modifiers.findIndex(
      (modifier) => modifier.serviceModifierId === serviceModifierId
    );
    modifiers[index].isFeatured = isFeatured;

    return {
      ...state,
      modifiers,
    };
  },

  [servicesNamespacer(servicesAT.TOGGLE_MODIFIER_ERROR)]: (state, action) => {
    return {
      ...state,
      toggleModifierError: action.payload,
    };
  },

  [servicesNamespacer(servicesAT.CLEAR_MODIFIERS)]: (state, action) => {
    return {
      ...state,
      modifiers: [],
      modifiersCallError: "",
      createModifierError: "",
      toggleModifierError: "",
    };
  },

  [servicesNamespacer(servicesAT.SET_UPDATE_VALUES)]: (state, action) => {
    return {
      ...state,
      updateModifierValues: action.payload,
    };
  },

  [servicesNamespacer(servicesAT.SET_ARCHIVE_ERROR)]: (state, action) => {
    return {
      ...state,
      archiveError: action.payload,
    };
  },

  [servicesNamespacer(servicesAT.SET_SERVICES_TOP_LEVEL_STATE)]: (state, action) => {
    return {
      ...state,
      newServicesList: action.payload,
    };
  },

  [servicesNamespacer(servicesAT.SET_SERVICES_CATEGORIES)]: (state, action) => {
    return {
      ...state,
      servicesCategories: action.payload,
    };
  },

  [servicesNamespacer(servicesAT.SET_SERVICES_PRICING_TYPES)]: (state, action) => {
    return {
      ...state,
      pricingTypes: action.payload,
    };
  },

  [servicesNamespacer(servicesAT.SET_SERVICES_SUBSERVICES)]: (state, action) => {
    return {
      ...state,
      servicesSubcategories: action.payload,
    };
  },
  [servicesNamespacer(servicesAT.SET_SHOW_NEW_CATEGORY_SCREEN)]: (state, action) => {
    return {
      ...state,
      showNewCategoryScreen: action.payload,
      newCategoryError: "",
    };
  },
  [servicesNamespacer(servicesAT.SET_SERVICE_CATEGORY)]: (state, action) => {
    return {
      ...state,
      categoryForAService: action.payload.data.categories,
    };
  },
  [servicesNamespacer(servicesAT.UPDATE_SERVICE_CATEGORY)]: (state, action) => {
    return {
      ...state,
      categoryForAService: action.payload,
    };
  },
  [servicesNamespacer(servicesAT.SET_NEW_CATEGORY_ID)]: (state, action) => {
    return {
      ...state,
      newCategoryId: action.payload,
    };
  },
  [servicesNamespacer(servicesAT.UPDATE_SERVICE_LIST)]: (state, action) => {
    return {
      ...state,
      newServicesList: action.payload,
    };
  },
  [servicesNamespacer(servicesAT.SET_SHOW_NEW_CATEGORY_SCREEN_IN_DETAILS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      showNewCategoryScreenInDetails: action.payload,
      newCategoryError: "",
    };
  },
  [servicesNamespacer(servicesAT.SET_SERVICES_REFRESH)]: (state, action) => {
    return {
      ...state,
      servicesRefresh: action.payload,
    };
  },
  [servicesNamespacer(servicesAT.SET_MODIFIER_REFRESH)]: (state, action) => {
    return {
      ...state,
      modifiersRefresh: action.payload,
    };
  },
};

export default createReducer(initialState, handlers, [nameSpace]);
