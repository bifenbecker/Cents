import {createNamespacer, createReducer} from "../../../utils/reducers";
import actionTypes from "../../../actionTypes";
import cloneDeep from "lodash/cloneDeep";
import sortBy from "lodash/sortBy";
import {faLungs} from "@fortawesome/free-solid-svg-icons";

const initialState = {
  promotionsList: [],
  promotionsListCopy: [],
  promotionsListError: "",
  getAllPromotionsCallInProgress: false,
  activePromotionId: null,
  addNewPromotionCallInProgress: false,
  addNewPromotionError: "",
  showNewPromotionWizard: false,
  activePromotionDetails: null,
  activePromotionInsights: null,
  isPromotionDetailsLoading: false,
  promotionDetailsError: "",
  isInPromotionEditMode: false,
  searchText: "",
  roundedTabs: [
    {label: "Active", value: "active"},
    {label: "Inactive", value: "inactive"},
  ],
  activeRoundedTab: "active",
  searchInProgress: false,
  promotionDetailsUpdateInProgress: false,
  promotionDetailsUpdateError: "",
  showNewPromotionsPricingScreen: false,
  newPromotionPriceItems: null,
  newPromotionName: "",
  numberOfActivePriceUpdates: 0,
  stepInPromotionWizard: 1,
  fetchLocationsCallInProgress: false,
  fetchLocationsListError: "",
  allLocations: {
    regions: [],
    locations: [],
    needsRegions: false,
    storesWithoutRegions: [],
  },
  selectedLocations: [],
  showProductsAndServicesScreen: false,
  servicesCallInProgress: false,
  servicesListCallError: "",
  servicesList: [],
  servicesListCopy: [],
  productsCallInProgress: false,
  productsListCallError: "",
  productsList: [],
  productsListCopy: [],
  selectAllServices: false,
  selectAllProducts: false,
  itemsCount: 0,
  isLocationsLoading: false,
  // allLocations: null,
  locationsError: "",
  createPromotionCallInProgress: false,
  createPromotionError: "",
  isDetailsProductPickerVisible: false,
  newPromoAndValue: {
    name: "",
    discountValue: "",
  },
  hasDetailsEndDate: false,
  activePromotionDetailsUpdateErrors: {},
  customerRedemptionLimitCopy: "",
};

const nameSpace = "BO-PROMOTIONS";
const promotionsNamespacer = createNamespacer(nameSpace);
const promotionsAT = actionTypes.businessOwner.globalSettings.promotions;

const handlers = {
  [promotionsNamespacer(promotionsAT.SET_ALL_PROMOTIONS)]: (state, action) => {
    const promotionsList = sortBy(action.payload.promotionPrograms, [
      (promo) => promo.name.toLowerCase(),
    ]);
    let activePromotions = [];
    let inactivePromotions = [];
    promotionsList.forEach((promotion) => {
      if (promotion.active) activePromotions.push(promotion);
      else inactivePromotions.push(promotion);
    });
    const activePromotionId =
      activePromotions.length !== 0
        ? activePromotions[0].id
        : inactivePromotions.length !== 0
        ? inactivePromotions[0].id
        : null;
    const activeRoundedTab =
      inactivePromotions.length !== 0 && activePromotions.length === 0
        ? "inactive"
        : "active";

    return {
      ...state,
      promotionsList,
      promotionsListCopy: promotionsList,
      activePromotionId,
      activeRoundedTab,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_PROMOTIONS_CALL_PROGRESS)]: (state, action) => {
    return {
      ...state,
      getAllPromotionsCallInProgress: action.payload,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_PROMOTIONS_ERROR)]: (state, action) => {
    return {
      ...state,
      promotionsListError: action.payload,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_ACTIVE_PROMOTION)]: (state, action) => {
    return {
      ...state,
      activePromotionId: action.payload,
      showNewPromotionWizard: false,
      isInPromotionEditMode: false,
      isDetailsProductPickerVisible: false,
      activePromotionDetailsUpdateErrors: initialState.activePromotionDetailsUpdateErrors,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_NEW_PROMOTION_CALL_PROGRESS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      addNewPromotionCallInProgress: action.payload,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_NEW_PROMOTION_ERROR)]: (state, action) => {
    return {
      ...state,
      addNewPromotionError: action.payload,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_SHOW_NEW_PROMOTION_WIZARD)]: (state, action) => {
    let additionalStateValue = {};
    let {newPromotionPriceItems, promotionsList, activeRoundedTab} = state;
    let newPromoAndValue = {name: "", discountValue: ""};
    if (action.payload) {
      additionalStateValue.activePromotionId = null;
      activeRoundedTab = "active";
    } else {
      if (state.activePromotionId === null && promotionsList.length > 0) {
        let activePromotions = [];
        let inactivePromotions = [];
        promotionsList.forEach((promotion) => {
          if (promotion.active) activePromotions.push(promotion);
          else inactivePromotions.push(promotion);
        });
        additionalStateValue.activePromotionId =
          activePromotions.length !== 0
            ? activePromotions[0].id
            : inactivePromotions.length !== 0
            ? inactivePromotions[0].id
            : null;
        activeRoundedTab =
          inactivePromotions.length !== 0 && activePromotions.length === 0
            ? "inactive"
            : "active";
      }
      newPromotionPriceItems = null;
    }
    return {
      ...state,
      showNewPromotionWizard: action.payload,
      isInPromotionEditMode: false,
      ...additionalStateValue,
      addNewPromotionError: "",
      newPromotionPriceItems,
      activeRoundedTab,
      allSelected: false,
      newPromoAndValue,
      itemsCount: 0,
      createPromotionError: "",
    };
  },

  [promotionsNamespacer(promotionsAT.SET_PROMOTION_SEARCH_TEXT)]: (state, action) => {
    let {promotionsListCopy, activeRoundedTab} = state;
    let searchText = action.payload;
    let activePromotionId;

    const filteredPromotionsList = promotionsListCopy.length
      ? promotionsListCopy.filter((promotion) => {
          const nameInLowerCase = promotion.name.toLowerCase();
          const searchTextInLowerCase = searchText.toLowerCase();
          return nameInLowerCase.indexOf(searchTextInLowerCase) > -1;
        })
      : [];

    let activePromotions = [];
    let inactivePromotions = [];
    filteredPromotionsList.forEach((promotion) => {
      if (promotion.active) activePromotions.push(promotion);
      else inactivePromotions.push(promotion);
    });

    if (searchText === "") {
      if (state.searchInProgress) {
        activePromotionId = null;
      } else if (activeRoundedTab === "active") {
        activePromotionId = activePromotions.length > 0 ? activePromotions[0].id : null;
      } else {
        activePromotionId =
          inactivePromotions.length > 0 ? inactivePromotions[0].id : null;
      }
    } else {
      activePromotionId =
        filteredPromotionsList.length > 0 ? filteredPromotionsList[0].id : null;
    }

    return {
      ...state,
      promotionsList: filteredPromotionsList,
      searchText,
      activePromotionId,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_ACTIVE_ROUNDED_TAB)]: (state, action) => {
    let activePromotionId;
    let {promotionsList} = state;

    let activePromotions = [];
    let inactivePromotions = [];
    promotionsList.forEach((promotion) => {
      if (promotion.active) activePromotions.push(promotion);
      else inactivePromotions.push(promotion);
    });

    let additionalStateFields = {};

    if (!action.preventAutoSelect) {
      if (action.payload === "active") {
        activePromotionId = activePromotions.length > 0 ? activePromotions[0].id : null;
      } else {
        activePromotionId =
          inactivePromotions.length > 0 ? inactivePromotions[0].id : null;
      }

      additionalStateFields.activePromotionId = activePromotionId;
    }

    return {
      ...state,
      activeRoundedTab: action.payload,
      showNewPromotionWizard: false,
      ...additionalStateFields,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_SEARCH_IN_PROGRESS)]: (state, action) => {
    return {
      ...state,
      searchInProgress: action.payload,
      activePromotionId: initialState.activePromotionId,
      showNewPromotionWizard: false,
    };
  },

  [promotionsNamespacer(promotionsAT.GET_PROMOTION_DETAILS_STARTED)]: (state, action) => {
    return {
      ...state,
      isPromotionDetailsLoading: true,
      activePromotionDetails: null,
      customerRedemptionLimitCopy: initialState.customerRedemptionLimitCopy,
      activePromotionInsights: null,
      promotionDetailsError: "",
    };
  },

  [promotionsNamespacer(promotionsAT.GET_PROMOTION_DETAILS_SUCCEEDED)]: (
    state,
    action
  ) => {
    let {details, insights} = action.payload;

    let hasDetailsEndDate = details.endDate ? true : false;
    return {
      ...state,
      isPromotionDetailsLoading: false,
      activePromotionDetails: details,
      customerRedemptionLimitCopy: details.customerRedemptionLimit,
      activePromotionInsights: insights,
      promotionDetailsError: "",
      hasDetailsEndDate,
    };
  },

  [promotionsNamespacer(promotionsAT.GET_PROMOTION_DETAILS_FAILED)]: (state, action) => {
    return {
      ...state,
      isPromotionDetailsLoading: false,
      activePromotionDetails: null,
      customerRedemptionLimitCopy: initialState.customerRedemptionLimitCopy,
      activePromotionInsights: null,
      promotionDetailsError: action.paylaod,
    };
  },

  [promotionsNamespacer(promotionsAT.UPDATE_STEP_COUNT_IN_WIZARD)]: (state, action) => {
    return {
      ...state,
      stepInPromotionWizard: action.payload,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_LOCATIONS_CALL_PROGRESS)]: (state, action) => {
    return {
      ...state,
      fetchLocationsCallInProgress: action.payload,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_LOCATIONS_LIST_ERROR)]: (state, action) => {
    return {
      ...state,
      fetchLocationsListError: action.payload,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_ALL_LOCATIONS)]: (state, action) => {
    return {
      ...state,
      allLocations: {...action.payload},
    };
  },

  [promotionsNamespacer(promotionsAT.SET_SELECTED_LOCATION)]: (state, action) => {
    return {
      ...state,
      selectedLocations: action.payload,
    };
  },

  [promotionsNamespacer(promotionsAT.SHOW_PRODUCTS_AND_SERVICES_SCREEN)]: (
    state,
    action
  ) => {
    return {
      ...state,
      showProductsAndServicesScreen: action.payload,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_SERVICES_CALL_PROGRESS)]: (state, action) => {
    return {
      ...state,
      servicesCallInProgress: action.payload,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_SERVICES_LIST_CALL_ERROR)]: (state, action) => {
    return {
      ...state,
      servicesListCallError: action.payload,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_SERVICES_LIST)]: (state, action) => {
    const originalServicesList = action.payload;
    let formattedServicesList = [];

    const perPoundServicesList =
      originalServicesList.find((service) => service.category === "PER_POUND")
        ?.services || [];
    const fixedPriceServicesList =
      originalServicesList.find((service) => service.category === "FIXED_PRICE")
        ?.services || [];

    let selectedItems = [];
    if (action.isDetails) {
      selectedItems = state.activePromotionDetails?.promotionItems
        ?.filter((item) => item.promotionItemType === "ServicesMaster")
        .map((item) => item.promotionItemId);
    }
    const formattedPerPoundList = perPoundServicesList.map((perPoundService) => {
      let isSelected = false;
      if (action.isDetails) {
        isSelected = selectedItems.includes(perPoundService.id);
      }
      return {
        ...perPoundService,
        isSelectedForPromotion: isSelected,
      };
    });
    const formattedFixedPriceList = fixedPriceServicesList.map((fixedPriceService) => {
      let isSelected = false;
      if (action.isDetails) {
        isSelected = selectedItems.includes(fixedPriceService.id);
      }
      return {
        ...fixedPriceService,
        isSelectedForPromotion: isSelected,
      };
    });

    formattedServicesList = [
      {
        ...originalServicesList.find((service) => service.category === "PER_POUND"),
        services: formattedPerPoundList,
      },
      {
        ...originalServicesList.find((service) => service.category === "FIXED_PRICE"),
        services: formattedFixedPriceList,
      },
    ];
    return {
      ...state,
      servicesList: [...formattedServicesList],
      servicesListCopy: cloneDeep(formattedServicesList),
    };
  },

  [promotionsNamespacer(promotionsAT.SET_NEW_SERVICES_LIST)]: (state, action) => {
    const originalServicesList = action.payload;

    let selectedItems = [];
    if (action.isDetails) {
      selectedItems = state.activePromotionDetails?.promotionItems
        ?.filter((item) => item.promotionItemType === "ServicesMaster")
        .map((item) => item.promotionItemId);
    }

    let isSelected = false;
    originalServicesList.forEach((category) => {
      category.services.forEach((service) => {
        if (action.isDetails) {
          isSelected = selectedItems.includes(service.id);
        }
        service["isSelectedForPromotion"] = isSelected;
      });
    });

    return {
      ...state,
      servicesList: [...originalServicesList],
      servicesListCopy: cloneDeep(originalServicesList),
    };
  },

  [promotionsNamespacer(promotionsAT.SET_PRODUCTS_CALL_PROGRESS)]: (state, action) => {
    return {
      ...state,
      productsCallInProgress: action.payload,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_PRODUCTS_LIST_CALL_ERROR)]: (state, action) => {
    return {
      ...state,
      productsListCallError: action.payload,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_PRODUCTS_LIST)]: (state, action) => {
    let selectedItems = [];
    if (action.isDetails) {
      selectedItems = state.activePromotionDetails?.promotionItems
        ?.filter((item) => item.promotionItemType === "Inventory")
        .map((item) => item.promotionItemId);
    }

    const originalProductsList = action.payload;
    const formattedProductsList = originalProductsList.map((product) => {
      let isSelected = false;
      if (action.isDetails) {
        isSelected = selectedItems.includes(product.inventoryId);
      }
      return {...product, isSelectedForPromotion: isSelected};
    });

    return {
      ...state,
      productsList: formattedProductsList,
      productsListCopy: cloneDeep(formattedProductsList),
    };
  },

  [promotionsNamespacer(promotionsAT.UPDATE_SERVICES_LIST)]: (state, action) => {
    const {servicesList, activePromotionDetails, activePromotionId} = state;
    const {isSelectedForPromotion, categoryId, serviceId} = action.payload;

    let categoryIndex = servicesList.findIndex((category) => categoryId === category.id);
    let category = servicesList[categoryIndex];
    let serviceIndex = category?.services.findIndex(
      (service) => service.id === serviceId
    );
    let service = category?.services[serviceIndex];
    service.isSelectedForPromotion = isSelectedForPromotion;
    if (servicesList[categoryIndex])
      servicesList[categoryIndex].services[serviceIndex] = service;
    const areAllServicesSelected = servicesList[categoryIndex]?.services.every(
      (service) => service.isSelectedForPromotion
    );

    let additionalStateFields = {};

    if (activePromotionId) {
      // This is being called from details and not from create new wizard
      let promotionItems = [...activePromotionDetails.promotionItems];

      let index = promotionItems
        .filter((promo) => promo.promotionItemType === "ServicesMaster")
        .findIndex((promo) => promo.promotionItemId === serviceId);

      if (index > -1) {
        if (!isSelectedForPromotion) {
          promotionItems.splice(index, 1); // Remove from promotionItems
        }
      } else {
        if (isSelectedForPromotion) {
          promotionItems.push({
            promotionItemId: serviceId,
            promotionItemType: "ServicesMaster",
          });
        }
      }

      additionalStateFields = {
        activePromotionDetails: {
          ...activePromotionDetails,
          promotionItems: promotionItems,
        },
      };
    }

    return {
      ...state,
      servicesList,
      selectAllServices: areAllServicesSelected,
      ...additionalStateFields,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_SELECT_ALL_SERVICES)]: (state, action) => {
    const {
      servicesList,
      selectAllServices,
      activePromotionId,
      activePromotionDetails,
    } = state;

    let serviceCategory;
    if (action.payload.flags.cents20) {
      serviceCategory =
        action.payload.serviceCategory === "laundry_services"
          ? "LAUNDRY"
          : "DRY_CLEANING";

      servicesList.forEach((category) => {
        if (category.categoryType === serviceCategory)
          category.services.forEach((service) => {
            service.isSelectedForPromotion = !selectAllServices;
          });
      });
    } else {
      serviceCategory =
        action.payload.serviceCategory === "lb_services" ? "PER_POUND" : "FIXED_PRICE";

      const category = servicesList.find(
        (category) => category.category === serviceCategory
      );
      const categoryIndex = servicesList.findIndex(
        (category) => category.category === serviceCategory
      );
      const updatedCategoryServices = category?.services.map((service) => ({
        ...service,
        isSelectedForPromotion: !selectAllServices,
      }));
      if (servicesList[categoryIndex])
        servicesList[categoryIndex].services = [...updatedCategoryServices];
    }

    let additionalItems = {};

    if (activePromotionId) {
      let promotionItems = activePromotionDetails.promotionItems.filter(
        (item) => item.promotionItemType !== "ServicesMaster"
      );

      servicesList.forEach((cat) => {
        cat.services.forEach((service) => {
          if (service.isSelectedForPromotion) {
            promotionItems.push({
              promotionItemId: service.id,
              promotionItemType: "ServicesMaster",
            });
          }
        });
      });

      additionalItems = {
        activePromotionDetails: {
          ...activePromotionDetails,
          promotionItems,
        },
      };
    }

    return {
      ...state,
      selectAllServices: !selectAllServices,
      servicesList,
      ...additionalItems,
    };
  },

  [promotionsNamespacer(promotionsAT.HANDLE_SERVICES_TAB_SWITCH)]: (state, action) => {
    /* 
		Whenever the Tab is switched between /Lb services and Fixed price services, need to run this case
		so that we re-caculate the selectAllServices state for that particular list of Services.
		 */
    const {servicesList} = state;
    const serviceCategory =
      action.payload === "lb_services" ? "PER_POUND" : "FIXED_PRICE";
    const category = servicesList.find(
      (category) => category.category === serviceCategory
    );
    const areAllServicesSelected = category?.services.every(
      (service) => service.isSelectedForPromotion
    );

    return {
      ...state,
      selectAllServices: areAllServicesSelected,
    };
  },

  [promotionsNamespacer(promotionsAT.UPDATE_PRODUCTS_LIST)]: (state, action) => {
    const {isSelectedForPromotion, inventoryId} = action.payload;
    const {productsList, activePromotionId, activePromotionDetails} = state;
    const productIndex = productsList.findIndex(
      (product) => product.inventoryId === inventoryId
    );
    productsList[productIndex].isSelectedForPromotion = isSelectedForPromotion;

    const areAllProductsSelected = productsList.every(
      (product) => product.isSelectedForPromotion
    );

    let additionalStateFields = {};

    if (activePromotionId) {
      // This is being called from details and not from create new wizard
      let promotionItems = [...activePromotionDetails.promotionItems];

      let index = promotionItems
        .filter((promo) => promo.promotionItemType === "Inventory")
        .findIndex((promo) => promo.promotionItemId === inventoryId);

      if (index > -1) {
        if (!isSelectedForPromotion) {
          promotionItems.splice(index, 1); // Remove from promotionItems
        }
      } else {
        if (isSelectedForPromotion) {
          promotionItems.push({
            promotionItemId: inventoryId,
            promotionItemType: "Inventory",
          });
        }
      }

      additionalStateFields = {
        activePromotionDetails: {
          ...activePromotionDetails,
          promotionItems: promotionItems,
        },
      };
    }

    return {
      ...state,
      productsList,
      selectAllProducts: areAllProductsSelected,
      ...additionalStateFields,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_SELECT_ALL_PRODUCTS)]: (state) => {
    const {
      productsList,
      selectAllProducts,
      activePromotionDetails,
      activePromotionId,
    } = state;
    const updatedProductsList = productsList.map((product) => ({
      ...product,
      isSelectedForPromotion: !selectAllProducts,
    }));
    let additionalStateFields = {};

    if (activePromotionId) {
      let promotionItems = activePromotionDetails.promotionItems.filter(
        (item) => item.promotionItemType !== "Inventory"
      );
      updatedProductsList.forEach((product) => {
        if (product.isSelectedForPromotion) {
          promotionItems.push({
            promotionItemId: product.inventoryId,
            promotionItemType: "Inventory",
          });
        }
      });

      additionalStateFields = {
        activePromotionDetails: {
          ...activePromotionDetails,
          promotionItems,
        },
      };
    }
    return {
      ...state,
      selectAllProducts: !selectAllProducts,
      productsList: updatedProductsList,
      ...additionalStateFields,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_ITEMS_COUNT)]: (state) => {
    const {servicesList, productsList} = state;
    let itemsCount = 0;

    // We can assume cents2.0 serviceList will have more than 2 objects in the list
    // Because we specifically map <cents2.0 to only have 2 objects in the list
    // We also check to make sure ONLY PER_POUND and FIXED_PRICE categories exist for <cents2.0
    const isNotCents20CheckArr = servicesList.map((category) =>
      ["PER_POUND", "FIXED_PRICE"].includes(category.category)
    );
    const isNotCents20 =
      servicesList.length === 2 && isNotCents20CheckArr.every((val) => val);

    if (isNotCents20) {
      const perPoundItemsCount =
        servicesList
          .find((category) => category.category === "PER_POUND")
          ?.services.reduce((acc, service) => {
            if (service.isSelectedForPromotion) {
              acc = acc + 1;
            }
            return acc;
          }, 0) || 0;

      const fixedPriceItemsCount =
        servicesList
          .find((category) => category.category === "FIXED_PRICE")
          ?.services.reduce((acc, service) => {
            if (service.isSelectedForPromotion) {
              acc = acc + 1;
            }
            return acc;
          }, 0) || 0;

      const productsCount =
        productsList?.reduce((acc, product) => {
          if (product.isSelectedForPromotion) {
            acc = acc + 1;
          }
          return acc;
        }, 0) || 0;

      itemsCount = perPoundItemsCount + fixedPriceItemsCount + productsCount;
    } else {
      let promotionServicesCount = 0;
      servicesList.forEach((category) => {
        if (category?.services) {
          const count = category?.services?.reduce((acc, service) => {
            if (service.isSelectedForPromotion) {
              acc++;
            }
            return acc;
          }, 0);
          promotionServicesCount += count;
        }
      });

      const productsCount = productsList?.reduce((acc, product) => {
        if (product.isSelectedForPromotion) {
          acc++;
        }
        return acc;
      }, 0);

      itemsCount = promotionServicesCount + productsCount;
    }
    return {
      ...state,
      itemsCount,
    };
  },

  [promotionsNamespacer(promotionsAT.RESET_SERVICES_AND_PRODUCTS)]: (state) => {
    const {servicesListCopy, productsListCopy} = state;
    return {
      ...state,
      servicesList: cloneDeep(servicesListCopy),
      productsList: cloneDeep(productsListCopy),
    };
  },

  [promotionsNamespacer(promotionsAT.HANDLE_PRODUCTS_TAB_SWITCH)]: (state) => {
    const {productsList} = state;
    const areAllProductsSelected = productsList.every(
      (product) => product.isSelectedForPromotion
    );
    return {
      ...state,
      selectAllProducts: areAllProductsSelected,
    };
  },

  [promotionsNamespacer(promotionsAT.UPDATE_SERVICES_AND_PRODUCTS_COPY)]: (state) => {
    const {servicesList, productsList} = state;
    return {
      ...state,
      servicesListCopy: cloneDeep(servicesList),
      productsListCopy: cloneDeep(productsList),
    };
  },

  [promotionsNamespacer(promotionsAT.RESET_WIZARD_REDUX_STATE)]: (state) => {
    return {
      ...state,
      stepInPromotionWizard: 1,
      selectedLocations: [],
      showProductsAndServicesScreen: false,
      servicesCallInProgress: false,
      servicesListCallError: "",
      servicesList: [],
      servicesListCopy: [],
      productsCallInProgress: false,
      productsListCallError: "",
      productsList: [],
      productsListCopy: [],
      selectAllServices: false,
      selectAllProducts: false,
      itemsCount: 0,
    };
  },

  [promotionsNamespacer(promotionsAT.GET_ALL_LOCATIONS_STARTED)]: (state, action) => {
    return {
      ...state,
      isLocationsLoading: true,
      allLocations: null,
      locationsError: "",
    };
  },

  [promotionsNamespacer(promotionsAT.GET_ALL_LOCATIONS_SUCCEEDED)]: (state, action) => {
    return {
      ...state,
      isLocationsLoading: false,
      allLocations: action.payload,
      locationsError: "",
    };
  },

  [promotionsNamespacer(promotionsAT.GET_ALL_LOCATIONS_FAILED)]: (state, action) => {
    return {
      ...state,
      isLocationsLoading: false,
      allLocations: null,
      locationsError: action.payload,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_CREATE_PROMOTION_CALL_PROGRESS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      createPromotionCallInProgress: action.payload,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_CREATE_PROMOTION_CALL_ERROR)]: (
    state,
    action
  ) => {
    return {
      ...state,
      createPromotionError: action.payload,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_DETAILS_PRODUCT_PICKER_VISIBILITY)]: (
    state,
    action
  ) => {
    return {
      ...state,
      isDetailsProductPickerVisible: action.payload,
    };
  },

  [promotionsNamespacer(promotionsAT.CLEAR_SERVICES_AND_PRODUCTS_DATA)]: (
    state,
    action
  ) => {
    return {
      ...state,
      servicesCallInProgress: false,
      servicesListCallError: "",
      servicesList: [],
      servicesListCopy: [],
      productsCallInProgress: false,
      productsListCallError: "",
      productsList: [],
      productsListCopy: [],
      selectAllServices: false,
      selectAllProducts: false,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_NEW_PROMO_NAME_AND_DISCOUNT_VALUE)]: (
    state,
    action
  ) => {
    return {
      ...state,
      newPromoAndValue: action.payload,
    };
  },

  [promotionsNamespacer(promotionsAT.ACTIVE_PROMO_DETAILS_CHANGED)]: (state, action) => {
    let updatedActivePromoDetails = {
      ...state.activePromotionDetails,
      ...action.payload,
    };
    return {
      ...state,
      activePromotionDetails: updatedActivePromoDetails,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_DETAILS_HAS_END_DATE)]: (state, action) => {
    return {
      ...state,
      hasDetailsEndDate: action.payload,
    };
  },

  [promotionsNamespacer(promotionsAT.UPDATE_PROMO_DETAIL_IN_LIST)]: (state, action) => {
    let {id} = action.payload;
    delete action.payload.id;
    let promotionsList = cloneDeep(state.promotionsList);
    let promotionsListCopy = cloneDeep(state.promotionsListCopy);
    let currentPromoIndexForPromotionstList = promotionsList.findIndex(
      (promo) => promo.id === id
    );
    let currentPromoIndexForPromotionstListCopy = promotionsListCopy.findIndex(
      (promo) => promo.id === id
    );
    if (currentPromoIndexForPromotionstList !== -1) {
      promotionsList[currentPromoIndexForPromotionstList] = {
        ...promotionsList[currentPromoIndexForPromotionstList],
        ...action.payload,
      };
      promotionsListCopy[currentPromoIndexForPromotionstListCopy] = {
        ...promotionsListCopy[currentPromoIndexForPromotionstListCopy],
        ...action.payload,
      };
    }
    const sortedPromotionsList = sortBy(promotionsList, [
      (promo) => promo.name.toLowerCase(),
    ]);
    const sortedPromotionsListCopy = sortBy(promotionsListCopy, [
      (promo) => promo.name.toLowerCase(),
    ]);
    return {
      ...state,
      promotionsList: sortedPromotionsList,
      promotionsListCopy: sortedPromotionsListCopy,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_CUST_LIMIT_COPY)]: (state, action) => {
    return {
      ...state,
      customerRedemptionLimitCopy: action.payload,
    };
  },

  [promotionsNamespacer(promotionsAT.SET_UPDATE_ERRORS)]: (state, action) => {
    return {
      ...state,
      activePromotionDetailsUpdateErrors: {
        ...state.activePromotionDetailsUpdateErrors,
        ...action.payload,
      },
    };
  },
};

export default createReducer(initialState, handlers, [nameSpace]);
