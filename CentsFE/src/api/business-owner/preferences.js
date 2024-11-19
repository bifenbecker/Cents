import httpClient from "./../httpClient";

const PREFERENCES_API = "/business-owner/admin/preferences";

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
      url: `${PREFERENCES_API}/${data.businessId}/${data.id}`,
    });
  },

  updatePreference: (data) => {
    return httpClient({
      method: "PATCH",
      url: `${PREFERENCES_API}/${data.businessId}/${data.id}`,
      data,
    });
  },
};
