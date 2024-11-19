const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const dotenv = require('dotenv');

describe('test /api/v1/employee-tab/scale-device/store/attach', () => {
    const apiAttachEndPoint = '/api/v1/employee-tab/scandit';

    let token;

    beforeEach(async () => {
        await factory.create('role', { userType: 'Business Owner' });
        const user = await factory.create('userWithBusinessOwnerRole');
        const business = await factory.create('laundromatBusiness', { userId: user.id });
        const store = await factory.create('store', { businessId: business.id });
        token = await generateToken({ id: store.id });
    });

    describe('fails to return scandit token', async () => {
        it('should fail when there is no token', async () => {
            const res = await ChaiHttpRequestHelper.get(apiAttachEndPoint).set('authtoken', '');
            const { error } = JSON.parse(res.text);

            res.should.have.status(401);
            expect(error).to.equal('Please sign in to proceed.');
        });

        it('should fail when token is not correct', async () => {
            const res = await ChaiHttpRequestHelper.get(apiAttachEndPoint).set(
                'authtoken',
                token + '12334123',
            );
            const { error } = JSON.parse(res.text);

            res.should.have.status(401);
            expect(error).to.equal('Invalid token.');
        });

        it('should fail when token is number', async () => {
            const res = await ChaiHttpRequestHelper.get(apiAttachEndPoint).set('authtoken', 123342);
            const { error } = JSON.parse(res.text);

            res.should.have.status(401);
            expect(error).to.equal('Invalid token.');
        });
    });

    describe('returns scandit token', async () => {
        // use the .env.test file
        const envData = dotenv.config({ path: './.env.test' });

        it('should return scandit token with correct token', async () => {
            const res = await ChaiHttpRequestHelper.get(apiAttachEndPoint).set('authtoken', token);
            const text = JSON.parse(res.text);

            expect(text.token).to.be.a('string');
            expect(text.token).to.have.lengthOf(envData.parsed.SCANDIT_KEY.length);
            expect(text.token).to.equal(envData.parsed.SCANDIT_KEY);
        });
    });
});
