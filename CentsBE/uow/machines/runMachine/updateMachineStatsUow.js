const moment = require('moment');
const { deviceStatuses, serviceTypes } = require('../../../constants/constants');
const Turn = require('../../../models/turns');
const MachineTurnsStats = require('../../../models/machineTurnsStats');

/**
 *
 * @param {number} machineId
 * @param {*} transaction
 * @returns the totalRevenue of the machine
 */
async function getTotalSelfServeRevenueOfMachine(machineId, transaction) {
    const query = `SELECT SUM("turns"."netOrderTotalInCents")::INTEGER as "totalRevenue" FROM "turns"
    WHERE "turns"."machineId" = ${machineId} AND "turns"."serviceType"='${serviceTypes.SELF_SERVICE}'`;
    const { rows } = await Turn.query(transaction).knex().raw(query);
    return rows[0].totalRevenue;
}

function getNoOfPairedDays(pairing) {
    const activePairing = pairing.find((pair) => !pair.deletedAt);
    let noOfPairedDays = 0;
    if (activePairing) {
        const fromDate = moment(activePairing.createdAt).startOf('day');
        const toDate = moment().endOf('day');
        noOfPairedDays = toDate.diff(fromDate, 'days');
    }
    // if the machine is previously paired and then unPaired,
    // we need to consider previously paired days as well
    if (pairing.length > 1) {
        const prevPairingDays = pairing
            .filter((pair) => pair.deletedAt)
            .reduce((previous, current) => {
                const fromDate = moment(current.createdAt).startOf('day');
                const toDate = moment(current.deletedAt).endOf('day');
                return previous + toDate.diff(fromDate, 'days');
            }, 0);
        return noOfPairedDays + prevPairingDays;
    }
    return noOfPairedDays;
}

async function getNoOfUnpairedTurnCreationDays(machineId, transaction) {
    const query = `SELECT DISTINCT(Date("createdAt")) FROM "turns"  
        WHERE "machineId"=${machineId} AND "deviceId" is null AND "deletedAt" is null`;
    const { rows } = await Turn.query(transaction).knex().raw(query);
    return rows.length;
}

/**
 *
 * @param {number} machineId
 * @param {*} transaction
 * @returns the total turns count of the machine
 */
async function getMachineTurnsCount(machineId, transaction) {
    const { rows } = await Turn.query(transaction).knex().raw(`
        SELECT COUNT("turns".id)::INTEGER FROM "turns" WHERE "machineId"=${machineId} AND "deletedAt" is null
    `);
    return rows[0].count;
}

async function getAvgTurnsPerDay(machineId, noOfDays, transaction) {
    const turnsCount = await getMachineTurnsCount(machineId, transaction);
    return noOfDays > 1 ? (turnsCount / noOfDays).toFixed(2) : turnsCount;
}

async function getAvgSelfServeRevenuePerDay(machineDetails, noOfDays, transaction) {
    const { id: machineId } = machineDetails;
    const totalRevenue = await getTotalSelfServeRevenueOfMachine(machineId, transaction);
    return noOfDays > 1 ? totalRevenue / noOfDays : totalRevenue;
}

/**
 *
 * @param {object} payload
 * @returns updates the avgTurnPerDay and avgRevenuePerDay of the machine
 */
async function updateMachineStatsUow(payload) {
    const { machineDetails, transaction } = payload;
    const noOfPairedDays = getNoOfPairedDays(machineDetails.pairing);
    const noOfUnpairedTurnCreationDays = await getNoOfUnpairedTurnCreationDays(
        machineDetails.id,
        transaction,
    );
    const noOfDays = noOfPairedDays + noOfUnpairedTurnCreationDays;
    const avgTurnsPerDay = await getAvgTurnsPerDay(machineDetails.id, noOfDays, transaction);
    const avgSelfServeRevenuePerDay = await getAvgSelfServeRevenuePerDay(
        machineDetails,
        noOfDays,
        transaction,
    );

    const machineTurnsStatsPayload = {
        machineId: machineDetails.id,
        avgTurnsPerDay,
        avgSelfServeRevenuePerDay,
    };
    if (machineDetails.machineTurnsStats) {
        machineTurnsStatsPayload.id = machineDetails.machineTurnsStats.id;
    }
    const stats = await MachineTurnsStats.query(transaction).upsertGraph(machineTurnsStatsPayload);

    const newPayload = {
        ...payload,
        deviceStatus: deviceStatuses.IN_USE,
        stats,
    };
    return newPayload;
}

module.exports = {
    updateMachineStatsUow,
};
