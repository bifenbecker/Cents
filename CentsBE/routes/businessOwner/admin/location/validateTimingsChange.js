const validateTimingsChangePipeline = require('../../../../pipeline/locations/validateTimingsChangePipeline');

async function validateTimingsChange(req, res, next) {
    try {
        const { storeId } = req.params;
        const { timingIds, timing, type } = req.body;

        const { timingsWithDeliveriesAndSubscriptionsCount } = await validateTimingsChangePipeline({
            storeId,
            timingIds,
            timing,
            type,
        });

        if (timingsWithDeliveriesAndSubscriptionsCount.length) {
            res.status(422).json({
                success: false,
                error: [
                    `${
                        timingIds.length === 1
                            ? 'This window has'
                            : `There are ${timingIds.length} timings with`
                    }`,
                    'either active order deliveries or active recurring subscriptions associated with it.',
                ].join(' '),
                type: 'ACTIVE_DELIVERIES_OR_SUBSCRIPTIONS',
                timingsWithDeliveriesAndSubscriptionsCount,
            });
            return;
        }
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = validateTimingsChange;
