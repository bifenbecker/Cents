import {useHookstate} from "@hookstate/core";
import {useCallback} from "react";

import customerState, {initialCustomerState} from "../state/customer";

import {CUSTOMER_AUTH_TOKEN_KEY, CUSTOMER_KEY} from "../utils";
import {setStringifiedLocalStorageData} from "../utils/common";

const defaultCustomer = {
  firstName: "",
  lastName: "",
};

const useCustomerState = () => {
  const setCustomer = useCallback(value => {
    customerState.customer.set(value);
    setStringifiedLocalStorageData(CUSTOMER_KEY, value);
  }, []);

  const setCustomerAuthToken = useCallback(value => {
    customerState.customerAuthToken.set(value);
    setStringifiedLocalStorageData(CUSTOMER_AUTH_TOKEN_KEY, value);
  }, []);

  const setCustomerState = useCallback(({customer, customerAuthToken}) => {
    customerState.set({
      customer,
      customerAuthToken,
    });
  }, []);

  const setCustomerDetails = useCallback(
    ({customer, customerAuthToken}) => {
      setCustomerState({customer, customerAuthToken});
      setStringifiedLocalStorageData(CUSTOMER_KEY, customer);
      setStringifiedLocalStorageData(CUSTOMER_AUTH_TOKEN_KEY, customerAuthToken);
    },
    [setCustomerState]
  );

  const clearCustomerDetails = useCallback(() => {
    setCustomerState(initialCustomerState);
    localStorage.removeItem(CUSTOMER_KEY);
    localStorage.removeItem(CUSTOMER_AUTH_TOKEN_KEY);
  }, [setCustomerState]);

  return {
    customer: useHookstate(customerState.customer).value || defaultCustomer,
    customerAuthToken: useHookstate(customerState.customerAuthToken).value,
    setCustomer,
    setCustomerAuthToken,
    setCustomerState,
    setCustomerDetails,
    clearCustomerDetails,
  };
};

export default useCustomerState;
