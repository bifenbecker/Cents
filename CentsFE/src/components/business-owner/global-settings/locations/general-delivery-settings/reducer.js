import {ServicePricingOption} from "../constants";
import {isEmpty} from "lodash";

export const initialState = {
  deliverySettings: {},
  deliveryPriceType: "",
  deliveryTiersList: [],
  loading: false,
  zones: [],
  zonesCopy: [],
  deliveryTier: {},
  deliveryTierCopy: {},
  selectedServicesForRetailPricing: [],
  selectedServicesForRetailPricingCopy: [],
  locationServices: [],
  isSetDeliveryTierAndServicesPerZone: false,
  error: "",
  servicePricingAndAvailabilityPayload: {},
  hasDryCleaningServices: false,
};

export default (state, action) => {
  switch (action.type) {
    case "SET_DELIVERY_SETTINGS_DATA": {
      const {deliverySettings} = action.payload;
      return {
        ...state,
        deliverySettings,
        deliveryPriceType:
          deliverySettings?.generalDeliverySettings?.deliveryPriceType ||
          ServicePricingOption.storeRetailPricingOption, //setting the price type from the delivery settings or keeping STORE_RETAIL as default
      };
    }

    case "SET_INITIAL_LOCATION_OR_ZONES_DATA": {
      /* 
      Setting up the zones array skeleton with all the required attributes
      */

      const {deliverySettings} = state;
      const {isEdit} = action.payload;

      return {
        ...state,
        zones: deliverySettings?.ownDriverDeliverySettings?.zones?.map((zone) => {
          return {
            id: zone?.id,
            name: zone?.name,
            deliveryTier: isEdit
              ? {
                  label: zone?.deliveryTier?.name,
                  value: zone?.deliveryTier?.id,
                }
              : {},
          };
        }),
        deliveryTier:
          isEdit &&
          !deliverySettings?.ownDriverDeliverySettings?.hasZones &&
          !isEmpty(deliverySettings?.generalDeliverySettings?.deliveryTier)
            ? {
                label: deliverySettings?.generalDeliverySettings?.deliveryTier?.name,
                value: deliverySettings?.generalDeliverySettings?.deliveryTier?.id,
              }
            : {},
      };
    }

    case "TOGGLE_TIER_AND_RETAIL":
      return {
        ...state,
        deliveryPriceType: action.payload,
        error: "",
      };

    case "SET_LOADER":
      return {
        ...state,
        loading: action.payload,
      };

    case "SET_DELIVERY_TIERS_LIST": {
      /* 
      Storing the delivery tiers list here
      */
      return {
        ...state,
        deliveryTiersList:
          action?.payload?.map((tier) => {
            return {
              value: tier?.id,
              label: tier?.name,
              offerDryCleaningForDeliveryTier: tier?.offerDryCleaningForDeliveryTier,
            };
          }) || [],
      };
    }

    case "SET_SERVICES_FOR_RETAIL_PRICING": {
      /* 
      Storing services which are fetched for a location here which will be used for retail pricing
      */
      const {services} = action.payload;
      const dryCleaningServices = services?.filter(
        (service) => service?.categoryType === "DRY_CLEANING"
      );
      return {
        ...state,
        locationServices: services,
        selectedServicesForRetailPricing: [null],
        hasDryCleaningServices: dryCleaningServices?.length > 0,
      };
    }

    case "TOGGLE_OFFERS_DRY_CLEANING_FOR_DELIVERY": {
      /* 
      Storing services which are fetched for a location here which will be used for retail pricing
      */
      const {offerDryCleaningForDelivery} = action.payload;
      return {
        ...state,
        deliverySettings: {
          ...state.deliverySettings,
          generalDeliverySettings: {
            ...state.generalDeliverySettings,
            offerDryCleaningForDelivery,
          },
        },
      };
    }

    case "SET_SELECTED_SERVICES_FOR_RETAIL_PRICING": {
      /* 
      Storing selected services for retail pricing
      */
      return {
        ...state,
        selectedServicesForRetailPricing: action.payload,
        selectedServicesForRetailPricingCopy: action.payload,
      };
    }
    case "HANDLE_CHANGE_SERVICE_FOR_RETAIL_PRICING": {
      /* 
      updating selected services for retail pricing here using index
      */
      const {selectedService, selectedServiceIndex} = action.payload;
      return {
        ...state,
        error: "",
        selectedServicesForRetailPricing: state?.selectedServicesForRetailPricing
          ?.map((e, i) => {
            return i === selectedServiceIndex ? selectedService : e;
          })
          ?.filter(function (el) {
            return el !== undefined;
          }),
      };
    }

    case "HANDLE_ADD_ANOTHER_SERVICE_FOR_RETAIL_PRICING": {
      /* 
      Adding a dropdown to select a service for retail pricing, pushing the value null to keep the dropdown value empty by default
      */
      const {selectedServicesForRetailPricing} = state;

      return {
        ...state,
        selectedServicesForRetailPricing: selectedServicesForRetailPricing.concat([null]),
      };
    }

    case "SET_DELIVERY_TIER_FOR_A_LOCATION_OR_ZONE": {
      /* 
       Adding a tier and empty service selection dropdown for a location if zones are not being used and also using the same reducer to add delivery Tier
       & service selection dropdown for each zone if user don't chooses set delivery tier and services per zone.
      */
      const {selection, isZone, zoneId} = action.payload;
      const {zones} = state;
      return {
        ...state,
        deliveryTier: !isZone ? selection : {},
        error: "",
        zones: !isZone
          ? zones?.map((zone) => {
              if (zone?.id === zoneId) {
                return {
                  ...zone,
                  deliveryTier: selection,
                };
              }
              return zone;
            })
          : [],
      };
    }

    case "HANDLE_APPLY_TIER_FOR_ALL_ZONE": {
      const {zones} = state;
      const {deliveryTier} = action.payload;

      return {
        ...state,
        error: "",
        zones: zones?.map((zone) => {
          return {
            ...zone,
            deliveryTier: deliveryTier,
          };
        }),
      };
    }

    case "SET_ERROR": {
      return {
        ...state,
        error: action.payload,
      };
    }

    case "SET_SERVICE_PRICING_AVAILABILITY_PAYLOAD": {
      /* 
       storing the final payload here
      */
      return {
        ...state,
        error: "",
        servicePricingAndAvailabilityPayload: action.payload,
      };
    }

    case "SAVE_INITIAL_PRICING": {
      return {
        ...state,
        zonesCopy: state.zones,
        deliveryTierCopy: state.deliveryTier,
      };
    }

    case "RESET_DATA": {
      return {
        ...state,
        zones: state.zonesCopy,
        deliveryTier: state.deliveryTierCopy,
        selectedServicesForRetailPricing: state.selectedServicesForRetailPricingCopy,
      };
    }
    default:
      return state;
  }
};
