import httpClient from "./../httpClient";

export const getRevenueBreakdownByPaymentMethod = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/reports/stores/revenue/payment-methods",
    params,
  });
};

export const getAverageServiceOrderTotals = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/reports/stores/service-orders/total/average",
    params,
  });
};

export const getAppliedPromotionsReport = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/reports/stores/service-orders/promotions",
    params,
  });
};

export const getNewCustomersReport = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/reports/customers/new/list",
    params,
  });
};

export const getTeamMemberTotalsReport = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/reports/team-members/totals/list",
    params,
  });
};

export const getTipsPerOrderReport = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/reports/stores/service-orders/tips",
    params,
  });
};

export const getPayoutsReport = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/reports/payouts",
    params,
  });
};

export const getAverageOrdersReport = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/reports/stores/orders/total/average",
    params,
  });
};

export const getLaborReport = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/reports/stores/orders/labor",
    params,
  });
};

export const getInventoryCountReport = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/reports/stores/inventory/count",
    params,
  });
};

export const getCashDrawerReport = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/reports/stores/cash-drawer",
    params,
  });
};

export const getSalesTaxLiabilityReport = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/reports/stores/sales-tax",
    params,
  });
};

export const getSalesByServiceCategoryReport = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/reports/categories/sales",
    params,
  });
};

export const getSalesByServiceSubCategoryReport = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/reports/categories/sales/by-subcategory",
    params,
  });
};

export const getEmailedReport = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/reports",
    params,
  });
};

export const downloadDeliveriesReport = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/reports/stores/deliveries",
    params,
  });
};

export const downloadSubscriptionsReport = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/reports/subscriptions",
    params,
  });
};
