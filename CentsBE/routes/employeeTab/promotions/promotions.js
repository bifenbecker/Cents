const { filter, reduce } = require('lodash');
const Store = require('../../../models/store');
const InventoryItem = require('../../../models/inventoryItem');
const ServicePrices = require('../../../models/servicePrices');
const StoreCustomer = require('../../../models/storeCustomer');
const BusinessPromotionProgram = require('../../../models/businessPromotionProgram');

/**
 * Check if customer has used promotion before.
 *
 * @param {BusinessPromotionProgram} promotionProgram
 * @param {Number} customerId
 */
async function validateCustomerRedemption(promotionProgram, customerId) {
    const { id, customerRedemptionLimit } = promotionProgram;

    // customerRedemptionLimit is 0 if there are no limits
    if (customerRedemptionLimit === 0) return true;

    const { rows } = await StoreCustomer.query().knex().raw(`
        SELECT SUM(orders.promoOrders)::INT as redeemedCount from(
            SELECT COALESCE(COUNT(so.id),0)::INT as promoOrders FROM "serviceOrders" so
            INNER JOIN "storeCustomers" sc on sc.id=so."storeCustomerId"
            WHERE so."promotionId"=${id} AND sc."centsCustomerId"=${customerId}
                UNION ALL
            SELECT COALESCE(COUNT(io.id),0)::INT as promoOrders FROM "inventoryOrders" io
            INNER JOIN "storeCustomers" sc on sc."id"=io."storeCustomerId"
            WHERE io."promotionId"=${id} AND sc."centsCustomerId"=${customerId}
        ) orders
    `);

    // return true only if the redeemed count is less than the defined limit
    return rows[0].redeemedcount < customerRedemptionLimit;
}

/**
 * Validate that the current date is not after the endDate
 *
 * @param {BusinessPromotionProgram} promotionProgram
 */

async function validateEndDate(promotionProgram) {
    const { endDate } = promotionProgram;
    const currentDate = Date.now();

    if (endDate && currentDate > endDate) return false;

    return true;
}

/**
 * Validate that the current date is not before the startDate
 *
 * @param {BusinessPromotionProgram} promotionProgram
 */

async function validateStartDate(promotionProgram) {
    const { startDate } = promotionProgram;
    const currentDate = Date.now();

    if (startDate > currentDate) return false;

    return true;
}

/**
 * Based on the locationEligibilityType, check if the promotion is valid at the current store.
 *
 * @param {String} locationEligibilityType
 * @param {Array} stores
 * @param {Object} currentStore
 */
function validateLocation(locationEligibilityType, stores, currentStore) {
    if (locationEligibilityType === 'any-location') return true;

    const storeIds = stores.map((store) => store.storeId);

    const includesCurrentStore = storeIds.includes(currentStore.id);

    return includesCurrentStore;
}

/**
 * Compare the current day of the week with the activeDays array
 *
 * @param {Array} activeDays
 */
async function validateActiveDays(activeDays) {
    const daysOfWeek = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
    ];
    const days = activeDays.map((activeDay) => activeDay.day);

    const date = new Date();
    const currentDay = daysOfWeek[date.getDay()];

    const includesCurrentDay = days.includes(currentDay);

    return includesCurrentDay;
}

/**
 * Given a single orderItem, find the appropriate master service or product
 *
 * @param {Object} item
 */
async function getIndividualMasterObject(item) {
    const masterObject = {};

    if (item.lineItemType === 'INVENTORY') {
        const inventoryItem = await InventoryItem.query()
            .withGraphFetched('[inventory]')
            .findById(item.priceId);
        masterObject.promotionItemId = inventoryItem.inventory.id;
        masterObject.promotionItemType = 'Inventory';
        return masterObject;
    }

    const servicePrice = await ServicePrices.query()
        .withGraphFetched('[service]')
        .findById(item.priceId);

    masterObject.promotionItemId = servicePrice.service.id;
    masterObject.promotionItemType = 'ServicesMaster';

    return masterObject;
}

/**
 * Return an array of master ids based on the order items
 *
 * @param {Array} orderItems
 */
async function extractMasterIds(orderItems) {
    const masterIdArray = [];

    for (const item of orderItems) {
        if (item.lineItemType !== 'MODIFIER') {
            masterIdArray.push(getIndividualMasterObject(item));
        }
    }

    return Promise.all(masterIdArray);
}

/**
 * Compare individual object to list
 *
 * @param {Object} obj
 * @param {Array} list
 */
async function containsObject(obj, list) {
    let found = false;

    list.forEach((item) => {
        if (
            item.promotionItemType === obj.promotionItemType &&
            item.promotionItemId === obj.promotionItemId
        ) {
            found = true;
        }
    });

    return found;
}

/**
 * Process comparison functionality
 *
 * @param {Array} orderItems
 * @param {Array} promotionItems
 */
async function compareIds(masterOrderItems, promotionItems) {
    const comparisonArray = [];

    for (const item of masterOrderItems) {
        comparisonArray.push(containsObject(item, promotionItems));
    }

    return Promise.all(comparisonArray);
}

/**
 * If the promotion applies to certain products or services,
 * verify those products and services are included in the order.
 *
 * If a promption applies to certain services or products and the
 * orderItems is empty, the validation will fail.
 *
 * @param {Array} orderItems
 * @param {BusinessPromotionProgram} promotionProgram
 * @param {Array} promotionItems
 */
async function validateProductsAndServices(orderItems, promotionProgram, promotionItems) {
    const { appliesToType } = promotionProgram;

    if (appliesToType === 'entire-order') return true;

    if (appliesToType === 'specific-items' && (!orderItems || orderItems.length === 0))
        return false;

    const masterOrderItems = await extractMasterIds(orderItems);
    const comparedArray = await compareIds(masterOrderItems, promotionItems);
    const includesTrue = comparedArray.includes(true);

    return includesTrue;
}

// JIRA ISSUE: CENTS-1448: https://cents.atlassian.net/browse/CENTS-1448
// /**
//  * Return false if the discountValue is greater than the totalAmount
//  * based on the promotionType
//  *
//  * @param {Number} totalAmount
//  * @param {Object} promotionProgram
//  */
// async function validateTotalAmount(totalAmount, promotionProgram) {
//     const { discountValue } = promotionProgram;
//     const { promotionType } = promotionProgram;

//     const discountAmount = promotionType === 'fixed-price-discount'
//         ? discountValue
//         : (totalAmount * (discountValue / 100));

//     if (discountAmount > totalAmount) return false;

//     return true;
// }

/**
 * Based on the values in a comparedArray, push the orderItem
 * of the same index to a new array
 *
 * @param {Array} comparedArray
 * @param {Array} orderItems
 */
async function assignFilteredOrderItems(comparedArray, orderItems) {
    const filteredOrderItems = [];

    for (let i = 0; i < comparedArray.length; i++) {
        if (comparedArray[i]) {
            filteredOrderItems.push(orderItems[i]);
        }
    }

    return filteredOrderItems;
}

/**
 * Calculate the correct quantity of order items in an order
 *
 * @param {Array} orderItems
 * @param {Array} promotionItems
/ */
async function calculateOrderItemsQuantity(orderItems, promotionItems) {
    let filteredOrderItems = [];
    let totalQuantity = 0;

    if (promotionItems && promotionItems.length > 0) {
        const masterOrderItems = await extractMasterIds(orderItems);
        const comparedArray = await compareIds(masterOrderItems, promotionItems);
        filteredOrderItems = await assignFilteredOrderItems(comparedArray, orderItems);
    } else {
        return false;
    }

    for (let i = 0; i < filteredOrderItems.length; i++) {
        totalQuantity += filteredOrderItems[i].count;
    }

    return totalQuantity;
}

/**
 * For a given orderItem, determine the proper promotionId and perform matches to promotionItems
 *
 * @param {Object} orderItem
 * @param {Array} promotionItems
 */
async function performApplicableItemMatch(orderItem, promotionItems) {
    const type = orderItem.lineItemType;
    let promotionItemId = null;

    if (type === 'SERVICE') {
        const serviceItem = await ServicePrices.query()
            .withGraphFetched('[service]')
            .findById(orderItem.priceId);
        promotionItemId = serviceItem.service.id;
    } else {
        const inventoryItem = await InventoryItem.query()
            .withGraphFetched('[inventory]')
            .findById(orderItem.priceId);
        promotionItemId = inventoryItem.inventory.id;
    }

    const isMatch = promotionItems.find(
        (item) =>
            item.promotionItemId === promotionItemId &&
            item.promotionItemType ===
                `${orderItem.lineItemType === 'SERVICE' ? 'ServicesMaster' : 'Inventory'}`,
    );

    if (isMatch) {
        return orderItem;
    }

    return [];
}

/**
 * Returns the list of order items on which promotion can be applied.
 * @param {*} promotionItems
 * @param {*} orderItems
 */
async function applicableItemsList(promotionItems, orderItems) {
    const items = [];
    if (promotionItems && promotionItems.length) {
        for (const i of orderItems) {
            items.push(performApplicableItemMatch(i, promotionItems));
        }
    }
    return Promise.all(items);
}

/**
 * Function to properly return boolean value for minQuantity validation
 *
 * @param {String} requirementValue
 * @param {Array} orderItems
 * @param {Array} promotionItems
 * @param {String} type
 */
async function determineMinQuantityValidation(requirementValue, orderItems, promotionItems, type) {
    let totalQuantity = 0;

    if (type === 'entire-order' && orderItems) {
        totalQuantity = reduce(orderItems, (pre, curr) => ({
            count: pre.count + curr.count,
        })).count;
    } else {
        totalQuantity = await calculateOrderItemsQuantity(orderItems, promotionItems);
    }

    if (!totalQuantity) return false;

    if (totalQuantity < requirementValue) return false;

    return true;
}

/**
 * Function to properly return boolean value for minTotal validation
 *
 * @param {String} requirementValue
 * @param {Array} orderItems
 * @param {Array} promotionItems
 * @param {String} type
 */
async function determineMinTotalValidation(requirementValue, orderItems, promotionItems, type) {
    let orderTotal = 0;

    if (type !== 'entire-order') {
        const items = await applicableItemsList(promotionItems, orderItems);
        orderItems = filter(items, (item) => !(item instanceof Array));
    }

    orderItems.forEach((order) => {
        orderTotal += order.price * order.count;
    });

    if (orderTotal < requirementValue) return false;

    return true;
}

/**
 * Perform validations over requirementValue based on the requirementType
 *
 * @param {BusinessPromotionProgram} promotionProgram
 * @param {Array} orderItems
 */

async function validateMinRequirements(promotionProgram, orderItems) {
    const { requirementType } = promotionProgram;
    const { requirementValue } = promotionProgram;
    const { promotionItems } = promotionProgram;
    const { appliesToType } = promotionProgram;

    switch (requirementType) {
        case 'min-purchase-amount':
            return determineMinTotalValidation(
                requirementValue,
                orderItems,
                promotionItems,
                appliesToType,
            );
        case 'min-quantity':
            return determineMinQuantityValidation(
                requirementValue,
                orderItems,
                promotionItems,
                appliesToType,
            );
        case 'none':
            return true;
        default:
            return true;
    }
}

/**
 * Perform the validations over the given program. The validations to perform are as follows:
 *
 * 1) Check if active;
 * 2) Check customerRedemptionLimit and determine whether customer has used promotion before;
 * 3) Check endDate and compare with current date;
 * 4) Check locationEligibilityType and determine if the store
 *    where the promotion is being processed is in the storePromotions relation;
 * 5) Check activeDays;
 * 6) Check requirementType and requirementValue;
 *
 * @param {Object} req
 * @param {BusinessPromotionProgram} promotionProgram
 * @param {Store} store
 */
async function performValidations(req, promotionProgram, store) {
    const validationResponse = {};

    const { customer, orderItems } = req.body;
    if (!promotionProgram[0].active) {
        validationResponse.isValid = false;
        validationResponse.reason = 'This promotion is no longer active.';
        return validationResponse;
    }
    if (!customer.centsCustomerId) {
        const storeCustomer = await StoreCustomer.query().findById(customer.id);
        customer.centsCustomerId = storeCustomer ? storeCustomer.centsCustomerId : null;
    }

    const redemptionLimitValidation = await validateCustomerRedemption(
        promotionProgram[0],
        customer.centsCustomerId,
    );
    if (!redemptionLimitValidation) {
        validationResponse.isValid = false;
        validationResponse.reason = 'This customer has already redeemed this promotion.';
        return validationResponse;
    }

    const endDateValidation = await validateEndDate(promotionProgram[0]);
    if (!endDateValidation) {
        validationResponse.isValid = false;
        validationResponse.reason = 'This promotion has expired.';
        return validationResponse;
    }

    const startDateValidation = await validateStartDate(promotionProgram[0]);
    if (!startDateValidation) {
        validationResponse.isValid = false;
        validationResponse.reason = 'This promotion has not started yet.';
        return validationResponse;
    }

    const locationValidation = validateLocation(
        promotionProgram[0].locationEligibilityType,
        promotionProgram[0].storePromotions,
        store,
    );
    if (!locationValidation) {
        validationResponse.isValid = false;
        validationResponse.reason = 'This promotion is not valid at this store.';
        return validationResponse;
    }

    const activeDayValidation = await validateActiveDays(promotionProgram[0].activeDays);
    if (!activeDayValidation) {
        validationResponse.isValid = false;
        validationResponse.reason = 'This promotion is not active for the current day of the week.';
        return validationResponse;
    }

    const minRequirementValidations = await validateMinRequirements(
        promotionProgram[0],
        orderItems,
    );
    if (!minRequirementValidations) {
        validationResponse.isValid = false;
        validationResponse.reason =
            'The promotion requires a minimum total or minimum quantity of order items.';
        return validationResponse;
    }

    const orderItemValidations = await validateProductsAndServices(
        orderItems,
        promotionProgram[0],
        promotionProgram[0].promotionItems,
    );
    if (!orderItemValidations) {
        validationResponse.isValid = false;
        validationResponse.reason =
            'The promotion requires a product or service that is not included in this order.';
        return validationResponse;
    }

    // JIRA ISSUE: CENTS-1448: https://cents.atlassian.net/browse/CENTS-1448
    // const totalAmountValidation = await validateTotalAmount(totalAmount, promotionProgram[0]);
    // if (!totalAmountValidation) {
    //     validationResponse.isValid = false;
    //     validationResponse.reason =
    // 'The discount value of the promotion cannot be greater than the order total';
    //     return validationResponse;
    // }

    validationResponse.isValid = true;

    return validationResponse;
}

/**
 * Determine whether the promotion is valid to use for a given order
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function validatePromotion(req, res, next) {
    try {
        const { promotionCode, storeId } = req.body;
        if (!promotionCode || !promotionCode.trim()) {
            res.status(422).json({
                error: 'Promotion Code is required.',
            });
            return;
        }
        const store = await Store.query().findById(storeId);
        const promotionProgram = await BusinessPromotionProgram.query()
            .withGraphJoined('[storePromotions, promotionItems]')
            .where({
                'businessPromotionPrograms.businessId': Number(store.businessId),
            })
            .andWhereRaw(`upper("businessPromotionPrograms"."name") = ?`, [
                promotionCode.toUpperCase(),
            ]);

        if (!promotionProgram.length) {
            res.status(404).json({
                success: false,
                error: 'The promotion code is invalid or does not exist',
            });
            return;
        }

        const validationResponse = await performValidations(req, promotionProgram, store);

        if (validationResponse.isValid) {
            const applicableItems = await applicableItemsList(
                promotionProgram[0].promotionItems,
                req.body.orderItems,
            );

            res.status(200).json({
                success: true,
                promotionProgram,
                applicableItems,
            });
        } else {
            res.status(422).json({
                success: false,
                error: validationResponse.reason,
            });
        }
    } catch (error) {
        next(error);
    }
}

module.exports = exports = { validatePromotion, performValidations, validateCustomerRedemption };
