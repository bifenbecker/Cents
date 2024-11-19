export const usa_state_list = [
  "Alabama",
  "Alaska",
  "American Samoa",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "District Of Columbia",
  "Federated States Of Micronesia",
  "Florida",
  "Georgia",
  "Guam",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Marshall Islands",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Northern Mariana Islands",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Palau",
  "Pennsylvania",
  "Puerto Rico",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virgin Islands",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

export const run_machine_wash_type = {
  TECHNICAL: "technical",
  CUSTOMER_SERVICE: "customerService",
};

export const orderDatatableColumns = [
  {
    name: "Order ID",
    selector: "orderId",
    sortable: true,
  },
  {
    name: "Customer",
    selector: "customerName",
    sortable: true,
  },
  {
    name: "Order Total",
    selector: "orderTotal",
    sortable: true,
  },
  {
    name: "Per lbs. Service Type",
    selector: "serviceTypeName",
    sortable: true,
  },
  {
    name: "Intake Weight",
    selector: "totalWeight",
    sortable: true,
  },
  {
    name: "Fixed Price Services",
    selector: "fixedPriceServices",
    sortable: false,
  },
  {
    name: "Date",
    selector: "date",
    sortable: true,
  },
  {
    name: "Order Status",
    selector: "orderStatus",
    sortable: true,
  },
  {
    name: "Payment Status",
    selector: "paymentStatus",
    sortable: true,
  },
  {
    name: "Employee Code",
    selector: "employeeCode",
    sortable: true,
  },
  {
    name: "Payment Processor",
    selector: "paymentProcessor",
    sortable: true,
  },
  {
    name: "Cash Card Receipt",
    selector: "esdReceiptNumber",
    sortable: true,
  },
];

export const servicesAndProductsTabValues = {
  LAUNDRY: "laundry_services",
  FIXED_PRICE: "fixed_price_services",
  PER_POUND: "lb_services",
  PRODUCTS: "products",
  DRY_CLEANING: "dry_cleaning_services",
};

export const app_urls = {
  dev: "http://cents-dev.us-east-2.elasticbeanstalk.com/api/v1",
  preProd: "https://preprod-admin-api.trycents.com/api/v1",
  prod: "https://api3.trycents.com/api/v1",
};

export const WEEK_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const ORDER_TYPES = {
  residential: "RESIDENTIAL",
  service: "SERVICE",
  online: "ONLINE",
  inventory: "INVENTORY",
};

export const ROLES = {
  superAdmin: "superAdmin",
  owner: "owner",
  admin: "admin",
  manager: "manager",
};

export const RoleNameMapping = {
  superAdmin: "Super Admin",
  owner: "Owner",
  admin: "Administrator",
  manager: "Manager",
};

export const TURN_STATUS = {
  CREATED: "Turn enabled",
  STARTED: "Turn in process",
  ENABLED: "Turn enabled",
  COMPLETED: "Turn complete",
};

export const ShiftTypes = {
  SHIFT: "SHIFT",
  OWN_DELIVERY: "OWN_DELIVERY",
  CENTS_DELIVERY: "CENTS_DELIVERY",
};

export const SUBSCRIPTION_INTERVAL_DISPLAY = {
  1: "Weekly",
  2: "Every 2 weeks",
  3: "Every 3 weeks",
  4: "Every 4 weeks",
};

export const SERVICE_TYPES = [
  {label: "Pickup & Delivery", value: "ALL"},
  {label: "Pickup", value: "PICKUP"},
  {label: "Delivery", value: "RETURN"},
];

export const PREFERENCES_SECTION_TITLE_LENGTH = 80;
export const PREFERENCES_OPTION_LENGTH = 80;

export const WASH_AND_FOLD_SUBCATEGORY = "PER_POUND";
export const REPORTS = {
  TEAMS: "Teams",
};

export const HELP_BUTTON_ID = "helpButton"; // is used to run Intercom messenger
