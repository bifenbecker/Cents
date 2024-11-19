require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { createInventoryPayload } = require('../../../support/serviceOrderTestHelper');
const {
    assertPostResponseSuccess,
} = require('../../../support/httpRequestsHelper');

function getToken(storeId) {
    return generateToken({ id: storeId });
}

describe('test create inventoryOrder api', () => {
    let store, payload, token;
    const apiEndPoint = '/api/v1/employee-tab/home/orders/inventory';

    beforeEach(async () => {
        store = await factory.create('store');
        token = getToken(store.id);
        const centsCustomer = await factory.create('centsCustomer');
        const storeCustomer = await factory.create('storeCustomer', {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: store.businessId,
        });
        inventoryPayload = await createInventoryPayload(store);
        inventoryItem = inventoryPayload.inventoryItem;
        payload = {
            customer: {
                id: centsCustomer.id,
            },
            orderItems: [
                {
                    priceId: inventoryItem.id,
                    lineItemType: 'INVENTORY',
                    count: 1,
                },
            ],
            orderType: 'InventoryOrder',
            paymentStatus: 'BALANCE_DUE',
            storeId: store.id,
        };
    });

    it('should throw an error if token is not sent', async () => {
        // act
        const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload).set(
            'authtoken',
            '',
        );
        // assert
        res.should.have.status(401);
    });

    it('should return store not found error', async () => {
        const token = await getToken(0);
        const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload).set(
            'authtoken',
            token,
        );
        res.should.have.status(403);
    });

    it('should throw an error saying customer is required', async () => {
        delete payload.customer;
        const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload).set(
            'authtoken',
            token,
        );
        res.should.have.status(422);
    });

    describe('with inventory order items', () => {
        let inventoryItem, inventory, inventoryPayload, payload;
        beforeEach(async () => {
            const centsCustomer = await factory.create('centsCustomer');
            inventoryPayload = await createInventoryPayload(store);
            inventoryItem = inventoryPayload.inventoryItem;
            inventory = inventoryPayload.inventory;
            payload = {
                customer: {
                    id: centsCustomer.id,
                },
                orderItems: [
                    {
                        priceId: inventoryItem.id,
                        lineItemType: 'INVENTORY',
                        count: 1,
                    },
                ],
            };
        });

        it('should throw an error if the priceId is not sent', async () => {
            delete payload.orderItems[0].priceId;
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload).set(
                'authtoken',
                token,
            );
            res.should.have.status(422);
        });

        it('should throw an error if inventory item is not found', async () => {
            payload.orderItems[0].priceId = 100;
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload).set(
                'authtoken',
                token,
            );
            res.should.have.status(500);
            expect(res.body).to.have.property('error').equal(`Inventory item not found.`);
        });

        it('should throw an error if the count is greater than the quanity of the inventory', async () => {
            payload.orderItems[0].count = 10;
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload).set(
                'authtoken',
                token,
            );
            res.should.have.status(500);
            expect(res.body).to.have.property('error')
                .equal(`Available quantity for ${inventory.productName} is ${inventoryItem.quantity}.
             Please update the order quantity for ${inventory.productName}`);
        });

        it('should create a order with the inventory items', async () => {
            const res = await ChaiHttpRequestHepler.post(`${apiEndPoint}/`, {}, payload).set(
                'authtoken',
                token,
            );
            res.should.have.status(200);
        });

        it('should add convenience fee when convenience fee id is provided', async () => {
            const convenienceFee = await factory.create('convenienceFee', {
                businessId: store.businessId,
                fee: 10
            });
            payload.convenienceFeeId = convenienceFee.id
            
            const res = await assertPostResponseSuccess({
                url: apiEndPoint,
                body: payload,
                token,
            });
            res.should.have.status(200);
            expect(res.body).to.have.property('order');
            expect(res.body.order).to.have.property('convenienceFee').to.equal(1.5);
        });

        it('should show convenience fee as 0 when convenience fee id is not provided', async () => {
            const res = await assertPostResponseSuccess({
                url: apiEndPoint,
                body: payload,
                token,
            });
            res.should.have.status(200);
            expect(res.body).to.have.property('order');
            expect(res.body.order).to.have.property('convenienceFee').to.equal(0);
        });
    });
});
