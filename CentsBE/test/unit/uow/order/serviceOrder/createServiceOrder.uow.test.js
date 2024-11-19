require('../../../../testHelper');
const createServiceOrder = require('../../../../../uow/order/serviceOrder/createServiceOrder');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { classicVersion, dryCleaningVersion } = require('../../../../support/apiTestHelper');
const { createServicePayload } = require('../../../../support/serviceOrderTestHelper');
const { transaction } = require('objection');
const Model = require('../../../../../models');

describe('test createServiceOrder UOW', () => {
    let store, payload;

    beforeEach(async () => {
        store = await factory.create('store');

        const centsCustomer = await factory.create('centsCustomer');
        const storeCustomer = await factory.create('storeCustomer', {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: store.businessId,
        });
        payload = {
            store,
            status: 'READY_FOR_PROCESSING',
            customer: {
                storeCustomerId: storeCustomer.id,
            },
            storeCustomerId: storeCustomer.id,
            version: classicVersion,
            cents20LdFlag: false,
            transaction: await transaction.start(Model.knex()),
        };
    });

    it('should be able to create a service order with order count', async () => {
        const result = await createServiceOrder(payload);
        expect(result.serviceOrder).to.have.property('id');
        expect(result.serviceOrder).to.have.property('orderCode').equal('1001');
    });

    it('should be able to add order items for the service order', async () => {
        const { servicePrice } = await createServicePayload(store);
        payload.serviceOrderItems = [
            {
                status: 'READY_FOR_PROCESSING',
                price: 10,
                referenceItems: [
                    {
                        servicePriceId: servicePrice.id,
                        quantity: 1,
                        unitCost: servicePrice.minPrice,
                        totalPrice: servicePrice.minPrice,
                    },
                ],
            },
        ];
        const result = await createServiceOrder(payload);
        expect(result.serviceOrder).to.have.property('orderItems').to.be.an('array').of.length(1);
    });

    it('should add turnAroundInHours values to ServiceOrder for Cents 2.0', async () => {
        payload.turnAroundInHours = {
            value: 24,
            setManually: false,
        };
        payload.version = dryCleaningVersion;
        payload.cents20LdFlag = true;
        const result = await createServiceOrder(payload);
        expect(result.serviceOrder.turnAroundInHours).to.equal(24);
        expect(result.serviceOrder.turnAroundInHoursSetManually).to.be.false;
    });

    it('should not add turnAroundInHours values to ServiceOrder for Cents 2.0 if LD flag is off', async () => {
        payload.turnAroundInHours = {
            value: 24,
            setManually: true,
        };
        payload.version = dryCleaningVersion;
        payload.cents20LdFlag = false;
        const result = await createServiceOrder(payload);
        expect(result.serviceOrder.turnAroundInHours).to.be.null;
        expect(result.serviceOrder.turnAroundInHoursSetManually).to.be.false;
    });

    it('should add turnAroundInHours values to ServiceOrder for Cents 2.0.1', async () => {
        payload.turnAroundInHours = {
            value: 24,
            setManually: false,
        };
        payload.version = '2.0.1';
        payload.cents20LdFlag = true;
        const result = await createServiceOrder(payload);
        expect(result.serviceOrder.turnAroundInHours).to.equal(24);
        expect(result.serviceOrder.turnAroundInHoursSetManually).to.be.false;
    });

    it('should throw error when duplicate request is made', async () => {
        // arrange
        await createServiceOrder(payload);

        // act
        const res = createServiceOrder(payload);

        // assert
        await expect(res).to.be.rejectedWith('UniqueViolationError');
    });
});
