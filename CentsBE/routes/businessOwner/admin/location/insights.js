const { raw } = require('objection');
const moment = require('moment');

const Machine = require('../../../../models/machine');
const ServiceOrder = require('../../../../models/serviceOrders');

function startOfWeek() {
    return new Date(
        Date.UTC(moment().year(), moment().month(), moment().isoWeekday(1).date(), 0, 0, 0, 0),
    ).toISOString();
}

async function getInsights(req, res, next) {
    try {
        const { id } = req.params;
        const machineCount = await Machine.query()
            .select(
                raw(`
            sum (case when "machineTypes".name = 'washer' then 1 else 0 end) as washers,
            sum (case when "machineTypes".name = 'dryer' then 1 else 0 end) as dryers`),
            )
            .join('machineModels', 'machineModels.id', 'machines.modelId')
            .join('machineTypes', 'machineTypes.id', 'machineModels.typeId')
            .where('machines.storeId', id);
        const revenue = await ServiceOrder.query()
            .sum({ revenue: 'orderTotal' })
            .where('storeId', id)
            .andWhere('placedAt', '>=', startOfWeek())
            .andWhere('status', '<>', 'CANCELLED');
        res.status(200).json({
            success: true,
            insights: {
                washers: Number(machineCount[0].washers),
                dryers: Number(machineCount[0].dryers),
                revenue: Number(revenue[0].revenue),
            },
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getInsights;
