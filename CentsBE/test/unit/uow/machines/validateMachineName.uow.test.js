require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const validateMachineName = require('../../../../uow/machines/validateMachineNameUOW');
const factory = require('../../../factories');
const getModelInfo = require('../../../../uow/machines/getModelInfoUOW');

describe('test business-owner\'s machine name validation uow', () => {
    let model, store, type, machine;

    beforeEach(async () => {
        store = await factory.create('store');

        type = await factory.create('machineType', {
            name: "WASHER"
        })

        model = await factory.create('machineModel', {
            typeId: type.id
        });

        machine = await factory.create('machine', {
            storeId: store.id,
            name: '123'
        })
    })

    it('should throw error when machine name already taken', async () => {
            const reqPayload = {
                "storeId": store.id,
                "modelId": model.id,
                "name": "123",
                "turnTimeInMinutes": 14
            }

            const newPayload = await getModelInfo(reqPayload);

            try {
                await validateMachineName(newPayload);
            } catch (error) {
                expect(error).to.be.an('Error');
                expect(error.message).to.equal('Name already exists.')
            }
        }
    );
})
