const Route = require('../../../models/route');
const getRouteOrdersSummaryPipeline = require('../../../pipeline/driverApp/route/getRouteOrdersSummaryPipeline');

async function getRouteOrdersSummary(req, res, next) {
    try {
        const { decodedToken } = req.locals;

        const { driverId, routeId } = {
            driverId: decodedToken.teamMemberId,
            routeId: req.params.routeId,
        };

        const route = await Route.query()
            .findById(routeId)
            .withGraphJoined(
                '[store, routeDeliveries.[store, orderDelivery, serviceOrderRouteDeliveries.serviceOrder.serviceOrderBags]]',
                { minimize: true },
            )
            .where('driverId', driverId);

        if (!route) {
            res.status(404).json({
                error: 'No Route found',
            });
            return;
        }

        const payload = {
            route,
            driverId: decodedToken.teamMemberId,
            routeId: req.params.routeId,
        };

        const result = await getRouteOrdersSummaryPipeline(payload);

        res.status(200).json({
            success: true,
            online: result.online ? result.online : [],
            stores: result.stores ? result.stores : [],
            cancelledDeliveries: result.cancelledDeliveries || [],
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getRouteOrdersSummary;
