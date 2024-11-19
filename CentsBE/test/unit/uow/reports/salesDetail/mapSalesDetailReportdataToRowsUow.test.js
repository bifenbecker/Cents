require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const sinon = require('sinon');
const LdClient = require('../../../../../launch-darkly/LaunchDarkly');

const mapSalesDetailDataToRowsUow = require('../../../../../uow/reports/salesDetail/mapSalesDetailDataToRowsUow')

describe('test map sales detail report data to rows', () => {
    let payload, data;
    beforeEach(() => {
        data = {
            id: '1001',
            address: '40 Lodge street, Albany, New York',
            orderIntakeDate: '06-24-2022',
            orderIntakeTime: '01:30 AM',
            IntakeEmployee: 'John Doe',
            customerName: 'Bill Gray',
            customerPhoneNumber: '9999999911',
            orderType: 'ONLINE',
            inTakePounds: 1,
            perPoundServices: 'SERVICE_PER_POUND_MOCKED',
            perPoundValue: '$10.00',
            fixedPriceServices: 'SERVICE_FIXED_PRICE_MOCKED',
            fixedPriceValue: '$10.55',
            products: 'POD-1, POD-2',
            productsValue: '$10.77',
            pickupFee: '$1.00',
            deliveryFee: '$1.00',
            onDemandPickupTip: '$1.00',
            onDemandDeliveryTip: '$1.00',
            subTotalOrderValue: '$15.00',
            promoCode: 'MOCKED_PROMO',
            promoDiscount: '$1.00',
            creditApplied: '$1.00',
            tipAmount: '$1.00',
            convenienceFee: '$1.00',
            transactionFee: '$0.00',
            taxAmount: '$1.00',
            netOrderTotal: '$13.00',
            orderPaymentDate: '06-24-2022',
            orderPaymentTime: '01:30 AM',
            paymentEmployee: 'John Doe',
            paymentType: 'Debit/Credit',
            cashCardReceipt: 'MOCKED_RECEIPT',
            paymentStatus: 'PAID',
            orderStatus: 'completed',
            modifiers: 'ariel, surf-excel',
            totalModifierValue: '$2.00',
            deliverySubsidy: '$0.00',
            pickupSubsidy: '$0.50',
            laundryBagTotalValue: '$1.00',
        }
        payload = {
            reportData: [data],
            reportTimeFrame: '05-01-2022-05-10-2022',
            recipient: {
                email: 'user-1@testmail.com'
            }
        }
    });

    describe('when laundry-bag-report-change flag is turned off', () => {
        it('should not expect laundry bag total value', async () => {
            sinon
                .stub(LdClient, 'evaluateFlag')
                .withArgs('laundry-bag-report-change', { key: payload.recipient.email })
                .returns(false);
            const mappedSaleDetailReportData = await mapSalesDetailDataToRowsUow(payload);

            expect(mappedSaleDetailReportData.finalReportData[0].pop()).to.be.eq('Pickup Subsidy');
            expect(mappedSaleDetailReportData.finalReportData[1].pop()).to.be.eq('$0.50');
        });
    });

    describe('when laundry-bag-report-change flag is turned on', () => {
        it('should include laundry bag total value', async () => {
            sinon
                .stub(LdClient, 'evaluateFlag')
                .withArgs('laundry-bag-report-change', { key: payload.recipient.email })
                .returns(true);

            const mappedSaleDetailReportData = await mapSalesDetailDataToRowsUow(payload);
            expect(mappedSaleDetailReportData.finalReportData[0].pop()).to.be.eq('Laundry Bag Products Value');
            expect(mappedSaleDetailReportData.finalReportData[1].pop()).to.be.eq('$1.00');
        });
    });

    describe('when pickup and delivery is completed', () => {
        beforeEach(() => {
            data.deliveryStatus = 'COMPLETED';
            data.pickupStatus = 'COMPLETED';
        });
        it('returns pickup, delivery fee without final as label', async () => {
            const mappedSaleDetailReportData = await mapSalesDetailDataToRowsUow(payload);
            expect(mappedSaleDetailReportData.finalReportData[0][16]).to.be.eq('Pickup Fee');
            expect(mappedSaleDetailReportData.finalReportData[1][16]).to.be.eq('$1.00');
            expect(mappedSaleDetailReportData.finalReportData[0][17]).to.be.eq('Delivery Fee');
            expect(mappedSaleDetailReportData.finalReportData[1][17]).to.be.eq('$1.00');
        });
    });

    describe('Order Prefix', () => {
        it('returns order prefix', async () => {
            const mappedSaleDetailReportData = await mapSalesDetailDataToRowsUow(payload);
            expect(mappedSaleDetailReportData.finalReportData[0][0]).to.be.eq('Order Prefix');
            expect(mappedSaleDetailReportData.finalReportData[1][0]).to.be.eq('DWF');
        });
    });

    describe('Pickup Fee', () => {
        describe('when pickup is not completed', () => {
            it('returns pickup without final as label', async () => {
                data.pickupStatus = 'scheduled'
                const mappedSaleDetailReportData = await mapSalesDetailDataToRowsUow(payload);
                expect(mappedSaleDetailReportData.finalReportData[0][16]).to.be.eq('Pickup Fee');
                expect(mappedSaleDetailReportData.finalReportData[1][16]).to.be.eq('$1.00 (not final)');
            });
        })
        describe('when pickup is completed', () => {
            it('returns pickup without label', async () => {
                data.pickupStatus = 'COMPLETED'
                const mappedSaleDetailReportData = await mapSalesDetailDataToRowsUow(payload);
                expect(mappedSaleDetailReportData.finalReportData[0][16]).to.be.eq('Pickup Fee');
                expect(mappedSaleDetailReportData.finalReportData[1][16]).to.be.eq('$1.00');
            });
        })
        describe('without pickup', () => {
            it('returns pickup without label', async () => {
                data.pickupStatus = null;
                const mappedSaleDetailReportData = await mapSalesDetailDataToRowsUow(payload);
                expect(mappedSaleDetailReportData.finalReportData[0][16]).to.be.eq('Pickup Fee');
                expect(mappedSaleDetailReportData.finalReportData[1][16]).to.be.eq('$0.00');
            });
        })
    });

    describe('Delivery Fee', () => {
        describe('when delivery is not completed', () => {
            it('returns delivery without final as label', async () => {
                data.deliveryStatus = 'scheduled'
                const mappedSaleDetailReportData = await mapSalesDetailDataToRowsUow(payload);
                expect(mappedSaleDetailReportData.finalReportData[0][17]).to.be.eq('Delivery Fee');
                expect(mappedSaleDetailReportData.finalReportData[1][17]).to.be.eq('$1.00 (not final)');
            });
        })
        describe('when delivery is completed', () => {
            it('returns delivery without label', async () => {
                data.deliveryStatus = 'COMPLETED'
                const mappedSaleDetailReportData = await mapSalesDetailDataToRowsUow(payload);
                expect(mappedSaleDetailReportData.finalReportData[0][17]).to.be.eq('Delivery Fee');
                expect(mappedSaleDetailReportData.finalReportData[1][17]).to.be.eq('$1.00');
            });
        })
        describe('without delivery', () => {
            it('returns delivery without label', async () => {
                data.deliveryStatus = null;
                const mappedSaleDetailReportData = await mapSalesDetailDataToRowsUow(payload);
                expect(mappedSaleDetailReportData.finalReportData[0][17]).to.be.eq('Delivery Fee');
                expect(mappedSaleDetailReportData.finalReportData[1][17]).to.be.eq('$0.00');
            });
        })
    });

    describe('test return payload', () => {
        it('should have pickup and delivery fee with (not final) tag', async () => {
            const mappedSaleDetailReportData = await mapSalesDetailDataToRowsUow(payload);
            expect(mappedSaleDetailReportData).to.have.property('finalReportData');
            expect(mappedSaleDetailReportData.reportName).to.be.equal(`Cents_Sales_Detail_Report_${payload.reportTimeFrame}.csv`);
            expect(mappedSaleDetailReportData).to.have.property('reportObjectType').equal('array');
        });
    });
});