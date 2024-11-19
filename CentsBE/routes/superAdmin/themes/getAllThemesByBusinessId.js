const BusinessTheme = require('../../../models/businessTheme');
const StoreTheme = require('../../../models/storeTheme');
const getUniqThemes = require('../../../utils/superAdmin/getUniqThemes');

async function getAllThemesByBusinessId(req, res, next) {
    try {
        const {
            params: { businessId },
        } = req;
        const businessTheme = await BusinessTheme.query()
            .withGraphJoined('business')
            .where({ businessId })
            .orderBy('createdAt')
            .first();
        businessTheme.isBusinessTheme = true;

        const storeThemes = await StoreTheme.query()
            .withGraphJoined('store')
            .where('storeThemes.businessId', '=', businessId)
            .orderBy('createdAt');

        const allUniqThemes = getUniqThemes(businessTheme, storeThemes);

        res.status(200).json({ themes: allUniqThemes });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getAllThemesByBusinessId;
