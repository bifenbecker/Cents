const BusinessSettings = require('../../../../models/businessSettings');
const TipSettings = require('../../../../models/tipSettings');
const ConvenienceFee = require('../../../../models/convenienceFee');
const BagNoteTag = require('../../../../models/bagNoteTag');
const getBusiness = require('../../../../utils/getBusiness');

async function getSettings(req, res, next) {
    try {
        const business = await getBusiness(req);
        const settings = await BusinessSettings.query().findOne({
            businessId: business.id,
        });
        const tipSettings = await TipSettings.query().findOne({
            businessId: business.id,
        });
        const convenienceFee = await ConvenienceFee.query().findOne({
            businessId: business.id,
        });
        const bagNoteTags = await BagNoteTag.query().where({
            businessId: business.id,
            isDeleted: false,
        });
        settings.tipSettings = tipSettings || null;
        settings.convenienceFee = convenienceFee || null;
        settings.bagNoteTags = bagNoteTags || null;
        res.status(200).json({
            success: true,
            settings,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getSettings;
