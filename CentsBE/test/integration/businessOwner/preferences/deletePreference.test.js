require('../../../testHelper')
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper')
const { generateToken } = require('../../../support/apiTestHelper')
const factory = require('../../../factories')
const { expect } = require('../../../support/chaiHelper')
const { ENDPOINT_URL } = require('./constants');

describe('tests business owner preferences api', () => {
    describe('tests delete preference', () => {
        let preferenceToDelete;
        let business;
        let user;

        beforeEach(async () => {
            await factory.create('role', { userType: "Business Owner" });
            user = await factory.create('userWithBusinessOwnerRole');
            business = await factory.create('laundromatBusiness', { userId: user.id });
            preferenceToDelete = await factory.create('customerPrefOptions', { businessId: business.id }, { applyOnCreateOnly: true });
        });

        describe('when auth token is invalid', () => {
            it('should respond with a 401 code when token is empty', async () => {
                const res = await ChaiHttpRequestHepler.delete(`${ENDPOINT_URL}${preferenceToDelete.businessId}/${preferenceToDelete.id}`)
                    .set('authtoken', '');
                res.should.have.status(401);
            });

            it('should respond with a 403 when token is invalid', async () => {
                const token = await generateToken({ id: 100 });
                const res = await ChaiHttpRequestHepler.delete(`${ENDPOINT_URL}${preferenceToDelete.businessId}/${preferenceToDelete.id}`)
                    .set('authtoken', token);
                res.should.have.status(403);
            });
        });

        describe('when auth token is valid', () => {
            let token;

            beforeEach(async () => {
                token = await generateToken({ id: user.id });
            });

            describe('when rest params are invalid', () => {
                it('should respond with 404 code', async () => {
                    let res = await ChaiHttpRequestHepler.delete(`${ENDPOINT_URL}42/${preferenceToDelete.id}`)
                        .set('authtoken', token);
                    res.should.have.status(404);

                    res = await ChaiHttpRequestHepler.delete(`${ENDPOINT_URL}${preferenceToDelete.businessId}/42`)
                        .set('authtoken', token);
                    res.should.have.status(404);
                });
            });

            describe('when rest params are valid', () => {
                it('should delete the preference successfully', async () => {
                    let res = await ChaiHttpRequestHepler.delete(`${ENDPOINT_URL}${preferenceToDelete.businessId}/${preferenceToDelete.id}`)
                        .set('authtoken', token);
                    res.should.have.status(200);
                    expect(res.body.preference).to.deep.include(preferenceToDelete);
                });
            });
        });
    });
});
