require('../../../testHelper')
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper')
const { generateToken } = require('../../../support/apiTestHelper')
const factory = require('../../../factories')
const { expect } = require('../../../support/chaiHelper')
const { ENDPOINT_URL } = require('./constants');

describe('tests business owner preferences api', () => {
    describe('tests update preference', async () => {
        let preferenceToUpdate;
        let business;
        let user;

        beforeEach(async () => {
            await factory.create('role', { userType: "Business Owner" });
            user = await factory.create('userWithBusinessOwnerRole');
            business = await factory.create('laundromatBusiness', { userId: user.id });
            preferenceToUpdate = await factory.create('customerPrefOptions', {businessId: business.id}, {applyOnCreateOnly: true});
        });

        describe('when auth token is invalid', () => {
            it('should respond with a 401 code when token is empty', async () => {
                const res = await ChaiHttpRequestHepler.patch(`${ENDPOINT_URL}${business.id}/${preferenceToUpdate.id}`, {}, preferenceToUpdate)
                    .set('authtoken', '');
                res.should.have.status(401);
            });

            it('should respond with a 403 when token is invalid', async () => {
                const token = await generateToken({ id: 100 });
                const res = await ChaiHttpRequestHepler.patch(`${ENDPOINT_URL}${business.id}/${preferenceToUpdate.id}`, {}, preferenceToUpdate)
                    .set('authtoken', token);
                res.should.have.status(403);
            });
        });

        describe('when auth token is valid', () => {
            let token;

            beforeEach(async () => {
                token = await generateToken({id: user.id});
            });

            describe('when rest params are invalid', () => {
                it('should respond with 404 code', async () => {
                    let res = await ChaiHttpRequestHepler.patch(`${ENDPOINT_URL}42/${preferenceToUpdate.id}`, {}, preferenceToUpdate)
                        .set('authtoken', token);
                    res.should.have.status(404);

                    res = await ChaiHttpRequestHepler.patch(`${ENDPOINT_URL}${business.id}/42`, {}, preferenceToUpdate)
                        .set('authtoken', token);
                    res.should.have.status(404);
                });
            });

            describe('when rest params are valid', () => {
                describe('when payload is invalid', () => {
                    it('should respond with a 400 code', async () => {
                        let preference = {...preferenceToUpdate};
                        delete preference.id;
                        let res = await ChaiHttpRequestHepler.patch(`${ENDPOINT_URL}${business.id}/${preferenceToUpdate.id}`, {}, preference)
                            .set('authtoken', token);
                        res.should.have.status(400);

                        preference = {...preferenceToUpdate};
                        preference.type = "mul";
                        res = await ChaiHttpRequestHepler.patch(`${ENDPOINT_URL}${business.id}/${preferenceToUpdate.id}`, {}, preference)
                            .set('authtoken', token);
                        res.should.have.status(400);

                        preference = {...preferenceToUpdate};
                        preference.options[0].isDefault = 42;
                        res = await ChaiHttpRequestHepler.patch(`${ENDPOINT_URL}${business.id}/${preferenceToUpdate.id}`, {}, preference)
                            .set('authtoken', token);
                        res.should.have.status(400);
                    });
                });

                describe('when payload is valid', () => {
                    it('should update the preference successfully', async () => {

                        const fieldName = "new name";
                        let res = await ChaiHttpRequestHepler.patch(`${ENDPOINT_URL}${business.id}/${preferenceToUpdate.id}`, {}, {...preferenceToUpdate, fieldName})
                            .set('authtoken', token);
                        res.should.have.status(200);
                        expect(res.body.preference).to.deep.include({...preferenceToUpdate, fieldName});
                    });
                });
            });
        });
    });
});
