const getBusiness = require('../../../utils/getBusiness');
const generateIntercomHash = require('../../../utils/generateIntercomHash');

const getAccountInfo = async (req, res, next) => {
    try {
        const { currentUser } = req;

        if (currentUser) {
            const {
                id: businessId,
                uuid: businessUuid,
                name: businessName,
            } = await getBusiness(req);

            return res.status(200).json({
                userId: currentUser.id,
                firstName: currentUser.firstname,
                lastName: currentUser.lastname,
                email: currentUser.email,
                isGlobalVerified: currentUser.isGlobalVerified,
                uuid: currentUser.uuid,
                intercomHash: generateIntercomHash(currentUser.uuid),
                business: {
                    id: businessId,
                    name: businessName,
                    uuid: businessUuid,
                },
            });
        }

        return res.status(403).json({
            error: 'User not found',
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = getAccountInfo;
