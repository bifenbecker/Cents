const LdClient = require('../../../launch-darkly/LaunchDarkly');
const getOrderCodePrefix = require('../../../utils/getOrderCodePrefix');
/**
 * Map the retrieved report data to proper columns
 *
 * @param {Object} payload
 */
async function mapSalesDetailDataToRows(payload) {
    try {
        const newPayload = payload;
        const { reportData, reportTimeFrame, recipient } = newPayload;
        const featureFlagUser = { key: recipient.email };
        const cleanRiteFlag = await LdClient.evaluateFlag(
            'laundry-bag-report-change',
            featureFlagUser,
        );

        const data = [
            [
                'Order Prefix',
                'OrderId',
                'Order Location',
                'Order Intake Date',
                'Order Intake Time',
                'Intake Employee',
                'Customer Name',
                'Customer Phone Number',
                'Order Type',
                'Intake Pounds',
                'Per Pound Services',
                'Per Pound Service Value',
                'Fixed Price Services',
                'Fixed Price Service Value',
                'Products',
                'Products Value',
                'Pickup Fee',
                'Delivery Fee',
                'On Demand Pickup Tip',
                'On Demand Delivery Tip',
                'Sub Total Order Value',
                'Promo Code',
                'Promo Discount',
                'Credit Applied',
                'Tip Amount',
                'Convenience Fee',
                'Transaction Fee',
                'Tax Amount',
                'Order Value Total',
                'Order Payment Date',
                'Order Payment Time',
                'Payment Employee',
                'Payment Type',
                'Payment Memo',
                'Cash Card Receipt',
                'Payment Status',
                'Order Status',
                'Modifiers',
                'Total Modifier Value',
                'Delivery Subsidy',
                'Pickup Subsidy',
            ],
        ];

        if (cleanRiteFlag) {
            data[0].push('Laundry Bag Products Value');
        }

        reportData.forEach((a) => {
            const {
                id,
                address,
                orderIntakeDate,
                orderIntakeTime,
                IntakeEmployee,
                customerName,
                customerPhoneNumber,
                orderType,
                inTakePounds,
                perPoundServices,
                fixedPriceServices,
                perPoundValue,
                fixedPriceValue,
                products,
                productsValue,
                laundryBagTotalValue,
                pickupFee,
                deliveryFee,
                onDemandPickupTip,
                onDemandDeliveryTip,
                subTotalOrderValue,
                promoCode,
                promoDiscount,
                creditApplied,
                tipAmount,
                transactionFee,
                taxAmount,
                netOrderTotal,
                orderPaymentDate,
                orderPaymentTime,
                paymentEmployee,
                paymentType,
                paymentMemo,
                cashCardReceipt,
                paymentStatus,
                orderStatus,
                convenienceFee,
                deliveryStatus,
                pickupStatus,
                modifiers,
                totalModifierValue,
                deliverySubsidy,
                pickupSubsidy,
            } = a;
            const orderPrefix = getOrderCodePrefix({ orderType, orderCode: id }).split('-');
            const rowToPush = [
                orderPrefix[0],
                id,
                address,
                orderIntakeDate,
                orderIntakeTime,
                IntakeEmployee,
                customerName,
                customerPhoneNumber,
                orderType.toLowerCase(),
                inTakePounds,
                perPoundServices,
                perPoundValue,
                fixedPriceServices,
                fixedPriceValue,
                products,
                productsValue,
                pickupStatus
                    ? pickupStatus === 'COMPLETED'
                        ? pickupFee
                        : `${pickupFee} (not final)`
                    : '$0.00',
                deliveryStatus
                    ? deliveryStatus === 'COMPLETED'
                        ? deliveryFee
                        : `${deliveryFee} (not final)`
                    : '$0.00',
                onDemandPickupTip,
                onDemandDeliveryTip,
                subTotalOrderValue,
                promoCode,
                promoDiscount,
                creditApplied,
                tipAmount,
                convenienceFee,
                transactionFee,
                taxAmount,
                netOrderTotal,
                orderPaymentDate,
                orderPaymentTime,
                paymentEmployee,
                paymentType,
                paymentMemo,
                cashCardReceipt,
                paymentStatus,
                orderStatus,
                modifiers,
                totalModifierValue,
                deliverySubsidy,
                pickupSubsidy,
            ];

            if (cleanRiteFlag) {
                rowToPush.push(laundryBagTotalValue);
            }

            data.push(rowToPush);
        });

        newPayload.finalReportData = data;
        newPayload.reportName = `Cents_Sales_Detail_Report_${reportTimeFrame}.csv`;
        newPayload.reportObjectType = 'array';
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = mapSalesDetailDataToRows;
