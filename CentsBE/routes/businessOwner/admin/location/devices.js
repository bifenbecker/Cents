const LoggerHandler = require('../../../../LoggerHandler/LoggerHandler');
const Store = require('../../../../models/store');

const getBusiness = require('../../../../utils/getBusiness');

const listDevices = async (req, res, next) => {
    try {
        const locationId = req.query.id; // TODO: Move to params
        if (!locationId) {
            throw new Error('Please provide a location Id.');
        }

        const business = await getBusiness(req);

        if (business) {
            const location = await Store.query()
                .findById(locationId)
                .where('stores.businessId', business.id)
                .withGraphJoined({
                    batches: {
                        devices: true,
                    },
                });

            if (!location) {
                return res.json({
                    error: 'Invalid Location',
                });
            }

            const deviceCount = location.batches.reduce((r, c) => r + c.devices.length, 0);

            return res.json({
                location,
                deviceCount,
                devices: location.batches.reduce((r, c) => r.concat(c.devices), []),
            });
        }

        const errMsg = 'Invalid Business';
        LoggerHandler('error', errMsg, req);
        return res.status(400).json({
            error: errMsg,
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = listDevices;
