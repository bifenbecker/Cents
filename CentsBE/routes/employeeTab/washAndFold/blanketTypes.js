const WashService = require('../../../models/washService');

async function getBlanketTypes(req, res, next) {
    try {
        const { storeId } = req.query;
        if (!Number(storeId.trim())) {
            res.status(422).json({
                error: 'storeId is required.',
            });
            return;
        }
        const blanketTypes = await WashService.query()
            .select(
                'washServices.laundryType as blanketType',
                'prices.id as priceId',
                'prices.price as price',
            )
            .join('prices', 'prices.washServicesId', 'washServices.id')
            .where('prices.storeId', storeId)
            .andWhere((q) => {
                q.where('washServices.laundryType', 'Small Blanket')
                    .orWhere('washServices.laundryType', 'Medium Blanket')
                    .orWhere('washServices.laundryType', 'Large Blanket');
            });

        res.status(200).json({
            success: true,
            blanketTypes,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getBlanketTypes;
