const Mustache = require('mustache');
const fs = require('fs');
const Route = require('../../../models/route');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

async function getOriginRouteStoreUow(payload) {
    try {
        const { routeDetails, currentStore } = payload;

        routeDetails.originStore = {
            id: currentStore.id,
            name: currentStore.name,
            isHub: currentStore.isHub,
            address: {
                address: currentStore.address,
                city: currentStore.city,
                state: currentStore.state,
                lat: currentStore.settings.lat,
                lng: currentStore.settings.lng,
            },
        };

        const query = fs.readFileSync(
            `${__dirname}/../../../queries/driver-app/origin-store-drop-off-summary.sql`,
            'utf-8',
        );
        const options = {
            routeId: routeDetails.id,
            pickupType: currentStore.isHub ? 'TO_HUB' : 'TO_STORE',
        };
        const sql = Mustache.render(query, options);
        const ordersSummaryResult = await Route.knex().raw(sql);

        if (ordersSummaryResult.rows && ordersSummaryResult.rows.length) {
            const [summary] = ordersSummaryResult.rows;
            routeDetails.originStore.dropOffOrdersSummary = { ...summary };
        }

        return routeDetails;
    } catch (err) {
        LoggerHandler('error', `Error in getOriginRouteStoreUow: ${JSON.stringify(err)}`, payload);
        throw err;
    }
}

module.exports = getOriginRouteStoreUow;
