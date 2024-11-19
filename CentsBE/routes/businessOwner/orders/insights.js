const CustomQuery = require('../../../services/customQuery');
/**
 * @description Insights:
        Total Orders(#)
        Total Order Value($)
        Average Order Value($)
        can be added to query if insights are required for all orders
        currently query will return
        count for all orders
        total order values for orders that are not cancelled
        avg order value for orders that are not cancelled.
        Remove case statement and add the following line if insights are required for all orders.
         .avg({ averageOrderValue: 'orderTotal' })
         .sum( { totalOrdersValue: 'orderTotal'})
 */

async function getInsights(req, res, next) {
    try {
        const { stores } = req.query;
        const insightsQueryParams = {
            stores,
        };
        const customQuery = new CustomQuery('reports/insights.sql', insightsQueryParams);
        const insights = await customQuery.execute();
        res.json({
            success: true,
            insights: insights[0],
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getInsights;
