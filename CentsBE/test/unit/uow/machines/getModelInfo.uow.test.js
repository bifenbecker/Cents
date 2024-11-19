require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const getModelInfo = require('../../../../uow/machines/getModelInfoUOW');
const factory = require('../../../factories');

describe('test business-owner\'s getModelInfo uow', () => {
    let model, store, type;

    beforeEach(async () => {
        store = await factory.create('store');

        type = await factory.create('machineType', {
            name: "WASHER"
        })

        model = await factory.create('machineModel', {
            typeId: type.id
        });
    })

    it('should modify payload with machine type name and id', async () => {
            const reqPayload = {
                "storeId": store.id,
                "modelId": model.id,
                "name": "177",
                "turnTimeInMinutes": 14
            }

            const newPayload = await getModelInfo(reqPayload);

            expect(newPayload.machineTypeName).to.equal(type.name)
            expect(newPayload.machineTypeId).to.equal(type.id)
        }
    );

    it('should throw error on wrong model id', async () => {
            const reqPayload = {
                "storeId": store.id,
                "modelId": 9999,
                "name": "177",
                "turnTimeInMinutes": 14
            }

            try {
                await getModelInfo(reqPayload);
            } catch (error) {
                expect(error).to.be.an('Error');
                expect(error.message).to.equal('invalid model id')
            }

        }
    );
});
