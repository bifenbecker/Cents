const getRegionDistrictsLocationPipeline = require('../../../../pipeline/locations/regionsAndLocationsPipeline');

const getBusiness = require('../../../../utils/getBusiness');

module.exports = exports = async (req, res, next) => {
    try {
        const business = await getBusiness(req);
        const response = await getRegionDistrictsLocationPipeline({ business });
        res.status(200).json({
            success: true,
            ...response,
        });
    } catch (error) {
        next(error);
    }
};
