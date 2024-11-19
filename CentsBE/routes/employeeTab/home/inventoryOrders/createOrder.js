const eventEmitter = require('../../../../config/eventEmitter');
const createInventoryOrderPipeline = require('../../../../pipeline/employeeApp/inventoryOrder/createInventoryOrderPipeline');
const { getConvenienceFeeById } = require('../../../../services/orders/queries/convenienceFees');
const { paymentStatuses } = require('../../../../constants/constants');

async function createOrder(req, res, next) {
    try {
        const payload = {
            store: req.currentStore,
            ...req.body,
            storeCustomerId: req.body.storeCustomerId,
            paymentStatus: req.body.paymentStatus || paymentStatuses.BALANCE_DUE,
            constants: req.constants,
            orderType: 'InventoryOrder',
        };
        if (req.body.convenienceFeeId) {
            payload.convenienceFee = await getConvenienceFeeById(null, req.body.convenienceFeeId);
        }
        const result = await createInventoryOrderPipeline(payload);
        eventEmitter.emit('indexCustomer', result.customer.id);

        res.status(200).json({
            success: true,
            order: result,
        });
    } catch (error) {
        if (error.duplicateInventoryOrder) {
            const message = 'Duplicate order recently placed for customer';
            res.status(200).json({
                success: true,
                message,
                existingOrder: error.duplicateInventoryOrder,
            });
        }

        next(error);
    }
}

module.exports = exports = createOrder;
