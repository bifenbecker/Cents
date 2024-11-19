const ServiceOrderWeights = require('../../../models/serviceOrderWeights');
const getEmployeeDetails = require('../../../utils/getEmployeeDetails');
const getSingleOrderLogic = require('../../../uow/singleOrder/getSingleOrderLogicUOW');

async function EditOrderWeight(req, res, next) {
    try {
        const { businessId } = req.currentStore;
        const { requiresEmployeeCode } = req.currentStore.settings;
        const { employeeCode, serviceOrderId, serviceOrderWeightId, totalWeight, editReason } =
            req.body;

        let employee;
        if (employeeCode && requiresEmployeeCode) {
            employee = await getEmployeeDetails(employeeCode, businessId);
        }

        await ServiceOrderWeights.query()
            .patch({
                totalWeight,
                editReason,
                editedBy: requiresEmployeeCode ? employee.id : null,
                isEdited: true,
                updatedAt: new Date().toISOString(),
            })
            .where('id', serviceOrderWeightId);

        const orderDetails = await getSingleOrderLogic(serviceOrderId, req.currentStore);
        res.status(200).json({
            success: true,
            orderDetails,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = EditOrderWeight;
