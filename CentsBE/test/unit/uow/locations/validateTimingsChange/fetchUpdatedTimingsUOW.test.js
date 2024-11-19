require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');

const fetchUpdatedTimingsUOW = require('../../../../../uow/locations/validateTimingsChange/fetchUpdatedTimingsUOW');

describe('test fetchUpdatedTimingsUOW', async () => {
    let shift, timing;

    beforeEach(async () => {
        shift = await factory.create('shift', { type: 'OWN_DELIVERY' });
        timing = await factory.create('timing', {
            shiftId: shift.id,
            startTime: '1970-01-01 11:00:00',
            endTime: '1970-01-01 12:00:00',
        });
    });

    it('should return timings which got updated', async () => {
        const newTiming = await factory.create('timing', {
            shiftId: shift.id,
            startTime: '1970-01-01 12:00:00',
        });
        response = await fetchUpdatedTimingsUOW({
            timingIds: [timing.id, newTiming.id],
            timing: {
                isActive: true,
                startTime: timing.startTime,
                endTime: timing.endTime,
            },
        });

        expect(response.updatedTimingIds).to.include(newTiming.id);
        expect(response.updatedTimingIds).to.not.include(timing.id);
    });

    it('should not return timings which did not get updated', async () => {
        response = await fetchUpdatedTimingsUOW({
            timingIds: [timing.id],
            timing: {
                isActive: true,
                startTime: timing.startTime,
                endTime: timing.endTime,
            },
        });

        expect(response.updatedTimingIds).to.be.empty;
    });
});
