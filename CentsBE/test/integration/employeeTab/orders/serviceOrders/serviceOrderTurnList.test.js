require('../../../../testHelper');
const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { expect } = require('../../../../support/chaiHelper');
const {
    assertGetResponseError,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../../support/httpRequestsHelper');

function getApiEndPoint(serviceOrderId) {
    return `/api/v1/employee-tab/orders/service-orders/${serviceOrderId}/turns`;
}

describe('test serviceOrderTurnList api', () => {
    let token, serviceOrder, turn, user, machine, turnLineItem;

    beforeEach(async () => {
        const store = await factory.create(FN.store);
        token = generateToken({ id: store.id });
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        const machineType = await factory.create(FN.machineType);
        const machineModel = await factory.create(FN.machineModel, {
            typeId: machineType.id,
        });
        machine = await factory.create(FN.machine, {
            modelId: machineModel.id,
        });
        const device = await factory.create(FN.device);
        user = await factory.create(FN.user);
        turn = await factory.create(FN.turn, {
            userId: user.id,
            deviceId: device.id,
            machineId: machine.id,
            storeId: store.id,
        });
        turnLineItem = await factory.create(FN.turnLineItem, {
            turnId: turn.id,
        });
        const serviceOrderTurn = await factory.create(FN.serviceOrderTurns, {
            serviceOrderId: serviceOrder.id,
            turnId: turn.id,
        });
    });

    itShouldCorrectlyAssertTokenPresense(
        assertGetResponseError,
        () => getApiEndPoint(serviceOrder.id),
    );

    it('should get service order turn list successfully', async () => {
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(serviceOrder.id), {
            type: 'WASHER',
        }).set('authtoken', token);
        res.should.have.status(200);
        expect(res.body).to.have.property('success').to.eq(true);
        expect(res.body.turn.length).to.eq(1);
        expect(res.body.turn[0].id).to.eq(turn.id);
        expect(res.body.turn[0].status).to.eq(turn.status);
        expect(res.body.turn[0].machine.id).to.eq(machine.id);
        expect(res.body.turn[0].machine.name).to.eq(machine.name);
        expect(res.body.turn[0].machine.type).to.eq('W');
        expect(res.body.turn[0].employee.id).to.eq(user.id);
        expect(res.body.turn[0].employee.firstName).to.eq(user.firstname);
        expect(res.body.turn[0].employee.lastName).to.eq(user.lastname);
        expect(res.body.turn[0].quantity).to.eq(turnLineItem.quantity);
    });

    it('should throw an error if serviceOrder is not found', async () => {
        const serviceOrderId = serviceOrder.id + 1;
        const res = await ChaiHttpRequestHelper.get(getApiEndPoint(serviceOrderId), {
            type: 'WASHER',
        }).set('authtoken', token);
        res.should.have.status(500);
        expect(res.body).to.have.property('error').to.eq('Error: Invalid serviceOrder id.');
    });
});