require('../../../../testHelper');
const factory = require('../../../../factories');
const { generateToken } = require('../../../../support/apiTestHelper');
const {
    assertPostResponseError,
    assertPostResponseSuccess,
} = require('../../../../support/httpRequestsHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const BusinessSettings = require('../../../../../models/businessSettings');

function getApiEndPoint(serviceOrderId) {
    return `/api/v1/employee-tab/orders/service-orders/${serviceOrderId}/turn`;
}

describe('test createFullServiceTurn validation', () => {
    let centsCustomer, store, token, serviceOrder, machine, teamMember;

    beforeEach(async () => {
        centsCustomer = await factory.create(FN.centsCustomer);
        store = await factory.create(FN.store);
        token = generateToken({
            id: store.id,
        });
        serviceOrder = await factory.create(FN.serviceOrder, {
            status: 'PROCESSING',
        });
        machine = await factory.create(FN.machine, {
            storeId: store.id,
        });
        const machinePricing = await factory.create(FN.machinePricing, {
            machineId: machine.id,
            price: 10.0,
        });
        teamMember = await factory.create(FN.teamMember, {
            employeeCode: '123',
            businessId: store.businessId,
        });
        await factory.create(FN.teamMemberStore, {
            teamMemberId: teamMember.id,
            storeId: store.id,
        });
        await factory.create(FN.teamMemberCheckIn, {
            teamMemberId: teamMember.id,
            isCheckedIn: true,
        });
    });

    it('should fail when machineId is not a number', async () => {
        const body = {
            centsCustomerId: centsCustomer.id,
            machineId: '',
            quantity: 10,
            storeId: store.id,
            employeeCode: teamMember.employeeCode,
        };
        await assertPostResponseError({
            url: getApiEndPoint(serviceOrder.id),
            body,
            token,
            code: 500,
            expectedError: '"machineId" must be a number',
        });
    });

    it('should fail when storeId is not a number', async () => {
        const body = {
            centsCustomerId: centsCustomer.id,
            machineId: machine.id,
            quantity: 10,
            storeId: '',
            employeeCode: teamMember.employeeCode,
        };
        await assertPostResponseError({
            url: getApiEndPoint(serviceOrder.id),
            body,
            token,
            code: 500,
            expectedError: '"storeId" must be a number',
        });
    });

    it('should fail when employeeCode is not a number', async () => {
        await BusinessSettings.query()
            .findOne({
                businessId: store.businessId,
            })
            .patch({ requiresEmployeeCode: true });
        const body = {
            centsCustomerId: centsCustomer.id,
            machineId: machine.id,
            quantity: 10,
            storeId: store.id,
            employeeCode: '',
        };
        await assertPostResponseError({
            url: getApiEndPoint(serviceOrder.id),
            body,
            token,
            code: 500,
            expectedError: '"employeeCode" must be a number',
        });
    });

    it('should pass validation successfully', async () => {
        await BusinessSettings.query()
            .findOne({
                businessId: store.businessId,
            })
            .patch({ requiresEmployeeCode: true });
        const body = {
            centsCustomerId: centsCustomer.id,
            machineId: machine.id,
            quantity: 10,
            storeId: store.id,
            employeeCode: teamMember.employeeCode,
        };
        await assertPostResponseSuccess({
            url: getApiEndPoint(serviceOrder.id),
            body,
            token,
        });
    });

    it('should pass validation with requiresEmployeeCode is false', async () => {
        await BusinessSettings.query()
            .findOne({
                businessId: store.businessId,
            })
            .patch({ requiresEmployeeCode: false });
        const body = {
            centsCustomerId: centsCustomer.id,
            machineId: machine.id,
            quantity: 10,
            storeId: store.id,
            employeeCode: teamMember.employeeCode,
        };
        await assertPostResponseSuccess({
            url: getApiEndPoint(serviceOrder.id),
            body,
            token,
        });
    });
});
