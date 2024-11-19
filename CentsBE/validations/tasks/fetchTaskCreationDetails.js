const Store = require('../../models/store');

module.exports = exports = async function fetchDetails(req, res, next) {
    try {
        const { assignedDays } = req.body;
        const shiftNames = req.body.assignedShifts
            .filter((shift) => shift.isAssigned === true)
            .map((shift) => shift.name);

        const timings = await Store.query()
            .select('timings.id')
            .join('shifts as shifts', 'stores.id', 'shifts.storeId')
            .join('timings as timings', 'shifts.id', 'timings.shiftId')
            .where('timings.isActive', true)
            .whereIn('stores.id', req.body.assignedLocations)
            .whereIn('shifts.name', shiftNames)
            .whereIn('timings.day', assignedDays);

        if (timings.length) {
            req.timings = timings;
            next();
        } else {
            res.status(422).json({
                error: 'Invalid day or shift.',
            });
        }
    } catch (error) {
        next(error);
    }
};
