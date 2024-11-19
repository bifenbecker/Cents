require('../../../testHelper');

const { expect } = require('../../../support/chaiHelper');
const validatePriceOrTurnTimeForMachineUOW = require('../../../../uow/machines/validatePriceOrTurnTimeForMachineUOW');

describe('validatePriceOrTurnTimeForMachineUOW test', function () {
    it('should throw error if no price per turn provided for WASHER machine', async () => {
        const payload = {
            machineTypeName: 'WASHER',
        };
        try {
            await validatePriceOrTurnTimeForMachineUOW(payload);
        } catch (err) {
            expect(err.message).to.equal('Price is required for adding a washer.');
        }
    });

    it('should throw error if negative price per turn provided for WASHER machine', async () => {
        const payload = {
            machineTypeName: 'WASHER',
            pricePerTurnInCents: -23,
        };
        try {
            await validatePriceOrTurnTimeForMachineUOW(payload);
        } catch (err) {
            expect(err.message).to.equal('Price cannot be less than or equal to 0.');
        }
    });

    it('should throw error if turnTimeInMinutes not provided for DRYER machine', async () => {
        const payload = {
            machineTypeName: 'DRYER',
        };
        try {
            await validatePriceOrTurnTimeForMachineUOW(payload);
        } catch (err) {
            expect(err.message).to.equal('Turn time is required for adding a dryer.');
        }
    });

    it('should throw error if negative turnTimeInMinutes provided for DRYER machine', async () => {
        const payload = {
            machineTypeName: 'DRYER',
            turnTimeInMinutes: -45,
        };
        try {
            await validatePriceOrTurnTimeForMachineUOW(payload);
        } catch (err) {
            expect(err.message).to.equal('Turn time cannot be less than or equal to 0.');
        }
    });

    it('should return expected result for WASHER machine type', async () => {
        const payload = {
            machineTypeName: 'WASHER',
            pricePerTurnInCents: 23,
        };
        const res = await validatePriceOrTurnTimeForMachineUOW(payload);
        expect(res.machineTypeName).to.equal(payload.machineTypeName);
        expect(res.pricePerTurnInCents).to.equal(payload.pricePerTurnInCents);
    });

    it('should return expected result for DRYER machine type', async () => {
        const payload = {
            machineTypeName: 'DRYER',
            turnTimeInMinutes: 15,
        };
        const res = await validatePriceOrTurnTimeForMachineUOW(payload);
        expect(res.machineTypeName).to.equal(payload.machineTypeName);
        expect(res.turnTimeInMinutes).to.equal(payload.turnTimeInMinutes);
    });
});
