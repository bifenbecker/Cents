require('../../../testHelper');
const factory = require('../../../factories');
const { expect, assert } = require('../../../support/chaiHelper');
const createStoreCustomer = require('../../../../uow/customer/createStoreCustomer');
const StoreCustomer = require('../../../../models/storeCustomer');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const { MAX_DB_INTEGER } = require('../../../constants/dbValues');

describe('test createStoreCustomer UoW', () => {
    describe('should return valid payload', () => {
        const entities = {};
        beforeEach(async () => {
            entities.business = await factory.create(FN.laundromatBusiness);
            entities.store = await factory.create(FN.store, {
                businessId: entities.business.id,
                taxRateId: null,
            });
            entities.centsCustomer = await factory.create(FN.centsCustomer);
            entities.businessCustomer = await factory.create(FN.businessCustomer, {
                businessId: entities.business.id,
                centsCustomerId: entities.centsCustomer.id,
            });
        });

        it('when storeCustomer already exist', async () => {
            const { store, centsCustomer, business, businessCustomer } = entities;
            let storeCustomer = await factory.create(FN.storeCustomer, {
                storeId: store.id,
                centsCustomerId: centsCustomer.id,
                businessId: business.id,
                businessCustomerId: businessCustomer.id,
            });
            storeCustomer = await StoreCustomer.query().findById(storeCustomer.id);

            // call Uow
            const newPayload = await createStoreCustomer({ storeId: store.id, centsCustomer });

            // assert
            assert.deepEqual(newPayload.customer, centsCustomer, 'return valid customer');
            assert.deepEqual(
                newPayload.storeCustomer,
                { ...storeCustomer, centsCustomer },
                'return valid storeCustomer',
            );
            assert.deepEqual(
                newPayload.storeCustomerId,
                storeCustomer.id,
                'return valid storeCustomerId',
            );
            assert.deepEqual(
                newPayload.centsCustomerId,
                centsCustomer.id,
                'return valid centsCustomerId',
            );
        });

        it("should create storeCustomer when it doesn't exist", async () => {
            const { store, centsCustomer, business } = entities;
            const payload = {
                storeId: store.id,
                centsCustomer,
                firstName: 'Nash',
                lastName: 'Macejkovic',
                phoneNumber: '6327585668',
                languageId: 1,
                businessId: business.id,
            };

            // call Uow
            const newPayload = await createStoreCustomer(payload);

            // assert
            const newStoreCustomer = await StoreCustomer.query().findOne({
                storeId: store.id,
                centsCustomerId: centsCustomer.id,
            });
            assert.deepEqual(newPayload.customer, centsCustomer, 'return valid customer');
            expect(newPayload.storeCustomer.id).equal(
                newStoreCustomer.id,
                'return valid storeCustomer',
            );
            expect(newPayload.storeCustomer.centsCustomer).equal(
                centsCustomer,
                'return valid storeCustomer.centsCustomer',
            );
            assert.deepEqual(
                newPayload.storeCustomerId,
                newStoreCustomer.id,
                'return valid storeCustomerId',
            );
            assert.deepEqual(
                newPayload.centsCustomerId,
                centsCustomer.id,
                'return valid centsCustomerId',
            );
        });
    });

    it('should throw Error with invalid payload', async () => {
        await expect(
            createStoreCustomer({
                storeId: MAX_DB_INTEGER,
                centsCustomer: { id: MAX_DB_INTEGER },
            }),
        ).to.be.rejected;
    });
});
