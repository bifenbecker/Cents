import pick from "lodash/pick";

import {locationTabs, ServicePricingOption} from "../constants";
import {ShiftTypes} from "../../../../../constants";
import {areShiftTimingsAvailable} from "../common/shifts-tab/utils";
import {REACT_ENV} from "../../../../../utils/config";
import {flatten, isEmpty, sortBy} from "lodash";

const EMPTY_VALUES = ["", null, undefined];

export const isLocationDetailsSaveDisabled = (location, needsRegions) => {
  const fieldKeys = ["name", "phoneNumber", "address", "city", "state", "zipCode"];
  // If needsRegions is false, then we can ignore districtId.
  // Else, we need to check for that as well.
  if (needsRegions) {
    fieldKeys.push("districtId");
  }
  const fieldValues = Object.values(pick(location, fieldKeys));
  return EMPTY_VALUES.some((val) => fieldValues.includes(val));
};

export const getLocationTabsList = (location) => {
  return location.type === "RESIDENTIAL" ||
    (!location.hasDeliveryEnabled && REACT_ENV === "production")
    ? locationTabs.filter((t) => t.value !== "delivery-settings")
    : locationTabs;
};

export const curateShiftsAndTimings = (shifts, opts = {}) => {
  const {
    name = "Shift",
    addNewShift = true,
    type = ShiftTypes.SHIFT,
    overlapping = false,
  } = opts;

  let curatedShifts = [...shifts].sort((s1, s2) => s1?.id - s2?.id);
  const maxShifts = type === ShiftTypes.CENTS_DELIVERY ? 1 : null;

  if (addNewShift && (!maxShifts || curatedShifts.length < maxShifts)) {
    curatedShifts.push({
      name: `+ ${name} ${curatedShifts.length + 1}`,
      type,
      timings: [],
    });
  }

  curatedShifts = curatedShifts.map((shift) => {
    const isOldShift = Boolean(shift.id);
    const newTimings = [1, 2, 3, 4, 5, 6, 0].map((day) => {
      const existingTiming = shift.timings.find((t) => Number(t?.day) === day);

      return (
        existingTiming || {
          day,
          // If it's an old shift, it means they manually set it to false.
          isActive: !isOldShift,
          startTime: null,
          endTime: null,
          deliveryTimingSettings: {maxStops: null, serviceType: "ALL"},
        }
      );
    });

    return {
      ...shift,
      timings: newTimings,
    };
  });

  if (!overlapping) {
    // Need to loop again to send the latest shifts data that was setup above
    // This will set isActive key by also checking with the availablity of time.
    curatedShifts = curatedShifts.map((shift, shiftIdx) => {
      return {
        ...shift,
        timings: shift.timings.map((timing) => ({
          ...timing,
          isActive:
            timing.isActive &&
            areShiftTimingsAvailable(
              curatedShifts,
              shiftIdx,
              Number(timing.day) === 0 ? 6 : Number(timing.day) - 1
            ),
        })),
      };
    });
  }

  return curatedShifts;
};

export const centsToDollarsDisplay = (amount) => {
  return (amount / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

export const toDollars = (amount) => {
  return `$${Number(amount || 0)?.toFixed(2) || "0.00"}`;
};

export const filterDeliverableServices = (services) => {
  let filterDeliverableServicesOptions = [];
  ["PER_POUND", "FIXED_PRICE"].forEach((serviceCategory) => {
    const isPerPound = serviceCategory === "PER_POUND";
    filterDeliverableServicesOptions = [
      ...filterDeliverableServicesOptions,
      ...(
        services?.find(({category}) => category === serviceCategory) || {services: []}
      )?.services
        ?.filter(({prices: [{isFeatured, isDeliverable}]}) => isFeatured && isDeliverable)
        ?.map(({name, id, hasMinPrice, prices: [{storePrice}]}) => ({
          label: name,
          value: id,
          metaInfo: `(${hasMinPrice ? "min + " : ""}${toDollars(storePrice)} / ${
            isPerPound ? "lb" : "unit"
          })`,
        })),
    ];
  });

  return filterDeliverableServicesOptions.length
    ? filterDeliverableServicesOptions
    : [null];
};
export const filterByCategory = (
  serviceCategory,
  availableServices,
  selectedServicesOptions,
  checkForIsDeliverable = true
) => {
  const serviceCategoryCount = Array.isArray(serviceCategory)
    ? serviceCategory.length
    : 1;

  if (!availableServices?.length) {
    return [];
  }
  let returnArr = [];
  for (let i = 0; i < serviceCategoryCount; i++) {
    const currServiceCategory = Array.isArray(serviceCategory)
      ? serviceCategory[i]
      : serviceCategory;
    const isPerPound = currServiceCategory === "PER_POUND";
    const tempArr = (
      availableServices?.find(({category}) => category === currServiceCategory) || {
        services: [],
      }
    ).services
      ?.filter(
        ({prices: [{isFeatured, isDeliverable}]}) =>
          isFeatured && (isDeliverable || !checkForIsDeliverable)
      )
      ?.map(({name, id, hasMinPrice, prices: [{storePrice}]}) => {
        return {
          label: name,
          value: id,
          metaInfo: `(${hasMinPrice ? "min + " : ""}${toDollars(storePrice)} / ${
            isPerPound ? "lb" : "unit"
          })`,
        };
      })
      ?.filter(
        ({value}) => !selectedServicesOptions?.find((option) => option?.value === value)
      );

    returnArr.push(...tempArr);
  }
  const sortedReturnArr = sortBy(returnArr, [(o) => o.label.toLowerCase()]);
  return sortedReturnArr;
};

export const groupedServiceOptions = (
  availableServices,
  selectedServicesOptions,
  checkForIsDeliverable,
  flags = {}
) => {
  let serviceOptions = [];
  if (flags.cents20) {
    serviceOptions = [
      {
        label: "Wash & Fold",
        options: filterByCategory(
          ["PER_POUND"],
          availableServices,
          selectedServicesOptions,
          checkForIsDeliverable
        ),
      },
    ];
  } else {
    serviceOptions = [
      {
        label: "/Lb",
        options: filterByCategory(
          "PER_POUND",
          availableServices,
          selectedServicesOptions,
          checkForIsDeliverable
        ),
      },
      {
        label: "Fixed Price",
        options: filterByCategory(
          "FIXED_PRICE",
          availableServices,
          selectedServicesOptions,
          checkForIsDeliverable
        ),
      },
    ];
  }

  return serviceOptions;
};

export const isMoreSelectionAvailable = (ServiceOptions) => {
  return !!flatten(ServiceOptions.map(({options}) => options)).length;
};

export const buildDeliveryPricingPayload = (
  zones,
  deliveryTier,
  selectedServicesForRetailPricing,
  deliveryPriceType,
  deliverySettings
) => {
  const {ownDriverDeliverySettings} = deliverySettings;
  let payload = {};
  payload.deliveryPriceType = deliveryPriceType;

  if (
    deliveryPriceType === ServicePricingOption.deliveryTierPricing &&
    ownDriverDeliverySettings?.hasZones
  ) {
    payload.zones = zones.map((zone) => {
      return {
        id: zone?.id,
        deliveryTierId: zone?.deliveryTier.value,
      };
    });
    payload.offerDryCleaningForDelivery = deliveryTier?.offerDryCleaningForDeliveryTier;
    payload.dryCleaningDeliveryPriceType = ServicePricingOption.deliveryTierPricing;
  } else if (
    deliveryPriceType === ServicePricingOption.deliveryTierPricing &&
    !ownDriverDeliverySettings?.hasZones
  ) {
    payload.deliveryTierId = deliveryTier?.value;
    payload.offerDryCleaningForDelivery = deliveryTier?.offerDryCleaningForDeliveryTier;
    payload.dryCleaningDeliveryPriceType = ServicePricingOption.deliveryTierPricing;
  } else if (deliveryPriceType === ServicePricingOption.storeRetailPricingOption) {
    payload.deliveryServiceIds = selectedServicesForRetailPricing
      .map((e) => {
        return e?.value;
      })
      .filter(Number);
  }
  if (
    deliveryPriceType === ServicePricingOption.storeRetailPricingOption &&
    isEmpty(payload?.deliveryServiceIds)
  ) {
    return {
      payload,
      error:
        "Please select atleast one service that you want to offer for pickup & delivery",
    };
  } else if (
    deliveryPriceType === ServicePricingOption.deliveryTierPricing &&
    !ownDriverDeliverySettings?.hasZones &&
    !payload?.deliveryTierId
  ) {
    return {
      payload,
      error: "Please select a Delivery Tier!",
    };
  } else if (
    deliveryPriceType === ServicePricingOption.deliveryTierPricing &&
    ownDriverDeliverySettings?.hasZones &&
    payload?.zones.filter((zone) => zone?.deliveryTierId).length < payload?.zones?.length
  ) {
    return {
      payload,
      error: "Please select a Delivery Tier for each zone!",
    };
  }
  return {payload, error: null};
};
