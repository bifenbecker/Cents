require('../../../../testHelper');
const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const BusinessSettings = require('../../../../../models/businessSettings');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const Store = require('../../../../../models/store');

function getApiEndPoint() {
    return `/api/v1/employee-tab/home/order/update`;
}

describe('test updateStatus validation', () => {
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

    it('should fail if serviceOrder.id is not provided', async () => {
        const body = {
            status: 'COMPLETED',
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(422);
        expect(res.body).to.have.property('error').to.equal('child "id" fails because ["id" is required]');
    });

    it('should fail if order not found', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder);
        const body = {
            id: -1,
            status: 'COMPLETED',
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(404);
        expect(res.body).to.have.property('error').to.equal('Order not found');
    });

    it('should fail if not authorized to modify order where isHub is true', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            isProcessedAtHub: true,
        });
        await store.$query().update({
            isHub: true,
        }).execute();
        await BusinessSettings.query()
            .findById(store.businessId)
            .patch({
                requiresEmployeeCode: true,
            })
            .returning('*')
        const body = {
            id: serviceOrder.id,
            status: 'READY_FOR_PICKUP',
            employeeCode: '123',
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(403);
        expect(res.body).to.have.property('error').to.equal('You are not authorized to modify this order');
    });

    it('should fail if not authorized to modify order where isHub is false', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder);
        const body = {
            id: serviceOrder.id,
            status: 'READY_FOR_PICKUP',
            employeeCode: '123',
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(403);
        expect(res.body).to.have.property('error').to.equal('You are not authorized to modify this order');
    });

    it('should go to next() successfully when status is DESIGNATED_FOR_PROCESSING_AT_HUB', async () => {
        await Store.query()
            .findById(store.id)
            .patch({
                isHub: true,
            })
            .returning('*');
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        const body = {
            id: serviceOrder.id,
            status: 'DESIGNATED_FOR_PROCESSING_AT_HUB',
            employeeCode: '123',
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(500);
        expect(res.body).to.have.property('error').to.equal('Cannot read property \'id\' of null');
    });

    it('should fail if hub not associated with store where status is DESIGNATED_FOR_PROCESSING_AT_HUB', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        const body = {
            id: serviceOrder.id,
            status: 'DESIGNATED_FOR_PROCESSING_AT_HUB',
            employeeCode: '123',
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(404);
        expect(res.body).to.have.property('error').to.equal('hub is not associated with store');
    });

    it('should fail if orders already have this status', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            status: 'CANCELLED',
        });
        const body = {
            id: serviceOrder.id,
            status: 'CANCELLED',
            employeeCode: '123',
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(409);
        expect(res.body).to.have.property('error').to.equal(`Orders is already in ${body.status} state.`);
    });

    it('should fail if order is already paid', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 0,
        });
        const body = {
            id: serviceOrder.id,
            status: 'CANCELLED',
            employeeCode: '123',
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(409);
        expect(res.body).to.have.property('error').to.equal('Can not cancel a paid order.');
    });

    it('should fail if can not be updated to READY_FOR_PROCESSING', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            status: 'READY_FOR_PICKUP',
        });
        const body = {
            id: serviceOrder.id,
            status: 'READY_FOR_PROCESSING',
            employeeCode: '123',
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(409);
        expect(res.body).to.have.property('error').to.equal(`Order is currently in ${serviceOrder.status} state, so can not update it to ${body.status}`);
    });

    it('should fail if can not be updated to READY_FOR_PROCESSING where isOrder.status is COMPLETED', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            status: 'COMPLETED',
        });
        const body = {
            id: serviceOrder.id,
            status: 'READY_FOR_PROCESSING',
            employeeCode: '123',
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(409);
        expect(res.body).to.have.property('error').to.equal(`Order is currently in ${serviceOrder.status} state, so can not update it to ${body.status}`);
    });

    it('should fail if can not be updated to PROCESSING', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            status: 'COMPLETED',
        });
        const body = {
            id: serviceOrder.id,
            status: 'PROCESSING',
            employeeCode: '123',
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(409);
        expect(res.body).to.have.property('error').to.equal(`Order is currently in ${serviceOrder.status} state, so can not update it to ${body.status}`);
    });

    it('should fail if can not be updated to READY_FOR_PICKUP', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            status: 'READY_FOR_PROCESSING',
        });
        const body = {
            id: serviceOrder.id,
            status: 'READY_FOR_PICKUP',
            employeeCode: '123',
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(409);
        expect(res.body).to.have.property('error').to.equal(`Order is currently in ${serviceOrder.status} state, so can not update it to ${body.status}`);
    });

    it('should fail if can not be updated to COMPLETED', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            status: 'READY_FOR_PROCESSING',
        });
        const body = {
            id: serviceOrder.id,
            status: 'COMPLETED',
            employeeCode: '123',
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(409);
        expect(res.body).to.have.property('error').to.equal(`Order is currently in ${serviceOrder.status} state, so can not update it to ${body.status}`);
    });

    it('should fail if can not be updated to RECEIVED_AT_HUB_FOR_PROCESSING where isOrder.status is HUB_PROCESSING_ORDER', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            hubId: store.id,
            status: 'HUB_PROCESSING_ORDER',
            isProcessedAtHub: true,
            isBagTrackingEnabled: true,
        });
        await store.$query().update({
            isHub: true,
        }).execute();
        const body = {
            id: serviceOrder.id,
            status: 'RECEIVED_AT_HUB_FOR_PROCESSING',
            employeeCode: '123',
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(409);
        expect(res.body).to.have.property('error').to.equal(`Order is currently in ${serviceOrder.status} state, so can not update it to ${body.status}`);
    });

    it('should fail if can not be updated to HUB_PROCESSING_COMPLETE where isOrder.status is HUB_PROCESSING_ORDER', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            hubId: store.id,
            status: 'HUB_PROCESSING_ORDER',
            isProcessedAtHub: true,
            isBagTrackingEnabled: true,
        });
        await store.$query().update({
            isHub: true,
        }).execute();
        const body = {
            id: serviceOrder.id,
            status: 'HUB_PROCESSING_COMPLETE',
            employeeCode: '123',
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(409);
        expect(res.body).to.have.property('error').to.equal(`Order is currently in ${serviceOrder.status} state, so can not update it to ${body.status}`);
    });

    it('should fail if can not be updated to RECEIVED_AT_HUB_FOR_PROCESSING where isOrder.status is IN_TRANSIT_TO_HUB', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            hubId: store.id,
            status: 'IN_TRANSIT_TO_HUB',
            isProcessedAtHub: true,
            isBagTrackingEnabled: true,
        });
        await store.$query().update({
            isHub: true,
        }).execute();
        const body = {
            id: serviceOrder.id,
            status: 'RECEIVED_AT_HUB_FOR_PROCESSING',
            employeeCode: '123',
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(409);
        expect(res.body).to.have.property('error').to.equal(`Order is currently in ${serviceOrder.status} state, so can not update it to ${body.status}`);
    });

    it('should fail if can not be updated to RECEIVED_AT_HUB_FOR_PROCESSING where isOrder.status is IN_TRANSIT_TO_STORE', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            hubId: store.id,
            status: 'IN_TRANSIT_TO_STORE',
            isProcessedAtHub: true,
            isBagTrackingEnabled: true,
        });
        await store.$query().update({
            isHub: true,
        }).execute();
        const body = {
            id: serviceOrder.id,
            status: 'RECEIVED_AT_HUB_FOR_PROCESSING',
            employeeCode: '123',
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(409);
        expect(res.body).to.have.property('error').to.equal(`Order is currently in ${serviceOrder.status} state, so can not update it to ${body.status}`);
    });

    it('should fail if can not be updated to HUB_PROCESSING_ORDER where isOrder.status is RECEIVED_AT_HUB_FOR_PROCESSING', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            hubId: store.id,
            status: 'RECEIVED_AT_HUB_FOR_PROCESSING',
            isProcessedAtHub: true,
            isBagTrackingEnabled: true,
        });
        await store.$query().update({
            isHub: true,
        }).execute();
        const body = {
            id: serviceOrder.id,
            status: 'HUB_PROCESSING_ORDER',
            employeeCode: '123',
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(409);
        expect(res.body).to.have.property('error').to.equal(`Order is currently in ${serviceOrder.status} state, so can not update it to ${body.status}`);
    });
});
