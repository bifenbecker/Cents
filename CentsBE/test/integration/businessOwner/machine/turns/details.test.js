require('../../../../testHelper');

const factory = require('../../../../factories');
const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const { createServiceOrderTurn } = require('../../../../support/serviceOrderTestHelper');
const { expect } = require('../../../../support/chaiHelper');

function getApiEndPoint(area, turnsId) {
    return `/api/v1/${area}/machines/turns/${turnsId}/`;
}

describe('get turn details endpoint', () => {
    describe('get turn details endpoint for employee tab', function () {
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
            const response = await ChaiHttpRequestHelper.get(
                getApiEndPoint('employee-tab', turn.id),
            ).set('authtoken', '');
            response.should.have.status(401);
        });

        it('should throw an error if token is not correct', async () => {
            const response = await ChaiHttpRequestHelper.get(
                getApiEndPoint('employee-tab', turn.id),
            ).set('authtoken', 'invalid_token');
            response.should.have.status(401);
        });

        it('should successfully return turn details', async () => {
            const response = await ChaiHttpRequestHelper.get(
                getApiEndPoint('employee-tab', turn.id),
            ).set('authtoken', token);
            response.should.have.status(200);
            expect(response.body).to.have.property('success').to.equal(true);
            expect(response.body).to.have.property('turn');
            expect(response.body.turn.store.address).to.be.equal(store.address);
            expect(response.body.turn.store.id).to.be.equal(store.id);
        });

        it('should throw 500 when wrong turns id provided', async () => {
            const response = await ChaiHttpRequestHelper.get(
                getApiEndPoint('employee-tab', 12345),
            ).set('authtoken', token);
            expect(response.status).equal(500);
        });
    });
});
