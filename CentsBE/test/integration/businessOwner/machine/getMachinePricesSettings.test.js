require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { generateToken } = require('../../../support/apiTestHelper');
const {
    assertGetResponseSuccess,
    assertGetResponseError,
} = require('../../../support/httpRequestsHelper');

const getAPIEndpoint = (machineId) => `/api/v1/business-owner/machine/${machineId}/prices-settings`;

describe('test getMachinePricesSettings api', () => {
    let user, business, store, machine, token, machinePricing;

    beforeEach(async () => {
        user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness, { userId: user.id });
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        machine = await factory.create(FACTORIES_NAMES.machine, {
            storeId: store.id,
        });
        token = generateToken({
            id: user.id,
        });
    });

    describe('when validation or authorization is failed', function () {
        it('should throw an error if token is not sent', async () => {
            await assertGetResponseError({
                url: getAPIEndpoint(machine.id),
                token: '',
                code: 401,
                expectedError: 'Please sign in to proceed.',
            });
        });

        it('should throw an error if token is not correct', async () => {
            await assertGetResponseError({
                url: getAPIEndpoint(machine.id),
                token: '123678a',
                code: 401,
                expectedError: 'Invalid token.',
            });
        });

        it('should throw an error if user does not exist', async () => {
            await assertGetResponseError({
                url: getAPIEndpoint(machine.id),
                token: generateToken({
                    id: -1,
                }),
                code: 403,
                expectedError: 'User not found',
            });
        });

        it('should throw an error if user does not have a valid role', async () => {
            user = await factory.create('user');
            await assertGetResponseError({
                url: getAPIEndpoint(machine.id),
                token: generateToken({
                    id: user.id,
                }),
                code: 403,
                expectedError: 'Unauthorized',
            });
        });

        it('should throw an error if machine was not found', async () => {
            await assertGetResponseError({
                url: getAPIEndpoint(99999),
                token,
                code: 404,
                expectedError: 'Machine does not exist',
            });
        });
    });

    describe('when validation is passed successfully', function () {
        it('should return machine pricing and settings', async () => {
            machinePricing = await factory.createMany(FACTORIES_NAMES.machinePricing, 5, {
                machineId: machine.id,
            });

            const { body } = await assertGetResponseSuccess({
                url: getAPIEndpoint(machine.id),
                token,
            });

            expect(body).to.have.property('basePricing').to.be.an('array');
            expect(body).to.have.property('modifierPricing').to.be.an('array');
            expect(body).to.have.property('coinValues').to.be.an('array');
            expect(body).to.have.property('cycleSettings').to.be.an('array');
            expect(body).to.have.property('additionalSettings').to.be.an('array');
        });

        it('should return machine basePricing', async () => {
            machinePricing = await factory.createMany(FACTORIES_NAMES.machinePricing, 5, {
                machineId: machine.id,
            });

            const { body } = await assertGetResponseSuccess({
                url: getAPIEndpoint(machine.id),
                token,
            });

            expect(body).to.have.property('basePricing').to.be.an('array')
            const { basePricing } = body;
            for (const basePricingItem of basePricing) {
                expect(basePricingItem).to.have.all.keys('label', 'minutes', 'price', 'machinePricingId');
            }
        });
    });
});
