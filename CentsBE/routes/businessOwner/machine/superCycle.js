const User = require('../../../models/user');
const SuperCycle = require('../../../mongooseModels/superCycle');

function mapMachineIds(machineIds) {
    return machineIds.map((machine) => machine.id);
}
async function getList(req, res, next) {
    try {
        const { id } = req.params;
        const machineIds = await User.knex().raw(`
            SELECT machines.id from
            users join "laundromatBusiness" on users.id = "laundromatBusiness"."userId"
            join stores on "stores"."businessId" = "laundromatBusiness".id
            join machines on machines."storeId" = stores.id
            join pairing on pairing."machineId" = machines.id
            where users.id = ${id} and pairing."isDeleted" = false
        `);
        let allDetails;
        if (machineIds.rows) {
            const page = Number(req.query.page) ? Number(req.query.page) : 0;
            allDetails = await SuperCycle.find({
                machineId: {
                    $in: mapMachineIds(machineIds.rows),
                },
            })
                .limit(60)
                .skip(page * 60);
        }
        res.status(200).json({
            success: true,
            records: allDetails,
            nexPage: allDetails.length > 59,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getList;
