require('../../../../testHelper');
const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const BusinessSetting = require('../../../../../models/businessSettings');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

function getApiEndPoint() {
    return `/api/v1/employee-tab/home/order/weights/edit`;
}

describe('test editOrderWeight validation', () => {
    let laundromatBusiness, store, token, serviceOrder, teamMember;

    beforeEach(async () => {
        laundromatBusiness = await factory.create(FN.laundromatBusiness);
        store = await factory.create(FN.store, {
            businessId: laundromatBusiness.id,
        });
        token = generateToken({ id: store.id });
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            paymentTiming: 'PRE-PAY',
        });
        teamMember = await factory.create(FN.teamMember, {
            businessId: store.businessId,
            employeeCode: '123',
        });
    });

    it('should fail if totalWeight is absent', async () => {
        const serviceOrderWeight = await factory.create(FN.serviceOrderWeight, {
            serviceOrderId: serviceOrder.id,
        });
        const body = {
            employeeCode: teamMember.employeeCode,
            serviceOrderId: serviceOrder.id,
            serviceOrderWeightId: serviceOrderWeight.id,
            editReason: 'test',
        };
        const res = await ChaiHttpRequestHelper.patch(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(422);
        expect(res.body).to.have.property('error').to.equal('child "totalWeight" fails because ["totalWeight" is required]');
    });

    it('should fail if isWeight is undefined', async () => {
        const body = {
            employeeCode: teamMember.employeeCode,
            serviceOrderId: serviceOrder.id,
            serviceOrderWeightId: -1,
            totalWeight: 100.00,
            editReason: 'test',
        };
        const res = await ChaiHttpRequestHelper.patch(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(404);
        expect(res.body).to.have.property('error').to.equal('Weight not found.');
    });

    it('should throw an error if roles is undefined', async () => {
        const serviceOrderWeight = await factory.create(FN.serviceOrderWeight, {
            serviceOrderId: serviceOrder.id,
        });
        const body = {
            employeeCode: teamMember.employeeCode,
            serviceOrderId: serviceOrder.id,
            serviceOrderWeightId: serviceOrderWeight.id,
            totalWeight: 100.00,
            editReason: 'test',
        };
        await BusinessSetting.query()
            .where('businessId', store.businessId)
            .patch({
                requiresEmployeeCode: true,
            })
            .returning('*')
        const res = await ChaiHttpRequestHelper.patch(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(500);
        expect(res.body).to.have.property('error').to.equal("Cannot read property 'roleName' of undefined");
    });

    it('should verify request successfully and go to next()', async () => {
        const serviceOrderWeight = await factory.create(FN.serviceOrderWeight, {
            serviceOrderId: serviceOrder.id,
        });
        const body = {
            employeeCode: teamMember.employeeCode,
            serviceOrderId: serviceOrder.id,
            serviceOrderWeightId: serviceOrderWeight.id,
            totalWeight: 100.00,
            editReason: 'test',
        };
        const res = await ChaiHttpRequestHelper.patch(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(200);
    });
});