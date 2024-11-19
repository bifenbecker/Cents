require('../../testHelper');
const factory = require('../../factories');
const { expect, assert } = require('../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../support/apiTestHelper');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');
const { USER_TYPES } = require('../../../constants/constants');

const apiEndpoint = '/api/v1/live-status/authorize-admin';

describe(`test ${apiEndpoint} API endpoint`, () => {
    describe('should return response without errors', () => {
        describe('when user is admin', () => {
            describe('because he is', () => {
                const makeRequestAs = async (role) => {
                    const business = await factory.create(FN.laundromatBusiness);
                    const user = await factory.create(FN.user);
                    const roleEntity = await factory.create(FN.role, {
                        userType: role,
                    });
                    await factory.create(FN.userRole, {
                        roleId: roleEntity.id,
                        userId: user.id,
                    });
                    const token = generateToken({ id: user.id });
                    const body = {
                        token: {
                            token,
                            businessId: business.id,
                        },
                    };

                    const response = await ChaiHttpRequestHelper.post(apiEndpoint, {}, body);
                    return { response, userId: user.id};
                };

                const assertAdminResponse = (response, userId) => {
                    response.should.have.status(200);
                    expect(response.body).have.property('success', true);
                    expect(response.body)
                        .have.property('isTokenValid')
                        .have.property('id', userId);
                };

                it('business owner', async () => {
                    const owner = await factory.create(FN.user);
                    const business = await factory.create(FN.laundromatBusiness, {
                        userId: owner.id,
                    });
                    const token = generateToken({ id: owner.id });
                    const body = {
                        token: {
                            token,
                            businessId: business.id,
                        },
                    };
                    // request
                    const response = await ChaiHttpRequestHelper.post(apiEndpoint, {}, body);

                    // assert
                    response.should.have.status(200);
                    expect(response.body).have.property('success', true);
                    expect(response.body)
                        .have.property('isTokenValid')
                        .have.property('id', owner.id);
                });

                it('Super Admin', async () => {
                    const { response, userId } = await makeRequestAs('Super Admin');

                    // assert
                    assertAdminResponse(response, userId);
                });

                it('Business Owner', async () => {
                    const { response, userId } = await makeRequestAs('Business Owner');

                    // assert
                    assertAdminResponse(response, userId);
                });

                it('Business Admin', async () => {
                    const { response, userId } = await makeRequestAs('Business Admin');

                    // assert
                    assertAdminResponse(response, userId);
                });

                it('Business Manager', async () => {
                    const { response, userId } = await makeRequestAs('Business Manager');

                    // assert
                    assertAdminResponse(response, userId);
                });
            });
        });

        it('when user is not owner and not admin', async () => {
            const business = await factory.create(FN.laundromatBusiness);
            const user = await factory.create(FN.user);
            const roleEntity = await factory.create(FN.role, {
                userType: USER_TYPES.CUSTOMER,
            });
            await factory.create(FN.userRole, {
                roleId: roleEntity.id,
                userId: user.id,
            });
            const tokenPayload = { id: user.id };
            const token = generateToken(tokenPayload);
            const body = {
                token: {
                    token,
                    businessId: business.id,
                },
            };

            // request
            const response = await ChaiHttpRequestHelper.post(apiEndpoint, {}, body);

            // assert
            response.should.have.status(200);
            expect(response.body).have.property('success', false);
            expect(response.body).have.property('isTokenValid');
            assert.deepInclude(response.body.isTokenValid, tokenPayload);
        });
    });

    describe('should response Error', async () => {
        it('when token.businessId not provided', async () => {
            const body = {
                token: {
                    token: 'token',
                },
            };

            // request
            const response = await ChaiHttpRequestHelper.post(apiEndpoint, {}, body);

            // assert
            response.should.have.status(422);
            expect(response.body).have.property('success', false);
            expect(response.body).have.property(
                'error',
                'No token or business id present in the request',
            );
        });

        it('when token.token not provided', async () => {
            const body = {
                token: {},
            };

            // request
            const response = await ChaiHttpRequestHelper.post(apiEndpoint, {}, body);

            // assert
            response.should.have.status(422);
            expect(response.body).have.property('success', false);
            expect(response.body).have.property(
                'error',
                'No token or business id present in the request',
            );
        });

        it('when token not provided', async () => {
            const body = {};

            // request
            const response = await ChaiHttpRequestHelper.post(apiEndpoint, {}, body);

            // assert
            response.should.have.status(500);
            expect(response.body).have.property('error');
        });
    });
});
