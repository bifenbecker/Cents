const { origins } = require('../../../constants/constants');
const adjustServiceOrderPipeline = require('../../../pipeline/employeeApp/serviceOrder/adjustServiceOrderPipeline');

async function adjustOrder(req, res, next) {
    try {
        const { id } = req.params;
        // TODO add employee details to payload i.e req.body.
        // TODO add customer details.
        // TODO add current order details: netOrderTotal, orderTotal.
        const { employee, orderType } = req.constants;
        const payload = {
            serviceOrderId: id,
            ...req.body,
            ...req.constants,
            employee,
            customer: {
                id: req.constants.currentOrderDetails.centsCustomerId,
                fullName: req.constants.currentOrderDetails.customerName,
                phoneNumber: req.constants.currentOrderDetails.customerPhoneNumber,
            },
            store: req.currentStore,
            status: req.constants.currentOrderDetails.status,
            orderType,
            adjusted: true,
            isAdjusted: true,
            orderNotes: req.body.notes,
            notes: 'Order Adjustment',
            origin: origins.EMPLOYEE_APP,
            storeCustomerId: req.constants.currentOrderDetails.storeCustomerId,
        };
        payload.version = req.apiVersion;
        payload.cents20LdFlag = req.cents20LdFlag;
        const result = await adjustServiceOrderPipeline(payload);
        res.status(200).json({
            ...result,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = adjustOrder;
