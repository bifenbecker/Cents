const momentTz = require('moment-timezone');
const _ = require('lodash');
const Store = require('../../models/store');
const { updateMachineStatsUow } = require('../../uow/machines/runMachine/updateMachineStatsUow');
const { getDistinctStoreTimezones } = require('../../queries/getDistinctStoreTimeZones');

async function getTimezonesToUpdate() {
    const distinctTimezones = await getDistinctStoreTimezones();
    const timezoneToUpdate = distinctTimezones.filter((timezone) => {
        const currentTime = momentTz().tz(timezone);
        const currentHour = currentTime.hour();
        const currentMinutes = currentTime.minutes();
        const amOrPm = currentTime.format('a');
        return currentHour === 0 && amOrPm === 'am' && currentMinutes >= 0 && currentMinutes <= 5;
    });
    return timezoneToUpdate;
}

async function getMachinesToUpdate(timezones) {
    const stores = await Store.query()
        .select('stores.id')
        .whereIn('settings.timeZone', timezones)
        .withGraphJoined(
            '[settings(settings), machines(machines).[pairing, turns(turns), machineTurnsStats(machineTurnsStats)]]',
            {
                joinOperation: 'leftJoin',
            },
        )
        .modifiers({
            settings: (query) => {
                query.select('storeId', 'timeZone');
            },
            turns: (query) => {
                query.select('id');
            },
            machines: (query) => {
                query.select('id');
            },
            machineTurnsStats: (query) => {
                query.select('id');
            },
        });
    const machines = stores.map((store) => store.machines);
    return _.flattenDeep(machines);
}

async function updateMachineTurnsStats() {
    const timezonesToUpdate = await getTimezonesToUpdate();
    if (timezonesToUpdate) {
        const machines = await getMachinesToUpdate(timezonesToUpdate);
        if (machines.length) {
            await Promise.all(
                machines.map((machine) => updateMachineStatsUow({ machineDetails: machine })),
            );
        }
    }
    return timezonesToUpdate;
}

module.exports = exports = updateMachineTurnsStats;
