const router = require('express').Router();

const notify = require('./Notify');
const checkOut = require('./checkOut');
// const services = require('./services');
const location = require('./location');
const search = require('./orderSearch');
const getOrders = require('./getOrders');
const checkIn = require('./checkIn');
const { getOrdersCount } = require('./ordersCount');
const { getOrdersCountByStatus } = require('./ordersCount');
const { createOrder } = require('./createOrder');
const getAllOrders = require('./getAllOrders');
const verifyEmployee = require('./verifyEmployee');
const updateOrderStatus = require('./updateOrderStatus').updateStatus;
const ordersPagination = require('./getOrdersPagination').getOrders;
const notificationLogs = require('./orderNotificationLogs');
const getCheckedInEmployees = require('./checkedInEmployees');
const singleOrder = require('./getSingleOrder').getSingleOrder;
const updateOrderNotes = require('./updateOrderNotes');
const checkBarcode = require('./checkBarcode');
const overrideStatus = require('./overrideOrderStatus');
const getOrderFromBarcode = require('./getOrderFromBarcode');
const editOrderWeight = require('./updateOrderWeight');
const updateOrderTotal = require('./updateOrderTotal');
const inventoryOrders = require('./inventoryOrders');
const history = require('./ordersHistoryPagination');
const updateOrderPaymentTiming = require('./updateOrderPaymentTiming');
const adjustOrder = require('./adjustOrder');
const intakeResidentialOrder = require('./intakeresidentialOrder');
const intakeOnlineOrder = require('./intakeOnlineOrder');
const sendLiveLink = require('./sendLiveLink');
const updateRack = require('./updateRack');
const getOrderDeliveryDetails = require('./getOrderDelivery');
const { updatePromotionTipAndCredit } = require('../orders/serviceOrders/serviceOrderController');

const checkOrder = require('../../../validations/employeeTab/home/checkOrder');
const addRackValidations = require('../../../validations/employeeTab/washAndFold/addRack');
const checkOutValidations = require('../../../validations/employeeTab/home/checkIn/checkOut');
const addWeightValidations = require('../../../validations/employeeTab/washAndFold/addWeight');
const checkInValidations = require('../../../validations/employeeTab/home/checkIn/checkIn');
const verifyEmployeeValidations = require('../../../validations/employeeTab/home/checkIn/verifyEmployee');
const updateOrderStatusValidations = require('../../../validations/employeeTab/washAndFold/updateStatus');
const createOrderValidations =
    require('../../../validations/employeeTab/washAndFold/createOrder').validate;
const updateOrderCreditValidations = require('../../../validations/employeeTab/home/updateOrderCredits');
const updateOrderTipValidations = require('../../../validations/employeeTab/home/updateOrderTipValidations');
const updateOrderPromotionValidations = require('../../../validations/employeeTab/home/updateOrderPromotionValidation');
const updateRackValidation = require('../../../validations/employeeTab/home/updateRack');

const editOrderWeightValidations = require('../../../validations/employeeTab/home/editOrderWeight');
const overrideStatusValidations = require('../../../validations/employeeTab/home/overrideOrderStatus');
const intakeResidentialOrderValidation = require('../../../validations/residentialOrder/intakeResidentialOrder');
const intakeOnlineOrderValidation = require('../../../validations/employeeTab/washAndFold/onlineOrderIntake');
const adjustOrderValidator = require('../../../validations/employeeTab/washAndFold/orderAdjustment');
const orderCalculationsValidation = require('../../../validations/employeeTab/washAndFold/orderCalculations');
const storeCustomerCheck = require('../../../middlewares/checkCustomer');
const setOrderCalculationsDetails = require('../../../middlewares/setOrderCalculationsDetails');

const { appendOrderCustomerAndEmployee } = require('../../../utils/addOrderCustomerAndEmployee');
const { orderCalculations } = require('./orderCalculations');
const sendDeliveryReminderText = require('./sendDeliveryReminderText');
const checkFailedPaymentHandler = require('./checkFailedPayment');

// router.get('/', services);
router.get('/history', history);
router.post('/notify', notify);
router.get('/serviceOrder/:serviceOrderId/checkFailedPayment', checkFailedPaymentHandler);
router.post('/serviceOrder/:serviceOrderId/delivery-reminder', sendDeliveryReminderText);
router.post('/sendLiveLink', sendLiveLink);
router.post('/order/status/override', overrideStatusValidations, overrideStatus);
router.use('/orders/inventory', inventoryOrders);
router.get('/orders', getOrders);
router.get('/location', location);
router.post('/orders', createOrderValidations, storeCustomerCheck, createOrder);
router.post(
    '/orders/calculate-total',
    orderCalculationsValidation,
    appendOrderCustomerAndEmployee,
    orderCalculations,
);

router.put('/orders/:id', adjustOrderValidator, appendOrderCustomerAndEmployee, adjustOrder);
router.get('/orders/search', search);
router.get('/singleOrder', singleOrder);
router.get('/orders-count', getOrdersCount);
router.get('/orders-count-by-status', getOrdersCountByStatus);
router.get('/orders-pagination', ordersPagination);
router.get('/orders-history', getAllOrders, getOrders);
router.post('/check-out', checkOutValidations, checkOut);
router.get('/checked-in-employees', getCheckedInEmployees);
router.post('/check-in', checkInValidations, checkIn);
router.post('/check-in-out', checkInValidations, checkIn);
router.get('/order/notification-logs', checkOrder, notificationLogs);
// router.post('/orders/add-weight', addWeightValidations, addWeightLog);
router.post('/verify-employee', verifyEmployeeValidations, verifyEmployee);
router.post(
    '/order/update',
    updateOrderStatusValidations,
    addWeightValidations,
    addRackValidations,
    updateOrderStatus,
);
router.patch('/order/notes/update', updateOrderNotes);
router.patch('/order/weights/edit', editOrderWeightValidations, editOrderWeight);
router.get('/check-barcode', checkBarcode);
router.get('/order/barcode/retrieve', getOrderFromBarcode);
router.patch('/orders/:id/orderTotal/update', updateOrderTotal);
router.patch('/orders/:id/paymentTiming/update', updateOrderPaymentTiming);
router.patch(
    '/orders/:id/tipAmount/update',
    setOrderCalculationsDetails,
    updateOrderTipValidations,
    updatePromotionTipAndCredit,
);
router.patch(
    '/orders/:id/promotions/update',
    setOrderCalculationsDetails,
    updateOrderPromotionValidations,
    updatePromotionTipAndCredit,
);
router.patch(
    '/orders/:id/credit/update',
    setOrderCalculationsDetails,
    updateOrderCreditValidations,
    updatePromotionTipAndCredit,
);
router.patch(
    '/orders/residentialOrderIntake/:id',
    intakeResidentialOrderValidation,
    intakeResidentialOrder,
);
router.patch('/order/rack', updateRackValidation, updateRack);
router.patch(
    '/orders/onlineOrderIntake/:id',
    intakeOnlineOrderValidation,
    appendOrderCustomerAndEmployee,
    intakeOnlineOrder,
);

router.get('/orders/:orderId/delivery', getOrderDeliveryDetails);

module.exports = exports = router;
