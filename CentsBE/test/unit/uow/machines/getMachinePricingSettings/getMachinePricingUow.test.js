require('../../../../testHelper');

const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { expect, chai } = require('../../../../support/chaiHelper');
const { deviceStatuses, MACHINE_PRICING_LABELS } = require('../../../../../constants/constants');
const getMachinePricingUow = require('../../../../../uow/machines/machinePricesSettings/getMachinePricingUow');
const MachinePricing = require('../../../../../models/machinePricing');
const {
    isMachinePricingBaseVend,
    mapMachinePricingToBase,
    mapMachinePricingToModifier,
} = require('../../../../../utils/machines/machinePricingUtil');

describe('getMachinePricingSettings/getMachinePricingUow function test', () => {
    let user, business, store, batch, device, machine, machineModel;

    beforeEach(async () => {
        user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness, { userId: user.id });
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        batch = await factory.create(FACTORIES_NAMES.batch, {
            storeId: store.id,
            businessId: business.id,
        });
        device = await factory.create(FACTORIES_NAMES.device, {
            batchId: batch.id,
            isActive: true,
            isPaired: false,
            status: deviceStatuses.ONLINE,
            name: '66:cc:88:dd'
        });
        machineModel = await factory.create(FACTORIES_NAMES.machineModel);
        machine = await factory.create(FACTORIES_NAMES.machine, {
            modelId: machineModel.id,
        });
    });

    describe('when machine does not exist', () => {
        it('should throw an error when machine does not exist', async () => {
            const payloadMock = {
                machineId: 54673,
            };
            const spyErrorHandler = chai.spy(() => {});

            await expect(getMachinePricingUow(payloadMock, spyErrorHandler)).to.be.rejectedWith('Machine does not exist');
            expect(spyErrorHandler).to.have.been.called();
        });
    });

    describe('when we have only base vend pricing', () => {
        it('should attach basePricing with also BASE_VEND item', async () => {
            const baseMachinePrice = await factory.create(FACTORIES_NAMES.machinePricingBaseVend, {
                machineId: machine.id,
            });

            await factory.createMany(FACTORIES_NAMES.machinePricingLoadTemperature, 6, {
                machineId: machine.id,
            });

            const payloadMock = {
                machineId: machine.id,
            };
            const spyErrorHandler = chai.spy(() => {});

            const result = await getMachinePricingUow(payloadMock);

            const machinePricingExpected = await MachinePricing.query()
                .where({
                    machineId: machine.id,
                })
                .withGraphJoined('[machineModelLoad.[machineLoadType]]');

            const basePricingItems = machinePricingExpected
                .filter((machinePricingItem) => {
                    const isBaseVend = isMachinePricingBaseVend(machinePricingItem);

                    return isBaseVend || machinePricingItem.loadId;
                })
                .map((basePricingItem) => mapMachinePricingToBase(basePricingItem));
            
            

            expect(result).to.deep.includes({
                ...payloadMock,
                basePricing: basePricingItems,
                modifierPricing: [],
            });
            
            const basePriceExpected = basePricingItems.find(({ machinePricingId }) => machinePricingId === baseMachinePrice.id);
            expect(basePriceExpected).to.have.property('label').to.be.eql(MACHINE_PRICING_LABELS.BASE_VEND);
            expect(spyErrorHandler).not.to.have.been.called();
        });
    });

    describe('when we have only multi vend with load type prices', () => {
        it('should attach basePricing', async () => {
            await factory.createMany(FACTORIES_NAMES.machinePricingLoadTemperature, 5, {
                machineId: machine.id,
            });

            const payloadMock = {
                machineId: machine.id,
            };
            const spyErrorHandler = chai.spy(() => {});

            const result = await getMachinePricingUow(payloadMock);

            const machinePricingExpected = await MachinePricing.query()
                .where({
                    machineId: machine.id,
                })
                .withGraphJoined('[machineModelLoad.[machineLoadType]]');

            const basePricingItems = machinePricingExpected
                .filter((machinePricingItem) => {
                    const isBaseVend = isMachinePricingBaseVend(machinePricingItem);

                    return isBaseVend || machinePricingItem.loadId;
                })
                .map((basePricingItem) => mapMachinePricingToBase(basePricingItem));

            expect(result).to.deep.includes({
                ...payloadMock,
                basePricing: basePricingItems,
                modifierPricing: [],
            });
            expect(spyErrorHandler).not.to.have.been.called();
        });
    });

    describe('when we have only machine modifiers prices', () => {
        it('should attach modifier prices', async () => {
            await factory.createMany(FACTORIES_NAMES.machinePricingModifier, 5, {
                machineId: machine.id,
            });

            const payloadMock = {
                machineId: machine.id,
            };
            const spyErrorHandler = chai.spy(() => {});

            const result = await getMachinePricingUow(payloadMock);


            const machinePricingExpected = await MachinePricing.query()
                .where({
                    machineId: machine.id,
                })
                .withGraphJoined('[machineModelModifier.[machineModifierType]]');
            const modifierPricing = machinePricingExpected
                .filter((machinePricingItem) => machinePricingItem.modifierId)
                .map((modifierPricingItem) => mapMachinePricingToModifier(modifierPricingItem));

            expect(result).to.deep.includes({
                ...payloadMock,
                basePricing: [],
                modifierPricing: modifierPricing,
            });
            expect(spyErrorHandler).not.to.have.been.called();
        });
    });

    describe('when we have load type and modifier prices', () => {
        it('should attach modifiers and load type prices', async () => {
            await factory.createMany(FACTORIES_NAMES.machinePricingLoadTemperature, 5, {
                machineId: machine.id,
            });
            await factory.createMany(FACTORIES_NAMES.machinePricingModifier, 5, {
                machineId: machine.id,
            });

            const payloadMock = {
                machineId: machine.id,
            };
            const spyErrorHandler = chai.spy(() => {});

            const result = await getMachinePricingUow(payloadMock);

            const machinePricingExpected = await MachinePricing.query()
                .where({
                    machineId: machine.id,
                })
                .withGraphJoined('[machineModelLoad.[machineLoadType], machineModelModifier.[machineModifierType]]');

            const modifierPricing = machinePricingExpected
                .filter((machinePricingItem) => machinePricingItem.modifierId)
                .map((modifierPricingItem) => mapMachinePricingToModifier(modifierPricingItem));

            const basePricingItems = machinePricingExpected
                .filter((machinePricingItem) => {
                    const isBaseVend = isMachinePricingBaseVend(machinePricingItem);

                    return isBaseVend || machinePricingItem.loadId;
                })
                .map((basePricingItem) => mapMachinePricingToBase(basePricingItem));

            expect(result).to.deep.includes({
                ...payloadMock,
                basePricing: basePricingItems,
                modifierPricing: modifierPricing,
            });
            expect(spyErrorHandler).not.to.have.been.called();
        });
    });
});
