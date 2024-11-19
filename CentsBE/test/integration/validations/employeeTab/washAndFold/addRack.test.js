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

describe('test addRack validation for update order status api', () => {
    let store, payload, token, business, teamMember, serviceOrder, storeSettings, serviceOrderWeight, businessSettings;
    const apiEndPoint = '/api/v1/employee-tab/home/order/update';

    beforeEach(async () => {
        const { centsCustomer, ...entities } = await createUserWithBusinessAndCustomerOrders();
        store = entities.store;
        business = entities.laundromatBusiness;
        businessSettings = entities.businessSettings;
        storeSettings = entities.storeSettings;

        await BusinessSettings.query().patch({
            isWeightAfterProcessing: true,
            isWeightReceivingAtStore: true,
            isWeightBeforeProcessing: true,
            requiresRack: false,
            dryCleaningEnabled: false,
        }).findById(businessSettings.id).returning('*');

        teamMember = await factory.create(FN.teamMember, {
            businessId: business.id,
        });
        token = getToken(store.id);
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            employeeCode: teamMember.id,
            status: 'PROCESSING',
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
                totalWeight: 1,
                chargeableWeight: 1,
                bagCount: 1,
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

    it('should throw an error saying rack is required for non-2.0 if rack is missing but rack is not required', async () => {
        payload.rack = [];
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload)
            .set('authtoken', token)
            .set('version', classicVersion);
        res.should.have.status(422);
        expect(res.body).to.have.property('error').equal('Rack is not allowed.');
    });

    it('should throw an error saying rack must be a string for non-2.0 if rack is array', async () => {
        await BusinessSettings.query().patch({
            requiresRack: true,
        }).findById(businessSettings.id).returning('*');

        payload.rack = [];
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload)
            .set('authtoken', token)
            .set('version', classicVersion);
        res.should.have.status(422);
        expect(res.body).to.have.property('error').equal(`child "rack" fails because ["rack" must be a string]`);
    });

    it('should throw an error saying rack must be an array for 2.0 if rack is string', async () => {
        await BusinessSettings.query().patch({
            requiresRack: true,
            dryCleaningEnabled: true,
        }).findById(businessSettings.id).returning('*');

        payload.rack = '1234';
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
        res.should.have.status(422);
        expect(res.body).to.have.property('error').equal(`child "rack" fails because ["rack" must be an array]`);
    });

    it('should throw an error saying rack is required for 2.0 if rack has length but rack is not required', async () => {
        await BusinessSettings.query().patch({
            dryCleaningEnabled: true,
        }).findById(businessSettings.id).returning('*');

        payload.rack = [1];
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
        res.should.have.status(422);
        expect(res.body).to.have.property('error').equal('Rack is not allowed.');
    });

    it('should return next() for 2.0', async () => {
        await factory.create(FN.serviceOrderMasterOrder, {
            orderableId: serviceOrder.id,
        });

        await BusinessSettings.query().patch({
            requiresRack: true,
            dryCleaningEnabled: true,
        }).findById(businessSettings.id).returning('*');

        payload.rack = [
            {
                rackInfo: '1234',
            },
        ];
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
        res.should.have.status(200);
    });

    it('should return next() for 2.0 with ID added', async () => {
        await factory.create(FN.serviceOrderMasterOrder, {
            orderableId: serviceOrder.id,
        });

        await BusinessSettings.query().patch({
            requiresRack: true,
            dryCleaningEnabled: true,
        }).findById(businessSettings.id).returning('*');

        payload.rack = [
            {
                id: 1,
                rackInfo: '1234',
            },
        ];
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
        res.should.have.status(200);
    });

    it('should return next() for non-2.0', async () => {
        await factory.create(FN.serviceOrderMasterOrder, {
            orderableId: serviceOrder.id,
        });

        await BusinessSettings.query().patch({
            requiresRack: true,
        }).findById(businessSettings.id).returning('*');

        payload.rack = '1234';
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload)
            .set('authtoken', token)
            .set('version', classicVersion);
        res.should.have.status(200);
    });

    it('should go to next() if status is not equal READY_FOR_PICKUP', async () => {
        payload.status = 'HUB_PROCESSING_COMPLETE';
        const order = await factory.create(FN.order, {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, payload).set('authtoken', token);
        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.equal(true);
        expect(res.body.orderItems.length).to.eq(0);
        expect(res.body.activityLog.length).to.eq(1);
        expect(res.body.activityLog[0].status).to.eq(payload.status);
        expect(res.body.status).to.eq(payload.status);
        expect(res.body.orderDetails.status).to.eq(payload.status);
        expect(res.body.orderDetails.rack).to.eq('');
    });
});