// Packages
const eventEmitter = require('../../../config/eventEmitter');

// Models
const ServiceOrder = require('../../../models/serviceOrders');

// Pipelines
const updateServiceOrderStatusPipeline = require('../../../pipeline/superAdmin/serviceOrder/updateServiceOrderStatusPipeline');

// Utils
const mapServiceOrderData = require('../../../utils/superAdmin/mapServiceOrderData');
const { mapResponse } = require('../../../uow/superAdmin/serviceOrder/mapResponseUOW');
const { validateParamsIdType } = require('../../../validations/paramsValidation');
const { ERROR_MESSAGES } = require('../../../constants/error.messages');
const { RECORDS_PER_PAGE_DEFAULT, origins } = require('../../../constants/constants');

/**
 * Get all ServiceOrders in the Cents ecosystem
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getServiceOrders(req, res, next) {
    try {
        const { pageNumber, searchTerm } = req.query;
        const isSearchTermNumber = parseInt(searchTerm, 10);

        const serviceOrders = await ServiceOrder.query()
            .withGraphFetched(
                `[
                storeCustomer.[centsCustomer],
                store
            ]`,
            )
            .join('stores', 'stores.id', 'serviceOrders.storeId')
            .join('storeCustomers', 'storeCustomers.id', 'serviceOrders.storeCustomerId')
            .orWhere('stores.name', 'ilike', `%${searchTerm || ''}%`)
            .orWhere('storeCustomers.firstName', 'ilike', `%${searchTerm || ''}%`)
            .orWhere('storeCustomers.lastName', 'ilike', `%${searchTerm || ''}%`)
            .modify((queryBuilder) => {
                if (isSearchTermNumber) {
                    queryBuilder
                        .orWhere('serviceOrders.orderCode', '=', `${searchTerm}`)
                        .orWhere('serviceOrders.id', '=', `${searchTerm}`);
                }
            })
            .page(pageNumber ?? 0, RECORDS_PER_PAGE_DEFAULT)
            .orderBy('createdAt', 'desc');

        let mappedOrders = serviceOrders.results.map((item) => mapServiceOrderData(item));
        mappedOrders = await Promise.all(mappedOrders);

        return res.json({
            success: true,
            serviceOrders: mappedOrders,
            total: serviceOrders.total,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get ServiceOrder QueryBuilder with necessary columns
 *
 * @returns Objection.QueryBuilder<ServiceOrder>
 */
function getServiceOrderQueryBuilder() {
    return ServiceOrder.query()
        .withGraphFetched(
            `[
                storeCustomer(customerDetails).[centsCustomer(centsCustomerDetails)],
                store,
                order.[promotionDetails, delivery, pickup, payments],
                notificationLogs(reverse).[language],
                weightLogs,
                orderItems.[referenceItems as refItem.[servicePrice, inventoryItem, lineItemDetail.[modifierLineItems]]],
                activityLog(activityLog),
                tier,
            ]`,
        )
        .modifiers({
            activityLog: (query) => {
                query.select(
                    'id',
                    'status',
                    'employeeCode',
                    'employeeName',
                    'updatedAt',
                    'teamMemberId',
                    'notes',
                );
            },
            customerDetails: (query) => {
                query.select(
                    'id',
                    'firstName',
                    'lastName',
                    'phoneNumber',
                    'email',
                    'creditAmount',
                    'notes',
                    'isHangDrySelected',
                    'hangDryInstructions',
                );
            },
            centsCustomerDetails: (query) => {
                query.select(
                    'id',
                    'firstName',
                    'lastName',
                    'phoneNumber',
                    'email',
                    'stripeCustomerId',
                );
            },
            reverse: (query) => {
                query.orderBy('id', 'desc');
            },
        });
}

/**
 * Get an individual service order and its details
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getIndividualServiceOrder(req, res, next) {
    try {
        const isValid = validateParamsIdType(req);

        if (!isValid) {
            return res.status(409).json({
                error: ERROR_MESSAGES.INVALID_PARAM_ID,
            });
        }

        const serviceOrder = await getServiceOrderQueryBuilder().findById(req.params.id);

        return res.json({
            success: true,
            serviceOrder: await mapResponse(serviceOrder),
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Update the status of the ServiceOrder and any of the related ServiceOrderItem entries
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function updateServiceOrderStatus(req, res, next) {
    try {
        const { inProgressDeliveries } = req.constants;
        const payload = {
            status: req.body.status,
            serviceOrderId: req.params.id,
            origin: origins.INTERNAL_MANAGER,
            inProgressDeliveries,
        };

        await updateServiceOrderStatusPipeline(payload);

        const serviceOrder = await getServiceOrderQueryBuilder().findById(payload.serviceOrderId);

        eventEmitter.emit('indexCustomer', serviceOrder.storeCustomerId);

        return res.status(200).json({
            success: true,
            serviceOrder: await mapResponse(serviceOrder),
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = {
    getServiceOrders,
    getIndividualServiceOrder,
    updateServiceOrderStatus,
};
