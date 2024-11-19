const { raw } = require('objection');
const Joi = require('@hapi/joi');

const ServiceOrder = require('../../../models/serviceOrders');
const InventoryOrder = require('../../../models/inventoryOrders');
const StoreCustomer = require('../../../models/storeCustomer');
const { dateFormat } = require('../../../helpers/dateFormatHelper');
const { getFormattedStartAndEndDates } = require('../../../utils/reports/reportsUtils');
const getOrderCodePrefix = require('../../../utils/getOrderCodePrefix');
const { paymentStatuses, statuses } = require('../../../constants/constants');

const timeRangeSchema = require('../../../validations/reports/timeRangeSchema');
const getBusiness = require('../../../utils/getBusiness');

const validationSchema = Joi.object().keys({
    ...timeRangeSchema,
    customerId: Joi.number().required(),
});

const REPORT_DATE_FORMAT = 'MM/DD/YY';

/**
 * Returns invoicing orders report for specified period
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @returns {Object} JSON response containing orders
 */
async function getInvoicingCustomerOrders(req, res, next) {
    try {
        const { customerId: centsCustomerId, startDate, endDate, timeZone } = req.query;
        const [finalStartDate, finalEndDate] = getFormattedStartAndEndDates(
            startDate,
            endDate,
            timeZone,
        );
        const business = await getBusiness(req);

        if (!business) {
            res.status(400).json({
                error: 'Invalid request. No business exists',
            });
            return;
        }

        const businessId = business.id;

        // get first customer store to extract customer timezone
        const storeCustomer = await StoreCustomer.query()
            .findOne({ centsCustomerId, businessId })
            .withGraphFetched('[store.[settings],centsCustomer]');

        if (!storeCustomer) {
            res.status(400).json({
                success: false,
                error: 'Customer for the selected stores was not found',
            });
            return;
        }

        const {
            store: {
                settings: { timeZone: customerTimeZone },
            },
            centsCustomer: { firstName, lastName },
        } = storeCustomer;

        const customerName = `${firstName} ${lastName}`.trim();

        const addStatusClause = (query) =>
            query.where({
                paymentStatus: paymentStatuses.INVOICING,
                status: statuses.COMPLETED,
            });

        const serviceOrdersQuery = ServiceOrder.query()
            .joinRelated('storeCustomer')
            .select('orderCode', 'orderTotal', 'placedAt', 'orderType')
            .where('storeCustomer.centsCustomerId', centsCustomerId)
            .where('storeCustomer.businessId', businessId)
            .whereBetween('placedAt', [finalStartDate, finalEndDate]);

        const inventoryOrdersQuery = InventoryOrder.query()
            .select(
                'orderCode',
                'orderTotal',
                'inventoryOrders.createdAt as placedAt',
                raw('\'INVENTORY\' as "orderType"'),
            )
            .joinRelated('customer')
            .where('customer.centsCustomerId', centsCustomerId)
            .where('customer.businessId', businessId)
            .whereBetween('inventoryOrders.createdAt', [finalStartDate, finalEndDate]);

        const [serviceOrders, inventoryOrders] = await Promise.all([
            addStatusClause(serviceOrdersQuery),
            addStatusClause(inventoryOrdersQuery),
        ]);

        const orders = [...serviceOrders, ...inventoryOrders].map((order) => ({
            'Invoice Number': '',
            'Customer Name': customerName,
            'Invoice Date': dateFormat(Date.now(), customerTimeZone, REPORT_DATE_FORMAT),
            'Due Date': '',
            Item: 'Services',
            'Item Description': getOrderCodePrefix(order),
            'Service Date': dateFormat(order.placedAt, customerTimeZone, REPORT_DATE_FORMAT),
            'Item Amount': order.orderTotal,
        }));

        res.json({
            success: true,
            orders,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { getInvoicingCustomerOrders, validationSchema };
