const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');
const Device = require('../../../models/device');
const laundromatBusiness = require('../../../models/laundromatBusiness');
const validator = require('../../../validations/deviceListing');

async function listDevices(req, res, next) {
    try {
        const { businessId } = req.query;
        const errorCheck = validator(req.query);
        let errMsg;

        if (!errorCheck.error) {
            if (!Number(req.query.page)) {
                errMsg = 'Page should be a number.';
                LoggerHandler('error', errMsg, req);
                return res.status(422).json({
                    error: errMsg,
                });
            }
            const page = req.query.page ? Number(req.query.page) : 1;
            const offset = page > 1 ? (page - 1) * 10 + 1 : 0;
            const perPage = 10;
            // TODO test
            const businessOwners = await laundromatBusiness
                .query()
                .findById(businessId)
                .withGraphJoined('[batches.[devices], user]');
            const deviceList = await Device.knex()
                .query()
                .select('device.name', 'device.createdAt')
                .where('devices.businessId', businessId)
                .limit(perPage)
                .offset(offset);
            const totalCount = await Device.query().count().where('businessId', businessId);

            const totalPages = Math.ceil(totalCount[0].count / 10);

            return res.json({
                success: true,
                businessOwner: businessOwners.rows[0],
                businessOwners: businessOwners.map((x) => ({
                    businessId: x.id,
                    name: x.name,
                    deviceCount: x.batches.reduce((r, c) => r + c.devices.length, 0),
                    firstname: x.user.firstname,
                    lastname: x.user.lastname,
                    userId: x.user.id,
                })),
                deviceList: deviceList.rows,
                totalpage: totalPages,
            });
        }

        errMsg = `${errorCheck.error.message.split('[')[1].split(']')[0]}`;
        LoggerHandler('error', errMsg, req);
        return res.status(422).json({
            error: errMsg,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = listDevices;
