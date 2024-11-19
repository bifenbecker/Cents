import httpClient from "./../httpClient";
import Axios from "axios";

let locationDetailsCancelToken;

export const fetchLocations = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/locations",
    params,
  });
};

export const createNewLocation = (newLocation) => {
  return httpClient({
    method: "POST",
    url: "/business-owner/admin/locations",
    data: newLocation,
  });
};

export const updateLocationInfo = (locationInfo, params) => {
  return httpClient({
    params,
    method: "PUT",
    url: "/business-owner/admin/locations",
    data: locationInfo,
  });
};

export const updateLocationPassword = (id, {password, confirmPassword}) => {
  return httpClient({
    method: "PUT",
    url: `/business-owner/admin/locations/${id}/updateStorePassword`,
    data: {password, confirmPassword},
  });
};

export const fetchShifts = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/locations/shifts",
    params,
  });
};

export const updateShifts = (storeId, shifts) => {
  return httpClient({
    method: "PUT",
    url: `/business-owner/admin/locations/${storeId}/shifts`,
    data: {shifts},
  });
};

export const updateOrCreateShift = (shift, storeId) => {
  const method = shift && shift.id ? "PUT" : "POST";
  const params = shift && shift.id ? null : {storeId};
  return httpClient({
    params,
    method: method,
    url: "/business-owner/admin/locations/shifts",
    data: shift,
  });
};

export const fetchDistricts = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/locations/districts",
    params,
  });
};

export const fetchRegions = () => {
  return httpClient({
    method: "GET",
    url: "/business-owner/locations/regions",
  });
};

export const updateHubSettings = (params, payload) => {
  return httpClient({
    method: "PUT",
    url: "/business-owner/admin/locations/hub",
    params,
    data: payload,
  });
};

export const updateLocationSettings = (locationId, payload) => {
  return httpClient({
    method: "PATCH",
    url: `/business-owner/admin/locations/settings/${locationId}`,
    data: payload,
  });
};

//   export const updateBagTracking = (id, isBagTrackingEnabled) => {
//     return httpClient({
//         method: 'PUT',
//         url: '/business-owner/admin/locations/settings/bagTracking',
//         params: {
//             id,
//         },
//         data: {
//             isBagTrackingEnabled,
//         },
//     })
//   }

/**
 * This api fetches locations of this business
 * which are not hub themselves and are not assigned to any other hub
 */
export const fetchLocationsWithoutHub = (locationId) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/locations/storesWithouthub",
    params: {
      id: locationId,
    },
  });
};

export const fetchServicesOfLocation = (locationId) => {
  return httpClient({
    method: "GET",
    url: `/business-owner/admin/locations/${locationId}/services`,
  });
};

export const fetchProductsOfLocation = (locationId) => {
  return httpClient({
    method: "GET",
    url: `/business-owner/admin/locations/${locationId}/products`,
  });
};

export const fetchLocationDetails = (locationId) => {
  if (locationDetailsCancelToken) {
    locationDetailsCancelToken.cancel();
  }

  locationDetailsCancelToken = Axios.CancelToken.source();
  return httpClient({
    method: "GET",
    url: `/business-owner/admin/locations/${locationId}`,
    cancelToken: locationDetailsCancelToken.token,
  });
};

export const updateOffersFullService = (locationId, offersFullService) => {
  return httpClient({
    method: "PATCH",
    url: `/business-owner/admin/locations/full-service/${locationId}`,
    data: {
      offersFullService,
    },
  });
};

export const updateServicesOfLocation = (locationId, services) => {
  return httpClient({
    method: "PUT",
    url: `/business-owner/admin/locations/${locationId}/services`,
    data: {
      services,
    },
  });
};

export const updateIntakeOnly = (locationId, isIntakeOnly) => {
  return httpClient({
    method: "PATCH",
    url: `/business-owner/admin/locations/settings/intake-only/${locationId}`,
    data: {
      isIntakeOnly,
    },
  });
};

export const updateIsResidential = (locationId) => {
  return httpClient({
    method: "PATCH",
    url: `/business-owner/admin/locations/settings/residential/${locationId}`,
  });
};

export const registerCashCardSettings = (id, payload) => {
  return httpClient({
    method: "POST",
    url: `/business-owner/admin/locations/${id}/cashCard/register`,
    data: payload,
  });
};

export const fetchAssignedLocations = () => {
  return httpClient({
    method: "GET",
    url: "/business-owner/locations/assigned",
  });
};

export const validateTimings = (locationId, payload) => {
  return httpClient({
    method: "POST",
    url: `business-owner/admin/locations/${locationId}/validate-timings-change`,
    data: payload,
  });
};
