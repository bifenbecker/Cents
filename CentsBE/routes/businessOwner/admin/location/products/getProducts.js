const { getProductsQuery } = require('../../../../../services/queries/getProductsQuery');

async function getProducts(req, res, next) {
    try {
        const { id } = req.params;
        const products = await getProductsQuery(null, id);
        res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = {
    getProducts,
};
