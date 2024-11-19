const { getServicePrices } = require('../../../../../services/washServices/queries');

async function getServices(req, res, next) {
    try {
        const { id } = req.params;
        const services = await getServicePrices(null, id);
        res.json({
            services,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = {
    getServices,
};
