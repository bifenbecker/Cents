const jwt = require('jsonwebtoken');
const Business = require('../../models/laundromatBusiness');

/**
 * Filter the business's subscription products based on billing frquency
 *
 * @param {Array} subscriptionProductList
 */
async function filterSubscriptionProducts(subscriptionProductList) {
    const oneTimeItems = subscriptionProductList.filter((item) => item.billingFrequency === 'once');
    const recurringItems = subscriptionProductList.filter(
        (item) => item.billingFrequency !== 'once',
    );

    return [oneTimeItems, recurringItems];
}

/**
 * Get the sum total of all subscription product line items
 *
 * @param {Array} subscriptionProductList
 */
async function calculateTotalCost(subscriptionProductList) {
    const totalCost = subscriptionProductList.reduce(
        (previous, currentItem) => previous + currentItem.unitPrice * currentItem.quantity,
        0,
    );

    return totalCost.toFixed(2);
}

/**
 * Get the sum total of the one-time subscription product line items
 *
 * @param {Array} oneTimeItems
 */
async function calculateOneTimeTotalCosts(oneTimeItems) {
    const totalCost = oneTimeItems.reduce(
        (previous, currentItem) => previous + currentItem.unitPrice * currentItem.quantity,
        0,
    );

    return totalCost.toFixed(2);
}

/**
 * Get the subscription quote and individual product details for a business
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getQuoteForBusiness(req, res, next) {
    try {
        let { token } = req.query;
        token = token.toString().replace(/'|'/g, '');

        if (!token) {
            res.status(404).json({
                error: 'No token present in the request',
            });
        }

        const decodedToken = jwt.verify(token, process.env.QUOTES_JWT);
        const businessId = decodedToken.id;

        const business = await Business.query().findById(businessId);
        const subscriptionProducts = await business.getSubscriptionProducts();
        const businessOwner = await business.getBusinessOwner();
        const businessOwnerDetails = {
            firstName: businessOwner.firstname,
            lastName: businessOwner.lastname,
        };

        const [oneTimeItems, recurringItems] = await filterSubscriptionProducts(
            subscriptionProducts,
        );
        const oneTimeTotalCost = await calculateOneTimeTotalCosts(oneTimeItems);
        const totalCost = await calculateTotalCost(subscriptionProducts);

        return res.status(200).json({
            success: true,
            business,
            businessOwner: businessOwnerDetails,
            oneTimeSubscriptionItems: oneTimeItems,
            recurringSubscriptionItems: recurringItems,
            totalCost,
            oneTimeTotalCost,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = getQuoteForBusiness;
