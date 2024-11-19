const removeZonesPipeline = require('../../../../pipeline/locations/removeZonePipeline');

async function removeZone(req, res, next) {
    try {
        const { zoneId, storeId } = req.params;
        const payload = {
            zoneId,
            storeId,
        };
        await removeZonesPipeline(payload);
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = removeZone;
