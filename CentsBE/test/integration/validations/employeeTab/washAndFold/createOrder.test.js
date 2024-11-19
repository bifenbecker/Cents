require('../../../../testHelper');

const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const {
    generateToken,
    classicVersion,
    dryCleaningVersion,
} = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const Settings = require('../../../../../models/businessSettings');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test createOrder validation', () => {
    let business, store, centsCustomer, storeCustomer, token;
    const apiEndPoint = '/api/v1/employee-tab/home/orders';

    beforeEach(async () => {
        business = await factory.create(FN.laundromatBusiness);
        store = await factory.create(FN.store, {
            businessId: business.id,
        });
        centsCustomer = await factory.create(FN.centsCustomer);
        storeCustomer = await factory.create(FN.storeCustomer, {
            centsCustomerId: centsCustomer.id,
        });
        token = generateToken({
            id: store.id,
        });
    });

    it('should fail if totalWeight is absent', async () => {
        const body = {};
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body)
            .set('authtoken', token)
            .set('version', classicVersion);

        res.should.have.status(422);
        expect(res.body).to.have.property('error').to.equal('totalWeight is required');
    });

    it('should fail if isBagTrackingEnabled is absent', async () => {
        const body = { totalWeight: 1 };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body)
            .set('authtoken', token)
            .set('version', classicVersion);

        res.should.have.status(422);
        expect(res.body)
            .to.have.property('error')
            .to.equal(
                'child "isBagTrackingEnabled" fails because ["isBagTrackingEnabled" is required]',
            );
    });

    it('should fail if paymentTiming is absent', async () => {
        const body = {
            totalWeight: 1,
            isBagTrackingEnabled: true,
        };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body)
            .set('authtoken', token)
            .set('version', classicVersion);

        res.should.have.status(422);
        expect(res.body)
            .to.have.property('error')
            .to.equal('child "paymentTiming" fails because ["paymentTiming" is required]');
    });

    it('should fail if storeId is absent', async () => {
        const body = {
            totalWeight: 1,
            isBagTrackingEnabled: true,
            paymentTiming: 'POST-PAY',
        };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body)
            .set('authtoken', token)
            .set('version', classicVersion);

        res.should.have.status(422);
        expect(res.body)
            .to.have.property('error')
            .to.equal('child "storeId" fails because ["storeId" is required]');
    });

    it('should fail if orderType is absent', async () => {
        const body = {
            totalWeight: 1,
            isBagTrackingEnabled: true,
            paymentTiming: 'POST-PAY',
            storeId: store.id,
        };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body)
            .set('authtoken', token)
            .set('version', classicVersion);

        res.should.have.status(422);
        expect(res.body)
            .to.have.property('error')
            .to.equal('child "orderType" fails because ["orderType" is required]');
    });

    it('should fail if employeeCode is absent', async () => {
        await Settings.query()
            .findOne({
                businessId: store.businessId,
            })
            .del();
        await factory.create('businessSetting', {
            requiresEmployeeCode: true,
            businessId: store.businessId,
        });
        const body = {
            totalWeight: 1,
            isBagTrackingEnabled: true,
            paymentTiming: 'POST-PAY',
            storeId: store.id,
            orderType: 'ServiceOrder',
        };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body)
            .set('authtoken', token)
            .set('version', classicVersion);

        res.should.have.status(422);
        expect(res.body)
            .to.have.property('error')
            .to.equal('child "employeeCode" fails because ["employeeCode" is required]');
    });

    it('should fail if teamMember does not exist', async () => {
        await Settings.query()
            .findOne({
                businessId: store.businessId,
            })
            .del();
        await factory.create('businessSetting', {
            requiresEmployeeCode: true,
            businessId: store.businessId,
        });
        const body = {
            totalWeight: 1,
            isBagTrackingEnabled: true,
            paymentTiming: 'POST-PAY',
            storeId: store.id,
            orderType: 'ServiceOrder',
            employeeCode: 1,
        };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body)
            .set('authtoken', token)
            .set('version', classicVersion);

        res.should.have.status(500);
        expect(res.body).to.have.property('error').to.equal('Invalid employee code');
    });

    it('should go into next()', async () => {
        const business = await factory.create('laundromatBusiness');
        await factory.create('role', { userType: 'Business Owner' });
        const user = await factory.create('userWithBusinessOwnerRole');
        const teamMember = await factory.create('teamMember', {
            businessId: business.id,
            userId: user.id,
        });
        store = await factory.create('store', { businessId: business.id });
        token = generateToken({
            id: store.id,
        });
        await Settings.query()
            .findOne({
                businessId: store.businessId,
            })
            .del();
        await factory.create('businessSetting', {
            requiresEmployeeCode: true,
            businessId: business.id,
        });
        const body = {
            totalWeight: 1,
            isBagTrackingEnabled: true,
            paymentTiming: 'POST-PAY',
            storeId: store.id,
            orderType: 'ServiceOrder',
            employeeCode: teamMember.employeeCode,
            customer: { id: storeCustomer.id },
        };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body)
            .set('authtoken', token)
            .set('version', classicVersion);

        res.should.have.status(500);
    });

    it('should fail if turnAroundInHours is absent for 2.0', async () => {
        await Settings.query()
            .patch({
                dryCleaningEnabled: true,
            })
            .findOne({ businessId: business.id });

        const body = {
            totalWeight: 1,
            isBagTrackingEnabled: true,
            paymentTiming: 'POST-PAY',
            storeId: store.id,
            orderType: 'ServiceOrder',
            employeeCode: 1,
        };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);

        res.should.have.status(422);
        expect(res.body)
            .to.have.property('error')
            .to.equal('child "turnAroundInHours" fails because ["turnAroundInHours" is required]');
    });

    it('should fail if turnAroundInHours is absent in 2.0.1', async () => {
        await Settings.query()
            .patch({
                dryCleaningEnabled: true,
            })
            .findOne({ businessId: business.id });

        const body = {
            totalWeight: 1,
            isBagTrackingEnabled: true,
            paymentTiming: 'POST-PAY',
            storeId: store.id,
            orderType: 'ServiceOrder',
            employeeCode: 1,
        };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body)
            .set('authtoken', token)
            .set('version', '2.0.1');

        res.should.have.status(422);
        expect(res.body)
            .to.have.property('error')
            .to.equal('child "turnAroundInHours" fails because ["turnAroundInHours" is required]');
    });

    it('should fail if turnAroundInHours is not an object for 2.0', async () => {
        await Settings.query()
            .patch({
                dryCleaningEnabled: true,
            })
            .findOne({ businessId: business.id });

        const body = {
            totalWeight: 1,
            isBagTrackingEnabled: true,
            paymentTiming: 'POST-PAY',
            storeId: store.id,
            orderType: 'ServiceOrder',
            employeeCode: 1,
            turnAroundInHours: 24,
        };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);

        res.should.have.status(422);
        expect(res.body)
            .to.have.property('error')
            .to.equal(
                'child "turnAroundInHours" fails because ["turnAroundInHours" must be an object]',
            );
    });

    it('should fail if storageRacks is not an array in 2.0.1', async () => {
        await Settings.query()
            .patch({
                dryCleaningEnabled: true,
            })
            .findOne({ businessId: business.id });

        const body = {
            totalWeight: 1,
            isBagTrackingEnabled: true,
            paymentTiming: 'POST-PAY',
            storeId: store.id,
            orderType: 'ServiceOrder',
            employeeCode: 1,
            turnAroundInHours: {
                setManually: false,
                value: 24,
            },
            storageRacks: 'hi',
        };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body)
            .set('authtoken', token)
            .set('version', '2.0.1');

        res.should.have.status(422);
        expect(res.body)
            .to.have.property('error')
            .to.equal('child "storageRacks" fails because ["storageRacks" must be an array]');
    });

    it('should fail if hangerBundles is not an array in 2.0.1', async () => {
        await Settings.query()
            .patch({
                dryCleaningEnabled: true,
            })
            .findOne({ businessId: business.id });

        const body = {
            totalWeight: 1,
            isBagTrackingEnabled: true,
            paymentTiming: 'POST-PAY',
            storeId: store.id,
            orderType: 'ServiceOrder',
            employeeCode: 1,
            turnAroundInHours: {
                setManually: false,
                value: 24,
            },
            hangerBundles: 'hi, another non-array',
        };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body)
            .set('authtoken', token)
            .set('version', '2.0.1');

        res.should.have.status(422);
        expect(res.body)
            .to.have.property('error')
            .to.equal('child "hangerBundles" fails because ["hangerBundles" must be an array]');
    });

    it('should fail if serviceOrderBags is not an array in 2.0.1', async () => {
        await Settings.query()
            .patch({
                dryCleaningEnabled: true,
            })
            .findOne({ businessId: business.id });

        const body = {
            totalWeight: 1,
            isBagTrackingEnabled: true,
            paymentTiming: 'POST-PAY',
            storeId: store.id,
            orderType: 'ServiceOrder',
            employeeCode: 1,
            turnAroundInHours: {
                setManually: false,
                value: 24,
            },
            serviceOrderBags: 'this is not an array',
        };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body)
            .set('authtoken', token)
            .set('version', '2.0.1');

        res.should.have.status(422);
        expect(res.body)
            .to.have.property('error')
            .to.equal(
                'child "serviceOrderBags" fails because ["serviceOrderBags" must be an array]',
            );
    });

    it('should fail if orderItems does not have pricingType in 2.0.1', async () => {
        await Settings.query()
            .patch({
                dryCleaningEnabled: true,
            })
            .findOne({ businessId: business.id });

        const body = {
            totalWeight: 1,
            isBagTrackingEnabled: true,
            paymentTiming: 'POST-PAY',
            storeId: store.id,
            orderType: 'ServiceOrder',
            employeeCode: 1,
            turnAroundInHours: {
                setManually: false,
                value: 24,
            },
            orderItems: [
                {
                    priceId: 1,
                    count: 1,
                    category: 'PER_POUND',
                    weight: 1,
                    lineItemType: 'SERVICE',
                    turnAroundInHours: 24,
                    serviceCategoryType: 'LAUNDRY',
                },
            ],
        };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body)
            .set('authtoken', token)
            .set('version', '2.0.1');

        res.should.have.status(422);
        expect(res.body)
            .to.have.property('error')
            .to.equal(
                'child "orderItems" fails because ["orderItems" at position 0 fails because [child "pricingType" fails because ["pricingType" is required]]]',
            );
    });

    it('should fail if orderItems does not have turnAroundInHours in 2.0.1', async () => {
        await Settings.query()
            .patch({
                dryCleaningEnabled: true,
            })
            .findOne({ businessId: business.id });

        const body = {
            totalWeight: 1,
            isBagTrackingEnabled: true,
            paymentTiming: 'POST-PAY',
            storeId: store.id,
            orderType: 'ServiceOrder',
            employeeCode: 1,
            turnAroundInHours: {
                setManually: false,
                value: 24,
            },
            orderItems: [
                {
                    priceId: 1,
                    pricingType: 'PER_POUND',
                    count: 1,
                    category: 'PER_POUND',
                    weight: 1,
                    lineItemType: 'SERVICE',
                    serviceCategoryType: 'LAUNDRY',
                },
            ],
        };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body)
            .set('authtoken', token)
            .set('version', '2.0.1');

        res.should.have.status(422);
        expect(res.body)
            .to.have.property('error')
            .to.equal(
                'child "orderItems" fails because ["orderItems" at position 0 fails because [child "turnAroundInHours" fails because ["turnAroundInHours" is required]]]',
            );
    });

    it('should fail if orderItems does not have serviceCategoryType in 2.0.1', async () => {
        await Settings.query().patch({
            dryCleaningEnabled: true,
        }).findOne({ businessId: business.id });

        const body = {
            totalWeight: 1,
            isBagTrackingEnabled: true,
            paymentTiming: 'POST-PAY',
            storeId: store.id,
            orderType: 'ServiceOrder',
            employeeCode: 1,
            turnAroundInHours: {
                setManually: false,
                value: 24,
            },
            orderItems: [
                {
                    priceId: 1,
                    pricingType: 'PER_POUND',
                    count: 1,
                    category: 'PER_POUND',
                    weight: 1,
                    lineItemType: 'SERVICE',
                    turnAroundInHours: 24,
                },
            ],
        };
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body)
            .set('authtoken', token)
            .set('version', '2.0.1');

        res.should.have.status(422);
        expect(res.body)
            .to.have.property('error')
            .to.equal(
                'child "orderItems" fails because ["orderItems" at position 0 fails because [child "serviceCategoryType" fails because ["serviceCategoryType" is required]]]',
            );
    });

    it('should go into next() for 2.0.0', async () => {
        const business = await factory.create('laundromatBusiness');
        await factory.create('role', { userType: 'Business Owner' });

        const user = await factory.create('userWithBusinessOwnerRole');
        const teamMember = await factory.create('teamMember', {
            businessId: business.id,
            userId: user.id,
        });

        store = await factory.create('store', { businessId: business.id });
        token = generateToken({
            id: store.id,
        });

        await Settings.query()
            .findOne({
                businessId: store.businessId,
            })
            .del();
        await factory.create('businessSetting', {
            requiresEmployeeCode: true,
            businessId: business.id,
            dryCleaningEnabled: true,
        });

        storeCustomer = await factory.create(FN.storeCustomer, {
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
        });

        const body = {
            totalWeight: 1,
            isBagTrackingEnabled: true,
            paymentTiming: 'POST-PAY',
            storeId: store.id,
            orderType: 'ServiceOrder',
            employeeCode: teamMember.employeeCode,
            turnAroundInHours: {
                setManually: false,
                value: 24,
            },
            customer: { id: storeCustomer.id },
        };

        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);

        res.should.have.status(500);
    });

    it('should go into next() for 2.0.1', async () => {
        const business = await factory.create('laundromatBusiness');
        await factory.create('role', { userType: 'Business Owner' });

        const user = await factory.create('userWithBusinessOwnerRole');
        const teamMember = await factory.create('teamMember', {
            businessId: business.id,
            userId: user.id,
        });

        store = await factory.create('store', { businessId: business.id });
        token = generateToken({
            id: store.id,
        });

        await Settings.query()
            .findOne({
                businessId: store.businessId,
            })
            .del();
        await factory.create('businessSetting', {
            requiresEmployeeCode: true,
            businessId: business.id,
            dryCleaningEnabled: true,
        });
        storeCustomer = await factory.create(FN.storeCustomer, {
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
        });

        const body = {
            totalWeight: 1,
            isBagTrackingEnabled: true,
            paymentTiming: 'POST-PAY',
            storeId: store.id,
            orderType: 'ServiceOrder',
            employeeCode: teamMember.employeeCode,
            turnAroundInHours: {
                setManually: false,
                value: 24,
            },
            customer: { id: centsCustomer.id },
        };

        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body)
            .set('authtoken', token)
            .set('version', '2.0.1');

        res.should.have.status(500);
    });

    it('should return if duplicate service order', async () => {
        const business = await factory.create('laundromatBusiness');
        await factory.create('role', { userType: 'Business Owner' });

        const user = await factory.create('userWithBusinessOwnerRole');
        const teamMember = await factory.create('teamMember', {
            businessId: business.id,
            userId: user.id,
        });

        store = await factory.create('store', { businessId: business.id });
        token = generateToken({
            id: store.id,
        });

        await Settings.query()
            .findOne({
                businessId: store.businessId,
            })
            .del();
        await factory.create('businessSetting', {
            requiresEmployeeCode: true,
            businessId: business.id,
            dryCleaningEnabled: true,
        });

        await factory.create(FN.serviceOrder, {
            storeId: store.id,
            storeCustomerId: storeCustomer.id,
        });

        const body = {
            totalWeight: 1,
            isBagTrackingEnabled: true,
            paymentTiming: 'POST-PAY',
            storeId: store.id,
            orderType: 'ServiceOrder',
            employeeCode: teamMember.employeeCode,
            turnAroundInHours: {
                setManually: false,
                value: 24,
            },
            customer: {
                id: centsCustomer.id,
                centsCustomerId: centsCustomer.id,
            },
        };

        // act
        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body)
            .set('authtoken', token)
            .set('version', dryCleaningVersion);

        // assert
        res.should.have.status(200);
        res.body.should.have.property('message', 'Duplicate order recently placed for customer');
    });
});
