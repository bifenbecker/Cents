require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const getModelInfo = require('../../../../uow/machines/getModelInfoUOW');
const validatePriceOrTurnTime = require('../../../../uow/machines/validatePriceOrTurnTimeForMachineUOW');
const factory = require('../../../factories');

describe('test business-owner\'s validatePriceOrTurnTimeForMachineUOW', () => {
    let model, store, type, dryerType, dryerModel;

    beforeEach(async () => {
        store = await factory.create('store');

        type = await factory.create('machineType', {
            name: "WASHER"
        })

        model = await factory.create('machineModel', {
            typeId: type.id
        });

        dryerType = await factory.create('machineTypeDryer')

        dryerModel = await factory.create('machineModel', {
            typeId: dryerType.id
        })

    })

    it('should throw error when pricePerTurn not send for Washer', async () => {
            const reqPayload = {
                "storeId": store.id,
                "modelId": model.id,
                "name": "177",
                "turnTimeInMinutes": 14
            }

            const newPayload = await getModelInfo(reqPayload);

            try {
                await validatePriceOrTurnTime(newPayload);
            } catch (error) {
                expect(error).to.be.an('Error');
                expect(error.message).to.equal('Price is required for adding a washer.')
            }
        }
    );

    it('should throw error when pricePerTurn is negative for Washer', async () => {
            const reqPayload = {
                "storeId": store.id,
                "modelId": model.id,
                "name": "177",
                "pricePerTurnInCents": -1
            }

            const newPayload = await getModelInfo(reqPayload);

            try {
                await validatePriceOrTurnTime(newPayload);
            } catch (error) {
                expect(error).to.be.an('Error');
                expect(error.message).to.equal('Price cannot be less than or equal to 0.')
            }
        }
    );


    it('should throw error when turnTimeInMinutes not send for Dryer', async () => {
            const reqPayload = {
                "storeId": store.id,
                "modelId": dryerModel.id,
                "name": "177",
            }

            const newPayload = await getModelInfo(reqPayload);

            try {
                await validatePriceOrTurnTime(newPayload);
            } catch (error) {
                expect(error).to.be.an('Error');
                expect(error.message).to.equal('Turn time is required for adding a dryer.')
            }
        }
    );

    it('should throw error when turnTimeInMinutes is negative for Dryer', async () => {
            const reqPayload = {
                "storeId": store.id,
                "modelId": dryerModel.id,
                "name": "177",
                "turnTimeInMinutes": -1
            }

            const newPayload = await getModelInfo(reqPayload);

            try {
                await validatePriceOrTurnTime(newPayload);
            } catch (error) {
                expect(error).to.be.an('Error');
                expect(error.message).to.equal('Turn time cannot be less than or equal to 0.')
            }
        }
    );
});
