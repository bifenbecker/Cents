const { find, isEmpty } = require('lodash');
const jwt = require('jsonwebtoken');

// models
const ServiceOrder = require('../../models/serviceOrders');
const Store = require('../../models/store');
const StoreSettings = require('../../models/storeSettings');
const PartnerSubsidiaryStore = require('../../models/partnerSubsidiaryStore');
const ServiceOrderBag = require('../../models/serviceOrderBags');
const StoreCustomer = require('../../models/storeCustomer');
const CentsCustomer = require('../../models/centsCustomer');
const OrderActivityLog = require('../../models/orderActivityLog');
const Businesses = require('../../models/laundromatBusiness');
const User = require('../../models/user');
const OrderDelivery = require('../../models/orderDelivery');
const RouteDelivery = require('../../models/routeDeliveries');
const Order = require('../../models/orders');

// services
const { getSettings } = require('../../services/liveLink/queries/stores');
const { getOrderDetails } = require('../../services/liveLink/queries/serviceOrder');
const { requestOtp, verifyOtp, getPhoneNumber } = require('../../services/liveLink/otp');
const { findStoreById } = require('../../elasticsearch/store/queries');
const pickupAndDeliveryDetails = require('../../uow/liveLink/serviceOrders/pickupAndDeliveryDetails');

// utils
const { getServiceOrderAndCustomerDetails } = require('../../utils/addOrderCustomerAndEmployee');

// pipelines
const processPaymentForOrderPipeline = require('../../pipeline/residentialOrder/payment/processPaymentForOrderPipeline');
const addCustomerPaymentMethodPipeline = require('../../pipeline/customer/paymentMethod/addCustomerPaymentMethodPipeline');
const updateReturnMethodPipeLine = require('../../pipeline/liveLink/updateReturnMethod');
const updatePaymentIntentPaymentMethodPipeLine = require('../../pipeline/liveLink/updatePaymentIntentPaymentMethod');
const createOwnNetworkReturnDeliveryPipeline = require('../../pipeline/delivery/return/createOwnNetworkReturnDeliveryPipeline');
const cancelUberDeliveryPipeline = require('../../pipeline/delivery/uber/cancelUberDeliveryPipeline');
const getRouteDeliveryDetailsPipeline = require('../../pipeline/liveLink/getRouteDeliveryDetailsPipeline');
const cancelOwnDriverDeliveryPipeline = require('../../pipeline/delivery/ownDriver/cancelOwnDriverDeliveryPipeline');
const cancelDoorDashDeliveryPipeline = require('../../pipeline/doordash/cancelDoorDashDeliveryPipeline');
const manageOrderPipeline = require('../../pipeline/liveLink/manageOrderPipeline');
const getPickUpAndDeliveryDetailsPipeline = require('../../pipeline/liveLink/getPickUpAndDeliveryDetailsPipeline');
const updateOrderPipeline = require('../../pipeline/liveLink/updateOrderPipeline');
const computeDeliveryFee = require('../../pipeline/delivery/estimate/computeDeliveryFee');

const {
    routeDeliveryStatuses: deliveryStatuses,
    deliveryProviders,
    ADMIN_ROLES,
    origins,
    statuses,
    returnMethods,
} = require('../../constants/constants');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

async function getRouteDeliveryDetails(req, res, next) {
    try {
        const { orderDeliveryId } = req.params;
        const routableId = orderDeliveryId;
        const routeDelivery = await getRouteDeliveryDetailsPipeline({ routableId });
        res.status(200).json({
            success: true,
            routeDelivery,
        });
    } catch (error) {
        next(error);
    }
}

async function getOrder(req, res, next) {
    try {
        const { order } = req.constants;
        const orderDetails = await getOrderDetails(order.id);
        res.status(200).json({
            success: true,
            order: orderDetails,
        });
    } catch (error) {
        next(error);
    }
}

async function updateReturnMethod(req, res, next) {
    try {
        const { order } = req.constants;
        const { returnMethod } = req.body;
        await updateReturnMethodPipeLine({
            serviceOrderId: order.id,
            returnMethod,
        });
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        if (error.message === 'INVALID_METHOD') {
            res.status(403).json({
                error: 'returnMethods must include delivery and in-store-pickup',
            });
            return;
        }
        next(error);
    }
}

async function updatePaymentIntent(req, res, next) {
    try {
        const { order } = req.constants;
        await updatePaymentIntentPaymentMethodPipeLine({
            ...req.body,
            serviceOrderId: order.id,
        });

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        if (error.message === 'not_found') {
            res.status(404).json({
                error: 'payment which requires confirmation is not found',
            });
            return;
        }
        next(error);
    }
}

/**
 * Get the subsidiaryCode for a given store and parner association
 *
 * @param {Object} store
 */
async function getSubsidiaryCode(store) {
    let subsidiaryCode = null;
    const subsidiariesMap = await PartnerSubsidiaryStore.query()
        .withGraphFetched('partnerSubsidiary')
        .where({ storeId: store.id });

    if (store.type === 'RESIDENTIAL' && subsidiariesMap.length > 0) {
        const subsidiaries = subsidiariesMap.map((map) => map.partnerSubsidiary);
        const residentialSubsidiary = subsidiaries.filter(
            (subsidiary) => subsidiary.type === 'RESIDENTIAL',
        );
        subsidiaryCode = residentialSubsidiary[0].subsidiaryCode;
    }

    return subsidiaryCode;
}

async function generateOtp(req, res, next) {
    try {
        const { phoneNumber, storeId, isAuthorized } = req.body;
        let subsidiaryCode = null;
        let hasSmsEnabled = true;
        if (storeId) {
            const storeSettings = await StoreSettings.query()
                .withGraphFetched('store')
                .findOne({ storeId });
            subsidiaryCode = await getSubsidiaryCode(storeSettings.store);
            hasSmsEnabled = storeSettings.hasSmsEnabled;
        }

        const resp = await requestOtp(phoneNumber, hasSmsEnabled, subsidiaryCode, isAuthorized);
        const { firstName, lastName, otp } = resp;
        res.status(200).json({
            success: true,
            phoneNumber,
            customer: {
                firstName,
                lastName,
            },
            otpCode: otp,
        });
    } catch (error) {
        if (error.message === 'CUSTOMER_NOT_FOUND') {
            res.status(404).json({
                error: 'Customer not found.',
            });
            return;
        }
        next(error);
    }
}

/*  Authoirze Admin User:
    Verifies the passed in token belongs to an account with role type
    of Super Admin, Business Admin, Business Owner, or Business Manager.
    Query checks for a user, that belongs to the business, and is a manager, owner, or admin
    get userId from decoded token
    query the teamMembers table, role is manager/owner/admin, and belongs to
    the business.
*/
async function authorizeAdminUser(req, res, next) {
    try {
        const { token } = req.body;

        if (!token.businessId || !token.token) {
            return res.status(422).json({
                success: false,
                error: 'No token or business id present in the request',
            });
        }

        const stringToken = token.token.toString().replace(/'|'/g, '');
        const isTokenValid = jwt.verify(stringToken, process.env.JWT_SECRET_TOKEN);

        // Check if the user is the business owner.
        const owner = await Businesses.query().withGraphFetched('user').findById(token.businessId);

        if (owner.user.id === isTokenValid.id) {
            return res.status(200).json({
                isTokenValid,
                success: true,
            });
        }

        const user = await User.query().withGraphFetched('roles').findById(isTokenValid.id);
        const filteredUserRoles = user.roles.map((role) => role.userType);
        const isAuthorized = filteredUserRoles.some((filteredRole) =>
            ADMIN_ROLES.includes(filteredRole),
        );

        return res.status(200).json({
            isTokenValid,
            success: isAuthorized,
        });
    } catch (err) {
        return next(err);
    }
}

async function getStoreSettings(req, res, next) {
    try {
        const { storeId, businessId } = req.constants.order;
        const settings = await getSettings(storeId, businessId);

        res.status(200).json({
            success: true,
            ...settings,
        });
    } catch (error) {
        next(error);
    }
}

async function validateOtp(req, res, next) {
    try {
        const { phoneNumber, otp } = req.body;
        const response = await verifyOtp(phoneNumber, otp);
        res.status(200).json({
            success: true,
            ...response,
        });
    } catch (error) {
        if (error.message === 'INVALID_OTP') {
            res.status(403).json({
                error: 'Invalid code.',
            });
            return;
        }
        if (error.message === 'ORDER_NOT_FOUND') {
            res.status(404).json({
                error: 'Order not found.',
            });
            return;
        }
        next(error);
    }
}

async function updateOrder(req, res, next) {
    try {
        const { order, orderCalculationAttributes } = req.constants;
        const store = await Store.query().findById(order.storeId);
        const currentOrderDetails = await getServiceOrderAndCustomerDetails(order.masterOrderId);
        const payload = {
            ...orderCalculationAttributes,
            serviceOrder: order,
            orderType: 'ServiceOrder',
            store,
            serviceOrderId: order.id,
            orderId: order.masterOrderId,
            masterOrderId: order.masterOrderId,
            currentOrderDetails,
            customer: {
                id: currentOrderDetails.centsCustomerId,
                storeCustomerId: currentOrderDetails.storeCustomerId,
            },
            isLiveLinkRequest: true,
            origin: origins.LIVE_LINK,
        };
        await updateOrderPipeline(payload);
        const orderDetails = await getOrderDetails(order.id);
        res.status(200).json({
            success: true,
            order: orderDetails,
        });
    } catch (error) {
        if (error.message === 'UNABLE_TO_APPLY_PROMOTION_DUE_TO_CREDIT') {
            res.status(409).json({
                error: 'Unable to apply promo. Please remove the credits to apply it.',
            });
            return;
        }
        if (error.message === 'UNABLE_TO_APPLY_PROMOTION') {
            res.status(409).json({
                error: 'Unable to apply promo.',
            });
            return;
        }
        if (error.message === 'UNABLE_TO_APPLY_CREDITS') {
            res.status(409).json({
                error: 'Unable to apply credits.',
            });
            return;
        }
        if (error.message === 'UNABLE_TO_APPLY_PROMOTION_DUE_TO_BALANCE_DUE') {
            res.status(409).json({
                error: 'Unable to apply promotion as promotion discount amount is greater than the balance due.',
            });
            return;
        }
        if (error.message === 'NO_PAYMENT_INTENT_AVAILABLE') {
            res.status(409).json({
                error: 'Unable to update the order as order is already paid.',
            });
            return;
        }
        next(error);
    }
}

async function getCustomerPhoneNumber(req, res, next) {
    try {
        const { order } = req.constants;
        const serviceOrder = await ServiceOrder.query().findById(order.id);
        const businessId = await Store.query().findById(serviceOrder.storeId);
        const phoneNumber = await getPhoneNumber(order);
        res.status(200).json({
            success: true,
            phoneNumber,
            storeId: serviceOrder.storeId,
            businessId: businessId.businessId,
        });
    } catch (error) {
        if (error.message === 'ORDER_NOT_FOUND') {
            res.status(404).json({
                error: 'Order not found.',
            });
            return;
        }
        next(error);
    }
}

/**
 * Process a payment for an order in the live link
 *
 * This API performs the following actions:
 *
 * 1) Based on the incoming request, create a Stripe Customer for the CentsCustomer.
 * 2) Based on the incoming request, store a new PaymentMethod for a CentsCustomer.
 * 3) Create, capture, and confirm a Stripe PaymentIntent;
 * 4) Create a Payment model entry based on the Stripe data;
 * 5) Update the order status, balanceDue, and paymentStatus;
 * 6) Adjust the inventory amount of a product if order includes a product;
 * 7) Send a text message to the customer confirming successful payment
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function processPaymentForOrder(req, res, next) {
    try {
        const output = await processPaymentForOrderPipeline(req.body);
        const orderDetails = await getOrderDetails(output.serviceOrder.id);
        return res.status(200).json({
            success: true,
            output,
            order: orderDetails,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Add a payment method to a customer's profile/wallet.
 *
 * This controller method runs a pipeline that performs the following:
 *
 * 1) Creates a Stripe Customer if the customer does not have a stripeCustomerId;
 * 2) Attaches the payment method to the Stripe Customer profile;
 * 3) Creates a PaymentMethod for the given payment method;
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function addPaymentMethodForCustomer(req, res, next) {
    try {
        const payload = { ...req.body, ...{ requireCustomerPaymentsList: true } };
        const output = await addCustomerPaymentMethodPipeline(payload);
        return res.status(200).json({
            success: true,
            output,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Create a return delivery for an order using a store's own delivery network
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function createOwnNetworkReturnDelivery(req, res, next) {
    try {
        const { order, storeCustomer, serviceOrder, customer, store } = req.constants;
        const output = await createOwnNetworkReturnDeliveryPipeline({
            ...req.body,
            order,
            storeCustomer,
            serviceOrder,
            customer,
            store,
            serviceOrderId: serviceOrder.id,
            returnMethod: 'DELIVERY',
            origin: origins.LIVE_LINK,
        });
        const orderDetails = await getOrderDetails(output.serviceOrder.id);
        return res.status(200).json({
            success: true,
            output,
            order: orderDetails,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Cancel an Uber delivery order
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @returns {Object} output of pipeline
 */
async function cancelReturnDelivery(req, res, next) {
    try {
        const { serviceOrder } = req.constants;
        const { orderDeliveryId, cancellationReason } = req.body;
        const payload = {
            serviceOrder,
            orderDeliveryId,
            cancellationReason,
        };
        const orderDelivery = await OrderDelivery.query().findById(orderDeliveryId);

        LoggerHandler('info', 'Customer cancelled delivery', { ...payload, orderDelivery });

        let output;
        if (orderDelivery.deliveryProvider === 'OWN_DRIVER') {
            const routeDelivery = await RouteDelivery.query()
                .whereNotIn('routeDeliveries.status', [
                    deliveryStatuses.COMPLETED,
                    deliveryStatuses.CANCELED,
                ])
                .withGraphJoined('[route, orderDelivery]')
                .where('routeDeliveries.routableId', orderDelivery.id)
                .where('routeDeliveries.routableType', 'OrderDelivery')
                .first();
            payload.routeDelivery = routeDelivery;
            payload.driverId = routeDelivery ? routeDelivery.route.driverId : null;
            output = await cancelOwnDriverDeliveryPipeline(payload);
        } else if (orderDelivery.deliveryProvider === 'UBER') {
            output = await cancelUberDeliveryPipeline(payload);
        } else {
            output = await cancelDoorDashDeliveryPipeline(payload);
        }
        const orderDetails = await getOrderDetails(serviceOrder.id);
        return res.status(200).json({
            success: true,
            output,
            order: orderDetails,
        });
    } catch (error) {
        return next(error);
    }
}

async function getPickUpAndDeliveryDetails(req, res, next) {
    try {
        const { order } = req.constants;
        const response = await getPickUpAndDeliveryDetailsPipeline({
            orderId: order.masterOrderId,
        });
        return res.status(200).json({
            success: true,
            pickup: response.pickup,
            delivery: response.delivery,
        });
    } catch (error) {
        return next(error);
    }
}

const manageOrder = async (req, res, next) => {
    try {
        const { order } = req.constants;
        const { body, transaction } = req;

        const storeDetails = await findStoreById(order.storeId);

        const orderDelivery = await pickupAndDeliveryDetails({
            orderId: order.masterOrderId,
        });
        const storeSettings = await StoreSettings.query().findOne({
            storeId: order.storeId,
        });

        const orderActivities = await OrderActivityLog.query().where({
            orderId: order.id,
        });

        const orderIntake = orderActivities.find((activity) => {
            if (order.orderType === 'RESIDENTIAL') {
                return (
                    activity.status === 'READY_FOR_PROCESSING' ||
                    activity.status === 'HUB_PROCESSING_ORDER'
                );
            }
            return (
                activity.status === 'READY_FOR_PROCESSING' ||
                activity.status === 'DESIGNATED_FOR_PROCESSING_AT_HUB'
            );
        });

        // isProcessingCompleted READY_FOR_PICKUP
        const processedOrder = find(orderActivities, {
            status: statuses.READY_FOR_PICKUP,
        });

        let orderDetails = await Order.query().findById(order.masterOrderId);

        const storeCustomer = await StoreCustomer.query().findById(order.storeCustomerId);
        const centsCustomer = await CentsCustomer.query().findById(storeCustomer.centsCustomerId);

        // map data for payload
        const payload = {
            serviceOrderId: order.id,
            serviceOrder: order,
            order: orderDetails,
            orderItemsTotal: order.orderTotal,
            orderType: order.orderType,
            promotionAmount: order.promotionAmount,
            paymentToken: body.paymentToken,
            customerNotes: body.customerNotes,
            orderNotes: body.orderNotes,
            returnMethod: body.returnMethod,
            isPickupCancelled: body.isPickupCancelled,
            pickupPayload: {},
            returnPayload: {},
            pickupDetails: orderDelivery.pickup || {},
            deliveryDetails: orderDelivery.delivery || {},
            storeDetails,
            storeSettings,
            orderActivities,
            isIntakeComplete: !!orderIntake,
            isProcessingCompleted: !!processedOrder,
            transaction,
            storeCustomer,
            centsCustomer,
            centsCustomerId: centsCustomer.id,
        };

        if (body.subscription) {
            payload.subscription = body.subscription;
        }

        if (body.servicePriceId && order.orderType === 'ONLINE') {
            payload.orderItems = [];
            payload.servicePriceId = body.servicePriceId;
            payload.status = order.status;
            payload.storeId = order.storeId;
            payload.serviceModifierIds = body.modifierIds;

            if (payload.modifierIds) {
                payload.modifierIds = body.modifierIds;
            }
        }

        if (body.orderDelivery && !isEmpty(body.orderDelivery)) {
            payload.pickupPayload = body.orderDelivery.pickup || {};
            payload.returnPayload = body.orderDelivery.return || {};
        }

        if (payload.pickupPayload && !isEmpty(payload.pickupPayload)) {
            if (payload.pickupPayload.deliveryProvider === deliveryProviders.OWN_DRIVER) {
                // compute delivery fees
                const deliveryFeeInfo = await computeDeliveryFee({
                    storeId: storeDetails.id,
                    currentCustomer: centsCustomer,
                    // no orderId for pickup delivery fee
                });

                payload.pickupPayload = {
                    ...payload.pickupPayload,
                    totalDeliveryCost: deliveryFeeInfo.ownDeliveryStore.deliveryFeeInCents / 100,
                };
            }

            payload.serviceOrder.pickupDeliveryFee = Number(
                payload.pickupPayload.totalDeliveryCost,
            );
            payload.serviceOrder.pickupDeliveryTip = Number(payload.pickupPayload.courierTip);
        }

        if (
            payload.returnPayload &&
            !isEmpty(payload.returnPayload) &&
            payload.returnMethod !== returnMethods.IN_STORE_PICKUP
        ) {
            if (payload.returnPayload.deliveryProvider === deliveryProviders.OWN_DRIVER) {
                // compute delivery fees
                const deliveryFeeInfo = await computeDeliveryFee({
                    storeId: storeDetails.id,
                    currentCustomer: centsCustomer,
                    ...(isEmpty(payload.pickupPayload) && { orderId: order.masterOrderId }),
                });

                payload.returnPayload = {
                    ...payload.returnPayload,
                    totalDeliveryCost: deliveryFeeInfo.ownDeliveryStore.deliveryFeeInCents / 100,
                };
            }

            payload.serviceOrder.returnDeliveryFee = Number(
                payload.returnPayload.totalDeliveryCost,
            );
            payload.serviceOrder.returnDeliveryTip = Number(payload.returnPayload.courierTip);

            // get bags
            const bags = await ServiceOrderBag.query().where({
                serviceOrderId: order.id,
            });

            payload.bagCount = bags.length;
        } else {
            payload.serviceOrder.returnDeliveryFee = 0;
            payload.serviceOrder.returnDeliveryTip = 0;
        }

        await manageOrderPipeline(payload);

        orderDetails = await getOrderDetails(payload.serviceOrderId);
        res.status(200).json({
            success: true,
            order: orderDetails,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = exports = {
    getOrder,
    updateReturnMethod,
    generateOtp,
    getStoreSettings,
    validateOtp,
    updateOrder,
    processPaymentForOrder,
    getCustomerPhoneNumber,
    addPaymentMethodForCustomer,
    createOwnNetworkReturnDelivery,
    updatePaymentIntent,
    cancelReturnDelivery,
    getRouteDeliveryDetails,
    getPickUpAndDeliveryDetails,
    manageOrder,
    authorizeAdminUser,
};
