require('../../../testHelper');

const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

const Shift = require('../../../../models/shifts');
const Timing = require('../../../../models/timings');

const removeShiftWindowUOW = require('../../../../uow/locations/removeShiftWindowUOW');
const confirmStripePaymentUow = require('../../../../uow/superAdmin/payments/confirmStripePaymentUow');

const callRemoveShiftWindowUOW = (shiftId) => removeShiftWindowUOW({ shiftId });

describe('test removeShiftWindowUOW UOW', () => {
    let shift, timing;

    beforeEach(async () => {
        shift = await factory.create(FN.shift);
        firstTiming = await factory.create(FN.timing, { shiftId: shift.id });
        secondTiming = await factory.create(FN.timing, { shiftId: shift.id });
    });

    it('should apply deletedAt timestamp to shift and make related timings inactive', async () => {
        await callRemoveShiftWindowUOW(shift.id);

        const updatedShift = await Shift.query().findById(shift.id);
        const updatedFirstTiming = await Timing.query().findById(firstTiming.id);
        const updatedSecondTiming = await Timing.query().findById(secondTiming.id);

        expect(updatedShift.deletedAt).not.to.be.equal(null);
        expect(updatedFirstTiming.isActive).to.be.equal(false);
        expect(updatedSecondTiming.isActive).to.be.equal(false);
    });
});
