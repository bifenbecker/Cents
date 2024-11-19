const initialState = {
  manageOrderState: {},
  addressToValidate: {},
  selectedAddressId: null,
  customerInfo: {},
  customerAddresses: [],
  initLoading: true,
  generalDeliverySettings: {deliveryEnabled: false},
  onDemandDeliverySettings: {active: false},
  ownDriverDeliverySettings: {active: false},
  ownDriverDeliverySettingsLoading: false,
  serviceableByOnDemand: false,
  services: [],
  showAddressSelection: false,
  showDeliveryWindows: false,
  initialAddressValidation: false,

  error: null,
  loading: false,

  errorToastMessage: null,
};

export default initialState;
