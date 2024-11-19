export interface OTPResponse {
  isNew: boolean;
  customerAuthToken?: string;
  customer?: Partial<NewCustomer>;
  latestOrderToken?: string;
  success: boolean;
}

export interface NewCustomer {
  firstName?: string;
  lastName?: string;
  fullName: string;
  phoneNumber: string;
}
