import {createNamespacer, createReducer} from "../../../utils/reducers";
import actionTypes from "../../../actionTypes";

const initialState = {
  activeTab: "details",
  tabs: [
    {
      value: "details",
      label: "Details",
    },
    {
      value: "locationPricing",
      label: "Location Pricing",
    },
  ],
  activeProductDetails: {},

  productDetailsErrors: {},
  productDetailsNullDescription: "",
  newProductCallInProgress: false,
  newProductError: "",
  productsListCallInProgress: false,
  productsListError: "",
  productsList: null,
  productsListCopy: [],
  productCategories: [],
  activeProductId: null,
  showNewProductWizard: false,
  showNewCategoryScreen: false,
  showNewProductsPricingScreen: false,
  newCategoryCallInProgress: false,
  newCategoryError: "",
  isProductDetailsLoading: false,
  productDetailsError: "",
  productPricesUpdateErrors: {},
  fileStackKey: "",
  fileStackKeyError: "",
  searchText: "",
  searchInProgress: false,
  isProductDetailsUpdateLoading: false,
  productDetailsUpdateError: "",
  preventDetailsRefresh: false,
  productInventoryStatus: "Calculating Stock..",
  newProductPricingCallProgress: false,
  newProductPricingError: "",
  newProductPricingLocationList: null,
  newProductInventoryItems: null,
  allSelected: false,
  showNewCategoryScreenInDetails: false,
};

const nameSpace = "BO-PRODUCTS";

const productsNamespacer = createNamespacer(nameSpace);
const productsAT = actionTypes.businessOwner.globalSettings.products;

const handlers = {
  [productsNamespacer(productsAT.SET_ACTIVE_TAB)]: (state, action) => {
    return {
      ...state,
      activeTab: action.payload,
    };
  },

  [productsNamespacer(productsAT.UPDATE_ACTIVE_PRODUCT_DETAIL)]: (state, action) => {
    let activeProductDetails = {...state.activeProductDetails};
    activeProductDetails[action.payload.field] = action.payload.value;

    return {
      ...state,
      activeProductDetails,
    };
  },

  [productsNamespacer(productsAT.SET_PRODUCT_DETAILS_UPDATE_ERROR)]: (state, action) => {
    return {
      ...state,
      productDetailsUpdateError: action.payload,
    };
  },

  [productsNamespacer(productsAT.SET_PRODUCTS_LIST)]: (state, action) => {
    let activeProductId = null;
    let productsList = [];
    let productDetailsNullDescription = "";

    if (action.payload.length !== 0) {
      for (let category of action.payload) {
        for (let product of category.inventory) {
          product.categoryId = category.id;
          productsList.push(product);
        }
      }
      productsList.sort((a, b) => {
        const nameA = a.productName.toLowerCase(),
          nameB = b.productName.toLowerCase();
        if (nameA < nameB)
          //sort string ascending
          return -1;
        if (nameA > nameB) return 1;
        return 0; //default return value (no sorting)
      });
      // If this case reducer runs when a new product is created, then get the last element's id, else get the first non archived element's id.
      activeProductId =
        action.newProductId ||
        productsList.filter((product) => {
          return !product.isDeleted;
        })[0]?.id;
    } else if (action.payload.length === 0) {
      productDetailsNullDescription = "No products yet";
    }

    return {
      ...state,
      productsList,
      productsListCopy: productsList,
      activeProductId,
      productDetailsNullDescription,
    };
  },

  [productsNamespacer(productsAT.SET_PRODUCT_CATEGORIES_LIST)]: (state, action) => {
    return {
      ...state,
      productCategories: action.payload,
    };
  },

  [productsNamespacer(productsAT.SET_PRODUCTS_LIST_CALL_PROGRESS)]: (state, action) => {
    return {
      ...state,
      productsListCallInProgress: action.payload,
    };
  },

  [productsNamespacer(productsAT.SET_PRODUCTS_LIST_ERROR)]: (state, action) => {
    return {
      ...state,
      productsListError: action.payload,
    };
  },

  [productsNamespacer(productsAT.SET_PRODUCTS_LIST_ERROR)]: (state, action) => {
    return {
      ...state,
      productsListError: action.payload,
    };
  },

  [productsNamespacer(productsAT.SET_NEW_PRODUCT_CALL_PROGRESS)]: (state, action) => {
    return {
      ...state,
      newProductCallInProgress: action.payload,
    };
  },

  [productsNamespacer(productsAT.SET_NEW_PRODUCT_ERROR)]: (state, action) => {
    return {
      ...state,
      newProductError: action.payload,
    };
  },

  [productsNamespacer(productsAT.SET_ACTIVE_PRODUCT)]: (state, action) => {
    let resetActiveProductDetails = true;
    if (action.payload === state.activeProductDetails.id) {
      resetActiveProductDetails = false;
    }
    return {
      ...state,
      activeProductId: action.payload,
      activeTab: initialState.activeTab,
      productDetailsError: "",
      productDetailsErrors: initialState.productDetailsErrors,
      activeProductDetails: resetActiveProductDetails
        ? initialState.activeProductDetails
        : state.activeProductDetails,
      showNewProductWizard: false,
      productDetailsUpdateError: "",
      productInventoryStatus: "Calculating Stock...",
      showNewCategoryScreenInDetails: false,
      newCategoryError: "",
    };
  },

  [productsNamespacer(productsAT.SET_PRODUCT_SEARCH_TEXT)]: (state, action) => {
    const {text: searchText, includeArchived} = action.payload;
    const {productsListCopy} = state;

    const searchResults = productsListCopy.filter((product) => {
      let productNameLowerCase = product.productName.toLowerCase();
      let searchTextLowerCase = searchText.toLowerCase();
      return (
        productNameLowerCase.indexOf(searchTextLowerCase) > -1 &&
        (!product.isDeleted || includeArchived)
      );
    });

    const activeProductId = searchResults.length !== 0 ? searchResults[0]?.id : null;
    let productDetailsNullDescription;
    if (searchResults.length === 0) {
      if (searchText) {
        productDetailsNullDescription = "No product search results found";
      } else {
        productDetailsNullDescription = "No products yet";
      }
    } else {
      productDetailsNullDescription = "";
    }
    return {
      ...state,
      productsList: searchResults,
      activeProductId,
      productDetailsNullDescription,
      searchText,
    };
  },

  [productsNamespacer(productsAT.SET_SHOW_NEW_PRODUCT_WIZARD)]: (state, action) => {
    let {
      activeProductId,
      newProductError,
      newCategoryError,
      newProductInventoryItems,
      productsList,
    } = state;
    if (action.payload) {
      activeProductId = null;
      newProductError = "";
      newCategoryError = "";
    } else {
      newProductInventoryItems = null;
      activeProductId = productsList[0]?.id;
    }
    return {
      ...state,
      showNewProductWizard: action.payload,
      activeProductId,
      newProductError,
      newCategoryError,
      newProductInventoryItems,
      allSelected: false,
      showNewCategoryScreenInDetails: false,
    };
  },

  [productsNamespacer(productsAT.SET_SHOW_NEW_CATEGORY_SCREEN)]: (state, action) => {
    return {
      ...state,
      showNewCategoryScreen: action.payload,
      newCategoryError: "",
    };
  },

  [productsNamespacer(productsAT.SET_NEW_CATEGORY_CALL_PROGRESS)]: (state, action) => {
    return {
      ...state,
      newCategoryCallInProgress: action.payload,
    };
  },

  [productsNamespacer(productsAT.SET_NEW_CATEGORY_ERROR)]: (state, action) => {
    return {
      ...state,
      newCategoryError: action.payload,
    };
  },

  [productsNamespacer(productsAT.SET_PRODUCT_DETAILS_LOADING)]: (state, action) => {
    return {
      ...state,
      isProductDetailsLoading: action.payload,
    };
  },

  [productsNamespacer(productsAT.SET_PRODUCT_DETAILS_ERROR)]: (state, action) => {
    return {
      ...state,
      productDetailsError: action.payload,
    };
  },

  [productsNamespacer(productsAT.SET_ACTIVE_PRODUCT_DETAILS)]: (state, action) => {
    let activeProductDetails = action.payload;
    let numOfFeaturedLocations = 0;
    let numOfFeaturedLocationsWithStock = 0;
    let productInventoryStatus;
    activeProductDetails.inventoryItems.forEach((item) => {
      if (item.isFeatured) {
        numOfFeaturedLocations++;
        if (Number(item.quantity) > 0) {
          numOfFeaturedLocationsWithStock++;
        }
      }
    });

    if (numOfFeaturedLocationsWithStock === numOfFeaturedLocations) {
      productInventoryStatus = "In stock";
    } else if (numOfFeaturedLocationsWithStock === 0) {
      productInventoryStatus = "Out of Stock";
    } else {
      productInventoryStatus = `In stock at ${numOfFeaturedLocationsWithStock}/${numOfFeaturedLocations} locations`;
    }

    return {
      ...state,
      activeProductDetails,
      productDetailsError: "",
      productDetailsErrors: initialState.productDetailsErrors,
      productInventoryStatus,
      showNewProductsPricingScreen: false,
      newProductInventoryItems: null,
      showNewCategoryScreen: false,
    };
  },

  [productsNamespacer(productsAT.SET_FILESTACK_KEY)]: (state, action) => {
    return {
      ...state,
      fileStackKey: action.payload,
    };
  },

  [productsNamespacer(productsAT.SET_FILESTACK_KEY_ERROR)]: (state, action) => {
    return {
      ...state,
      fileStackKeyError: action.payload,
    };
  },

  [productsNamespacer(productsAT.SET_SEARCH_IN_PROGRESS)]: (state, action) => {
    return {
      ...state,
      searchInProgress: action.payload,
      activeTab: "details",
      showNewProductWizard: false,
    };
  },

  [productsNamespacer(productsAT.SET_PRODUCT_DETAILS_UPDATE_LOADING)]: (
    state,
    action
  ) => {
    return {
      ...state,
      isProductDetailsUpdateLoading: action.payload,
    };
  },

  [productsNamespacer(productsAT.UPDATE_PRODUCT_ID)]: (state, action) => {
    let activeProductDetails = {...state.activeProductDetails};
    let activeProductId = state.activeProductId;
    if (activeProductDetails.id === action.payload.id) {
      activeProductDetails = {...action.payload};
      activeProductId = action.payload.id;
    }

    let productsList = [...state.productsList];
    let {productsListCopy} = state;

    let productIndex = productsList.findIndex(
      (product) => product.id === action.payload.id
    );
    let productIndexFromCopy = productsListCopy.findIndex(
      (product) => product.id === action.payload.id
    );

    if (productIndex !== -1) {
      productsList[productIndex] = {
        ...productsList[productIndex],
        id: action.payload.id,
        productName: action.payload.productName,
        productImage: action.payload.productImage,
        sku: action.payload.sku,
        description: action.payload.description,
        categoryId: action.payload.categoryId,
      };
    }

    productsList.sort((a, b) => {
      const nameA = a.productName.toLowerCase(),
        nameB = b.productName.toLowerCase();
      if (nameA < nameB)
        //sort string ascending
        return -1;
      if (nameA > nameB) return 1;
      return 0; //default return value (no sorting)
    });

    if (productIndexFromCopy !== 1) {
      productsListCopy[productIndexFromCopy] = {
        ...productsListCopy[productIndexFromCopy],
        id: action.payload.id,
        productName: action.payload.productName,
        productImage: action.payload.productImage,
        sku: action.payload.sku,
        description: action.payload.description,
        categoryId: action.payload.categoryId,
      };
    }

    productsListCopy.sort((a, b) => {
      const nameA = a.productName.toLowerCase(),
        nameB = b.productName.toLowerCase();
      if (nameA < nameB)
        //sort string ascending
        return -1;
      if (nameA > nameB) return 1;
      return 0; //default return value (no sorting)
    });

    return {
      ...state,
      activeProductDetails,
      productsList,
      activeProductId,
      preventDetailsRefresh: true,
      productsListCopy,
    };
  },

  [productsNamespacer(productsAT.RESET_PREVENT_DETAILS_REFRESH)]: (state, action) => {
    return {
      ...state,
      preventDetailsRefresh: false,
    };
  },

  [productsNamespacer(productsAT.SET_SHOW_NEW_PRODUCT_PRICING_SCREEN)]: (
    state,
    action
  ) => {
    return {
      ...state,
      showNewProductsPricingScreen: action.payload,
    };
  },

  [productsNamespacer(productsAT.SET_NEW_PRODUCT_PRICING_CALL_PROGRESS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      newProductPricingCallProgress: action.payload,
    };
  },

  [productsNamespacer(productsAT.SET_NEW_PRODUCT_PRICING_LOCATIONS_ERROR)]: (
    state,
    action
  ) => {
    return {
      ...state,
      newProductPricingError: action.payload,
    };
  },

  [productsNamespacer(productsAT.SET_NEW_PRODUCT_PRICING_LOCATIONS_LIST)]: (
    state,
    action
  ) => {
    let newProductPricingLocationList = action.payload;
    newProductPricingLocationList.sort((a, b) => {
      const nameA = a.name.toLowerCase(),
        nameB = b.name.toLowerCase();
      if (nameA < nameB)
        //sort string ascending
        return -1;
      if (nameA > nameB) return 1;
      return 0; //default return value (no sorting)
    });

    const newProductInventoryItems = newProductPricingLocationList.map(
      (location, index) => {
        return {
          id: index + 1,
          storeId: location.id,
          price: 0,
          quantity: 0,
          isFeatured: false,
          isTaxable: true,
          store: {
            name: location.name,
          },
        };
      }
    );

    return {
      ...state,
      newProductPricingLocationList: action.payload,
      newProductInventoryItems,
    };
  },
  // handleChange case reducer function
  [productsNamespacer(productsAT.SET_NEW_PRODUCT_PRICE_AT_LOCATION)]: (state, action) => {
    const {id, field, value} = action.payload;
    const {newProductInventoryItems} = state;
    const itemIndex = newProductInventoryItems.findIndex((item) => item.id === id);

    newProductInventoryItems[itemIndex] = {
      ...newProductInventoryItems[itemIndex],
      [field]: value,
    };

    const notAllSelected = newProductInventoryItems.some(
      (item) => item.isFeatured === false
    );

    return {
      ...state,
      newProductInventoryItems: [...newProductInventoryItems],
      allSelected: notAllSelected ? false : true, // can be replaced with `allSelected: !notAllSelected` but this is easier to understand
    };
  },

  [productsNamespacer(productsAT.SET_SELECT_ALL_PRODUCT_LOCATIONS)]: (state, action) => {
    let {newProductInventoryItems} = state;
    let updatedInventoryItems = newProductInventoryItems.map((item) => ({
      ...item,
      isFeatured: newProductInventoryItems.every(({isFeatured}) => isFeatured)
        ? false
        : true,
    }));
    return {
      ...state,
      newProductInventoryItems: [...updatedInventoryItems],
      allSelected: true,
    };
  },

  [productsNamespacer(productsAT.SET_APPLY_ALL_PRODUCT_PRICES)]: (state, action) => {
    let {newProductInventoryItems} = state;
    let priceToApply = newProductInventoryItems[0]?.price;
    let isTaxableToApply = newProductInventoryItems[0]?.isTaxable;
    let updatedInventoryItems = newProductInventoryItems.map((item) => ({
      ...item,
      price: priceToApply,
      isTaxable: isTaxableToApply,
    }));

    return {
      ...state,
      newProductInventoryItems: [...updatedInventoryItems],
    };
  },

  [productsNamespacer(productsAT.SET_SHOW_NEW_CATEGORY_SCREEN_IN_DETAILS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      showNewCategoryScreenInDetails: action.payload,
      newCategoryError: "",
    };
  },

  [productsNamespacer(productsAT.SET_NEW_CATEGORY_ID)]: (state, action) => {
    let {activeProductDetails} = state;
    activeProductDetails = {...activeProductDetails, categoryId: action.payload};

    return {
      ...state,
      activeProductDetails,
    };
  },

  [productsNamespacer(productsAT.UPDATE_INVENTORY_ITEM_AND_STATUS)]: (state, action) => {
    let inventoryItem = action.payload;
    let activeProductDetails = {...state.activeProductDetails};
    let inventoryItemIndex = activeProductDetails.inventoryItems.findIndex(
      (invItem) =>
        invItem.inventoryId === inventoryItem.inventoryId &&
        invItem.id === inventoryItem.id
    );
    if (inventoryItemIndex > -1) {
      activeProductDetails.inventoryItems[inventoryItemIndex] = {
        ...inventoryItem,
      };

      /*  Status bar logic  */

      let numOfFeaturedLocations = 0;
      let numOfFeaturedLocationsWithStock = 0;
      activeProductDetails.inventoryItems.forEach((item) => {
        if (item.isFeatured) {
          numOfFeaturedLocations++;
          if (Number(item.quantity) > 0) {
            numOfFeaturedLocationsWithStock++;
          }
        }
      });

      /*  Status bar logic  */

      return {
        ...state,
        activeProductDetails,
        productInventoryStatus:
          numOfFeaturedLocationsWithStock === numOfFeaturedLocations
            ? "In stock"
            : numOfFeaturedLocationsWithStock === 0
            ? "Out of Stock"
            : `In stock at ${numOfFeaturedLocationsWithStock}/${numOfFeaturedLocations} locations`,
      };
    }

    return state;
  },
};

export default createReducer(initialState, handlers, [nameSpace]);
