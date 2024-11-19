const CustomQuery = require('../../../services/customQuery');

/**
 * @description
 * Total Orders(#)
 * Total Tickets(#) - 0 hardcoded for now
 * Last Order Date
 * Stores and visits
 * Last order id
 * Last order status
 */

async function getCustomerInsights(req, res, next) {
    try {
        const { id } = req.params;
        const { businessId } = req.constants;
        const customQueryObject = new CustomQuery('business-owner/single-customer-insights.sql', {
            businessId,
            id,
        });
        const insights = await customQueryObject.execute();
        res.status(200).json({
            success: true,
            insights: {
                ...insights[0],
            },
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getCustomerInsights;
