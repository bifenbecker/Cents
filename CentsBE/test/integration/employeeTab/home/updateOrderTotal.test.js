require('../../../testHelper');
const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');

const getAPIEndpoint = (id) => `/api/v1/employee-tab/home/orders/${id}/orderTotal/update`;
const updatedWeight = 20;

describe('test updateOrderTotal', () => {
    let store, token, serviceOrder, order, serviceOrderItem, serviceReferenceItem;

    beforeEach(async () => {
        store = await factory.create(FN.store);
        token = generateToken({
            id: store.id,
        });
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 5,
            orderTotal: 15,
        });
        order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        serviceOrderItem = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
        });  
        serviceReferenceItem = await factory.create(FN.serviceReferenceItem, {
            orderItemId: serviceOrderItem.id,
        });
    });

    it('should fail when token is not provided', async () => {
        const res = await ChaiHttpRequestHepler.patch(getAPIEndpoint(serviceOrder.id), {}, {})
        .set('authtoken', '',);
        
        res.should.have.status(401);
        expect(res.body).to.have.property('error').to.equal('Please sign in to proceed.');
    });

    it('should fail if token is not correct', async () => {
        const res = await ChaiHttpRequestHepler.patch(getAPIEndpoint(serviceOrder.id), {}, {})
        .set('authtoken', 'invalid_token',);
        
        res.should.have.status(401);
        expect(res.body).to.have.property('error').to.equal('Invalid token.');
    });

    it('should fail if updatedWeight is not provided', async () => {
        const res = await ChaiHttpRequestHepler.patch(getAPIEndpoint(serviceOrder.id), {}, {})
            .set('authtoken', token);
            
        expect(res.body).to.have.property('error');
    });

    it('should update order totals', async () => {
        const netOrderTotalDifference = serviceOrder.orderTotal - serviceOrder.netOrderTotal;
        const serviceReferenceItemDetail = await factory.create(FN.serviceReferenceItemDetailForInventoryItem, {
            serviceReferenceItemId: serviceReferenceItem.id,
            lineItemName: 'Service Test',
            lineItemTotalCost: 10,
            lineItemUnitCost: 15,
            category: 'PER_POUND',
        });
        // create ServiceOrderItem with FIXED_PRICE
        const serviceOrderItem2 = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
        });  
        const serviceReferenceItem2 = await factory.create(FN.serviceReferenceItem, {
            orderItemId: serviceOrderItem2.id,
        });
        const serviceReferenceItemDetail2 = await factory.create(FN.serviceReferenceItemDetailForInventoryItem, {
            serviceReferenceItemId: serviceReferenceItem2.id,
            lineItemName: 'Service Test',
            lineItemTotalCost: 10,
            lineItemUnitCost: 15,
            category: 'FIXED_PRICE',
        });
        const res = await ChaiHttpRequestHepler.patch(getAPIEndpoint(serviceOrder.id), {}, {
            updatedWeight,
        }).set('authtoken', token);

        const totalAmount = updatedWeight*serviceReferenceItemDetail.lineItemUnitCost + serviceReferenceItemDetail2.lineItemTotalCost;

        expect(res.body).to.have.property('success').to.equal(true);
        expect(res.body.orderDetails.id).to.equal(serviceOrder.id);
        expect(res.body.orderDetails).to.have.property('netOrderTotal').to.equal(totalAmount - netOrderTotalDifference);
        expect(res.body.orderDetails).to.have.property('totalAmount').to.equal(totalAmount);
    });

    it('should fail when category is not PER_POUND', async () => {
        const minPrice = 50;
        const minWeight = 25;
        await factory.create(FN.serviceReferenceItemDetailForInventoryItem, {
            serviceReferenceItemId: serviceReferenceItem.id,
            lineItemName: 'Service Test',
            lineItemTotalCost: 10,
            lineItemUnitCost: 15,
            lineItemMinPrice: minPrice,
            lineItemMinQuantity: minWeight,
        });
        const res = await ChaiHttpRequestHepler.patch(getAPIEndpoint(serviceOrder.id), {}, {
            updatedWeight,
        }).set('authtoken', token);
        
        res.should.have.status(500);
        expect(res.body).to.have.property('error');
    });

    describe('with minPrice', () => {
        let serviceReferenceItemDetail;
        const minPrice = 50;

        const createServiceReferenceItemDetail = async (minWeight) => {
            serviceReferenceItemDetail = await factory.create(FN.serviceReferenceItemDetailForInventoryItem, {
                serviceReferenceItemId: serviceReferenceItem.id,
                lineItemName: 'Service Test',
                lineItemTotalCost: 10,
                lineItemUnitCost: 15,
                category: 'PER_POUND',
                lineItemMinPrice: minPrice,
                lineItemMinQuantity: minWeight,
            });
        }
        
        it('should update order totalAmount to minPrice when updatedWeight less than minWeight', async () => {
            const minWeight = 25;
            const netOrderTotalDifference = serviceOrder.orderTotal - serviceOrder.netOrderTotal;
            await createServiceReferenceItemDetail(minWeight);
            const res = await ChaiHttpRequestHepler.patch(getAPIEndpoint(serviceOrder.id), {}, {
                updatedWeight,
            }).set('authtoken', token);
    
            res.should.have.status(200);
            expect(res.body).to.have.property('success').to.equal(true);
            expect(res.body.orderDetails.id).to.equal(serviceOrder.id);
            expect(res.body.orderDetails).to.have.property('netOrderTotal').to.equal(minPrice - netOrderTotalDifference);
            expect(res.body.orderDetails).to.have.property('totalAmount').to.equal(minPrice);
        });
    
        it('should update order totalAmount when minWeight less than updatedWeight', async () => {
            const minWeight = 10;
            const netOrderTotalDifference = serviceOrder.orderTotal - serviceOrder.netOrderTotal;
            await createServiceReferenceItemDetail(minWeight);
            const res = await ChaiHttpRequestHepler.patch(getAPIEndpoint(serviceOrder.id), {}, {
                updatedWeight,
            }).set('authtoken', token);
    
            const remainingWeight = updatedWeight - minWeight;
            const variablePrice = serviceReferenceItemDetail.lineItemUnitCost * remainingWeight;
    
            res.should.have.status(200);
            expect(res.body).to.have.property('success').to.equal(true);
            expect(res.body.orderDetails.id).to.equal(serviceOrder.id);
            expect(res.body.orderDetails).to.have.property('netOrderTotal').to.equal(minPrice + variablePrice - netOrderTotalDifference);
            expect(res.body.orderDetails).to.have.property('totalAmount').to.equal(minPrice + variablePrice);
        });
    })
});
