const Business = require('../../../../models/laundromatBusiness');
const getBusiness = require('../../../../utils/getBusiness');

async function getAccountDetails(req, res, next) {
    try {
        const userId = req.currentUser.id;
        if (!userId) {
            throw new Error('accountId is missing');
        }

        const business = await getBusiness(req);

        // TODO test
        const businessDetails = await Business.query()
            .findById(business.id)
            .withGraphJoined(
                '[user, settings, regions(notDeleted, orderByName).districts(notDeleted, orderByName)]',
            )
            .modifiers({
                notDeleted: (query) => {
                    query.where('isDeleted', false);
                },
                orderByName: (query) => {
                    query.orderBy('name', 'asc');
                },
            });
        const { user } = businessDetails;

        return res.json({
            success: true,
            accountDetails: {
                fullName: user.firstname.concat(' ', user.lastname),
                email: user.email,
                address: businessDetails.address,
                state: businessDetails.state,
                city: businessDetails.city,
                companyName: businessDetails.name,
                zipCode: businessDetails.zipCode,
                phone: user.phone,
                needsRegions: businessDetails.needsRegions,
                regions: businessDetails.regions,
                settings: businessDetails.settings,
            },
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = getAccountDetails;
