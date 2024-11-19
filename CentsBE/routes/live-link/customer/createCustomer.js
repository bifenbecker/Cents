const addCentsCustomer = require('../../../services/liveLink/customer');

async function createCustomer(req, res, next) {
    try {
        const customer = await addCentsCustomer(req.body);
        res.status(200).json({
            success: true,
            ...customer,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = createCustomer;
