const laundromatBusiness = require('../../../models/laundromatBusiness');

module.exports = exports = async (req, res, next) => {
    try {
        const { businessId } = req.params;

        // TODO test
        const business = await laundromatBusiness
            .query()
            .findById(businessId)
            .withGraphJoined('[batches.[devices], user]');
        if (!business) {
            return res.status(404).json({
                error: 'Business not found.',
            });
        }

        return res.json({
            success: true,
            batchList: business.batches.map((x) => {
                const obj = {};
                obj.id = x.id;
                obj.createdAt = x.createdAt;
                obj.deviceCount = x.devices.length;
                obj.isAssigned = x.storeId !== null;
                return obj;
            }),
            businessOwner: {
                businessid: business.id,
                name: business.name,
                userId: business.user.id,
                firstname: business.user.firstname,
                lastname: business.user.lastname,
                deviceCount: business.batches.reduce((r, c) => r + c.devices.length, 0),
                batchCount: business.batches.length,
            },
        });
    } catch (error) {
        return next(error);
    }
};
