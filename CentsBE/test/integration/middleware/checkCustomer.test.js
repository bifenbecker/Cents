require('../../testHelper');
const ChaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const factory = require('../../factories');
const { expect } = require('../../support/chaiHelper');
const { generateToken, classicVersion } = require('../../support/apiTestHelper');
const Settings = require('../../../models/businessSettings');

describe('test checkCustomer', () => {
    let store, token;
    const apiEndPoint = '/api/v1/employee-tab/home/orders';

    beforeEach(async () => {
        store = await factory.create('store');
        token = generateToken({
            id: store.id,
        });
    });

    it('should throw an error if centsCustomer is not found', async () => {
        const business = await factory.create('laundromatBusiness');
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
            .patch({ requiresEmployeeCode: true });
        const body = {
            totalWeight: 1,
            isBagTrackingEnabled: true,
            paymentTiming: 'POST-PAY',
            storeId: store.id,
            orderType: 'ServiceOrder',
            employeeCode: teamMember.employeeCode,
            customer: { id: 0 },
        };

        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body)
            .set('authtoken', token)
            .set('version', classicVersion);

        res.should.have.status(500);
        expect(res.body).to.haveOwnProperty('error');
    });

    it('should throw an error if storeCustomer is absent', async () => {
        const business = await factory.create('laundromatBusiness');
        const user = await factory.create('userWithBusinessOwnerRole');
        const teamMember = await factory.create('teamMember', {
            businessId: business.id,
            userId: user.id,
        });
        store = await factory.create('store', { businessId: business.id });
        token = generateToken({
            id: store.id,
        });
        const centsCustomer = await factory.create('centsCustomer');
        await factory.create('storeCustomer', {
            storeId: store.id,
            businessId: store.businessId,
        });
        await Settings.query()
            .findOne({
                businessId: store.businessId,
            })
            .patch({ requiresEmployeeCode: true });
        const body = {
            totalWeight: 1,
            isBagTrackingEnabled: true,
            paymentTiming: 'POST-PAY',
            storeId: store.id,
            orderType: 'ServiceOrder',
            employeeCode: teamMember.employeeCode,
            customer: {
                id: centsCustomer.id,
            },
        };

        const res = await ChaiHttpRequestHelper.post(apiEndPoint, {}, body)
            .set('authtoken', token)
            .set('version', classicVersion);

        console.log(res);

        res.should.have.status(500);
        expect(res.body)
            .to.have.property('error')
            .to.equal(`Cannot read property 'filter' of undefined`);
    });
});
