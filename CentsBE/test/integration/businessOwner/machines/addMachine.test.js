require('../../../testHelper')
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper')
const { generateToken } = require('../../../support/apiTestHelper')
const factory = require('../../../factories')
const faker = require('faker');
const { expect } = require('../../../support/chaiHelper')
const { NETWORKED_ENDPOINT_URL, OFFLINE_ENDPOINT_URL } = require('./constants');

describe('tests business owner machines api', () => {
    let store, type, model;

    beforeEach(async () => {
        store = await factory.create('store');
        type = await factory.create('machineType', {
            name: "WASHER"
        })

        model = await factory.create('machineModel', {
            typeId: type.id
        });
    })

    describe('test add networked machine', () => {

        describe('when auth token validation fails', () => {
            it('should respond with a 401 code when token is empty', async () => {
                const request = {
                    "storeId": 1,
                    "modelId": 2,
                    "name": "177",
                    "pricePerTurnInCents": 14
                };

                const res = await ChaiHttpRequestHepler.post(`${NETWORKED_ENDPOINT_URL}`, {}, request)
                    .set('authtoken', '');
                res.should.have.status(401);
            });

            it('should respond with a 403 when token is invalid', async () => {
                const token = await generateToken({ id: 100 });
                const request = {
                    "storeId": 1,
                    "modelId": 2,
                    "name": "177",
                    "pricePerTurnInCents": 14
                };

                const res = await ChaiHttpRequestHepler.post(`${NETWORKED_ENDPOINT_URL}`, {}, request)
                    .set('authtoken', token);
                res.should.have.status(403);
            });
        });

        describe('when auth token is valid', () => {
            let token, business, rightStore, machine;

            beforeEach(async () => {
                await factory.create('role', { userType: "Business Owner" });
                const user = await factory.create('userWithBusinessOwnerRole');
                business = await factory.create('laundromatBusiness', { userId: user.id });
                token = await generateToken({ id: user.id })
                rightStore = await factory.create('store', { businessId: business.id })
                machine = await factory.create('machine', { serialNumber: 'test'})
            });

            describe('when payload is valid', () => {
                it('should respond with a 200 when everything is alright', async () => {
                    const request = {
                        "storeId": rightStore.id,
                        "modelId": model.id,
                        "name": "177",
                        "pricePerTurnInCents": 14
                    };
                    const res = await ChaiHttpRequestHepler.post(`${NETWORKED_ENDPOINT_URL}`, {}, request)
                        .set('authtoken', token);

                    res.should.have.status(200);
                    expect(res.body.machineId).to.not.be.undefined;
                });
            });

            describe('when payload is invalid', () => {
                it('should respond with a 409 code when store id not correspond to user', async () => {
                    const request = {
                        "storeId": store.id,
                        "modelId": model.id,
                        "name": "177",
                        "pricePerTurnInCents": 14
                    };
                    const res = await ChaiHttpRequestHepler.post(`${NETWORKED_ENDPOINT_URL}`, {}, request)
                        .set('authtoken', token);

                    res.should.have.status(409);
                });

                it('should respond with a 422 when model ID is not provided', async () => {
                    const request = {
                        "storeId": rightStore.id,
                        "name": "177",
                        "pricePerTurnInCents": 14
                    };
                    const res = await ChaiHttpRequestHepler.post(`${NETWORKED_ENDPOINT_URL}`, {}, request)
                        .set('authtoken', token);

                    res.should.have.status(422);
                });

                it('should respond with a 409 when provided serial code too long', async () => {
                    const request = {
                        "storeId": rightStore.id,
                        "modelId": model.id,
                        "name": "177",
                        "pricePerTurnInCents": 14,
                        "serialNumber": faker.lorem.words(50)
                    };
                    const res = await ChaiHttpRequestHepler.post(`${NETWORKED_ENDPOINT_URL}`, {}, request)
                        .set('authtoken', token);

                    res.should.have.status(409);
                });

                it('should respond with a 409 when provided serial code already exist', async () => {
                    const request = {
                        "storeId": rightStore.id,
                        "modelId": model.id,
                        "name": "177",
                        "pricePerTurnInCents": 14,
                        "serialNumber": machine.serialNumber
                    };
                    const res = await ChaiHttpRequestHepler.post(`${NETWORKED_ENDPOINT_URL}`, {}, request)
                        .set('authtoken', token);

                    res.should.have.status(409);
                });
            });
        });
    });

    describe('test add offline machine', () => {

        describe('when auth token validation fails', () => {
            it('should respond with a 401 code when token is empty', async () => {
                const request = {
                    "storeId": 1,
                    "capacity": "30",
                    "modelName": "LG, mix",
                    "machineType": "WASHER",
                    "name": "126",
                    "pricePerTurnInCents": 500
                }

                const res = await ChaiHttpRequestHepler.post(`${OFFLINE_ENDPOINT_URL}`, {}, request)
                    .set('authtoken', '');
                res.should.have.status(401);
            });

            it('should respond with a 403 when token is invalid', async () => {
                const token = await generateToken({ id: 100 });
                const request = {
                    "storeId": 1,
                    "capacity": "30",
                    "modelName": "LG, mix",
                    "machineType": "WASHER",
                    "name": "126",
                    "pricePerTurnInCents": 500
                }

                const res = await ChaiHttpRequestHepler.post(`${OFFLINE_ENDPOINT_URL}`, {}, request)
                    .set('authtoken', token);
                res.should.have.status(403);
            });
        });

        describe('when auth token is valid', () => {
            let token, business, rightStore, machine;

            beforeEach(async () => {
                await factory.create('role', { userType: "Business Owner" });
                const user = await factory.create('userWithBusinessOwnerRole');
                business = await factory.create('laundromatBusiness', { userId: user.id });
                token = await generateToken({ id: user.id })
                rightStore = await factory.create('store', { businessId: business.id })
                machine = await factory.create('machine', { serialNumber: 'test'})
            });

            describe('when payload is valid', () => {
                it('should respond with a 200 when everything is alright', async () => {
                    const request = {
                        "storeId": rightStore.id,
                        "capacity": "30",
                        "modelName": "LG, mix",
                        "machineType": "WASHER",
                        "name": "126",
                        "pricePerTurnInCents": 500
                    }
                    const res = await ChaiHttpRequestHepler.post(`${OFFLINE_ENDPOINT_URL}`, {}, request)
                        .set('authtoken', token);

                    res.should.have.status(200);
                    expect(res.body.machineId).to.not.be.undefined;
                });
            });

            describe('when payload is invalid', () => {
                it('should respond with a 500 when required param not present', async () => {
                    const request = {
                        "storeId": store.id,
                        "capacity": "30",
                        "name": "126",
                        "pricePerTurnInCents": 500
                    }
                    const res = await ChaiHttpRequestHepler.post(`${OFFLINE_ENDPOINT_URL}`, {}, request)
                        .set('authtoken', token);

                    res.should.have.status(500);
                });

                it('should respond with a 409 code when store id not correspond to user', async () => {
                    const request = {
                        "storeId": store.id,
                        "capacity": "30",
                        "modelName": "LG, mix",
                        "machineType": "WASHER",
                        "name": "126",
                        "pricePerTurnInCents": 500
                    }
                    const res = await ChaiHttpRequestHepler.post(`${OFFLINE_ENDPOINT_URL}`, {}, request)
                        .set('authtoken', token);

                    res.should.have.status(409);
                });

                it('should respond with a 409 if machine type valid without price turn', async () => {
                    const request = {
                        "storeId": rightStore.id,
                        "capacity": "30",
                        "modelName": "LG, mix",
                        "machineType": "WASHER",
                        "name": "126",
                    }
                    const res = await ChaiHttpRequestHepler.post(`${OFFLINE_ENDPOINT_URL}`, {}, request)
                        .set('authtoken', token);

                    res.should.have.status(500);
                    expect(res.body.error).to.be.equal('Price is required for adding a washer.')
                });

                it('should respond with a 500 if machine type valid with negative price', async () => {
                    const request = {
                        "storeId": rightStore.id,
                        "capacity": "30",
                        "modelName": "LG, mix",
                        "machineType": "WASHER",
                        "name": "126",
                        "pricePerTurnInCents": -1,
                    }
                    const res = await ChaiHttpRequestHepler.post(`${OFFLINE_ENDPOINT_URL}`, {}, request)
                        .set('authtoken', token);

                    res.should.have.status(500);
                    expect(res.body.error).to.be.equal('Price cannot be less than or equal to 0.')
                });

                it('should respond with a 409 when provided serial code too long', async () => {
                    const request = {
                        "storeId": rightStore.id,
                        "capacity": "30",
                        "modelName": "LG, mix",
                        "machineType": "WASHER",
                        "name": "126",
                        "pricePerTurnInCents": 500,
                        "serialNumber": faker.lorem.words(50)
                    }

                    const res = await ChaiHttpRequestHepler.post(`${OFFLINE_ENDPOINT_URL}`, {}, request)
                        .set('authtoken', token);

                    res.should.have.status(409);
                });

                it('should respond with a 409 when provided serial code already exist', async () => {
                    const request = {
                        "storeId": rightStore.id,
                        "capacity": "30",
                        "modelName": "LG, mix",
                        "machineType": "WASHER",
                        "name": "126",
                        "pricePerTurnInCents": 500,
                        "serialNumber": machine.serialNumber
                    }

                    const res = await ChaiHttpRequestHepler.post(`${OFFLINE_ENDPOINT_URL}`, {}, request)
                        .set('authtoken', token);

                    res.should.have.status(409);
                });
            });
        });
    });
});
