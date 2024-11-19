require('../../../testHelper');
const { generateToken } = require('../../../support/apiTestHelper')
const factory = require('../../../factories')
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { expect } = require('../../../support/chaiHelper');
const BusinessSettings = require('../../../../models/businessSettings');
const { dryCleaningVersion } = require('../../../support/apiTestHelper');

const { 
    itShouldCorrectlyAssertTokenPresense,
    assertPatchResponseError,
 } = require('../../../support/httpRequestsHelper');

describe('test intakeOnlineOrder', () => {
    let business, store, token, serviceOrder, order;
    const apiEndPoint = (id) => {
        return `/api/v1/employee-tab/home/orders/onlineOrderIntake/${id}`
    };

    beforeEach(async () => {
        business = await factory.create(FN.laundromatBusiness);
        store = await factory.create(FN.store, {
            businessId: business.id,
        });
        token = generateToken({
            id: store.id,
        });
        const centsCustomer = await factory.create(FN.centsCustomer);
        const storeCustomer = await factory.create(FN.storeCustomer, {
            storeId: store.id,
            businessId: store.businessId,
            centsCustomerId: centsCustomer.id,
        });
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
            orderTotal: 100,
            netOrderTotal: 100,
        });
        order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
    });

    itShouldCorrectlyAssertTokenPresense(
        assertPatchResponseError,
        () => apiEndPoint(serviceOrder.id),
    );

    it(`should be successful`, async () => {
        const payload = {
            totalWeight: 10,
            storeId: store.id,
            orderType: order.orderableType,
            orderId: order.id,
            orderItems: [],
            chargeableWeight: 5,
        }
        const res = await ChaiHttpRequestHelper.patch(apiEndPoint(serviceOrder.id), {}, payload).set('authtoken', token);

        res.should.have.status(200);
        expect(res.body).to.have.property('weightLogs').to.not.be.empty;
        expect(res.body.weightLogs.length).to.equal(1);
        expect(res.body.weightLogs[0]).to.have.property('totalWeight').to.equal(payload.totalWeight);
        expect(res.body.weightLogs[0]).to.have.property('chargeableWeight').to.equal(payload.chargeableWeight);
        expect(res.body).to.have.property('id').to.equal(serviceOrder.id);
        expect(res.body).to.have.property('orderId').to.equal(order.id);
    });

    it(`should be successful and include additional data for 2.0 on`, async () => {
        await BusinessSettings.query()
            .patch({
                dryCleaningEnabled: true,
            })
            .findOne({ businessId: business.id });
        const payload = {
            id: serviceOrder.id,
            totalWeight: 10,
            storeId: store.id,
            orderType: order.orderableType,
            orderId: order.id,
            orderItems: [],
            chargeableWeight: 5,
            serviceOrderBags: [
                {
                    notes: [
                        {
                            id: 1,
                            name: 'Big time cold wash'
                        },
                    ],
                    manualNote: 'My manual note',
                }
            ],
            storageRacks: [
                {
                    rackInfo: 'ABC'
                }
            ],
            hangerBundles: [
                {
                    notes: [
                        {
                            id: 1,
                            name: 'Cold water',
                        },
                    ],
                    manualNote: 'NEW BUNDLE NOTE',
                }
            ],
        }
        const res = await ChaiHttpRequestHelper.patch(apiEndPoint(serviceOrder.id), {}, payload)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);
        res.should.have.status(200);
        expect(res.body).to.have.property('weightLogs').to.not.be.empty;
        expect(res.body.weightLogs.length).to.equal(1);
        expect(res.body.weightLogs[0]).to.have.property('totalWeight').to.equal(payload.totalWeight);
        expect(res.body.weightLogs[0]).to.have.property('chargeableWeight').to.equal(payload.chargeableWeight);
        expect(res.body).to.have.property('id').to.equal(serviceOrder.id);
        expect(res.body).to.have.property('orderId').to.equal(order.id);
        expect(res.body.serviceOrderBags).to.not.be.undefined;
        expect(res.body.serviceOrderBags).to.be.an('array');
        expect(res.body.hangerBundles).to.not.be.undefined;
        expect(res.body.hangerBundles).to.be.an('array');
        expect(res.body.hangerBundlesCount).to.not.be.undefined;
        expect(res.body.storageRacks).to.not.be.undefined;
        expect(res.body.storageRacks).to.be.an('object');
        expect(res.body.turnAroundInHours).to.not.be.undefined;
        expect(res.body.turnAroundInHours).to.be.an('object');
    });
});
