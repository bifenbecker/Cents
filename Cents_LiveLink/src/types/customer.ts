export interface IStoreCustomers {
  notes: null;
  isHangDrySelected: boolean;
  hangDryInstructions: null;
  availableCredits: number | null;
  id: number;
  businessCustomer: {isCommercial: null};
}

export interface IPaymentMethods {
  last4: string;
  brand: string;
  centsCustomerId: number;
  provider: string;
  type: string;
  paymentMethodToken: string;
  id: number;
}

export interface IAddresses {
  id: number;
  address1: string;
  address2: string;
  city: string;
  firstLevelSubdivisionCode: string;
  postalCode: string;
  countryCode: string;
  googlePlacesId: string;
  instructions: string;
  leaveAtDoor: boolean;
}

export interface ICustomer {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  id: number;
  storeCustomers: IStoreCustomers[];
  paymentMethods: IPaymentMethods[];
  addresses: IAddresses[];
  availableCredits: number;
}
