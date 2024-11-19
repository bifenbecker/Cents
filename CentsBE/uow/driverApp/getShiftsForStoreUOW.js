const moment = require('moment-timezone');
const { orderBy, flattenDeep } = require('lodash');
const Store = require('../../models/store');
const TeamMember = require('../../models/teamMember');

async function fetchTeamMemberShifts(teamMemberId, storeId, transaction, day) {
    const teamMemberShiftsQuery = TeamMember.query(transaction)
        .select('teamMembers.id')
        .findById(teamMemberId)
        .withGraphJoined('[stores.[shifts.timings, settings]]')
        .modifyGraph('stores', (builder) => builder.where('stores.id', storeId).select('id'))
        .modifyGraph('stores.shifts', (builder) =>
            builder.where('shifts.type', 'OWN_DELIVERY').select('id', 'name'),
        )
        .modifyGraph('stores.shifts.timings', (builder) => builder.where('isActive', true))
        .orderBy([
            'stores:shifts.id',
            'stores:shifts:timings.day',
            'stores:shifts:timings.startTime',
        ]);
    if (Number.isInteger(day)) {
        teamMemberShiftsQuery.where('stores:shifts:timings.day', day);
    }
    return teamMemberShiftsQuery;
}

async function getShiftsForStoreUOW(payload) {
    try {
        const { storeId, teamMemberId, transaction } = payload;

        const store = await Store.query().findById(storeId).withGraphJoined('settings');

        if (!store) {
            throw new Error('Store Not Found');
        }

        const today = moment.tz(store.settings.timeZone || 'UTC');
        const nextDay = today.day() === 6 ? '0' : `${today.day() + 1}`;

        const teamMemberWithTodayShift = await fetchTeamMemberShifts(
            teamMemberId,
            storeId,
            transaction,
            today.day(),
        );

        const nextAvailableShifts = await fetchTeamMemberShifts(teamMemberId, storeId, transaction);

        const newPayload = {
            todaysShiftsTimings: [],
            tomorrowsShiftTiming: {},
            today,
            store,
            storeTimezone: store.settings.timeZone || 'UTC',
        };

        if (
            teamMemberWithTodayShift &&
            teamMemberWithTodayShift.stores.length &&
            teamMemberWithTodayShift.stores[0].shifts.length
        ) {
            const todaysShiftsTimings = [];
            teamMemberWithTodayShift.stores[0].shifts.forEach((shift) => {
                todaysShiftsTimings.push(...shift.timings);
            });
            newPayload.todaysShiftsTimings = todaysShiftsTimings;
        }

        if (
            nextAvailableShifts &&
            nextAvailableShifts.stores.length &&
            nextAvailableShifts.stores[0].shifts.length
        ) {
            const timings = flattenDeep(
                nextAvailableShifts.stores[0].shifts.map((shift) => {
                    const timings = shift.timings.map((timing) => {
                        timing.shift = {
                            name: shift.name,
                        };
                        return timing;
                    });
                    return timings;
                }),
            );

            const lookingAheadTimings = orderBy(timings, ['day', 'startTime'], 'asc');
            newPayload.tomorrowsShiftTiming =
                lookingAheadTimings.find((timing) => timing.day >= nextDay) ||
                lookingAheadTimings[0];
        }
        return { ...newPayload, ...payload };
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = getShiftsForStoreUOW;
