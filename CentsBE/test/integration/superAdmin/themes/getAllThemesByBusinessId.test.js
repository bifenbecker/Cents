require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const chaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { MAX_DB_INTEGER } = require('../../../constants/dbValues');

const getApiEndpoint = (businessId = '') => `/api/v1/super-admin/themes/${businessId}`;

describe('test getAllThemesByBusinessId endpoint', () => {
    let authToken;

    beforeEach(async () => {
        await factory.create('role', { userType: 'Super Admin' });
        const user = await factory.create('userWithSuperAdminRole');
        authToken = generateToken({ id: user.id });
    });

    describe('should return correct response', () => {
        it('with uniq themes, BusinessTheme and  StoreThemes', async () => {
            const business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
            await factory.createMany(FACTORIES_NAMES.storeTheme, 3, {
                businessId: business.id,
            });
            await factory.createMany(FACTORIES_NAMES.storeTheme, 2, {
                borderRadius: '15px',
                businessId: business.id,
            });

            const apiEndpoint = getApiEndpoint(business.id);
            const res = await chaiHttpRequestHelper.get(apiEndpoint).set('authtoken', authToken);

            expect(res.status).equal(200);
            expect(res.body).have.property('themes').to.be.an('array').to.have.length(2);
            expect(res.body.themes[0])
                .have.property('appliedTo')
                .to.be.an('array')
                .to.have.length(4);
            expect(res.body.themes[0].appliedTo[0]?.isBusinessTheme).to.be.true;
            expect(res.body.themes[1].appliedTo).to.have.length(2);
        });
    });

    describe('should return error response', () => {
        it('with incorrect businessId', async () => {
            const apiEndpoint = getApiEndpoint(MAX_DB_INTEGER);
            const res = await chaiHttpRequestHelper.get(apiEndpoint).set('authtoken', authToken);

            expect(res.status).equal(500);
        });
    });
});
