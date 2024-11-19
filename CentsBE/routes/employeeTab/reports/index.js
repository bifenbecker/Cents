const router = require('express').Router();

// Controller methods
const {
    getRevenueByPaymentMethod,
    getAppliedPromotionsData,
    getNewCustomersData,
    getTeamMemberTotalsReport,
    getTipsPerServiceOrderData,
    getAverageCombinedOrderTotals,
    getTeamTimeCardsData,
    getTasksReportData,
    getInventoryCountReport,
    getOrderSalesAndPaymentMethods,
    getDetailedOrdersReport,
} = require('./reportsController');

router.get('/revenue/payment-methods', getRevenueByPaymentMethod);
router.get('/service-orders/promotions', getAppliedPromotionsData);
router.get('/customers/new/list', getNewCustomersData);
router.get('/team-members/totals/list', getTeamMemberTotalsReport);
router.get('/team-members/time-cards/list', getTeamTimeCardsData);
router.get('/service-orders/tips', getTipsPerServiceOrderData);
router.get('/orders/total/average', getAverageCombinedOrderTotals);
router.get('/tasks', getTasksReportData);
router.get('/inventory/count', getInventoryCountReport);
router.get('/payments/sales', getOrderSalesAndPaymentMethods);
router.get('/orders/sales', getDetailedOrdersReport);

module.exports = exports = router;
