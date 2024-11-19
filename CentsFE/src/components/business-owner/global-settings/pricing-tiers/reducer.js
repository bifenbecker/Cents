import {TIER_TYPE} from "./constants";

export const initialState = {
  showHideNewTiersWizard: false,
  showEditTierWizard: false,
  tiersList: [],
  loading: false,
  activeRoundedTab: TIER_TYPE.commercial.toLowerCase(),
  selectedTierId: null,
  selectedTierName: "",
  error: null,
  tierDetails: {},
  tierDetailsLoader: false,
  editTierDetailsLoader: true,
  editTierDetailsError: "",
  newlyCreatedTierInfo: null,
  setNewServices: [],
};

export default (state, action) => {
  switch (action.type) {
    case "TOGGLE_NEW_TIER_CREATION_WIZARD":
      return {
        ...state,
        showHideNewTiersWizard: action.payload,
        showEditTierWizard: false,
        selectedTierId: null,
      };
    case "SET_LOADER":
      return {
        ...state,
        loading: action.payload,
      };
    case "SET_EDIT_LOADER":
      return {
        ...state,
        tierDetailsLoader: action.payload,
      };
    case "SET_TIERS_LIST":
      return {
        ...state,
        error: null,
        tiersList: action.payload,
        allTiersList: action.payload,
        selectedTierId: state?.newlyCreatedTierInfo
          ? state?.newlyCreatedTierInfo?.id
          : action.payload[0]?.id,
        selectedTierName: state?.newlyCreatedTierInfo
          ? state?.newlyCreatedTierInfo?.name
          : action.payload[0]?.name,
        tierDetails: {},
        newlyCreatedTierInfo: null,
        loading: false,
        showHideNewTiersWizard: false,
      };
    case "SET_FILTERED_TIERS_LIST":
      let tiers = [];
      if (action.payload.searchText) {
        tiers = state?.allTiersList?.filter((tier) => {
          let tierName = tier.name.toLowerCase();
          let searchTextLowerCase = action.payload.searchText?.toLowerCase();
          return tierName.indexOf(searchTextLowerCase) > -1;
        });
      } else {
        tiers = state.allTiersList;
      }
      return {
        ...state,
        tiersList: tiers,
        selectedTierId: tiers[0]?.id,
        selectedTierName: tiers[0]?.name,
        searchText: action.payload.searchText,
        showEditTierWizard: false,
      };
    case "SET_ACTIVE_ROUNDED_TAB":
      return {
        ...state,
        activeRoundedTab: action.payload,
        showHideNewTiersWizard: false,
        showEditTierWizard: false,
        searchText: "",
      };
    case "SET_SELECTED_TIER_ID":
      return {
        ...state,
        selectedTierId: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    case "SET_SELECTED_TIER_NAME":
      return {
        ...state,
        selectedTierName: action.payload,
      };
    case "FETCH_TIERS_DETAILS":
      return {
        ...state,
        tierDetails: {
          name: action.payload?.name,
          type: action.payload?.type,
          commercialDeliveryFeeInCents: action.payload?.commercialDeliveryFeeInCents,
          locationAndCustomerLabel:
            action.payload?.type === TIER_TYPE.commercial
              ? "Commercial Customers:"
              : "Locations Assigned to this Tier:",
          locationAndCustomerData:
            action.payload?.type === TIER_TYPE.commercial
              ? action.payload?.customers
              : action.payload?.locations,
          deliverableServicePrices: action.payload?.deliverableServicePrices || [],
        },
      };

    case "EDIT_TIER_NAME": {
      const {tiersList} = state;
      const {id, name} = action.payload;

      return {
        ...state,
        tiersList: tiersList.map((t) =>
          t.id === id
            ? {
                ...t,
                name,
              }
            : t
        ),
        tierDetails: {
          ...state.tierDetails,
          name: action.payload?.name,
        },
        selectedTierName: name,
      };
    }

    case "EDIT_COMMERCIAL_TIER_DELIVERY_FEE": {
      const {tiersList} = state;
      const {id, commercialDeliveryFeeInCents} = action.payload;

      return {
        ...state,
        tiersList: tiersList.map((t) =>
          t.id === id
            ? {
                ...t,
                commercialDeliveryFeeInCents,
              }
            : t
        ),
        tierDetails: {
          ...state.tierDetails,
          commercialDeliveryFeeInCents,
        },
      };
    }

    case "TOGGLE_EDIT_TIER_WIZARD":
      return {
        ...state,
        showEditTierWizard: action.payload,
      };
    case "TOGGLE_EDIT_TIER_LOADER":
      return {
        ...state,
        editTierDetailsLoader: action.payload,
      };
    case "SET_EDIT_TIER_ERROR":
      return {
        ...state,
        editTierDetailsError: action.payload,
      };
    case "SET_NEW_TIER_INFO":
      return {
        ...state,
        newlyCreatedTierInfo: action.payload,
      };
    case "SET_NEW_SERVICES":
      return {
        ...state,
        setNewServices: action.payload,
      };
    default:
      return {...state};
  }
};
