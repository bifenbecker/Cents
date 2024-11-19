const User = require('../../models/user');
const TeamMember = require('../../models/teamMember');
const isOrderCanBeCanceled = require('../../utils/isOrderCanBeCanceled');
const { statuses } = require('../../constants/constants');
const calculateOrderRefundAmount = require('../../utils/calculateOrderRefundAmount');
const getOrderCodePrefix = require('../../utils/getOrderCodePrefix');
const getIsTaxable = require('../../services/orders/queries/getIsTaxable');
const getDeliveryReminderText = require('../../routes/employeeTab/home/getDeliveryReminderText');
const { getCustomer } = require('./getCustomer');
const { includeZoneNameInOrderDelivery } = require('../../queryHelpers/orderDeliveriesQuery');
const { addModifiersToOrderItem } = require('./addModifiersToOrderItem');
const {
    addServiceModifierIdToModifierLineItems,
} = require('./addServiceModifierIdToModifierLineItemUow');

function getPromotionItemId(promotion, lineItemDetails) {
    const { itemIds, promoDetails } = promotion;

    if (promoDetails.appliesToType !== 'specific-items') {
        return false;
    }

    return itemIds.includes(lineItemDetails.id);
}

async function getEmployee(employeeCode) {
    const employeeDetails = {};
    const teamMember = await TeamMember.query().findById(employeeCode);
    const employee = await User.query().findById(teamMember.userId);
    employeeDetails.employeeCode = teamMember.employeeCode;
    employeeDetails.name = `${employee.firstname} ${employee.lastname}`;
    return employeeDetails;
}

async function mapModifiers(orderItems, modifiers) {
    for (const orderItem of orderItems) {
        if (orderItem.pricingType === 'PER_POUND') {
            orderItem.modifiers = await addModifiersToOrderItem(orderItem, modifiers);
            orderItem.modifierLineItems = await addServiceModifierIdToModifierLineItems(orderItem);
            orderItem.totalAmount = Number(orderItem.totalAmount).toFixed(2);
        }
    }

    return orderItems;
}

/**
 * Get order items from order with necessary information
 *
 * @param {Object} order
 * @returns {Promise} order items
 */
function getModifiedOrderItems(order) {
    const modifiers = [];
    const orderItems = [];

    for (const item of order.orderItems) {
        const temp = {};

        if (item.refItem.length) {
            const { lineItemDetail } = item.refItem[0];

            if (lineItemDetail?.soldItemType !== 'Modifier') {
                temp.orderItemId = item.id;
                temp.id = item.id;
                temp.count = lineItemDetail?.lineItemQuantity;
                temp.itemTotal = lineItemDetail?.lineItemTotalCost;
                temp.serviceCategory =
                    lineItemDetail?.soldItemType === 'InventoryItem'
                        ? null
                        : lineItemDetail?.category;
                temp.category = lineItemDetail?.category;
                temp.isService = !!temp.serviceCategory;
                temp.totalAmount = Number(lineItemDetail?.lineItemTotalCost.toFixed(2));
                temp.price = lineItemDetail?.lineItemUnitCost;
                temp.laundryType = lineItemDetail?.lineItemName;
                temp.lineItemName = lineItemDetail?.lineItemName;
                temp.lineItemType = temp.isService ? 'SERVICE' : 'INVENTORY';
                temp.description = lineItemDetail?.lineItemDescription;
                temp.servicePriceId =
                    lineItemDetail?.soldItemType === 'ServicePrices'
                        ? lineItemDetail.soldItemId
                        : null;
                temp.inventoryItemId =
                    lineItemDetail?.soldItemType === 'InventoryItem'
                        ? lineItemDetail.soldItemId
                        : null;
                temp.serviceId =
                    lineItemDetail?.soldItemType === 'ServicesMaster'
                        ? lineItemDetail.soldItemId
                        : null;
                temp.minimumQuantity = lineItemDetail?.lineItemMinQuantity;
                temp.minimumPrice = lineItemDetail?.lineItemMinPrice;
                temp.hasMinPrice = temp.minimumQuantity !== null && temp.minimumPrice !== null;
                temp.weightLogs = [];

                if (order.weightLogs && order.weightLogs.length) {
                    temp.weightLogs = order.weightLogs;
                }

                temp.modifiers = [];
                temp.serviceCategoryType = lineItemDetail?.serviceCategoryType;
                temp.pricingType = lineItemDetail?.pricingType;
                temp.soldItemType = lineItemDetail?.soldItemType;
                temp.modifierLineItems = lineItemDetail?.modifierLineItems || [];
            } else {
                modifiers.push({
                    id: item.id,
                    lineItemId: lineItemDetail?.id,
                    name: lineItemDetail?.lineItemName,
                    price: lineItemDetail?.lineItemUnitCost,
                    description: lineItemDetail?.lineItemDescription,
                    serviceModifierId: item.refItem[0].serviceModifierId,
                    itemTotal: lineItemDetail?.lineItemTotalCost,
                    pricingType: lineItemDetail?.pricingType,
                });
            }
        }

        if (temp.orderItemId) {
            orderItems.push(temp);
        }
    }

    return mapModifiers(orderItems, modifiers);
}

async function mapResponse(order, currentStore, version, cents20LdFlag) {
    const promotion = order.orderMaster?.promotionDetails;
    const applicableItems = [];
    const response = {};

    response.id = order.id;
    response.storeId = order.storeId;
    response.orderId = order.orderMaster ? order.orderMaster.id : null;
    response.orderableType = order.orderMaster ? order.orderMaster.orderableType : null;
    response.orderableId = order.orderMaster ? order.orderMaster.orderableId : null;
    response.isBagTrackingEnabled = order.isBagTrackingEnabled;
    response.isAdjusted = order.isAdjusted;
    response.balanceDue = order.balanceDue;
    response.taxAmount = Number(order.taxAmountInCents / 100) || 0;
    response.returnMethod = order.returnMethod;
    response.status = order.status;
    response.service = 'washDryBag';
    response.placedAt = order.placedAt;
    response.tipAmount = order.tipAmount;
    response.orderCodeWithPrefix = getOrderCodePrefix(order);
    response.orderType = order.orderType;
    response.creditAmount = order.creditAmount;
    response.creditApplied = order.creditAmount;
    response.completedAt = order.completedAt;
    response.totalAmount = order.orderTotal;
    response.rack = order.rack ? order.rack : '';
    response.paymentStatus = order.paymentStatus;
    response.paymentTiming = order.paymentTiming;
    response.notes = order.notes ? order.notes : '';
    response.isProcessedAtHub = order.isProcessedAtHub;
    response.promotionId = order.promotionId;
    response.promotionAmount = order.promotionAmount;
    response.netOrderTotal = order.netOrderTotal;
    response.convenienceFee = order.convenienceFee;
    response.convenienceFeeId = order.convenienceFeeId;
    response.pickupDeliveryFee = order.pickupDeliveryFee;
    response.pickupDeliveryTip = order.pickupDeliveryTip;
    response.returnDeliveryFee = order.returnDeliveryFee;
    response.returnDeliveryTip = order.returnDeliveryTip;
    response.uuid = order.uuid;
    response.totalPaid = order.getTotalPaid();
    // for void order
    response.canCancel = isOrderCanBeCanceled(order, false);
    response.refundAmount = calculateOrderRefundAmount(order, response.canCancel);

    if (order.status === statuses.CANCELLED) {
        response.refundableAmount = order.refundableAmount;
    }

    response.customer = await getCustomer(order.storeCustomer);
    response.hub = order.hub ? order.hub : {};
    response.store = order.store ? order.store : {};
    response.notificationLogs = order.notificationLogs;
    response.promotion = order.orderMaster?.promotionDetails
        ? order.orderMaster.promotionDetails
        : {};
    response.employee =
        currentStore.settings.requiresEmployeeCode && order.employeeCode
            ? await getEmployee(order.employeeCode)
            : {};
    response.serviceOrderBags = order.serviceOrderBags ? order.serviceOrderBags : {};
    response.activityLog = order.activityLog ? order.activityLog : {};
    response.tipAmount = order.tipAmount;
    response.delivery = order.orderMaster?.delivery ? order.orderMaster.delivery : {};
    response.pickup = order.orderMaster?.pickup ? order.orderMaster.pickup : {};
    response.deliveries = [];

    if (response.pickup.id) {
        await includeZoneNameInOrderDelivery(response.pickup);
        response.deliveries.push(response.pickup);
    }

    if (response.delivery.id) {
        await includeZoneNameInOrderDelivery(response.delivery);
        response.deliveries.push(response.delivery);
    }

    // TODO: add modifier details.
    response.weightLogs = order.weightLogs;

    for (const item of order.orderItems) {
        if (item.refItem.length) {
            const { lineItemDetail } = item.refItem[0];

            // finding if promo was applied to this item or not.
            if (promotion) {
                const isMatch = getPromotionItemId(promotion, lineItemDetail);

                if (isMatch) {
                    applicableItems.push(item.id);
                }
            }
        }
    }

    response.payments = order.orderMaster ? order.orderMaster.payments : {};
    response.orderItems = await getModifiedOrderItems(order);
    response.orderCode = order.orderCode;

    if (applicableItems.length) {
        response.promotion.itemIds = applicableItems;
    }

    if (order.convenienceFeeDetails) {
        response.convenienceFeePercentage = order.convenienceFeeDetails.fee;
    }

    response.isTaxable = getIsTaxable(order.orderItems);
    response.deliveryReminderText = order.orderMaster?.delivery
        ? getDeliveryReminderText(order)
        : '';
    response.tier = order.tier || {};
    response.subscription = order.subscription || {};
    response.recurringDiscountInCents = order.recurringDiscountInCents;

    response.bagCount = order.serviceOrderBags.length > 0 ? order.serviceOrderBags.length : 0;

    if (version >= '2.0.0' && cents20LdFlag) {
        response.serviceOrderBags = order.serviceOrderBags ? order.serviceOrderBags : [];
        response.hangerBundles = order.hangerBundles ? order.hangerBundles : [];

        response.hangerBundlesCount =
            order.hangerBundles.length > 0 ? order.hangerBundles.length : 0;
        response.storageRacks = order.storageRacks ? order.storageRacks : {};
        response.turnAroundInHours = {
            value: order.turnAroundInHours,
            setManually: order.turnAroundInHoursSetManually,
        };
    }

    response.fullName = response.customer.fullName;
    response.lineItemQuantity = order.orderItems.length > 0 ? order.orderItems.length : 0;
    response.serviceOrderWeights = order.weightLogs;
    response.storeAddress = order.store ? order.store.address : '';
    response.storeName = order.store ? order.store.name : '';

    response.hubAddress = order.hub ? order.hub.address : '';
    response.hubId = order.hub ? order.hub.id : null;
    response.hubName = order.hub ? order.hub.name : '';

    response.deliveryId = null;

    // Data below is for order builder adjustOrder flow

    const orderPayments = order?.orderMaster?.payments;
    response.changeDue =
        order.paymentTiming === 'PRE-PAY' && orderPayments?.length
            ? orderPayments[orderPayments.length - 1]?.changeDue || 0
            : 0;

    // duplicate data as above, however it is necessary for the new adjustOrder flow
    response.orderCalculationResponse = {
        netOrderTotal: order.netOrderTotal || 0.0,
        orderTotal: order.totalAmount || 0.0,
        taxAmount: response.taxAmount || 0.0,
        promotionAmount: order.promotionAmount || 0.0,
        creditAmount: order.creditAmount || 0.0,
        tipAmount: order.tipAmount || 0.0,
        pickupDeliveryFee: order.pickupDeliveryFee || 0.0,
        pickupDeliveryTip: order.pickupDeliveryTip || 0.0,
        returnDeliveryFee: order.returnDeliveryFee || 0.0,
        returnDeliveryTip: order.returnDeliveryTip || 0.0,
        convenienceFee: order.convenienceFee || 0.0,
        balanceDue: order.balanceDue || 0.0,
    };
    response.hasDryCleaning = order.hasDryCleaning || false;

    return response;
}

module.exports = exports = {
    mapResponse,
    getModifiedOrderItems,
};
