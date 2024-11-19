require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect, assert } = require('../../../../support/chaiHelper');
const createServiceOrderBags = require('../../../../../uow/delivery/pickup/createServiceOrderBagsUow');
const ServiceOrderBags = require('../../../../../models/serviceOrderBags');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { deliveryProviders, statuses } = require('../../../../../constants/constants');

describe('test createServiceOrderBags UoW', () => {
    const testData = 'testData';
    let serviceOrder;

    beforeEach(async () => {
        serviceOrder = await factory.create(FN.serviceOrder);
    });

    describe('should return valid payload', () => {
        it('when delivered by own driver', async () => {
            const payload = {
                testData,
                serviceOrder,
                orderDelivery: { deliveryProvider: deliveryProviders.OWN_DRIVER },
            };

            // call Uow
            const newPayload = await createServiceOrderBags(payload);

            // assert
            const orderBags = await ServiceOrderBags.query().where({
                serviceOrderId: serviceOrder.id,
            });
            expect(orderBags, 'should not insert bag').to.have.lengthOf(0);
            assert.deepEqual(newPayload, payload, 'should return initial payload');
        });

        describe('when delivered by a non-own driver', () => {
            it('without bags', async () => {
                const payload = {
                    testData,
                    bagCount: 0,
                    serviceOrder,
                    orderDelivery: { deliveryProvider: deliveryProviders.DOORDASH },
                };

                // call Uow
                const newPayload = await createServiceOrderBags(payload);

                // assert
                const orderBags = await ServiceOrderBags.query().where({
                    serviceOrderId: serviceOrder.id,
                });
                expect(orderBags, 'should not insert bag').to.have.lengthOf(0);
                assert.deepEqual(newPayload, payload, 'should return initial payload');
            });

            it('with bags', async () => {
                const bagCount = 2;
                const payload = {
                    testData,
                    serviceOrder,
                    bagCount,
                    orderDelivery: { deliveryProvider: deliveryProviders.DOORDASH },
                };

                // call Uow
                const newPayload = await createServiceOrderBags(payload);

                // assert
                const orderBags = await ServiceOrderBags.query().where({
                    serviceOrderId: serviceOrder.id,
                });
                expect(orderBags, 'should insert every bag').to.have.lengthOf(bagCount);
                expect(
                    orderBags.every((bag) => bag.barcodeStatus === statuses.READY_FOR_INTAKE),
                    `every bag should have ${statuses.READY_FOR_INTAKE} barcodeStatus`,
                ).to.be.true;
                assert.deepEqual(newPayload, payload, 'should return initial payload');
            });
        });
    });

    describe('should throw Error', () => {
        it('without payload', async () => {
            await expect(createServiceOrderBags()).to.be.rejected;
        });
    });
});
