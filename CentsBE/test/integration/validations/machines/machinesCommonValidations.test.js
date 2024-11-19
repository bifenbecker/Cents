require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const {
    getBusinessId,
    validateStores,
} = require('../../../../validations/machines/machinesCommonValidations');

describe('test machinesCommonValidations', () => {
    describe('test getBusinessId', () => {
        it('should return business id for current user', async () => {
            const user = await factory.create('userWithBusinessOwnerRole'),
                business = await factory.create('laundromatBusiness', { userId: user.id });

            user.role = 'Business Owner';

            const req = {
                currentUser: user,
            };

            const result = await getBusinessId(req);

            expect(result).to.equal(business.id);
        });

        it('should return business id for current store', async () => {
            const store = await factory.create('store');

            const req = {
                currentStore: store,
            };

            const result = await getBusinessId(req);

            expect(result).to.equal(store.businessId);
        });
    });

    describe('test validateStores', () => {
        let business;

        beforeEach(async () => {
            business = await factory.create('laundromatBusiness');
        });

        it('should pass validation', async () => {
            const store1 = await factory.create('store', {
                    businessId: business.id,
                }),
                store2 = await factory.create('store', {
                    businessId: business.id,
                });

            await expect(validateStores([store1.id, store2.id], business.id)).to.not.be.rejected;
        });

        it('should be rejected if some of the stores from another business', async () => {
            const store1 = await factory.create('store', {
                    businessId: business.id,
                }),
                store2 = await factory.create('store');

            await expect(validateStores([store1.id, store2.id], business.id)).to.be.rejectedWith(
                'Invalid store id(s).',
            );
        });
    });
});
