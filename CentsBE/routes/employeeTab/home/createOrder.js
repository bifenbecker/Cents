const ServiceOrder = require('../../../models/serviceOrders');
const BusinessSettings = require('../../../models/businessSettings');

const OrderPromotionFactory = require('../../../services/orders/factories/orderPromotionCalculatorFactory');
const mapServiceReferenceItemDetail = require('../washAndFold/mapServiceReferenceItemDetail');

const getPromotionDetails = require('../../../services/orders/queries/getPromotionDetails');
const getLineItems = require('../../../services/orders/queries/currentActiveServiceItems');

const applyToFixed = require('../../../utils/applyToFixed');

const createServiceOrderPipeline = require('../../../pipeline/employeeApp/serviceOrder/createServiceOrderPipeline');
const { origins, paymentStatuses } = require('../../../constants/constants');
const eventEmitter = require('../../../config/eventEmitter');

async function insertPromotionDetails(serviceOrder, promotionDetails, trx) {
    await ServiceOrder.query(trx).upsertGraph({
        id: serviceOrder.id,
        promotionAmount: applyToFixed(promotionDetails.promoDetails.orderPromotionAmount || 0),
        order: {
            id: serviceOrder.masterId,
            promotionDetails,
        },
    });
}

async function addPromotionDetails(order, trx) {
    const { id, promotionId } = order;
    const promotion = await getPromotionDetails(promotionId, trx);
    const lineItems = await getLineItems(id, true, trx);
    const promotionCalculator = new OrderPromotionFactory(
        lineItems,
        promotion,
        lineItems[0].orderTotal,
        { orderType: 'ServiceOrder' },
    ).calculator();
    const promotionDetails = promotionCalculator.calculate();
    await insertPromotionDetails(order, promotionDetails, trx);
}

function calculatePerPoundPrice(price, totalWeight, flatRateWeight, flatPrice) {
    if (price === 0 && flatRateWeight === null && flatPrice === null) {
        return 0;
    }
    const remainingWeight = totalWeight - flatRateWeight;

    let variablePrice = 0;

    if (remainingWeight > 0) {
        variablePrice = price * remainingWeight;
    }

    return applyToFixed(flatPrice + variablePrice);
}

function returnWeightLog(orderItems, employee, status, totalWeight) {
    let chargeableWeight = 0;
    const perPoundService = orderItems.find((item) => item.category === 'PER_POUND');
    if (perPoundService) {
        chargeableWeight = perPoundService.weight;
    }
    return {
        step: 1,
        chargeableWeight,
        totalWeight,
        status,
        teamMemberId: employee ? employee.id : null,
    };
}

async function mapOrderItems(req, orderItems, employee, status) {
    const resp = [];
    await Promise.all(
        orderItems.map(async (orderItem) => {
            const item = {};
            const { weight, price, minimumPrice, minimumQuantity } = orderItem;
            item.price =
                orderItem.category === 'PER_POUND'
                    ? calculatePerPoundPrice(price, weight, minimumQuantity, minimumPrice)
                    : applyToFixed(Number(orderItem.price) * Number(orderItem.count));
            item.status = status;
            const referenceItem = {};
            if (orderItem.lineItemType === 'SERVICE') {
                referenceItem.servicePriceId = orderItem.priceId;
            } else {
                referenceItem.inventoryItemId = orderItem.priceId;
            }
            referenceItem.quantity = orderItem.count;
            referenceItem.unitCost = orderItem.price;
            referenceItem.totalPrice = item.price;

            const serviceReferenceItemDetail = await mapServiceReferenceItemDetail(
                referenceItem,
                req.body.customer,
            );
            referenceItem.lineItemDetail = [serviceReferenceItemDetail];
            item.referenceItems = [referenceItem];
            resp.push(item);
        }),
    );
    return resp;
}

function mapModifiers(orderModifiers, status, customer) {
    const resp = [];
    const { weight, modifiers } = orderModifiers;
    for (const i of modifiers) {
        const temp = {};
        temp.price = Number(weight) * Number(i.price);
        temp.status = status;
        temp.referenceItems = [
            {
                serviceModifierId: i.serviceModifierId,
                quantity: Number(weight),
                unitCost: i.price,
                totalPrice: Number(weight) * Number(i.price),
                lineItemDetail: [
                    {
                        soldItemType: 'Modifier',
                        lineItemName: i.name,
                        lineItemUnitCost: i.price,
                        lineItemDescription: i.description,
                        soldItemId: i.serviceModifierId,
                        lineItemQuantity: Number(weight),
                        lineItemTotalCost: Number((Number(weight) * Number(i.price)).toFixed(2)),
                        customerName: customer.fullName,
                        customerPhoneNumber: customer.phoneNumber,
                    },
                ],
            },
        ];
        resp.push(temp);
    }
    return resp;
}

const mapDataForSelectedOrder = (result) => {
    const objectData = JSON.parse(JSON.stringify(result));
    objectData.bagCount = result.serviceOrderBags.length > 0 ? result.serviceOrderBags.length : 0;
    objectData.customer.centsCustomerId = result.customer.centsCustomerId;
    objectData.deliveryId = null;
    objectData.fullName = result.customer.fullName;
    objectData.hubAddress = '';
    objectData.hubId = null;
    objectData.hubName = '';
    objectData.lineItemQuantity = result.orderItems.length > 0 ? result.orderItems.length : 0;
    objectData.serviceOrderWeights = result.weightLogs;
    objectData.storeAddress = result.store.address;
    objectData.storeName = result.store.name;
    return objectData;
};

/** Potential issue to note:
 In CENTS version 2.0.0 and greater, the below mapDataForSelectedOrder function
 assumes that the result passed in, created from the output of the createOrder
 pipeline, has valid customer and store objects. The pipeline does leverage these
 objects in many UoWs, should these be empty, the pipeline output should return in error.
 If for some reason either customer or store objects are empty and the output of the pipeline
 resolves in a valid non error result, the result object will be incorrect at which point,
 safety checks should be implemented. This result from the mapDataForSelectedOrder function
 is consumed by the employeeApp to generate payment tokens in the pre-pay workflow, which
 cannot contain empty or null values for customer or store objects.
 */
async function createOrder(req, res, next) {
    const version = req.apiVersion;
    const businessSettings = await BusinessSettings.query().findOne({
        businessId: req.currentStore.businessId,
    });
    const dryCleaningEnabled = !!businessSettings?.dryCleaningEnabled;
    try {
        const isStoreIntakeOnly = req.currentStore.isLocationIntakeOnly();
        const status = isStoreIntakeOnly
            ? 'DESIGNATED_FOR_PROCESSING_AT_HUB'
            : 'READY_FOR_PROCESSING';
        const hubId = isStoreIntakeOnly ? req.currentStore.hubId : null;
        const payload = {
            store: req.currentStore,
            ...req.body,
            hubId,
            isProcessedAtHub: req.currentStore.isIntakeOnly,
            storeCustomerId: req.body.customer.storeCustomerId,
            customerNotes: req.body.customer.customerNotes,
            status,
            paymentStatus: req.body.paymentStatus || paymentStatuses.BALANCE_DUE,
            ...req.constants,
            origin: origins.EMPLOYEE_APP,
        };

        payload.version = version;
        payload.cents20LdFlag = dryCleaningEnabled;
        let result = await createServiceOrderPipeline(payload);
        eventEmitter.emit('indexCustomer', result.customer.id);

        if (version >= '2.0.0' && dryCleaningEnabled) {
            result = mapDataForSelectedOrder(result);

            res.status(200).json({
                ...result,
            });
        } else {
            res.status(200).json({
                ...result,
            });
        }
    } catch (error) {
        if (error.duplicateServiceOrder) {
            const message = 'Duplicate order recently placed for customer';
            res.status(200).json({
                success: true,
                message,
                duplicateOrder: error.duplicateServiceOrder,
            });
        }

        next(error);
    }
}

module.exports = exports = {
    createOrder,
    addPromotionDetails,
    mapOrderItems,
    returnWeightLog,
    mapModifiers,
};
