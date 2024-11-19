require('../../../testHelper');

const factory = require('../../../factories');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const { createServiceOrderTurn } = require('../../../support/serviceOrderTestHelper');
const { expect } = require('../../../support/chaiHelper');

function getApiEndPoint(turnsId) {
    return `/api/v1/employee-tab/machines/turns/${turnsId}/`;
}

describe('get turn details validation', () => {
    let user,
        store,
        storeCustomer,
        turn,
        machine,
        machineType,
        machineModel,
        machinePricings,
        serviceOrder,
        token;

    beforeEach(async () => {
        store = await factory.create('store');
        storeCustomer = await factory.create('storeCustomer');
        user = await factory.create('user');
        serviceOrder = await factory.create('serviceOrder', {
            userId: user.id,
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
        });
        machineType = await factory.create('machineType');
        machineModel = await factory.create('machineModel', { typeId: machineType.id });
        machine = await factory.create('machine', {
            modelId: machineModel.id,
            storeId: store.id,
            userId: user.id,
        });
        machinePricings = await factory.create('machinePricing', { machineId: machine.id });
        ({ turn } = await createServiceOrderTurn(serviceOrder, machine));

        token = generateToken({ id: store.id });
    });

    it('should throw an error if token is not sent', async () => {
        const response = await ChaiHttpRequestHelper.get(getApiEndPoint(turn.id)).set(
            'authtoken',
            '',
        );
        response.should.have.status(401);
    });

    it('should throw an error if token is not correct', async () => {
        const response = await ChaiHttpRequestHelper.get(getApiEndPoint(turn.id)).set(
            'authtoken',
            'invalid_token',
        );
        response.should.have.status(401);
    });

    it('should fail when turns id is invalid', async () => {
        const response = await ChaiHttpRequestHelper.get(getApiEndPoint(-1)).set(
            'authtoken',
            token,
        );
        response.should.have.status(422);
    });

    it('should respond successfully', async () => {
        const response = await ChaiHttpRequestHelper.get(getApiEndPoint(turn.id)).set(
            'authtoken',
            token,
        );
        response.should.have.status(200);
        expect(response.body).to.have.property('success').to.equal(true);
        expect(response.body).to.have.property('turn');
    });
});
