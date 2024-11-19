const StoreSettings = require('../../../../models/storeSettings');

async function updateReportingAccessible(req, res, next) {
    try {
        const result = await StoreSettings.query()
            .patch({
                hasAppReportingAccessible: req.body.hasAppReportingAccessible,
            })
            .findOne({ storeId: req.params.id })
            .returning('hasAppReportingAccessible');
        res.json({
            success: true,
            hasAppReportingAccessible: result.hasAppReportingAccessible,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = updateReportingAccessible;
