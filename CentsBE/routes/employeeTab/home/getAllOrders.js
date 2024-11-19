async function getAllOrders(req, res, next) {
    try {
        req.query.orderHistory = true;
        req.query.statuses = ['COMPLETED', 'CANCELLED'];
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getAllOrders;
