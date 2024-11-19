import {fetchStoreTheme} from "api/store";
import {fetchBusinessTheme} from "api/business";

export const getThemeByStoreId = async (storeId: number) => {
  try {
    const response = await fetchStoreTheme(storeId);
    return response.data.theme;
  } catch (error) {
    return Promise.reject(error);
  }
};
export const getThemeByBusinessIdId = async (businessId: number) => {
  try {
    const response = await fetchBusinessTheme(businessId);
    return response.data.theme;
  } catch (error) {
    return Promise.reject(error);
  }
};
