require('../../../testHelper')
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper')
const { generateToken } = require('../../../support/apiTestHelper')
const factory = require('../../../factories')
const { expect } = require('../../../support/chaiHelper')
const { ENDPOINT_URL } = require('./constants');

describe('tests business owner preferences api', () => {
    describe('test get preferences', () => {

        describe('when auth token validation fails', () => {
            it('should respond with a 401 code when token is empty', async () => {
                const res = await ChaiHttpRequestHepler.get(`${ENDPOINT_URL}`)
                    .set('authtoken', '');
                res.should.have.status(401);
            });

            it('should respond with a 403 when token is invalid', async () => {
                const token = await generateToken({ id: 100 });
                const res = await ChaiHttpRequestHepler.get(`${ENDPOINT_URL}`)
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


            describe('when there are no preferences available', () => {
                it('should successfully return an empty array', async () => {
                    const res = await ChaiHttpRequestHepler.get(`${ENDPOINT_URL}`)
                        .set('authtoken', token);
                    res.should.have.status(200);
                    res.body.preferences.should.be.empty;
                });
            });

            describe('when there preferences available', () => {
                it('should successfully return the preferences', async () => {
                    const preferences = await factory.createMany("customerPrefOptions", 5, {businessId: business.id}, {applyOnCreateOnly: true} );
                    const res = await ChaiHttpRequestHepler.get(`${ENDPOINT_URL}`)
                        .set('authtoken', token);
                    res.should.have.status(200);

                    for (const pref of preferences){
                        const resPref = res.body.preferences.find(p => p.id === pref.id);
                        expect(resPref).to.deep.include(pref);
                    }


                });
            });
        });
    });
});
