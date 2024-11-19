const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');
const LaundromatBusiness = require('../../../models/laundromatBusiness');

async function listBusinessOwners(req, res, next) {
    try {
        const page = req.query.page ? Number(req.query.page) : 1;
        const offset = (page - 1) * 10;
        const perPage = 10;

        if (!Number(page)) {
            const errMsg = 'Page should be a number.';
            LoggerHandler('error', errMsg, req);
            return res.status(422).json({
                error: errMsg,
            });
        }

        // TODO test
        const businesses = await LaundromatBusiness.query()
            .withGraphFetched('[batches.[devices], user]')
            .limit(perPage)
            .offset(offset);

        const totalCount = await LaundromatBusiness.query().count('id');

        const totalPages = Math.ceil(totalCount[0].count / perPage);

        return res.json({
            success: true,
            businessOwners: businesses.map((x) => ({
                businessId: x.id,
                name: x.name,
                deviceCount: x.batches.reduce((r, c) => r + c.devices.length, 0),
                batchCount: x.batches.length,
                firstname: x.user.firstname,
                lastname: x.user.lastname,
                userId: x.userId,
            })),
            totalpage: totalPages,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = listBusinessOwners;
