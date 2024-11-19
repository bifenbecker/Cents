require('../../../../testHelper');

const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { expect } = require('../../../../support/chaiHelper');
const MachinePricing = require('../../../../../models/machinePricing');
const removeMachinePricingUow = require('../../../../../uow/machines/createNetworkedMachineByOffline/removeMachinePricingUow');

describe('createNetworkedMachineByOffline/removeMachinePricingUow function test', () => {
    let user, business, store, machine;

    beforeEach(async () => {
        user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness, { userId: user.id });
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        machine = await factory.create(FACTORIES_NAMES.machineWasher, {
            storeId: store.id,
        });
        await factory.createMany(FACTORIES_NAMES.machinePricing, 5, {
            machineId: machine.id,
        });
    });

    describe('when remove machine prices', () => {
        it('should return the same payload', async () => {
            const payloadMock = {
                machineId: machine.id,
            };

            const result = await removeMachinePricingUow(payloadMock);

            expect(result).to.deep.equal({
                machineId: machine.id,
            });
        });

        it('should mark as deleted all the machine prices for current machine', async () => {
            const payloadMock = {
                machineId: machine.id,
            };

            await removeMachinePricingUow(payloadMock);

            const machinePricingItems = await MachinePricing.query().where('machineId', machine.id);

            for (const machinePricing of machinePricingItems) {
                expect(machinePricing).to.have.property('isDeleted').to.eql(true);
                expect(machinePricing).to.have.property('deletedAt').not.to.be.null;
            }
        });
    });
});
