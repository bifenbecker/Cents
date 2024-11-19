export const REPORT_TYPE = {
  AVG_ORDER_VALUE: "avgOrderValue",
  LABOR_REPORT: "laborReport",
  CASH_DRAWER_REPORT: "cashDrawerReport",
  DELIVERIES: "deliveries",
  INVENTORY_REPORT: "inventoryReport",
  INVENTORY_SALES_REPORT: "inventorySalesReport",
  NEW_CUSTOMERS: "newCustomers",
  PAYMENTS_BY_ORDER_REPORT: "paymentsByOrderReport",
  PAYOUTS_BREAKDOWN_REPORT: "payoutsBreakdownReport",
  PROMOTIONS_APPLIED: "promotionsApplied",
  SALES_BY_PAYMENT_METHOD: "salesByPaymentMethod",
  SALES_BY_SERVICE_CATEGORY: "salesByServiceCategory",
  SALES_DETAIL_REPORT: "salesDetailReport",
  SALES_TAX_REPORT: "salesTaxReport",
  SUBSCRIPTIONS: "subscriptions",
  TASKS_REPORT: "tasksReport",
  TEAM_MEMBER_TOTALS: "teamMemberTotals",
  TEAM_TIME_CARD_REPORT: "teamTimeCardReport",
  TIPS_PER_ORDER: "tipsPerOrder",
};

export const REPORT_DESCRIPTIONS = {
  [REPORT_TYPE.AVG_ORDER_VALUE]:
    "View the average order per location for all sales, including service and inventory orders. Report data is pulled from the order creation date.",
  [REPORT_TYPE.LABOR_REPORT]:
    "This report provides a work history from intake to completion for each order, including service and inventory orders. Data includes order and tip value, pounds per stage, and the attributed employee per stage. This report supports both basic and advanced processing.",
  [REPORT_TYPE.PAYOUTS_BREAKDOWN_REPORT]:
    "Reconcile lumped payment transfers to your bank account, including service and inventory orders. Report data is based on the created date of the payout, but limited to only 100 payouts for a given report. If there are more than 100 payouts, these payouts will not be displayed in the report.",
  [REPORT_TYPE.NEW_CUSTOMERS]:
    "A list of all of your new customers, including the date they registered, which location they registered at, and the value of their first order. First visit amount and first location are found by finding the first service order registered to their customer ID. Customer ID is backend data and will not appear on the report itself.",
  [REPORT_TYPE.PROMOTIONS_APPLIED]:
    "See how many times each promotion has been used and the total discounted value of each promotion. Report data is pulled from the creation date of the order, and includes service and inventory orders.",
  [REPORT_TYPE.SALES_BY_PAYMENT_METHOD]:
    "A breakdown of sales by payment method, including only sales that have received payment and have a payment status of 'succeeded'.",
  [REPORT_TYPE.PAYMENTS_BY_ORDER_REPORT]: `A summary of all sales at the selected locations. Report data is filtered by payment creation date and payment status as "PAID" including service and product orders. This is a legacy report and will eventually be deprecated. We recommend using the Transactions report moving forward.`,
  [REPORT_TYPE.SALES_DETAIL_REPORT]:
    "A detailed ledger of all sales, including service and inventory, at the selected locations. Please note that report data that is displayed as Intake Date and Time is the Order Created Date and Time.",
  [REPORT_TYPE.TEAM_MEMBER_TOTALS]:
    "Track your team members' total hours, sales, orders processed, and pounds processed.  For total orders processed: data is pulled from the order creation date, and the order activity log status is `READY_FOR_PICKUP` or `HUB_PROCESSING_COMPLETE` or `PROCESSING` or `HUB_PROCESSING_ORDER`",
  [REPORT_TYPE.TIPS_PER_ORDER]:
    "See tips per order for orders completed in the selected date range. Report includes which employees completed intake and processing steps.",
  [REPORT_TYPE.TEAM_TIME_CARD_REPORT]:
    "Track your team's check in / check out activity. Report data filtered where check-in time is between the selected times.",
  [REPORT_TYPE.TASKS_REPORT]:
    "See total taxable product/service sales and tax amounts for various tax rates. Report data is pulled from the creation date of order, where order status is COMPLETED and sales tax amount for given orders is greater than $0.",
  [REPORT_TYPE.INVENTORY_REPORT]:
    "See the available quantity of products on hand and available for sale at given locations. Report data is only showing inventory not deleted.",
  [REPORT_TYPE.INVENTORY_SALES_REPORT]:
    "See the total sales amount and quantity sold of products at a given location. Report data is displayed based on the created date of an order that has inventory items, including service and product orders.",
  [REPORT_TYPE.CASH_DRAWER_REPORT]:
    "A detailed breakdown of all cash information at a given location, including cash sales, and start and end cash drawer amounts.",
  [REPORT_TYPE.SALES_TAX_REPORT]:
    "See total taxable product/service sales and tax amounts for various tax rates. Report data is pulled from the creation date of order, where order status is COMPLETED and sales tax amount for given orders is greater than $0.",
  [REPORT_TYPE.SALES_BY_SERVICE_CATEGORY]:
    "See a breakdown of sales based on service category",
  [REPORT_TYPE.DELIVERIES]:
    "View all deliveries per day, customer, time windows, and all associated fees.",
  [REPORT_TYPE.SUBSCRIPTIONS]:
    "View all active subscriptions, start date, cadence, order value, and more.",
};

export const ORDER_STATUS = {
  COMPLETED: "COMPLETED",
  ACTIVE: "ACTIVE",
  CANCELLED: "CANCELLED",
};

export const REPORTS_WITH_ORDER_STATUS_CHECKBOXES = [
  REPORT_TYPE.AVG_ORDER_VALUE,
  REPORT_TYPE.PAYMENTS_BY_ORDER_REPORT,
  REPORT_TYPE.SALES_DETAIL_REPORT,
];

export const REPORTS_WITHOUT_LOCATION_DROPDOWN = [
  REPORT_TYPE.AVG_ORDER_VALUE,
  REPORT_TYPE.CASH_DRAWER_REPORT,
  REPORT_TYPE.INVENTORY_SALES_REPORT,
  REPORT_TYPE.PAYOUTS_BREAKDOWN_REPORT,
];

export const REPORT_TYPE_OPTIONS = [
  {label: "Average Order Value", value: REPORT_TYPE.AVG_ORDER_VALUE},
  {label: "Labor", value: REPORT_TYPE.LABOR_REPORT},
  {label: "Cash Drawer", value: REPORT_TYPE.CASH_DRAWER_REPORT},
  {label: "Cents Online Payouts Breakdown", value: REPORT_TYPE.PAYOUTS_BREAKDOWN_REPORT},
  {label: "Deliveries", value: REPORT_TYPE.DELIVERIES},
  {label: "Inventory", value: REPORT_TYPE.INVENTORY_REPORT},
  {label: "Inventory Sales", value: REPORT_TYPE.INVENTORY_SALES_REPORT},
  {label: "New Customers", value: REPORT_TYPE.NEW_CUSTOMERS},
  {label: "Promotions Applied", value: REPORT_TYPE.PROMOTIONS_APPLIED},
  {label: "(Legacy) Payments by Order", value: REPORT_TYPE.PAYMENTS_BY_ORDER_REPORT},
  {label: "Sales by Payment Method", value: REPORT_TYPE.SALES_BY_PAYMENT_METHOD},
  {label: "Sales by Service Category", value: REPORT_TYPE.SALES_BY_SERVICE_CATEGORY},
  {label: "Sales Detail", value: REPORT_TYPE.SALES_DETAIL_REPORT},
  {label: "Sales Tax", value: REPORT_TYPE.SALES_TAX_REPORT},
  {label: "Subscriptions", value: REPORT_TYPE.SUBSCRIPTIONS},
  {label: "Tasks", value: REPORT_TYPE.TASKS_REPORT},
  {label: "Team Member Totals", value: REPORT_TYPE.TEAM_MEMBER_TOTALS},
  {label: "Team - Time Card", value: REPORT_TYPE.TEAM_TIME_CARD_REPORT},
  {label: "Tips Per Order", value: REPORT_TYPE.TIPS_PER_ORDER},
];
