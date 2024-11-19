require('../../../../testHelper');
const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const BusinessSettings = require('../../../../../models/businessSettings');

function getApiEndPoint() {
    return `/api/v1/employee-tab/home/order/status/override`;
}

describe('test overrideStatusValidations', () => {
    let store, token;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        token = generateToken({ id: store.id });
    });

    it('should throw an error if typeValidations failed', async () => {
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint()).set('authtoken', token);
        res.should.have.status(422);
        expect(res.body).to.have.property('error').to.equal('child "status" fails because ["status" is required]');
    });

    it('should throw an error if invalid employeeCode', async () => {
        const teamMember = await factory.create(FN.teamMember, {
            businessId: store.businessId,
            employeeCode: '123',
        });
        await BusinessSettings.query()
            .where('businessId', store.businessId)
            .patch({
                requiresEmployeeCode: true,
            });
        const body = {
            barcode: [ 'abracadabra' ],
            status: 'IN_TRANSIT_TO_HUB',
            employeeCode: '124',
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(500);
        expect(res.body).to.have.property('error').to.equal('Invalid employee code');
    });

    it('should go to next() if validation was successful', async () => {
        const teamMember = await factory.create(FN.teamMember, {
            businessId: store.businessId,
            employeeCode: '123',
        });
        const teamMemberStore = await factory.create(FN.teamMemberStore, {
            teamMemberId: teamMember.id,
            storeId: store.id,
        });
        await BusinessSettings.query()
            .where('businessId', store.businessId)
            .patch({
                requiresEmployeeCode: true,
            });
        const body = {
            barcode: [ 'abracadabra' ],
            status: 'IN_TRANSIT_TO_HUB',
            employeeCode: teamMember.employeeCode,
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set('authtoken', token);
        res.should.have.status(400);
        expect(res.body).to.have.property('error').to.equal('Barcode not found');
    });
});