const { getOrdersQuery, validatePageNumber, validateStores } = require('./getOrdersPagination');

async function search(req, res, next) {
    try {
        const store = req.currentStore;
        const { keyword, stores, statuses, page, sortBy, sortOrder, orderBy } = req.query;

        // withoutPagination is a param from query string, so we need to convert it to a boolean
        const withoutPagination = req.query.withoutPagination === 'true' || false;

        if (!keyword) {
            res.status(422).json({
                error: 'Keyword is required.',
            });
            return;
        }
        const isPageValid = validatePageNumber({
            page,
            stores,
            statuses,
            sortBy,
            sortOrder,
            orderBy,
            withoutPagination,
        });
        if (isPageValid.error) {
            res.status(422).json({
                error: isPageValid.error.message,
            });
            return;
        }
        if (stores) {
            try {
                await validateStores(stores);
            } catch (e) {
                res.status(422).json({
                    error: 'Store Ids are Invalid',
                });
                return;
            }
        }
        const orderId = null;
        const { resp, totalOrders } = await getOrdersQuery(
            store,
            stores,
            orderId,
            statuses,
            page,
            keyword,
            sortBy,
            sortOrder,
            orderBy,
            withoutPagination,
        );

        res.status(200).json({
            success: true,
            totalOrders,
            activeOrders: resp,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = search;
