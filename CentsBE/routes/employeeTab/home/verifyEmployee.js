const CheckIn = require('../../../models/teamMemberCheckIn');
const validateEmployeeCode = require('../../../validations/validateEmployeeCode');
const TeamMember = require('../../../models/teamMember');

async function isValid(req, res, next) {
    try {
        const { employeeCode } = req.body;
        const { id, businessId } = req.currentStore;
        await validateEmployeeCode(employeeCode, businessId, id);
        const isEmployee = await TeamMember.query().findOne({
            employeeCode,
            businessId,
        });
        const isCheckedIn = await CheckIn.query().findOne({
            teamMemberId: isEmployee.id,
            storeId: id,
            isCheckedIn: true,
        });
        if (!isCheckedIn) {
            res.status(400).json({
                error: 'Please check-in to continue.',
            });
            return;
        }
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = isValid;
