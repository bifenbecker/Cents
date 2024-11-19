require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { generateToken } = require('../../../support/apiTestHelper');
const {
    assertGetResponseSuccess,
    assertGetResponseError,
} = require('../../../support/httpRequestsHelper');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');

const getAPIEndpoint = (query) => `/api/v1/business-owner/machine?${query}`;

describe('test getMachinesList api', () => {
    let user, business, store, machinesNetworked, machinesOffline, token;

    beforeEach(async () => {
        user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness, { userId: user.id });
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        machinesNetworked = await factory.createMany(FACTORIES_NAMES.machineWasherWithPairedOnlineDevice, 20, {
            storeId: store.id,
        });
        machinesOffline = await factory.createMany(FACTORIES_NAMES.machineWasher, 15, {
            storeId: store.id,
        });
        token = generateToken({
            id: user.id,
        });
    });

    describe('when authorization is failed', () => {
        it('should throw an error if token is not sent', async () => {
            const query = `storeIds[]=${store.id}&page=1`;
            await assertGetResponseError({
                url: getAPIEndpoint(query),
                token: '',
                code: 401,
                expectedError: 'Please sign in to proceed.',
            });
        });

        it('should throw an error if token is not correct', async () => {
            const query = `storeIds[]=${store.id}&page=1`;
            await assertGetResponseError({
                url: getAPIEndpoint(query),
                token: '123678a',
                code: 401,
                expectedError: 'Invalid token.',
            });
        });

        it('should throw an error if user does not exist', async () => {
            const query = `storeIds[]=${store.id}&page=1`;
            await assertGetResponseError({
                url: getAPIEndpoint(query),
                token: generateToken({
                    id: -1,
                }),
                code: 403,
                expectedError: 'User not found',
            });
        });

        it('should throw an error if user does not have a valid role', async () => {
            user = await factory.create(FACTORIES_NAMES.user);
            const query = `storeIds[]=${store.id}&page=1`;
            await assertGetResponseError({
                url: getAPIEndpoint(query),
                token: generateToken({
                    id: user.id,
                }),
                code: 403,
                expectedError: 'Unauthorized',
            });
        });
    });

    describe('when validation middleware is passed with errors', () => {
        it('should respond with status 422 when required "page" query param is missed', async () => {
            const query = `storeIds[]=${store.id}`;
            await assertGetResponseError({
                url: getAPIEndpoint(query),
                token: generateToken({
                    id: user.id,
                }),
                code: 422,
            });
        });

        it('should respond with status 422 when required "storeIds" query param is missed', async () => {
            const query = `page=some`;
            await assertGetResponseError({
                url: getAPIEndpoint(query),
                token: generateToken({
                    id: user.id,
                }),
                code: 422,
            });
        });
    });

    describe('when success response', () => {
        it('should return with status 200 with machines list', async () => {
            const query = `storeIds[]=${store.id}&page=1&limit=10`;
            const { body } = await assertGetResponseSuccess({
                url: getAPIEndpoint(query),
                token: generateToken({
                    id: user.id,
                }),
                code: 200,
            });

            expect(body).to.have.property('hasMore').to.be.a('boolean');
            expect(body).to.have.property('machines').to.be.an('array');

            for (const machine of body.machines) {
                expect(machine).to.have.property('id').to.be.a('number');
                expect(machine).to.have.property('store').to.be.a('object');
                expect(machine.store).to.have.property('id').to.be.a('number');
                expect(machine.store).to.have.property('address').to.be.a('string');
                expect(machine.store).to.have.property('name').to.be.a('string');
                expect(machine).to.have.property('name').to.be.a('string');
                expect(machine).to.have.property('pricePerTurnInCents').to.be.a('number');
                expect(machine).to.have.property('turnTimeInMinutes').to.be.a('number');
                expect(machine).to.have.property('model').to.be.an('object');
                expect(machine.model).to.have.property('capacity').to.be.a('string');
                expect(machine.model).to.have.property('modelName').to.be.an('string');
                expect(machine.model).to.have.property('manufacturer').to.be.an('string');
                expect(machine.model).to.have.property('type').to.be.an('string');
                expect(machine).to.have.property('avgTurnsPerDay').to.be.a('number');
                expect(machine).to.have.property('avgSelfServeRevenuePerDay').to.be.a('number');
                expect(machine).to.have.property('device').to.be.an('object');
            }
        });

        it('should return with status 200 with empty machines list if we do not found needed machines', async () => {
            const query = `storeIds[]=${store.id}&page=1&limit=10&keyword=skdjfhkshfkakakda`;
            const { body } = await assertGetResponseSuccess({
                url: getAPIEndpoint(query),
                token: generateToken({
                    id: user.id,
                }),
                code: 200,
            });

            expect(body).to.have.property('hasMore').to.be.eql(false);
            expect(body).to.have.property('machines').to.be.eql([]);
        });
    });
});
