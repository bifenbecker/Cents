require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

describe('test /api/v1/employee-tab/sign-in', () => {
    const apiEndPoint = '/api/v1/employee-tab/sign-in';

    describe('test signIn API status error codes', () => {
        let business;
        beforeEach(async () => {
            business = await factory.create('laundromatBusiness');
        });

        it('should return a 422 error code for password being empty', async () => {
            const payload = { storeId: 0, password: '', residence: '' };
            const res = await await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload).set(
                'authToken',
                '',
            );

            res.should.have.status(422);
            expect(JSON.parse(res.text)).to.deep.equal({
                error: '"password" is not allowed to be empty',
            });
        });

        it('should return a 403 error code for invalid store id', async () => {
            const payload = { storeId: 100, password: 'asdf', residence: '' };
            const res = await await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload).set(
                'authToken',
                '',
            );

            res.should.have.status(403);
            expect(res.body.success).to.be.false;
            expect(res.body.error).to.equal('Invalid store id.');
        });

        it("should return a 409 error code when a store password isn't set up", async () => {
            const store = await factory.create('store', { businessId: business.id, password: '' });
            const payload = { storeId: store.id, password: 'asdf', residence: '' };
            const res = await await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload).set(
                'authToken',
                '',
            );

            res.should.have.status(409);
            expect(res.body.success).to.be.false;
            expect(res.body.error).to.equal(
                'Please set password using our business manager app to log in.',
            );
        });

        it('should return a 403 error code for invalid store password', async () => {
            const store = await factory.create('store', {
                businessId: business.id,
                password: 'password1',
            });
            const payload = { storeId: store.id, password: 'asdf', residence: '' };
            const res = await await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload).set(
                'authToken',
                '',
            );

            res.should.have.status(403);
            expect(res.body.success).to.be.false;
            expect(res.body.error).to.equal('Invalid password.');
        });

        it('should return a 403 error code when location is residential but residence key is false', async () => {
            const store = await factory.create('store', {
                businessId: business.id,
                password: 'password1',
                type: 'RESIDENTIAL',
            });
            const payload = { storeId: store.id, password: 'password1', residence: false };
            const res = await await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload).set(
                'authToken',
                '',
            );

            res.should.have.status(403);
            expect(res.body.success).to.be.false;
            expect(res.body.error).to.equal('Please login using residential app');
        });

        it('should return a 403 error code when location is NOT residential but residence key is true', async () => {
            const store = await factory.create('store', {
                businessId: business.id,
                password: 'password1',
                type: 'STANDALONE',
            });
            const payload = { storeId: store.id, password: 'password1', residence: true };
            const res = await await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload).set(
                'authToken',
                '',
            );

            res.should.have.status(403);
            expect(res.body.success).to.be.false;
            expect(res.body.error).to.equal('Please login using employee app');
        });
    });

    describe('test signIn API return values', async () => {
        let business;
        beforeEach(async () => {
            business = await factory.create('laundromatBusiness');
        });

        it('should return a 200 and proper return data when signing into RESIDENTIAL app', async () => {
            const store = await factory.create('store', {
                businessId: business.id,
                password: 'password1',
                type: 'RESIDENTIAL',
            });
            const payload = { storeId: store.id, password: 'password1', residence: true };
            const res = await await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload).set(
                'authToken',
                '',
            );

            res.should.have.status(200);

            expect(res.body).to.have.all.keys(
                'success',
                'token',
                'name',
                'address',
                'city',
                'state',
                'type',
                'zipCode',
                'isHub',
                'id',
                'subsidiaryCode',
                'processingCapability',
            );

            expect(res.body.success).to.be.true;
            expect(res.body.id).to.equal(store.id);
            expect(res.body.name).to.equal(store.name);
            expect(res.body.address).to.equal(store.address);
            expect(res.body.city).to.equal(store.city);
            expect(res.body.state).to.equal(store.state);
            expect(res.body.type).to.equal(store.type);
            expect(res.body.zipCode).to.equal(store.zipCode);

            expect(res.body).to.not.deep.equal({});
            expect(res.body.token).to.be.a('string');
        });

        it('should return a 200 and proper return data when signing into EMPLOYEE app', async () => {
            const store = await factory.create('store', {
                businessId: business.id,
                password: 'password1',
                type: 'STANDALONE',
            });
            const payload = { storeId: store.id, password: 'password1', residence: false };
            const res = await await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload).set(
                'authToken',
                '',
            );

            res.should.have.status(200);

            expect(res.body).to.have.all.keys(
                'success',
                'token',
                'name',
                'address',
                'city',
                'state',
                'type',
                'zipCode',
                'isHub',
                'id',
                'subsidiaryCode',
                'processingCapability',
            );

            expect(res.body.success).to.be.true;
            expect(res.body.id).to.equal(store.id);
            expect(res.body.name).to.equal(store.name);
            expect(res.body.address).to.equal(store.address);
            expect(res.body.city).to.equal(store.city);
            expect(res.body.state).to.equal(store.state);
            expect(res.body.type).to.equal(store.type);
            expect(res.body.zipCode).to.equal(store.zipCode);

            expect(res.body).to.not.deep.equal({});
            expect(res.body.token).to.be.a('string');
        });
    });
});
