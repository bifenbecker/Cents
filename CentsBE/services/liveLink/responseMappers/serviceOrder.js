const get = require('lodash/get');
const { statuses } = require('../../../constants/constants');
const stripe = require('../../../stripe/stripeWithSecret');
const calculateOrderRefundAmount = require('../../../utils/calculateOrderRefundAmount');
const isOrderCanBeCanceled = require('../../../utils/isOrderCanBeCanceled');
const CustomerService = require('../../residential/Customer');
const getOrderCodePrefix = require('../../../utils/getOrderCodePrefix');
const getIsTaxable = require('../../orders/queries/getIsTaxable');
const RRuleService = require('../../rruleService');
const { formatDeliveryWindow } = require('../../../helpers/dateFormatHelper');
const {
    addServiceModifierIdToModifierLineItems,
} = require('../../../uow/singleOrder/addServiceModifierIdToModifierLineItemUow');

// Models
const PartnerSubsidiaryStore = require('../../../models/partnerSubsidiaryStore');

function getPromotionItemId(promotion, lineItemDetails) {
    const { itemIds, promoDetails } = promotion;
    if (promoDetails.appliesToType !== 'specific-items') {
        return null;
    }
    const { id } = lineItemDetails;
    if (itemIds.includes(id)) {
        return true;
    }
    return null;
}

async function getStripeCardDetails(paymentMethod) {
    const response = {};

    if (paymentMethod.provider === 'stripe') {
        const stripeMethod = await stripe.paymentMethods.retrieve(paymentMethod.paymentMethodToken);

        response.last4 = stripeMethod.card.last4;
        response.brand = stripeMethod.card.brand;
    } else {
        response.last4 = null;
        response.brand = null;
    }

    response.centsCustomerId = paymentMethod.centsCustomerId;
    response.provider = paymentMethod.provider;
    response.type = paymentMethod.type;
    response.paymentMethodToken = paymentMethod.paymentMethodToken;
    response.id = paymentMethod.id;

    return response;
}

/**
 * If the order has a pending payment, retrieve payment details
 *
 * @param {Object} incomingPayment
 */
async function getCurrentPayment(incomingPayment) {
    let paymentMethod = null;
    const payment =
        incomingPayment.find((payment) => payment.status === 'requires_confirmation') ||
        incomingPayment[0];

    const stripePaymentIntent = await stripe.paymentIntents.retrieve(payment.paymentToken);

    if (stripePaymentIntent.payment_method) {
        paymentMethod = await stripe.paymentMethods.retrieve(stripePaymentIntent.payment_method);
    }

    const paymentIntent = {
        id: payment.id,
        paymentMethod: {
            paymentMethodToken: paymentMethod?.id || null,
            brand: paymentMethod?.card?.brand || null,
            last4: paymentMethod?.card?.last4 || null,
            provider: 'stripe',
        },
        status: stripePaymentIntent.status,
        paymentToken: payment.paymentToken,
        totalAmount: payment.totalAmount,
    };

    return paymentIntent;
}

function mapPaymentMethods(paymentMethods) {
    const formattedPaymentMethods = paymentMethods.map((paymentMethod) =>
        getStripeCardDetails(paymentMethod),
    );

    return Promise.all(formattedPaymentMethods);
}

async function getCustomer(customer) {
    const customerService = new CustomerService(customer);
    const { stripeCustomerId, id, addresses } = customer.centsCustomer;
    const availableCredit = Number((customer.creditAmount || 0).toFixed(2));
    return {
        ...customerService.details,
        availableCredit,
        centsCustomerId: id,
        stripeCustomerId,
        addresses,
    };
}

async function mapModifiers(orderItems, modifiers) {
    const resp = [];
    for (const orderItem of orderItems) {
        if (orderItem?.pricingType === 'PER_POUND' || orderItem?.category === 'PER_POUND') {
            orderItem.modifiers = modifiers;
            orderItem.modifierLineItems = await addServiceModifierIdToModifierLineItems(orderItem);
        }
        resp.push(orderItem);
    }
    return resp;
}

/**
 * Retrieve the PartnerSubsidiary model for a given store
 *
 * @param {Number} storeId
 */
async function getPartnerSubsidiary(storeId) {
    const subsidiary = await PartnerSubsidiaryStore.query()
        .withGraphFetched('partnerSubsidiary.[paymentMethods]')
        .findOne({
            storeId,
        });

    return subsidiary ? subsidiary.partnerSubsidiary : null;
}

/**
 * Based on order information, retrieve available payment methods
 *
 * @param {Object} order
 */
async function retrievePaymentMethods(order) {
    let paymentMethods = [];
    const residentialOrder = order.orderType === 'RESIDENTIAL';
    const subsidiary = await getPartnerSubsidiary(order.store.id);

    if (residentialOrder && subsidiary) {
        paymentMethods = await mapPaymentMethods(subsidiary.paymentMethods);
    } else {
        paymentMethods = await mapPaymentMethods(order.storeCustomer.centsCustomer.paymentMethods);
    }

    return paymentMethods;
}

async function mapServiceOrder(order) {
    const response = {};
    const { weightLogs } = order;
    const customer = await getCustomer(order.storeCustomer);
    response.orderId = order.id;
    response.masterOrderId = order.parentOrder.id;
    response.weightLogs = weightLogs;
    response.status = order.status;
    response.returnMethod = order.returnMethod;
    response.balanceDue = order.balanceDue;
    response.netOrderTotal = order.netOrderTotal;
    response.orderTotal = order.orderTotal;
    response.tipAmount = order.tipAmount || 0;
    if (order.tipOption && order.tipOption[0] === '$') {
        let tipOption = order.tipOption.substring(1);
        tipOption = Number(tipOption).toFixed(2);
        tipOption = `$${tipOption}`;
        response.tipOption = tipOption;
    } else if (order.tipOption && order.tipOption[order.tipOption.length - 1] === '%') {
        let tipOption = order.tipOption.substring(0, order.tipOption.length - 1);
        tipOption = Number(tipOption).toFixed(2);
        tipOption = `${tipOption}%`;
        response.tipOption = tipOption;
    } else {
        response.tipOption = '';
    }
    response.taxAmount = Number(order.taxAmountInCents / 100);
    response.creditAmount = order.creditAmount;
    response.paymentStatus = order.paymentStatus;
    response.paymentTiming = order.paymentTiming;
    response.promotion = order.parentOrder.promotionDetails || {};
    response.store = order.orderType === 'RESIDENTIAL' ? order.hub : order.store;
    response.store.timeZone = order.store.settings.timeZone;
    response.promotionId = order.promotionId;
    response.promotionAmount = order.promotionAmount;
    response.orderType = order.orderType;
    response.convenienceFee = order.convenienceFee;
    response.convenienceFeeId = order.convenienceFeeId;
    response.pickupDeliveryFee = order.pickupDeliveryFee;
    response.pickupDeliveryTip = order.pickupDeliveryTip;
    response.returnDeliveryFee = order.returnDeliveryFee;
    response.returnDeliveryTip = order.returnDeliveryTip;
    response.totalPaid = order.getTotalPaid();

    // for void order
    response.canCancel = isOrderCanBeCanceled(order, true);
    response.refundAmount = calculateOrderRefundAmount(order, response.canCancel);
    if (order.status === statuses.CANCELLED) {
        response.refundableAmount = order.refundableAmount;
    }
    response.customer = customer;
    response.paymentMethods = await retrievePaymentMethods(order);
    response.delivery = order.parentOrder.delivery ? order.parentOrder.delivery : {};
    response.pickup = order.parentOrder.pickup ? order.parentOrder.pickup : {};
    response.latestPayment = order.parentOrder.payment.length
        ? await getCurrentPayment(order.parentOrder.payment)
        : {};
    response.subsidiary = await getPartnerSubsidiary(order.store.id);
    const applicableItems = [];
    const orderItems = [];
    const modifiers = [];
    for (const item of order.orderItems) {
        const temp = {};
        if (item.refItem.length) {
            const { li } = item.refItem[0];
            if (li.soldItemType !== 'Modifier') {
                temp.orderItemId = item.id;
                temp.count = li.lineItemQuantity || null;
                temp.itemTotal = li.lineItemTotalCost >= 0 ? li.lineItemTotalCost : null;
                temp.serviceCategory = li.soldItemType === 'InventoryItem' ? null : li.category;
                temp.price = li.lineItemUnitCost;
                temp.laundryType = li.lineItemName;
                temp.servicePriceId = li.soldItemType === 'ServicePrices' ? li.soldItemId : null;
                temp.inventoryItemId = li.soldItemType === 'InventoryItem' ? li.soldItemId : null;
                temp.serviceId = li.soldItemType === 'ServicesMaster' ? li.soldItemId : null;
                temp.minimumQuantity = li.lineItemMinQuantity;
                temp.minimumPrice = li.lineItemMinPrice;
                temp.category = li.category;
                temp.pricingType = li?.pricingType;
                temp.hasMinPrice = temp.minimumQuantity !== null && temp.minimumPrice !== null;
                if (li.category === 'PER_POUND' || li?.pricingType === 'PER_POUND') {
                    temp.weightLogs = weightLogs;
                }
                temp.modifierLineItems = li?.ml || [];
                orderItems.push(temp);
            } else {
                modifiers.push({
                    id: item.id,
                    name: li.lineItemName,
                    price: li.lineItemUnitCost,
                    description: li.lineItemDescription,
                    serviceModifierId: item.refItem[0].serviceModifierId,
                    itemTotal: li.lineItemTotalCost,
                });
            }
            if (response.promotion.id) {
                const isMatch = getPromotionItemId(response.promotion, li);
                if (isMatch) {
                    applicableItems.push(item.id);
                }
            }
        }
    }
    response.orderItems = await mapModifiers(orderItems, modifiers);
    response.orderCode = order.orderCode;
    response.orderCodeWithPrefix = getOrderCodePrefix(order);
    if (applicableItems.length) {
        response.promotion.itemIds = applicableItems;
    }
    response.isTaxable = getIsTaxable(order.orderItems);
    response.subscription = order.subscription || {};
    if (get(response.subscription, 'recurringSubscription')) {
        const { recurringSubscription } = response.subscription;
        const timeZone = get(order, 'store.settings.timeZone', 'America/Los_Angeles');
        const rruleService = new RRuleService(recurringSubscription, timeZone);
        // skipCanceled = true will give us the even next window if next is cancelled
        const nextAvailablePickupWindow = await rruleService.nextAvailablePickupWindow(true);

        response.subscription.recurringSubscription = {
            ...recurringSubscription,
            interval: rruleService.getInterval,
            nextPickupDatetime: formatDeliveryWindow(nextAvailablePickupWindow, timeZone, {
                dateFormat: 'MM/DD',
            }),
            nextAvailablePickup: formatDeliveryWindow(nextAvailablePickupWindow, timeZone, {
                dateFormat: 'dddd, MMMM Do',
            }),
            isNextPickupCancelled: rruleService.isNextPickupCancelled(),
        };
    }
    response.recurringDiscountInCents = order.recurringDiscountInCents;
    return response;
}

module.exports = {
    mapServiceOrder,
    getCurrentPayment,
};
