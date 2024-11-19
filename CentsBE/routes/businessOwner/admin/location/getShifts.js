const ShiftsService = require('../../../../services/shifts/shifts');

const getShifts = async (req, res, next) => {
    try {
        const { storeId, type } = req.query;
        const shiftsService = new ShiftsService();
        const shifts = await shiftsService.getShiftsByStoreId(storeId, type);
        res.status(200).json({
            success: true,
            storeId,
            shifts,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = getShifts;
