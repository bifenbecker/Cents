require('../../../../testHelper');
const factory = require('../../../../factories');
const { generateToken } = require('../../../../support/apiTestHelper');
const { expect } = require('../../../../support/chaiHelper');
const {
    assertPostResponseError,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../../support/httpRequestsHelper');
const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const BusinessSettings = require('../../../../../models/businessSettings');
const Turn = require('../../../../../models/turns');

function getApiEndPoint(serviceOrderId) {
    return `/api/v1/employee-tab/orders/service-orders/${serviceOrderId}/turn`;
}

describe('test createFullServiceTurn api', () => {
    let centsCustomer, store, token, serviceOrder, machineModel, teamMember, device;

    beforeEach(async () => {
        centsCustomer = await factory.create(FN.centsCustomer);
        store = await factory.create(FN.store);
        token = generateToken({
            id: store.id,
        });
        serviceOrder = await factory.create(FN.serviceOrder, {
            status: 'PROCESSING',
        });
        const machineType = await factory.create(FN.machineType);
        machineModel = await factory.create(FN.machineModel, {
            typeId: machineType.id,
        });
        device = await factory.create(FN.device);
        teamMember = await factory.create(FN.teamMember, {
            employeeCode: '123',
            businessId: store.businessId,
        });
        await factory.create(FN.teamMemberStore, {
            teamMemberId: teamMember.id,
            storeId: store.id,
        });
        await factory.create(FN.teamMemberCheckIn, {
            teamMemberId: teamMember.id,
            isCheckedIn: true,
        });
    });

    itShouldCorrectlyAssertTokenPresense(
        assertPostResponseError,
        () => getApiEndPoint(serviceOrder.id),
    );

    it('should return result successfully', async () => {
        const machine = await factory.create(FN.machine, {
            storeId: store.id,
            modelId: machineModel.id,
        });
        const machinePricing = await factory.create(FN.machinePricing, {
            machineId: machine.id,
            price: 10.0,
        });
        const pairing = await factory.create(FN.pairing, {
            machineId: machine.id,
            deviceId: device.id,
        });
        await BusinessSettings.query()
            .findOne({
                businessId: store.businessId,
            })
            .patch({ requiresEmployeeCode: true });
        const body = {
            centsCustomerId: centsCustomer.id,
            machineId: machine.id,
            quantity: 10,
            storeId: store.id,
            employeeCode: teamMember.employeeCode,
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(serviceOrder.id), {}, body).set('authtoken', token);
        const turn = await Turn.query().select('*');
        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.eq(true);
        expect(res.body.result.turnId).to.eq(turn[0].id);
        expect(res.body.result.turnDetails.status).to.eq(turn[0].status);
        expect(res.body.result.turnDetails.machine.id).to.eq(machine.id);
        expect(res.body.result.turnDetails.machine.name).to.eq(machine.name);
        expect(res.body.result.turnDetails.machine.type).to.eq('W');
    });

    it('should throw an error in pipeline if machine not found', async () => {
        const machine = await factory.create(FN.machine);
        await BusinessSettings.query()
            .findOne({
                businessId: store.businessId,
            })
            .patch({ requiresEmployeeCode: false });
        const body = {
            centsCustomerId: centsCustomer.id,
            machineId: machine.id,
            quantity: 10,
            storeId: store.id,
            employeeCode: teamMember.employeeCode,
        };
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint(serviceOrder.id), {}, body).set('authtoken', token);
        res.should.have.status(500);
        expect(res.body).to.have.property('error').to.eq('Machine not found');
    });

    it('should throw an error if serviceOrderId not passed', async () => {
        const res = await ChaiHttpRequestHelper.post(getApiEndPoint()).set('authtoken', token);
        res.should.have.status(500);
    });
});
