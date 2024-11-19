const { raw } = require('objection');
const moment = require('moment');
const momenttz = require('moment-timezone');

const StoreCustomer = require('../../../models/storeCustomer');
const StoreSettings = require('../../../models/storeSettings');

/**
 * @description Laundromat Visits this month (#) - unique orders
 * New Customers this month (#)
 *  Average Order Value this month ($)
 */
async function getInsights(req, res, next) {
    try {
        const { stores } = req.query;
        const storeSettings = await StoreSettings.query().whereIn('storeId', stores).first();
        // get starting date of current month.
        const monthStartDate = new Date(
            Date.UTC(
                moment().year(),
                momenttz()
                    .tz(storeSettings.timeZone || 'America/New_York')
                    .month(),
                1,
                0,
                0,
                0,
                0,
            ),
        ).toISOString();
        const details = await StoreCustomer.query()
            .select(
                raw(`
            (count(distinct "serviceOrders".id) + count(distinct "inventoryOrders".id))
            as "visitsThisMonth",
            round(
                ((
                    sum(case when "serviceOrders".status <> 'CANCELLED' then "serviceOrders"."orderTotal" else 0 end)
                                                            +
                    sum(case when "inventoryOrders".status <> 'CANCELLED' then "inventoryOrders"."orderTotal" else 0 end)
                 ) / (count(distinct "serviceOrders".id) + count(distinct "inventoryOrders".id))) ::numeric , 2
            )  as "orderAverage"
            `),
            )
            .leftJoin('serviceOrders', (query) => {
                query
                    .on('serviceOrders.storeCustomerId', '=', 'storeCustomers.id')
                    .andOn('serviceOrders.placedAt', '>=', raw(`'${monthStartDate}'`))
                    .andOnIn('serviceOrders.storeId', stores);
            })
            .leftJoin('inventoryOrders', (query) => {
                query
                    .on('inventoryOrders.storeCustomerId', '=', 'storeCustomers.id')
                    .andOn('inventoryOrders.createdAt', '>=', raw(`'${monthStartDate}'`))
                    .andOnIn('inventoryOrders.storeId', stores);
            })
            .whereRaw(
                '"inventoryOrders"."storeId" is not null or "serviceOrders"."storeId" is not null',
            );
        const newCustomers = await StoreCustomer.query()
            .select(raw('count(distinct "storeCustomers"."centsCustomerId") as "newCustomers"'))
            .where('createdAt', '>=', monthStartDate)
            .whereIn('storeId', stores);
        res.status(200).json({
            success: true,
            insights: {
                ...details[0],
                ...newCustomers[0],
            },
        });
    } catch (error) {
        next(error);
    }
}
module.exports = exports = getInsights;
