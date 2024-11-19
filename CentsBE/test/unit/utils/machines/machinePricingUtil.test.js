require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const {
    mapMachinePricingToModifier,
    mapMachinePricingToBase,
    isMachinePricingBaseVend,
} = require('../../../../utils/machines/machinePricingUtil');
const { MACHINE_PRICING_LABELS } = require('../../../../constants/constants');

describe('test machinePricingUtil functions', () => {
    describe('test mapMachinePricingToBase', () => {
        it('should return mapped object with not Base Vend label', () => {
            const machinePricingMock = {
                machineModelLoad: {
                    machineLoadType: {
                        name: 'Normal Hot',
                    },
                },
                price: 0.75,
                unitTime: null,
                id: 789,
            };

            const result = mapMachinePricingToBase(machinePricingMock);

            expect(result).to.deep.equal({
                label: machinePricingMock.machineModelLoad.machineLoadType.name,
                minutes: null,
                price: machinePricingMock.price,
                machinePricingId: machinePricingMock.id,
            });
        });

        it('should return mapped object with Base Vend label', () => {
            const machinePricingMock = {
                machineModelLoad: null,
                price: 0.75,
                unitTime: 3,
                id: 789,
            };

            const result = mapMachinePricingToBase(machinePricingMock);

            expect(result).to.deep.equal({
                label: MACHINE_PRICING_LABELS.BASE_VEND,
                minutes: machinePricingMock.unitTime,
                price: machinePricingMock.price,
                machinePricingId: machinePricingMock.id,
            });
        });
    });

    describe('test mapMachinePricingToModifier', () => {
        it('should return mapped object', () => {
            const machinePricingMock = {
                machineModelModifier: {
                    machineModifierType: {
                        name: 'Heavy',
                    },
                },
                price: 0.75,
                unitTime: 9,
                id: 789,
            };

            const result = mapMachinePricingToModifier(machinePricingMock);

            expect(result).to.deep.equal({
                label: machinePricingMock.machineModelModifier.machineModifierType.name,
                minutes: machinePricingMock.unitTime,
                price: machinePricingMock.price,
                machinePricingId: machinePricingMock.id,
            });
        });
    });

    describe('test isMachinePricingBaseVend', () => {
        it('should return true', () => {
            const machinePricingMock = {
                loadId: null,
                modifierId: null,
            };

            const result = isMachinePricingBaseVend(machinePricingMock);

            expect(result).to.equal(true);
        });

        it('should return false', () => {
            const machinePricingMock = {
                loadId: 675,
                modifierId: null,
            };

            const result = isMachinePricingBaseVend(machinePricingMock);

            expect(result).to.equal(false);
        });

        it('should return false', () => {
            const machinePricingMock = {
                loadId: null,
                modifierId: 567,
            };

            const result = isMachinePricingBaseVend(machinePricingMock);

            expect(result).to.equal(false);
        });
    });
});
