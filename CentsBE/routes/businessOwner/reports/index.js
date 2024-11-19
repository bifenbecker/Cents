const router = require('express').Router();

// Controller methods
const {
    getRevenueByPaymentMethod,
    getAverageServiceOrderTotal,
    getAverageInventoryOrderTotal,
    getAppliedPromotionsData,
    getNewCustomersData,
    getTeamMemberTotalsReport,
    getTipsPerServiceOrderData,
    getPayoutsReport,
    getRefundsReport,
    getAverageCombinedOrderTotals,
    getInventoryCountReport,
    getCashDrawerReport,
    getSalesTaxLiabilityReport,
    getSalesByServiceCategoryReport,
    getSalesByServiceSubCategoryReport,
    generateReport,
    getOrderDeliveries,
    getSubscriptionsListReport,
    getCustomersReport,
} = require('./reportsController');
const validateLaborReportPayload = require('../../../validations/reports/validateLaborReportPayload');
const getLaborReport = require('./getLaborReport');

const reportInputValidation = require('../../../validations/reports/inputValidation');

// validations
const validateSubscriptionsReportPayload = require('../../../validations/reports/subscriptionsList');
const validateSalesByServiceCategoryPayload = require('../../../validations/reports/salesByServiceCategory');
const validateSalesByServiceSubCategoryPayload = require('../../../validations/reports/salesByServiceSubCategory');
const validateCustomersReportPayload = require('../../../validations/reports/validateCustomersReportPayload');

router.get('/stores/revenue/payment-methods', getRevenueByPaymentMethod);
router.get('/stores/service-orders/total/average', getAverageServiceOrderTotal);
router.get('/stores/inventory-orders/total/average', getAverageInventoryOrderTotal);
router.get('/stores/service-orders/promotions', getAppliedPromotionsData);
router.get('/customers/new/list', getNewCustomersData);
router.get('/team-members/totals/list', getTeamMemberTotalsReport);
router.get('/stores/service-orders/tips', getTipsPerServiceOrderData);
router.get('/payouts', getPayoutsReport);
router.get('/refunds', getRefundsReport);
router.get('/stores/orders/total/average', getAverageCombinedOrderTotals);
router.get('/stores/inventory/count', getInventoryCountReport);
router.get('/stores/cash-drawer', getCashDrawerReport);
router.get('/stores/sales-tax', validateCustomersReportPayload, getSalesTaxLiabilityReport);
router.get(
    '/categories/sales',
    validateSalesByServiceCategoryPayload,
    getSalesByServiceCategoryReport,
);
router.get(
    '/categories/sales/by-subcategory',
    validateSalesByServiceSubCategoryPayload,
    getSalesByServiceSubCategoryReport,
);
router.get('/stores/deliveries', reportInputValidation, getOrderDeliveries);
router.get('/', generateReport);
router.get('/subscriptions', validateSubscriptionsReportPayload, getSubscriptionsListReport);
router.get('/stores/orders/labor', validateLaborReportPayload, getLaborReport);
router.get('/customers', validateCustomersReportPayload, getCustomersReport);

module.exports = exports = router;
