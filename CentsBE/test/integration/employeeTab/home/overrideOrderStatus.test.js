require('../../../testHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const {
    assertPostResponseError,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');
const BusinessSettings = require('../../../../models/businessSettings');

function getApiEndPoint() {
    return `/api/v1/employee-tab/home/order/status/override`;
}

describe('test overrideOrderStatus api', () => {
    let store, token;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        token = generateToken({ id: store.id });
    });

    itShouldCorrectlyAssertTokenPresense(
        assertPostResponseError,
        () => getApiEndPoint(),
    );

    it('should throw an error if barcode not found', async () => {
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

    it('should override order status successfully', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        const teamMember = await factory.create(FN.teamMember, {
            businessId: store.businessId,
            employeeCode: '123',
        });
        const teamMemberStore = await factory.create(FN.teamMemberStore, {
            teamMemberId: teamMember.id,
            storeId: store.id,
        });
        const serviceOrderBag = await factory.create(FN.serviceOrderBag, {
            serviceOrderId: serviceOrder.id,
            barcodeStatus: 'IN_TRANSIT_TO_HUB',
            barcode: 'abracadabra',
            isActiveBarcode: true,
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
        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.eq(true);
        expect(res.body.orderDetails.status).to.eq(serviceOrder.status);
        expect(res.body.orderDetails.serviceOrderBags.length).to.eq(1);
        expect(res.body.orderDetails.serviceOrderBags[0]).contains(serviceOrderBag);
        expect(res.body.orderDetails.activityLog.length).to.eq(1);
        expect(res.body.orderDetails.activityLog[0].status).contains(body.status);
        expect(res.body.orderDetails.activityLog[0].employeeCode).contains(teamMember.employeeCode);
    });

    it('should override barcode status to body.status successfully', async () => {
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        const teamMember = await factory.create(FN.teamMember, {
            businessId: store.businessId,
            employeeCode: '123',
        });
        const teamMemberStore = await factory.create(FN.teamMemberStore, {
            teamMemberId: teamMember.id,
            storeId: store.id,
        });
        const serviceOrderBag = await factory.create(FN.serviceOrderBag, {
            serviceOrderId: serviceOrder.id,
            barcodeStatus: 'FAKE123STATUS',
            barcode: 'abracadabra',
            isActiveBarcode: true,
        });
        const body = {
            barcode: [ 'abracadabra' ],
            status: 'IN_TRANSIT_TO_HUB',
            employeeCode: teamMember.employeeCode,
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(), {
            paginationOrderStructure: 'true',
        }, body).set('authtoken', token);
        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.eq(true);
        expect(res.body.orderDetails.status).to.eq(body.status);
        expect(res.body.orderDetails.serviceOrderBags.length).to.eq(1);
        expect(res.body.orderDetails.serviceOrderBags[0].barcode).to.eq(body.barcode[0]);
        expect(res.body.orderDetails.serviceOrderBags[0].barcodeStatus).to.eq(body.status);
        expect(res.body.orderDetails.serviceOrderBags[0].serviceOrderId).to.eq(serviceOrder.id);
        expect(res.body.orderDetails.serviceOrderBags[0].isActiveBarcode).to.eq(true);
    });
});