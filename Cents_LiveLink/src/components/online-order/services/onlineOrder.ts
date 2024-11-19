import {fetchCustomerInfo} from "api/online-order";

export const getFetchCustomerInfoByStoreId = async (storeId: number) => {
  try {
    const response = await fetchCustomerInfo(storeId);
    return response.data.customer;
  } catch (error) {
    return Promise.reject(error);
  }
};
