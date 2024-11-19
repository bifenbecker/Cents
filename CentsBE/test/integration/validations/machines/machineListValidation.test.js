require('../../../testHelper');

const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { expect } = require('../../../support/chaiHelper');
const {
    createMiddlewareMockedArgs,
} = require('../../../support/mockers/createMiddlewareMockedArgs');
const machinesListValidation = require('../../../../validations/machines/machinesListValidation');
const { deviceStatuses, USER_TYPES } = require('../../../../constants/constants');
const User = require('../../../../models/user');

describe('machinesListValidation function test', () => {
    let user, business, store, batch, device;

    beforeEach(async () => {
        user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness, { userId: user.id });
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        batch = await factory.create(FACTORIES_NAMES.batch, {
            storeId: store.id,
            businessId: business.id,
        });
        device = await factory.create(FACTORIES_NAMES.device, {
            batchId: batch.id,
            isActive: true,
            isPaired: false,
            status: deviceStatuses.ONLINE,
            name: '66:cc:88:dd'
        });
    });

    describe('when type validation is not passed', () => {
        describe('when "storeIds" param does not pass the type validations', () => {
            it('should return 422 response when param is not provided', async () => {
                const req = {
                    query: {
                        page: '1',
                        limit: 25,
                    },
                };
                const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                await machinesListValidation(mockedReq, mockedRes, mockedNext);

                expect(mockedRes.status.calledWith(422)).to.be.true;
                expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
                expect(mockedNext.called, 'should not call next()').to.be.false;
            });

            it('should return 422 response when param is not array', async () => {
                const req = {
                    query: {
                        page: '1',
                        limit: 25,
                        storeIds: store.id,
                    },
                };
                const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                await machinesListValidation(mockedReq, mockedRes, mockedNext);

                expect(mockedRes.status.calledWith(422)).to.be.true;
                expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
                expect(mockedNext.called, 'should not call next()').to.be.false;
            });

            it('should return 422 response when param is an array with negative numbers', async () => {
                const req = {
                    query: {
                        page: 1,
                        limit: 25,
                        storeIds: ['-76', '-9'],
                    },
                };
                const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                await machinesListValidation(mockedReq, mockedRes, mockedNext);

                expect(mockedRes.status.calledWith(422)).to.be.true;
                expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
                expect(mockedNext.called, 'should not call next()').to.be.false;
            });

            it('should return 422 response when param is an array with string format values', async () => {
                const req = {
                    query: {
                        page: 1,
                        limit: 25,
                        storeIds: ['sfs', 'a'],
                    },
                };
                const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                await machinesListValidation(mockedReq, mockedRes, mockedNext);

                expect(mockedRes.status.calledWith(422)).to.be.true;
                expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
                expect(mockedNext.called, 'should not call next()').to.be.false;
            });

            it('should return 422 response when param is an array with float values', async () => {
                const req = {
                    query: {
                        page: 1,
                        limit: 25,
                        storeIds: ['24.6', '98.1'],
                    },
                };
                const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                await machinesListValidation(mockedReq, mockedRes, mockedNext);

                expect(mockedRes.status.calledWith(422)).to.be.true;
                expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
                expect(mockedNext.called, 'should not call next()').to.be.false;
            });
        });

        describe('when "page" param does not pass the type validations', () => {
            it('should return 422 response when param is not provided', async () => {
                const req = {
                    query: {
                        limit: 25,
                        storeIds: [store.id],
                    },
                };
                const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                await machinesListValidation(mockedReq, mockedRes, mockedNext);

                expect(mockedRes.status.calledWith(422)).to.be.true;
                expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
                expect(mockedNext.called, 'should not call next()').to.be.false;
            });

            it('should return 422 response when param is negative integer', async () => {
                const req = {
                    query: {
                        page: '-1',
                        limit: 25,
                        storeIds: [store.id],
                    },
                };
                const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                await machinesListValidation(mockedReq, mockedRes, mockedNext);

                expect(mockedRes.status.calledWith(422)).to.be.true;
                expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
                expect(mockedNext.called, 'should not call next()').to.be.false;
            });

            it('should return 422 response when param is equal "0"', async () => {
                const req = {
                    query: {
                        page: '0',
                        limit: 25,
                        storeIds: [store.id],
                    },
                };
                const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                await machinesListValidation(mockedReq, mockedRes, mockedNext);

                expect(mockedRes.status.calledWith(422)).to.be.true;
                expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
                expect(mockedNext.called, 'should not call next()').to.be.false;
            });

            it('should return 422 response when param is with float value', async () => {
                const req = {
                    query: {
                        page: '4.7',
                        limit: 25,
                        storeIds: [store.id],
                    },
                };
                const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                await machinesListValidation(mockedReq, mockedRes, mockedNext);

                expect(mockedRes.status.calledWith(422)).to.be.true;
                expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
                expect(mockedNext.called, 'should not call next()').to.be.false;
            });

            it('should return 422 response when param is with letters', async () => {
                const req = {
                    query: {
                        page: 'sda',
                        limit: 25,
                        storeIds: [store.id],
                    },
                };
                const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                await machinesListValidation(mockedReq, mockedRes, mockedNext);

                expect(mockedRes.status.calledWith(422)).to.be.true;
                expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
                expect(mockedNext.called, 'should not call next()').to.be.false;
            });
        });

        describe('when "type" param does not pass the type validations', () => {
            it('should return 422 response when param is with not allowed value', async () => {
                const req = {
                    query: {
                        limit: 25,
                        storeIds: [store.id],
                        type: 'HYDRO-WASHER'
                    },
                };
                const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                await machinesListValidation(mockedReq, mockedRes, mockedNext);

                expect(mockedRes.status.calledWith(422)).to.be.true;
                expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
                expect(mockedNext.called, 'should not call next()').to.be.false;
            });
        });

        describe('when "keyword" param does not pass the type validations', () => {
            it('should return 422 response when param is a number', async () => {
                const req = {
                    query: {
                        limit: 25,
                        storeIds: [store.id],
                        keyword: '45'
                    },
                };
                const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                await machinesListValidation(mockedReq, mockedRes, mockedNext);

                expect(mockedRes.status.calledWith(422)).to.be.true;
                expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
                expect(mockedNext.called, 'should not call next()').to.be.false;
            });
        });

        describe('when "unPairedDevicesCount" param does not pass the type validations', () => {
            it('should return 422 response when param is a random string', async () => {
                const req = {
                    query: {
                        limit: 25,
                        storeIds: [store.id],
                        unPairedDevicesCount: 'rango'
                    },
                };
                const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                await machinesListValidation(mockedReq, mockedRes, mockedNext);

                expect(mockedRes.status.calledWith(422)).to.be.true;
                expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
                expect(mockedNext.called, 'should not call next()').to.be.false;
            });

            it('should return 422 response when param is a number', async () => {
                const req = {
                    query: {
                        limit: 25,
                        storeIds: [store.id],
                        unPairedDevicesCount: '56'
                    },
                };
                const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                await machinesListValidation(mockedReq, mockedRes, mockedNext);

                expect(mockedRes.status.calledWith(422)).to.be.true;
                expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
                expect(mockedNext.called, 'should not call next()').to.be.false;
            });
        });

        describe('when "isPaired" param does not pass the type validations', () => {
            it('should return 422 response when param is a random string', async () => {
                const req = {
                    query: {
                        limit: 25,
                        storeIds: [store.id],
                        unPairedDevicesCount: 'rango'
                    },
                };
                const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                await machinesListValidation(mockedReq, mockedRes, mockedNext);

                expect(mockedRes.status.calledWith(422)).to.be.true;
                expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
                expect(mockedNext.called, 'should not call next()').to.be.false;
            });

            it('should return 422 response when param is a number', async () => {
                const req = {
                    query: {
                        limit: 25,
                        storeIds: [store.id],
                        unPairedDevicesCount: '56'
                    },
                };
                const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                await machinesListValidation(mockedReq, mockedRes, mockedNext);

                expect(mockedRes.status.calledWith(422)).to.be.true;
                expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
                expect(mockedNext.called, 'should not call next()').to.be.false;
            });
        });

        describe('when "limit" param does not pass the type validations', () => {
            it('should return 422 response when param is negative integer', async () => {
                const req = {
                    query: {
                        page: '-1',
                        limit: 25,
                        storeIds: [store.id],
                    },
                };
                const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                await machinesListValidation(mockedReq, mockedRes, mockedNext);

                expect(mockedRes.status.calledWith(422)).to.be.true;
                expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
                expect(mockedNext.called, 'should not call next()').to.be.false;
            });

            it('should return 422 response when param is equal "0"', async () => {
                const req = {
                    query: {
                        page: '0',
                        limit: 25,
                        storeIds: [store.id],
                    },
                };
                const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                await machinesListValidation(mockedReq, mockedRes, mockedNext);

                expect(mockedRes.status.calledWith(422)).to.be.true;
                expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
                expect(mockedNext.called, 'should not call next()').to.be.false;
            });

            it('should return 422 response when param is with float value', async () => {
                const req = {
                    query: {
                        page: '4.7',
                        limit: 25,
                        storeIds: [store.id],
                    },
                };
                const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                await machinesListValidation(mockedReq, mockedRes, mockedNext);

                expect(mockedRes.status.calledWith(422)).to.be.true;
                expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
                expect(mockedNext.called, 'should not call next()').to.be.false;
            });

            it('should return 422 response when param is with letters', async () => {
                const req = {
                    query: {
                        page: 'sda',
                        limit: 25,
                        storeIds: [store.id],
                    },
                };
                const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

                await machinesListValidation(mockedReq, mockedRes, mockedNext);

                expect(mockedRes.status.calledWith(422)).to.be.true;
                expect(mockedRes.json.getCall(0).args[0]).to.have.property('error');
                expect(mockedNext.called, 'should not call next()').to.be.false;
            });
        });
    });

    describe('when type validation is passed', () => {
        it('should call next with error is passed stores are not belonged to the current user business', async () => {
            const userSecond = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
            const businessSecond = await factory.create(FACTORIES_NAMES.laundromatBusiness, { userId: userSecond.id });
            const storeSecond = await factory.create(FACTORIES_NAMES.store, {
                businessId: businessSecond.id,
            });

            const userExpected = await User.query().findById(user.id);
            userExpected.role = USER_TYPES.BUSINESS_OWNER;

            const req = {
                query: {
                    page: '1',
                    limit: 25,
                    storeIds: [store.id, storeSecond.id],
                },
                currentUser: userExpected,
            };

            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            await machinesListValidation(mockedReq, mockedRes, mockedNext);

            expect(mockedNext.lastCall.firstArg, 'should be instance of Error').to.be.instanceOf(Error);
            expect(mockedNext.called, 'should call next(error)').to.be.true;
        });

        it('should attach constants to req and call next()', async () => {
            const userExpected = await User.query().findById(user.id);
            userExpected.role = USER_TYPES.BUSINESS_OWNER;

            const req = {
                query: {
                    page: '1',
                    limit: 25,
                    storeIds: [store.id],
                },
                currentUser: userExpected,
            };

            const { mockedReq, mockedRes, mockedNext } = createMiddlewareMockedArgs(req);

            await machinesListValidation(mockedReq, mockedRes, mockedNext);

            expect(mockedNext.called, 'should call next()').to.be.true;
            expect(mockedNext.lastCall.firstArg).to.deep.equal(undefined);
            expect(mockedReq).to.have.property('constants').to.deep.equal({
                businessId: business.id,
            });
        });
    });
});
