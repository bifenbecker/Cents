const { origins } = require('../../../constants/constants');
const intakeOrderPipeline = require('../../../pipeline/employeeApp/serviceOrder/intakeOnlineOrderPipeline');
const BusinessSettings = require('../../../models/businessSettings');

function getStatus(storeType) {
    const typeAndStatus = {
        STORE: 'READY_FOR_PROCESSING',
        HUB: 'READY_FOR_PROCESSING',
        INTAKE_ONLY: 'DESIGNATED_FOR_PROCESSING_AT_HUB',
        STANDALONE: 'READY_FOR_PROCESSING',
    };
    return typeAndStatus[storeType];
}

async function inTakeOnlineOrder(req, res, next) {
    try {
        const businessSettings = await BusinessSettings.query().findOne({
            businessId: req.currentStore.businessId,
        });
        const cents20LdFlag = !!businessSettings?.dryCleaningEnabled;
        const { id } = req.params;
        const { type } = req.currentStore;
        const status = getStatus(type);
        const { currentOrderDetails, employee, businessId } = req.constants;
        const payload = {
            serviceOrderId: id,
            ...req.body,
            ...req.constants,
            employee,
            customer: {
                id: currentOrderDetails.centsCustomerId,
                fullName: currentOrderDetails.customerName,
                phoneNumber: currentOrderDetails.customerPhoneNumber,
            },
            store: req.currentStore,
            status,
            orderType: 'ONLINE',
            adjusted: false,
            businessId,
            origin: origins.EMPLOYEE_APP,
            cents20LdFlag,
            version: req?.apiVersion,
        };
        const result = await intakeOrderPipeline(payload);
        res.status(200).json({
            ...result,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = inTakeOnlineOrder;
