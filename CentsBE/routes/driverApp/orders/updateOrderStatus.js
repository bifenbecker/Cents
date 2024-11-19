const ServiceOrderBags = require('../../../models/serviceOrderBags');
const ServiceOrder = require('../../../models/serviceOrders');
const TeamMember = require('../../../models/teamMember');
const OrderActivityLog = require('../../../models/orderActivityLog');
const StoreSettings = require('../../../models/storeSettings');
const getEmployeeDetails = require('../../../utils/getEmployeeDetails');
const notify = require('../../../utils/sms/residentialOrderLiveLink');
const { origins } = require('../../../constants/constants');

async function updateOrderStatus(req, res, next) {
    try {
        const { decodedToken } = req.locals || {};
        const { serviceOrderId, serviceBagId, status } = req.body;
        const allowedStatuses = [
            'IN_TRANSIT_TO_HUB',
            'IN_TRANSIT_TO_STORE',
            'DROPPED_OFF_AT_STORE',
            'DROPPED_OFF_AT_HUB',
        ];
        if (!allowedStatuses.includes(status)) throw new Error('STATUS_UPDATE_ERR');

        const serviceOrder = await ServiceOrder.query()
            .findById(serviceOrderId)
            .withGraphFetched('[serviceOrderBags]');
        const storeSettings = await StoreSettings.query().findOne({
            storeId: serviceOrder.storeId,
        });

        if (
            serviceOrder.serviceOrderBags.filter(
                (bag) => bag.id.toString() === serviceBagId.toString(),
            ).length !== 1
        )
            throw new Error('ID_MISMATCH');
        if (status === 'DROPPED_OFF_AT_STORE' && serviceOrder.status !== 'IN_TRANSIT_TO_STORE')
            throw new Error('STATUS_UPDATE_ERR');
        if (
            status === 'IN_TRANSIT_TO_HUB' &&
            serviceOrder.status !== 'DESIGNATED_FOR_PROCESSING_AT_HUB'
        )
            throw new Error('STATUS_UPDATE_ERR');
        if (status === 'DROPPED_OFF_AT_HUB' && serviceOrder.status !== 'IN_TRANSIT_TO_HUB')
            throw new Error('STATUS_UPDATE_ERR');
        if (status === 'IN_TRANSIT_TO_STORE' && serviceOrder.status !== 'HUB_PROCESSING_COMPLETE')
            throw new Error('STATUS_UPDATE_ERR');
        const totalBags = serviceOrder.serviceOrderBags.length;
        const scannedBags = serviceOrder.serviceOrderBags.filter(
            (bag) => bag.barcodeStatus === status,
        ).length;
        if (totalBags - scannedBags === 1) {
            await ServiceOrder.transaction(async (trx) => {
                await ServiceOrderBags.query(trx)
                    .findById(serviceBagId)
                    .patch({ barcodeStatus: status });
                await ServiceOrder.query(trx).findById(serviceOrderId).patch({ status });
                const { employeeCode, businessId } = await TeamMember.query()
                    .where('userId', decodedToken.id)
                    .first();
                const employee = await getEmployeeDetails(employeeCode, businessId);
                await OrderActivityLog.query(trx).insert({
                    orderId: serviceOrderId,
                    status,
                    employeeCode,
                    teamMemberId: employee.id,
                    employeeName: employee.name,
                    origin: origins.DRIVER_APP,
                });
                if (serviceOrder.orderType === 'RESIDENTIAL' && status === 'DROPPED_OFF_AT_STORE') {
                    await ServiceOrderBags.query(trx)
                        .where('serviceOrderId', serviceOrderId)
                        .patch({ barcodeStatus: 'COMPLETED', isActiveBarcode: false });
                    await ServiceOrder.query(trx)
                        .findById(serviceOrderId)
                        .patch({ status: 'COMPLETED', completedAt: new Date().toISOString() });
                    await OrderActivityLog.query(trx).insert({
                        orderId: serviceOrderId,
                        status: 'COMPLETED',
                        employeeCode,
                        teamMemberId: employee.id,
                        employeeName: employee.name,
                        origin: origins.DRIVER_APP,
                    });
                }
                if (
                    (status === 'IN_TRANSIT_TO_STORE' || status === 'DROPPED_OFF_AT_STORE') &&
                    serviceOrder.orderType === 'RESIDENTIAL' &&
                    storeSettings.hasSmsEnabled
                ) {
                    const order = await ServiceOrder.query()
                        .findById(serviceOrderId)
                        .withGraphFetched('storeCustomer');
                    order.status = status;
                    await notify(order.storeCustomer, order);
                }
            });
        } else {
            await ServiceOrderBags.query()
                .findById(serviceBagId)
                .patch({
                    barcodeStatus: status,
                    isActiveBarcode: !(status === 'CANCELLED' || status === 'COMPLETED'),
                });
        }
        res.json({
            success: true,
        });
    } catch (error) {
        if (error.message === 'STATUS_UPDATE_ERR') {
            res.status(403).json({
                error: 'Unable to update the status of the bag.',
            });
        }
        if (error.message === 'ID_MISMATCH') {
            res.status(403).json({
                error: 'The scanned bag is not associated with this order',
            });
        } else {
            next(error);
        }
    }
}

module.exports = exports = updateOrderStatus;
