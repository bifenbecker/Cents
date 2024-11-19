const listDevicesPipeline = require('../../../pipeline/machines/getUnPairedOnlineDevicesPipeline');

async function listDevices(req, res, next) {
    try {
        const payload = req.query;
        const deviceListResponse = await listDevicesPipeline(payload);
        res.status(200).json({
            success: true,
            ...deviceListResponse,
        });
    } catch (error) {
        next(error);
    }
}
module.exports = listDevices;
