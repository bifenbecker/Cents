import {createState} from "@hookstate/core";

export const initialCustomerState = {
  customerAuthToken: null,
  customer: {},
};

const customerState = createState(initialCustomerState);

export default customerState;
