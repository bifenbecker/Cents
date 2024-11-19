const serviceAndProductPricesPipeline = require('../../../../pipeline/pricingTiers/serviceAndProductPrices');
const updateServicePricePipeline = require('../../../../pipeline/pricingTiers/updateServicePrice');
const createNewServicePricePipeline = require('../../../../pipeline/pricingTiers/createNewServicePrice');
const updateProductPricePipeline = require('../../../../pipeline/pricingTiers/updateProductPrice');
const createNewProductPricePipeline = require('../../../../pipeline/pricingTiers/createNewProductPrice');

const getServiceAndProductPrice = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { businessId } = req;

        const data = await serviceAndProductPricesPipeline({ id, businessId });

        res.status(200).json({
            success: true,
            products: data.products,
            services: data.services,
        });
    } catch (error) {
        next(error);
    }
};

const updateServicePrice = async (req, res, next) => {
    try {
        let servicePrice;
        servicePrice = await updateServicePricePipeline(req.body);
        if (!servicePrice) {
            servicePrice = await createNewServicePricePipeline(req.body);
        }
        res.status(200).json({
            success: true,
            record: servicePrice,
        });
    } catch (error) {
        next(error);
    }
};

const updateProductPrice = async (req, res, next) => {
    try {
        let productPrice;
        productPrice = await updateProductPricePipeline(req.body);
        if (!productPrice) {
            productPrice = await createNewProductPricePipeline(req.body);
        }
        res.status(200).json({
            success: true,
            record: productPrice,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getServiceAndProductPrice,
    updateServicePrice,
    updateProductPrice,
};
