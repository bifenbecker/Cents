const { origins } = require('../../../constants/constants');
const intakeResidentialOrderPipeline = require('../../../pipeline/employeeApp/residentialOrder/intakeResidentialOrderPipeline');
const BusinessSettings = require('../../../models/businessSettings');

async function intakeResidentialOrder(req, res, next) {
    const trx = null;
    try {
        const businessSettings = await BusinessSettings.query().fineOne({
            businessId: req.currentStore.businessId,
        });
        const cents20LdFlag = !!businessSettings?.dryCleaningEnabled;
        const { id } = req.params;
        const { requiresEmployeeCode } = req.currentStore.settings;
        const { employee, residentialStore } = req.constants;
        const payload = {
            serviceOrderId: id,
            employeeCode: requiresEmployeeCode ? employee.id : null,
            store: residentialStore,
            ...req.body,
            ...req,
            ...req.constants,
            origin: origins.EMPLOYEE_APP,
            cents20LdFlag,
        };

        const response = await intakeResidentialOrderPipeline(payload);
        res.status(200).json({
            ...response,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = intakeResidentialOrder;
