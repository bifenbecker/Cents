const getTaxDataPipeline = require('../../../pipeline/employeeApp/tax/taxDataPipeline');

async function fetchTaxRate(req, res, next) {
    try {
        const output = await getTaxDataPipeline(req);

        return res.status(200).json({
            success: true,
            ...output,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = { fetchTaxRate };
