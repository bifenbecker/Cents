const getBusiness = require('../../../../utils/getBusiness');

async function getBatchList(req, res, next) {
    try {
        // TODO test
        const businessDetails = await getBusiness(req);
        const batches = await businessDetails.getBatches().withGraphJoined({
            devices: true,
        });

        res.json({
            success: true,
            deviceCount: batches.reduce((r, c) => r + c.devices.length, 0),
            batchCount: batches.length,
            batchList: batches.map((x) => ({
                ...x,
                deviceCount: x.devices.length,
            })),
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getBatchList;
