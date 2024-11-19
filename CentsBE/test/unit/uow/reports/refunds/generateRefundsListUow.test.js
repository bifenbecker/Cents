require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const generateRefundsListUow = require('../../../../../uow/reports/refunds/generateRefundsListUow.js');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const storeSettings = require('../../../../../models/storeSettings');
const { dateFormat } = require('../../../../../helpers/dateFormatHelper');
const { getPaymentType } = require('../../../../../utils/reports/reportsUtils');

const capitalizeFirstLetterForEachWord = (str) =>
    str?.replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase()) ?? '';

const storeTimezone = 'America/Los_Angeles';

describe('tests generateRefundsListUow', () => {
    let user,
        business,
        store,
        store2,
        storeCustomer,
        storeCustomer2,
        serviceOrder,
        order,
        order2,
        payment,
        payment2,
        payload;

    beforeEach(async () => {
        user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness, { userId: user.id });
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        store2 = await factory.create(FACTORIES_NAMES.store, { businessId: business.id });
        await storeSettings
            .query()
            .patch({
                timeZone: 'America/Los_Angeles',
            })
            .whereIn('storeId', [store.id, store2.id]);
        storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
            storeId: store.id,
            firstName: 'James',
            lastName: 'Pooley',
            phoneNumber: '1234567890',
        });
        storeCustomer2 = await factory.create(FACTORIES_NAMES.storeCustomer, {
            storeId: store2.id,
            firstName: 'Wood',
            lastName: 'Jeremy',
            phoneNumber: '9876543210',
        });
        teamMember = await factory.create(FACTORIES_NAMES.teamMember, {
            businessId: business.id,
            userId: user.id,
            employeeCode: '1234',
        });
        serviceOrder = await factory.create(FACTORIES_NAMES.serviceOrder, {
            userId: business.userId,
            storeId: storeCustomer.storeId,
            storeCustomerId: storeCustomer.id,
            employeeCode: teamMember.id,
            orderCode: '1111',
        });
        order = await factory.create(FACTORIES_NAMES.order, {
            storeId: serviceOrder.storeId,
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });
        payment = await factory.create(FACTORIES_NAMES.payment, {
            orderId: order.id,
            storeId: store.id,
        });
        inventoryOrder = await factory.create(FACTORIES_NAMES.inventoryOrder, {
            storeId: storeCustomer.storeId,
            storeCustomerId: storeCustomer.id,
            orderCode: '1111',
            employeeId: teamMember.id,
        });
        order2 = await factory.create(FACTORIES_NAMES.order, {
            storeId: inventoryOrder.storeId,
            orderableId: inventoryOrder.id,
            orderableType: 'InventoryOrder',
        });
        payment2 = await factory.create(FACTORIES_NAMES.payment, {
            orderId: order2.id,
            storeId: store2.id,
        });

        payload = {
            options: {
                finalStartDate: '09-10-2021 00:00:00',
                finalEndDate: '09-12-2023 23:59:59',
                timeZone: storeTimezone,
                stores: [{ id: store.id }, { id: store2.id }],
                status: 'SUCCEED_AND_PENDING',
            },
        };
    });

    it('should verify the report data keys', async () => {
        const result = await generateRefundsListUow(payload);
        const expected = [
            'Refund Creation Date',
            'Order Code',
            'Location Name',
            'Refund Amount',
            'Payment Method',
            'Payment Employee',
            'Reason',
            'Current Status',
            'Last Updated Date',
            'Refund Provider',
        ];
        expect(result.reportHeaders.flatMap((rh) => rh.title)).to.eql(expected);
        expect(result.finalReportData.length).equals(0);
    });

    it('should return only succeeded refunds', async () => {
        await factory.create(FACTORIES_NAMES.refunds, {
            orderId: order.id,
            paymentId: payment.id,
            status: 'succeeded',
            createdAt: '09-11-2022 00:00:00',
        });
        await factory.create(FACTORIES_NAMES.refunds, {
            orderId: order.id,
            paymentId: payment.id,
            status: 'pending',
            createdAt: '09-11-2022 00:00:00',
        });

        const customPayload = { ...payload };
        customPayload.options.status = 'SUCCEED';

        const result = await generateRefundsListUow(customPayload);

        expect(result.finalReportData.length).equals(1);
        expect(result.finalReportData[0].status).equals('Succeeded');
    });

    it('should return only pending refunds', async () => {
        await factory.create(FACTORIES_NAMES.refunds, {
            orderId: order.id,
            paymentId: payment.id,
            status: 'succeeded',
            createdAt: '09-11-2022 00:00:00',
        });
        await factory.create(FACTORIES_NAMES.refunds, {
            orderId: order.id,
            paymentId: payment.id,
            status: 'pending',
            createdAt: '09-11-2022 00:00:00',
        });

        const customPayload = { ...payload };
        customPayload.options.status = 'PENDING';

        const result = await generateRefundsListUow(customPayload);

        expect(result.finalReportData.length).equals(1);
        expect(result.finalReportData[0].status).equals('Pending');
    });

    it('should return refunds report data', async () => {
        const refund1 = await factory.create(FACTORIES_NAMES.refunds, {
            orderId: order.id,
            paymentId: payment.id,
            status: 'succeeded',
            createdAt: '09-11-2022 00:00:00',
        });
        const refund2 = await factory.create(FACTORIES_NAMES.refunds, {
            orderId: order.id,
            paymentId: payment.id,
            status: 'pending',
            createdAt: '09-11-2022 00:00:00',
        });
        const refund3 = await factory.create(FACTORIES_NAMES.refunds, {
            orderId: order2.id,
            paymentId: payment2.id,
            status: 'succeeded',
            createdAt: '09-11-2022 00:00:00',
        });
        await factory.create(FACTORIES_NAMES.refunds, {
            orderId: order2.id,
            paymentId: payment2.id,
            status: 'succeeded',
            createdAt: '09-11-2002 00:00:00',
        });

        const result = await generateRefundsListUow(payload);

        expect(result.finalReportData.length).equals(3);
        expect(result.finalReportData[0]).to.deep.equal({
            createdDate: dateFormat(refund1.createdAt, storeTimezone, 'MM-DD-YYYY hh:mm A'),
            locationName: store.name,
            orderCode: serviceOrder.orderCode,
            paymentEmployee: user.firstname + ' ' + user.lastname,
            paymentMethod: getPaymentType(payment.paymentProcessor, true),
            reason: capitalizeFirstLetterForEachWord(
                refund1.reason.toLowerCase().replace(/_/g, ' '),
            ),
            refundAmount: (refund1.refundAmountInCents / 100).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            }),
            refundProvider: capitalizeFirstLetterForEachWord(refund1.refundProvider),
            status: capitalizeFirstLetterForEachWord(refund1.status),
            updatedAt: dateFormat(refund1.updatedAt, storeTimezone, 'MM-DD-YYYY hh:mm A'),
        });
    });
});
