const { transaction } = require('objection');

const Timing = require('../../../../models/timings');
const Shift = require('../../../../models/shifts');

const addShifts = async (req, res, next) => {
    let trx = null;
    try {
        const { storeId } = req.query;
        trx = await transaction.start(Timing.knex());
        const isShift = await Shift.query(trx)
            .insert({
                name: req.body.name,
                type: req.body.type,
                storeId,
            })
            .returning('*');
        const timings = req.body.timings.map((timing) => ({
            ...timing,
            shiftId: isShift.id,
        }));
        const newData = await Timing.query(trx).insert(timings).returning('*');
        await trx.commit();
        res.json({
            success: true,
            newData,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
};

module.exports = addShifts;
