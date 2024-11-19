// Models
const eventEmitter = require('../../../config/eventEmitter');
const InventoryOrder = require('../../../models/inventoryOrders');

// Utils
const mapInventoryOrderData = require('../../../utils/superAdmin/mapInventoryOrderData');
const { validateParamsIdType } = require('../../../validations/paramsValidation');
const { ERROR_MESSAGES } = require('../../../constants/error.messages');
const { RECORDS_PER_PAGE_DEFAULT } = require('../../../constants/constants');

/**
 * Get all InventoryOrders in the Cents ecosystem
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getInventoryOrders(req, res, next) {
    try {
        const { pageNumber, searchTerm } = req.query;
        const isSearchTermNumber = parseInt(searchTerm, 10);

        const inventoryOrders = await InventoryOrder.query()
            .withGraphFetched(
                `[
                customer,
                store.[laundromatBusiness],
                order.[payments]
            ]`,
            )
            .join('stores', 'stores.id', 'inventoryOrders.storeId')
            .join('storeCustomers', 'storeCustomers.id', 'inventoryOrders.storeCustomerId')
            .orWhere('stores.name', 'ilike', `%${searchTerm || ''}%`)
            .orWhere('storeCustomers.firstName', 'ilike', `%${searchTerm || ''}%`)
            .orWhere('storeCustomers.lastName', 'ilike', `%${searchTerm || ''}%`)
            .modify((queryBuilder) => {
                if (isSearchTermNumber) {
                    queryBuilder
                        .orWhere('inventoryOrders.orderCode', '=', `${searchTerm}`)
                        .orWhere('inventoryOrders.id', '=', `${searchTerm}`);
                }
            })
            .page(pageNumber ?? 0, RECORDS_PER_PAGE_DEFAULT)
            .orderBy('createdAt', 'desc');
        let mappedOrders = inventoryOrders.results.map((item) => mapInventoryOrderData(item));
        mappedOrders = await Promise.all(mappedOrders);

        return res.json({
            success: true,
            inventoryOrders: mappedOrders,
            total: inventoryOrders.total,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get InventoryOrder QueryBuilder with necessary columns
 *
 * @returns Objection.QueryBuilder<InventoryOrder>
 */
function getInventoryOrderQueryBuilder() {
    return InventoryOrder.query()
        .withGraphFetched(
            `[
                customer,
                store(storeDetails),
                order.[payments(orderPayments), promotionDetails],
                employee.[user(userDetails)],
                lineItems.[inventoryItem],
            ]`,
        )
        .modifiers({
            storeDetails: (query) => {
                query.select('id', 'name', 'address', 'city', 'state', 'zipCode');
            },
            orderPayments: (query) => {
                query
                    .select(
                        'id',
                        'orderId',
                        'paymentToken',
                        'status',
                        'totalAmount',
                        'esdReceiptNumber',
                        'paymentProcessor',
                        'createdAt',
                    )
                    .orderBy('id');
            },
            userDetails: (query) => {
                query.select('id', 'firstname', 'lastname', 'phone', 'email');
            },
        });
}

/**
 * Get an individual inventory order and its details
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getIndividualInventoryOrder(req, res, next) {
    try {
        const isValid = validateParamsIdType(req);

        if (!isValid) {
            return res.status(409).json({
                error: ERROR_MESSAGES.INVALID_PARAM_ID,
            });
        }

        const inventoryOrder = await getInventoryOrderQueryBuilder().findById(req.params.id);

        return res.json({
            success: true,
            inventoryOrder,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Update the status of the InventoryOrder entry
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function updateInventoryOrderStatus(req, res, next) {
    const { status, inventoryOrderId } = req.body;
    const inventoryOrder = await getInventoryOrderQueryBuilder()
        .patch({ status })
        .findById(inventoryOrderId)
        .returning('*');
    eventEmitter.emit('indexCustomer', inventoryOrder.storeCustomerId);

    return res.status(200).json({
        success: true,
        inventoryOrder,
    });
}

module.exports = exports = {
    getInventoryOrders,
    getIndividualInventoryOrder,
    updateInventoryOrderStatus,
};
