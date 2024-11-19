const { raw } = require('objection');
const Orders = require('../../../models/serviceOrders');

async function getCustomers(req, res, next) {
    try {
        const { stores, page } = req.query;
        let customers = Orders.query()
            .select(
                raw(`
            distinct(users.id), trim(concat(users.firstname, ' ', users.lastname)) as "fullName",
            users.email, users.phone as "phoneNumber",
            count(users.id) over() as "totalCustomers"`),
            )
            .join('users', 'users.id', 'serviceOrders.userId')
            .whereIn('serviceOrders.storeId', stores);
        // apply stores filter
        customers = customers
            .groupBy('users.id')
            .limit(30)
            .offset((Number(page) - 1) * 30);
        customers = await customers.orderBy('fullName');
        const totalCustomers = customers.length ? customers[0].totalCustomers : 0;
        res.status(200).json({
            success: true,
            customers,
            totalCustomers,
        });
    } catch (error) {
        next(error);
    }
}
module.exports = exports = getCustomers;
