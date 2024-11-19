const CustomQuery = require('../../../services/customQuery');

const getOrderCodePrefix = require('../../../utils/getOrderCodePrefix');

function mapResponse(orders) {
    const response = {};
    let orderCount = 0;
    const resp = [];
    for (const order of orders) {
        const temp = {
            ...order,
        };
        orderCount = order.total_count;
        temp.orderCodeWithPrefix = getOrderCodePrefix(order);
        delete temp.total_count;
        resp.push(temp);
    }
    response.totalOrders = orderCount;
    response.resp = resp;
    return response;
}
async function getOrders(req, res, next) {
    try {
        const { status, page, stores, keyword } = req.query;
        const query = new CustomQuery('business-owner/orders-list.sql', {
            ordersOffset: (page - 1) * 30,
            ordersLimit: 30,
            stores,
            fetchActive: status !== 'completed',
            keyword,
        });
        const orders = await query.execute();

        if (page > 1 && orders.length === 0) {
            res.status(409).json({
                error: 'Invalid page number.',
            });
        } else {
            const response = mapResponse(orders);
            res.status(200).json({
                success: true,
                orders: response.resp,
                totalRecords: Number(response.totalOrders),
                currentPage: Number(page),
            });
        }
    } catch (error) {
        next(error);
    }
}
module.exports = exports = getOrders;
