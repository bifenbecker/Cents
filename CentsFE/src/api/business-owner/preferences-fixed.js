import httpClient from "./../httpClient";

const PREFERENCES_API = "/business-owner/admin/advanced-customer-preferences";

export default {
  addPreferences: (data) => {
    return httpClient({
      method: "POST",
      url: PREFERENCES_API,
      data,
    });
  },

  fetchPreferences: () => {
    return httpClient({
      method: "GET",
      url: PREFERENCES_API,
    });
  },

  removePreference: (data) => {
    return httpClient({
      method: "DELETE",
      url: `${PREFERENCES_API}/businesses/${data.businessId}/preferences/${data.id}`,
    });
  },

  updatePreference: (data) => {
    return httpClient({
      method: "PATCH",
      url: `${PREFERENCES_API}/businesses/${data.businessId}/preferences/${data.id}`,
      data,
    });
  },

  updateOption: (data) => {
    return httpClient({
      method: "PATCH",
      url: `${PREFERENCES_API}/options/${data.id}`,
      data,
    });
  },

  removeOption: (data) => {
    return httpClient({
      method: "DELETE",
      url: `${PREFERENCES_API}/options/${data.id}`,
    });
  },

  addOption: (data) => {
    return httpClient({
      method: "POST",
      url: `${PREFERENCES_API}/options/`,
      data,
    });
  },

  updateDefaultOption: (data) => {
    return httpClient({
      method: "PATCH",
      url: `${PREFERENCES_API}/options/default`,
      data,
    });
  },
};
