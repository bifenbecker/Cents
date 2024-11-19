const BusinessSettings = require('../../../../models/businessSettings');
const getBusiness = require('../../../../utils/getBusiness');

async function updateSettings(req, res, next) {
    try {
        const business = await getBusiness(req);
        const { field, value } = req.body;
        await BusinessSettings.query()
            .patch({
                [field]: value,
            })
            .findOne({
                businessId: business.id,
            });
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = updateSettings;
