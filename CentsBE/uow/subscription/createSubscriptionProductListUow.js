const SubscriptionProduct = require('../../models/subscriptionProduct');

/**
 * Handle processing/storage of individual SubscriptionProduct item
 *
 * @param {Object} item
 * @param {Number} businessId
 * @param {void} transaction
 */
async function createIndividualItem(item, businessId, transaction) {
    const subscriptionProduct = await SubscriptionProduct.query(transaction).insert({
        businessId,
        stripeProductId: item.stripeProductId,
        stripePriceId: item.stripePriceId,
        unitPrice: item.unitPrice,
        billingFrequency: item.billingFrequency,
        name: item.name,
        quantity: item.quantity,
    });

    return subscriptionProduct;
}

/**
 * Create SubscriptionProduct entries for each object in the subscriptionProducts object
 *
 * @param {Object} payload
 */
async function createSubscriptionProducts(payload) {
    try {
        const newPayload = payload;
        const { transaction } = newPayload;

        const { subscriptionProducts } = newPayload;
        const { business } = newPayload;

        const result = subscriptionProducts.map((item) =>
            createIndividualItem(item, business.id, transaction),
        );

        await Promise.all(result);

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createSubscriptionProducts;
