const toggleCommercialCustomerPipeline = require('../../../pipeline/customer/toggleCommercial');

const toggleCommercial = async (req, res, next) => {
    try {
        const { businessCustomer } = req.constants;

        await toggleCommercialCustomerPipeline({
            businessCustomer,
            ...req.body,
        });

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = exports = toggleCommercial;
