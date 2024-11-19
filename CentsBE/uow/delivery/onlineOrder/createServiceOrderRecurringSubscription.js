const ServiceOrderRecurringSubscription = require('../../../models/serviceOrderRecurringSubscription');
const PricingTier = require('../../../models/pricingTier');

/**
 * Queries customer's pricing tier and adjusts recurring discount accordingly.
 * @param {number} pricingTierId
 * @param {number} storeRecurringDiscount - The store's recurring discount percentage.
 */
async function calculateRecurringDiscount({ pricingTierId, storeRecurringDiscount }) {
    const pricingTier = await PricingTier.query().findById(pricingTierId).select('type');
    const { type } = pricingTier || {};
    return type === 'COMMERCIAL' ? 0 : storeRecurringDiscount;
}

async function createServiceOrderRecurringSubscription(payload) {
    const { transaction, settings, serviceOrder, recurringSubscription } = payload;

    if (!recurringSubscription) return payload;

    // Remove recurring store discount if commercial tier customer
    const orderRecurringDiscount = await calculateRecurringDiscount({
        pricingTierId: serviceOrder.tierId,
        storeRecurringDiscount: settings.recurringDiscountInPercent,
    });

    const serviceOrderSubscription = await ServiceOrderRecurringSubscription.query(transaction)
        .insert({
            serviceOrderId: serviceOrder.id,
            recurringSubscriptionId: recurringSubscription.id,
            recurringDiscountInPercent: orderRecurringDiscount,
            servicePriceId: recurringSubscription.servicePriceId,
            modifierIds: recurringSubscription.modifierIds,
            pickupWindow: recurringSubscription.pickupWindow,
        })
        .returning('*');
    payload.serviceOrderRecurringSubscription = serviceOrderSubscription;
    return payload;
}

module.exports = exports = createServiceOrderRecurringSubscription;
