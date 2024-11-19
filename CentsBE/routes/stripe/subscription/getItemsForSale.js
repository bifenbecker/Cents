const stripe = require('../config');
const { billingIntervals } = require('../../../constants/constants');

/**
 * Retrieve a specific Stripe Product given an individual Stripe Price
 *
 * https://stripe.com/docs/api/products/retrieve
 *
 * @param {Object} stripePrice
 */
async function getProductForStripePrice(stripePrice) {
    const individualPrice = stripePrice;
    const product = await stripe.products.retrieve(individualPrice.product);

    individualPrice.product = product;

    return individualPrice;
}

/**
 * Get a list of active prices in Stripe
 *
 * https://stripe.com/docs/api/prices/list
 */
async function getStripePrices() {
    const prices = await stripe.prices.list({
        active: true,
    });

    return prices.data;
}

/**
 * Determine the right billingFrequency based on Stripe values
 *
 * @param {Object} item
 */
async function mapBillingFrequency(item) {
    if (item.type === 'one_time') return 'once';

    const { interval } = item.recurring;

    return billingIntervals[interval];
}

/**
 * Format the list of for sale items to match eventual DB Values
 *
 * @param {Object} forSaleItem
 */
async function formatForSaleList(forSaleItem) {
    const individualSaleItem = {};

    individualSaleItem.stripeProductId = forSaleItem.product.id;
    individualSaleItem.stripePriceId = forSaleItem.id;
    individualSaleItem.name = forSaleItem.product.name;
    individualSaleItem.productImages = forSaleItem.product.images;
    individualSaleItem.billingFrequency = await mapBillingFrequency(forSaleItem);

    const price = (Number(forSaleItem.unit_amount) / 100).toFixed(2);

    individualSaleItem.unitPrice = price;

    return individualSaleItem;
}

/**
 * Get a list of all items available for sale when building a subscription plan for a customer
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getItemsForSale(req, res, next) {
    try {
        const prices = await getStripePrices();

        let pricesWithProducts = prices.map((price) => getProductForStripePrice(price));
        pricesWithProducts = await Promise.all(pricesWithProducts);

        let forSaleItems = pricesWithProducts.map((item) => formatForSaleList(item));
        forSaleItems = await Promise.all(forSaleItems);

        return res.status(200).json({
            success: true,
            forSaleItems,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = getItemsForSale;
