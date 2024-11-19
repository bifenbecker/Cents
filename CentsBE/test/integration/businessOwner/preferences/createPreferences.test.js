require('../../../testHelper')
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper')
const { generateToken } = require('../../../support/apiTestHelper')
const factory = require('../../../factories')
const Preferences = require('../../../../models/customerPrefOptions')
const { expect } = require('../../../support/chaiHelper')
const { ENDPOINT_URL } = require('./constants');

describe('tests business owner preferences api', () => {
    describe('test create preferences', () => {

        describe('when auth token validation fails', () => {
            it('should respond with a 401 code when token is empty', async () => {
                const preference = await factory.build('customerPrefOptions')
                const res = await ChaiHttpRequestHepler.post(`${ENDPOINT_URL}`, {}, preference)
                    .set('authtoken', '');
                res.should.have.status(401);
            });

            it('should respond with a 403 when token is invalid', async () => {
                const token = await generateToken({ id: 100 });
                const preference = await factory.build('customerPrefOptions');
                const res = await ChaiHttpRequestHepler.post(`${ENDPOINT_URL}`, {}, preference)
                    .set('authtoken', token);
                res.should.have.status(403);
            });
        });

        describe('when auth token is valid', () => {
            let token;
            let business;

            beforeEach(async () => {
                await factory.create('role', { userType: "Business Owner" });
                const user = await factory.create('userWithBusinessOwnerRole');
                business = await factory.create('laundromatBusiness', { userId: user.id });
                token = await generateToken({ id: user.id })
            });


            describe('when payload is invalid', () => {
                it('should respond with a 400 code when a property is not expected', async () => {
                    const preference = await factory.build('customerPrefOptions', { businessId: business.id });
                    preference.unexpectedProp = 42;

                    const res = await ChaiHttpRequestHepler.post(`${ENDPOINT_URL}`, {}, [preference])
                        .set('authtoken', token);

                    res.should.have.status(400);
                });

                it('should respond with a 400 code when a type is different than "multi" or "single"', async () => {
                    const preference = await factory.build('customerPrefOptions', { businessId: business.id });

                    preference.type = "multiple";
                    let res = await ChaiHttpRequestHepler.post(`${ENDPOINT_URL}`, {}, [preference])
                        .set('authtoken', token);
                    res.should.have.status(400);

                    preference.type = "multi";
                    res = await ChaiHttpRequestHepler.post(`${ENDPOINT_URL}`, {}, [preference])
                        .set('authtoken', token);
                    res.should.have.status(201);
                });
            });

            describe('when payload is valid', () => {
                it('should add a new preference successfully', async () => {
                    const preference = await factory.build('customerPrefOptions', { businessId: business.id });

                    const countQueryBeforePost = await Preferences.query().count();
                    const countBefore = parseInt(countQueryBeforePost[0].count, 10);
                    const res = await ChaiHttpRequestHepler.post(`${ENDPOINT_URL}`, {}, [preference])
                        .set('authtoken', token);
                    res.should.have.status(201);

                    const countQueryAfterPost = await Preferences.query().count()
                    const countAfter = parseInt(countQueryAfterPost[0].count, 10);

                    expect(countAfter).equal(countBefore + 1);
                });

                it('should return the new preference', async () => {
                    const preference = await factory.build('customerPrefOptions', { businessId: business.id });
                    const res = await ChaiHttpRequestHepler.post(`${ENDPOINT_URL}`, {}, [preference])
                        .set('authtoken', token);
                    preference.options = JSON.stringify(preference.options);
                    expect(res.body.preferences[0]).to.include(preference);
                });

                it('should add multiple preferences successfully', async () => {
                    const count = 5;
                    const preferences = await factory.buildMany('customerPrefOptions', count, { businessId: business.id });
                    const countQueryBeforePost = await Preferences.query().count();
                    const countBefore = parseInt(countQueryBeforePost[0].count, 10);
                    const res = await ChaiHttpRequestHepler.post(`${ENDPOINT_URL}`, {}, preferences)
                        .set('authtoken', token);
                    res.should.have.status(201);
                    const countQueryAfterPost = await Preferences.query().count()
                    const countAfter = parseInt(countQueryAfterPost[0].count, 10);

                    expect(countAfter).equal(countBefore + count);
                });

                it('should return the new preferences', async () => {
                    const count = 5;
                    let preferences = await factory.buildMany('customerPrefOptions', count, { businessId: business.id });
                    const res = await ChaiHttpRequestHepler.post(`${ENDPOINT_URL}`, {}, preferences)
                        .set('authtoken', token);

                    preferences.forEach(pref => pref.options = JSON.stringify(pref.options));

                    for (let i = 0; i < preferences.length; i++) {
                        expect(res.body.preferences[i]).to.include(preferences[i]);
                    }
                });
            });
        });
    });
});
