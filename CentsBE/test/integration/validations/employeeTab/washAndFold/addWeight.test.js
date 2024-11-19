require('../../../../testHelper');
const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const {
    generateToken,
    classicVersion,
    dryCleaningVersion,
} = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const BusinessSettings = require('../../../../../models/businessSettings');

function getToken(storeId) {
    return generateToken({ id: storeId });
}

describe('test addWeight validation for update order status api', () => {
    let store,
        payload,
        token,
        business,
        teamMember,
        serviceOrder,
        serviceOrderWeight,
        businessSettings;
    const apiEndPoint = '/api/v1/employee-tab/home/order/update';

    beforeEach(async () => {
        const { centsCustomer, ...entities } = await createUserWithBusinessAndCustomerOrders();
        store = entities.store;
        business = entities.laundromatBusiness;
        businessSettings = entities.businessSettings;

        await BusinessSettings.query()
            .patch({
                isWeightAfterProcessing: true,
                isWeightReceivingAtStore: true,
                isWeightBeforeProcessing: true,
                dryCleaningEnabled: false,
            })
            .findById(businessSettings.id)
            .returning('*');

        teamMember = await factory.create(FN.teamMember, {
            businessId: business.id,
        });
        token = getToken(store.id);
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            employeeCode: teamMember.id,
            status: 'PROCESSING',
        });
        await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        serviceOrderWeight = await factory.create(FN.serviceOrderWeight, {
            serviceOrderId: serviceOrder.id,
            chargeableWeight: 0,
            totalWeight: 0,
            step: 1,
        });

        payload = {
            id: serviceOrder.id,
            status: 'READY_FOR_PICKUP',
            isProcessedAtHub: false,
            notifyUser: false,
            employeeCode: teamMember.employeeCode.toString(),
            weight: {
                totalWeight: 0,
                chargeableWeight: 0,
                bagCount: 0,
                teamMemberId: teamMember.id,
            },
            rack: null,
            notes: null,
        };
    });

    it('should throw an error if token is not sent', async () => {
        // act
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload)
            .set('authtoken', '')
            .set('version', classicVersion);
        // assert
        res.should.have.status(401);
    });

    it('should return store not found error', async () => {
        const token = await getToken(0);
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload)
            .set('authtoken', token)
            .set('version', classicVersion);
        res.should.have.status(403);
    });

    it('should throw an error saying weight measurement is necessary for non-2.0 if weight is missing', async () => {
        delete payload.weight;
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload)
            .set('authtoken', token)
            .set('version', classicVersion);
        res.should.have.status(409);
        expect(res.body)
            .to.have.property('error')
            .equal('Weight measurement is necessary to change the order status.');
    });

    it('should throw an error saying weight measurement is necessary for non-2.0 if totalWeight is 0', async () => {
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload)
            .set('authtoken', token)
            .set('version', classicVersion);
        res.should.have.status(409);
        expect(res.body)
            .to.have.property('error')
            .equal('Weight measurement is necessary to change the order status.');
    });

    it('should go into next() for 2.0 if totalWeight is 0 and bagCount is 0', async () => {
        await BusinessSettings.query()
            .patch({
                dryCleaningEnabled: true,
            })
            .findById(businessSettings.id);

        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
        res.should.have.status(200);
    });

    it('should throw an error saying bagCount must be minimum 1 if on non-2.0', async () => {
        payload.weight.totalWeight = 1;

        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload)
            .set('authtoken', token)
            .set('version', classicVersion);
        res.should.have.status(422);
        expect(res.body)
            .to.have.property('error')
            .equal('child "bagCount" fails because ["bagCount" must be larger than or equal to 1]');
    });

    describe('fixed price item errors', () => {
        it('should throw error for non-online orders on 2.0', async () => {
            const newServiceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
                employeeCode: teamMember.id,
                status: 'PROCESSING',
            });

            await BusinessSettings.query()
                .patch({
                    dryCleaningEnabled: true,
                })
                .findById(businessSettings.id);

            payload.id = newServiceOrder.id;

            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload)
                .set('authtoken', token)
                .set('version', dryCleaningVersion);
            res.should.have.status(409);
            expect(res.body)
                .to.have.property('error')
                .equal('All order items are of type FIXED_PRICE can not add a weight measurement.');
        });

        it('should not throw error for online orders on 2.0', async () => {
            const newServiceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
                employeeCode: teamMember.id,
                status: 'PROCESSING',
                orderType: 'ONLINE',
            });

            await factory.create(FN.order, {
                orderableType: 'ServiceOrder',
                orderableId: newServiceOrder.id,
            });

            await BusinessSettings.query()
                .patch({
                    dryCleaningEnabled: true,
                })
                .findById(businessSettings.id);

            payload.id = newServiceOrder.id;

            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload)
                .set('authtoken', token)
                .set('version', dryCleaningVersion);
            res.should.have.status(200);
        });
    });

    describe('test addWeight validation', () => {
        let store, token, teamMember, teamMemberStore;

        beforeEach(async () => {
            store = await factory.create(FN.store);
            token = generateToken({
                id: store.id,
            });
            teamMember = await factory.create(FN.teamMember, {
                employeeCode: '123',
                businessId: store.businessId,
            });
            teamMemberStore = await factory.create(FN.teamMemberStore, {
                teamMemberId: teamMember.id,
                storeId: store.id,
            });
        });

        it('should fail if weight is not provided', async () => {
            const serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
            });
            const serviceOrderWeight = await factory.create(FN.serviceOrderWeight, {
                serviceOrderId: serviceOrder.id,
            });
            const body = {
                id: serviceOrder.id,
                status: 'COMPLETED',
                employeeCode: '123',
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);
            res.should.have.status(409);
            expect(res.body).to.have.property('error').to.equal('Weight measurement is necessary to change the order status.');
        });

        it('should fail if bagCount is equal to 0', async () => {
            const serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
            });
            const body = {
                id: serviceOrder.id,
                status: 'COMPLETED',
                employeeCode: '123',
                weight: {
                    totalWeight: 100.00,
                    chargeableWeight: 99.00,
                    bagCount: 0,
                    teamMemberId: teamMember.id,
                },
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);
            res.should.have.status(422);
            expect(res.body).to.have.property('error').to.equal('child "bagCount" fails because ["bagCount" must be larger than or equal to 1]');
        });

        it('should fail if can not be added a weight measurement', async () => {
            const serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
            });
            const body = {
                id: serviceOrder.id,
                status: 'COMPLETED',
                employeeCode: '123',
                weight: {
                    totalWeight: 100.00,
                    chargeableWeight: 99.00,
                    bagCount: 1,
                    teamMemberId: teamMember.id,
                },
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);
            res.should.have.status(409);
            expect(res.body).to.have.property('error').to.equal('All order items are of type FIXED_PRICE can not add a weight measurement.');
        });

        it('should fail when order is null (status = HUB_PROCESSING_COMPLETE)', async () => {
            const serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
                status: 'IN_TRANSIT_TO_STORE',
            });
            const body = {
                id: serviceOrder.id,
                status: 'HUB_PROCESSING_COMPLETE',
                employeeCode: '123',
                weight: {
                    totalWeight: 100.00,
                    chargeableWeight: 99.00,
                    bagCount: 1,
                    teamMemberId: teamMember.id,
                },
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);
            res.should.have.status(500);
            expect(res.body).to.have.property('error')
                .to.eq('Cannot read property \'id\' of null');
        });

        it('should fail when order is null (status = IN_TRANSIT_TO_STORE)', async () => {
            const serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
            });
            const body = {
                id: serviceOrder.id,
                status: 'IN_TRANSIT_TO_STORE',
                employeeCode: '123',
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);
            res.should.have.status(500);
            expect(res.body).to.have.property('error')
                .to.eq('Cannot read property \'id\' of null');
        });

        it('should fail when order is null (status = PROCESSING)', async () => {
            const serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
            });
            await BusinessSettings.query()
                .findById(store.businessId)
                .patch({
                    isWeightBeforeProcessing: false,
                });
            const body = {
                id: serviceOrder.id,
                status: 'PROCESSING',
                employeeCode: '123',
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);
            res.should.have.status(500);
            expect(res.body).to.have.property('error')
                .to.eq('Cannot read property \'id\' of null');
        });

        it('should fail when order is null (status = COMPLETED)', async () => {
            const serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
                isProcessedAtHub: true,
            });
            await store.$query().update({
                isHub: true,
            }).execute();
            await BusinessSettings.query()
                .findById(store.businessId)
                .patch({
                    isWeightUpOnCompletion: false,
                });
            const body = {
                id: serviceOrder.id,
                status: 'COMPLETED',
                employeeCode: '123',
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);
            res.should.have.status(500);
            expect(res.body).to.have.property('error')
                .to.eq('Cannot read property \'id\' of null');
        });

        it('should fail when hasWeight.length is equal 0', async () => {
            const serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
            });
            const body = {
                id: serviceOrder.id,
                status: 'COMPLETED',
                employeeCode: '123',
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);
            res.should.have.status(500);
            expect(res.body).to.have.property('error')
                .to.eq('Cannot read property \'id\' of null');
        });

        it('should successfully go to next()', async () => {
            const storeCustomer = await factory.create(FN.storeCustomer);
            const serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
                storeCustomerId: storeCustomer.id,
            });
            const order = await factory.create(FN.order, {
                orderableId: serviceOrder.id,
                orderableType: 'ServiceOrder',
            });
            const orderDelivery = await factory.create(FN.orderDelivery, {
                orderId: order.id,
            });
            const serviceOrderWeight = await factory.create(FN.serviceOrderWeight, {
                serviceOrderId: serviceOrder.id,
            });
            const body = {
                id: serviceOrder.id,
                status: 'HUB_PROCESSING_COMPLETE',
                employeeCode: '123',
                weight: {
                    totalWeight: 100.00,
                    chargeableWeight: 99.00,
                    bagCount: 1,
                    teamMemberId: teamMember.id,
                },
            };
            const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body).set('authtoken', token);
            res.should.have.status(200);
            expect(res.body).to.have.property('success').to.equal(true);
            expect(res.body).to.have.property('orderItems').to.be.an('array');
            expect(res.body).to.have.property('activityLog').to.be.an('array');
            expect(res.body).to.have.property('status').to.equal(body.status);
            expect(res.body).to.have.property('orderDetails').to.be.an('object');
        });
    });
});