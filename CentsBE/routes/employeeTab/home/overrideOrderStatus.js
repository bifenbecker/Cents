const { transaction } = require('objection');
const ServiceOrderBags = require('../../../models/serviceOrderBags');
const ServiceOrder = require('../../../models/serviceOrders');
const OrderActivityLog = require('../../../models/orderActivityLog');
const getEmployeeDetails = require('../../../utils/getEmployeeDetails');
const { getOrdersQuery } = require('./getOrdersPagination');
const getSingleOrderLogic = require('../../../uow/singleOrder/getSingleOrderLogicUOW');
const { origins } = require('../../../constants/constants');

async function overrideStatus(req, res, next) {
    let trx = null;
    try {
        const { barcode, status, employeeCode } = req.body;
        const { paginationOrderStructure } = req.query;
        const { businessId, settings } = req.currentStore;
        let employee = {};
        if (settings.requiresEmployeeCode && employeeCode) {
            employee = await getEmployeeDetails(employeeCode, businessId);
        }
        trx = await transaction.start(ServiceOrder.knex());
        const serviceBag = await ServiceOrderBags.query()
            .select('id', 'serviceOrderId', 'barcodeStatus')
            .whereIn('barcode', barcode)
            .andWhere('isActiveBarcode', true);
        if (!serviceBag.length) {
            res.status(400).json({
                error: 'Barcode not found',
            });
            return;
        }
        const serviceOrder = await ServiceOrder.query()
            .findById(serviceBag[0].serviceOrderId)
            .withGraphFetched('[serviceOrderBags]');
        const totalBags = serviceOrder.serviceOrderBags.length;
        const scannedBags = serviceOrder.serviceOrderBags.filter(
            (bag) => bag.barcodeStatus === status,
        ).length;
        if (totalBags - scannedBags === barcode.length) {
            await ServiceOrder.transaction(async (trx) => {
                await ServiceOrderBags.query()
                    .whereIn('barcode', barcode)
                    .patch({ barcodeStatus: status });
                await ServiceOrder.query(trx)
                    .findById(serviceBag[0].serviceOrderId)
                    .patch({ status });
            });
        } else {
            await ServiceOrderBags.query()
                .whereIn('barcode', barcode)
                .patch({ barcodeStatus: status });
        }
        if (settings.requiresEmployeeCode) {
            await OrderActivityLog.query(trx).insert({
                orderId: serviceBag[0].serviceOrderId,
                status,
                employeeCode,
                teamMemberId: employee.id,
                employeeName: employee.name,
                origin: origins.EMPLOYEE_APP,
            });
        }
        await trx.commit();

        let orderDetails;
        if (paginationOrderStructure === 'true') {
            const { resp } = await getOrdersQuery(
                req.currentStore,
                null,
                serviceBag[0].serviceOrderId,
                null,
                1,
                '',
                null,
                null,
                null,
            );
            [orderDetails] = resp;
        } else {
            orderDetails = await getSingleOrderLogic(
                serviceBag[0].serviceOrderId,
                req.currentStore,
            );
        }
        res.status(200).json({
            success: true,
            orderDetails,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = overrideStatus;
