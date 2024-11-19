const Business = require('../../../../models/laundromatBusiness');
const getBusiness = require('../../../../utils/getBusiness');

const shifts = async (req, res, next) => {
    try {
        const business = await getBusiness(req);

        const shifts = await Business.query()
            .distinct('shifts.name')
            .join('stores', 'stores.businessId', 'laundromatBusiness.id')
            .join('shifts', 'shifts.storeId', 'stores.id')
            .where('laundromatBusiness.id', business.id)
            .andWhere('shifts.type', 'SHIFT')
            .orderBy('shifts.name');

        res.status(200).json({
            success: true,
            shifts,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = shifts;
