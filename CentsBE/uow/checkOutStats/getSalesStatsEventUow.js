const Payments = require('../../models/payment');
const Orders = require('../../models/orders');
const ServiceOrder = require('../../models/serviceOrders');

async function getSalesStats(payload) {
    const newPayload = payload;
    const { totalOrdersForEmployee, inventoryOrders } = newPayload;
    let cashTotal = 0;
    let creditCardTotal = 0;
    let cashCardTotal = 0;
    const cashOrderLineItems = [];
    const creditCardOrderLineItems = [];
    const cashCardOrderLineItems = [];
    try {
        // use ID from serviceOrder table to get the storeCustomerID
        const inventoryOrdersFromOrdersTable = totalOrdersForEmployee.filter(
            (order) => order.orderableType === 'InventoryOrder',
        );
        const inventoryOrderIds = inventoryOrdersFromOrdersTable.map((prop) => prop.id);
        const inventoryPayments = await Payments.query()
            .whereIn('orderId', inventoryOrderIds)
            .andWhere('status', 'succeeded');

        let inventoryCashCard = inventoryPayments
            .filter((payment) => payment.stripeClientSecret === 'cashCard')
            .map((prop) => prop.totalAmount);
        const inventoryOrderCashCardPaymentsIds = inventoryPayments
            .filter((payment) => payment.stripeClientSecret === 'cashCard')
            .map((prop) => prop.orderId);
        const cashCardInventoryOrders = await Orders.query().whereIn(
            'id',
            inventoryOrderCashCardPaymentsIds,
        );
        const cashCardInventoryOrderIds = cashCardInventoryOrders.map((order) => order.orderableId);
        const cashCardInventoryOrderCodes = inventoryOrders
            .filter((order) => cashCardInventoryOrderIds.includes(order.id))
            .map((order) => order.orderCode);
        const inventoryOrderCashCardPaymentTotals = inventoryPayments.filter((order) =>
            inventoryOrderCashCardPaymentsIds.includes(order.orderId),
        );
        cashCardInventoryOrderCodes.forEach((code, idx) => {
            const pair = {};
            pair.orderCode = code;
            pair.totalAmount = inventoryOrderCashCardPaymentTotals[idx].totalAmount;
            cashCardOrderLineItems.push(pair);
        });

        let inventoryCash = inventoryPayments
            .filter((payment) => payment.stripeClientSecret === 'cash')
            .map((prop) => prop.totalAmount);
        const inventoryOrderCashPaymentsIds = inventoryPayments
            .filter(
                (payment) =>
                    payment.paymentProcessor === 'cash' || payment.stripeClientSecret === 'cash',
            )
            .map((prop) => prop.orderId);
        const cashInventoryOrders = await Orders.query().whereIn(
            'id',
            inventoryOrderCashPaymentsIds,
        );
        const cashInventoryOrderIds = cashInventoryOrders.map((order) => order.orderableId);
        const cashInventoryOrderCodes = inventoryOrders
            .filter((order) => cashInventoryOrderIds.includes(order.id))
            .map((order) => order.orderCode);
        const inventoryOrderCashPaymentTotals = inventoryPayments.filter((order) =>
            inventoryOrderCashPaymentsIds.includes(order.orderId),
        );
        cashInventoryOrderCodes.forEach((code, idx) => {
            const pair = {};
            pair.orderCode = code;
            pair.totalAmount = inventoryOrderCashPaymentTotals[idx].totalAmount;
            cashOrderLineItems.push(pair);
        });

        let inventoryCredit = inventoryPayments
            .filter((payment) => payment.paymentProcessor === 'stripe')
            .map((prop) => prop.totalAmount);
        const inventoryOrderCreditPaymentsIds = inventoryPayments
            .filter((payment) => payment.paymentProcessor === 'stripe')
            .map((prop) => prop.orderId);
        const creditInventoryOrders = await Orders.query().whereIn(
            'id',
            inventoryOrderCreditPaymentsIds,
        );
        const creditInventoryOrderIds = creditInventoryOrders.map((order) => order.orderableId);
        const creditInventoryOrderCodes = inventoryOrders
            .filter((order) => creditInventoryOrderIds.includes(order.id))
            .map((order) => order.orderCode);
        const inventoryOrderCreditPaymentTotals = inventoryPayments.filter((order) =>
            inventoryOrderCreditPaymentsIds.includes(order.orderId),
        );
        creditInventoryOrderCodes.forEach((code, idx) => {
            const pair = {};
            pair.orderCode = code;
            pair.totalAmount = inventoryOrderCreditPaymentTotals[idx].totalAmount;
            creditCardOrderLineItems.push(pair);
        });

        inventoryCash = inventoryCash.reduce((p1, p2) => p1 + p2, 0);
        inventoryCredit = inventoryCredit.reduce((p1, p2) => p1 + p2, 0);
        inventoryCashCard = inventoryCashCard.reduce((p1, p2) => p1 + p2, 0);

        /**
         * To Get Order Codes Associated by Payment Type
         */
        const serviceOrders = totalOrdersForEmployee.filter(
            (order) => order.orderableType === 'ServiceOrder',
        );
        const serviceOrderIds = serviceOrders.map((prop) => prop.id);
        const serviceOrderPayments = await Payments.query().whereIn('orderId', serviceOrderIds);
        const serviceOrderCashPaymentsIds = serviceOrderPayments
            .filter(
                (payment) =>
                    payment.paymentProcessor === 'cash' || payment.stripeClientSecret === 'cash',
            )
            .map((prop) => prop.orderId);
        const cashOrders = await Orders.query().whereIn('id', serviceOrderCashPaymentsIds);
        const cashOrderIds = cashOrders.map((order) => order.orderableId);
        const totalCashServiceOrders = await ServiceOrder.query().whereIn('id', cashOrderIds);
        let serviceOrderPaymentsInCash = serviceOrderPayments
            .filter(
                (payment) =>
                    payment.paymentProcessor === 'cash' || payment.stripeClientSecret === 'cash',
            )
            .map((prop) => prop.totalAmount);
        const cashOrderCodes = totalCashServiceOrders.map((order) => order.orderCode);
        const serviceOrderCashPaymentTotals = serviceOrderPayments.filter((order) =>
            serviceOrderCashPaymentsIds.includes(order.orderId),
        );

        cashOrderCodes.forEach((code, idx) => {
            const pair = {};
            pair.orderCode = code;
            pair.totalAmount = serviceOrderCashPaymentTotals[idx].totalAmount;
            cashOrderLineItems.push(pair);
        });
        serviceOrderPaymentsInCash = serviceOrderPaymentsInCash.reduce((a, b) => a + b, 0);

        let serviceOrderPaymentsInCredit = serviceOrderPayments
            .filter((payment) => payment.paymentProcessor === 'stripe')
            .map((prop) => prop.totalAmount);
        const serviceOrderCreditCardPaymentsIds = serviceOrderPayments
            .filter((payment) => payment.paymentProcessor === 'stripe')
            .map((prop) => prop.orderId);
        const creditCardOrders = await Orders.query().whereIn(
            'id',
            serviceOrderCreditCardPaymentsIds,
        );
        const creditCardOrderIds = creditCardOrders.map((order) => order.orderableId);
        const totalCreditCardServiceOrders = await ServiceOrder.query().whereIn(
            'id',
            creditCardOrderIds,
        );
        const creditCardOrderCodes = totalCreditCardServiceOrders
            .filter((order) => creditCardOrderIds.includes(order.id))
            .map((order) => order.orderCode);
        const serviceOrderCreditCardPaymentTotals = serviceOrderPayments.filter((order) =>
            serviceOrderCreditCardPaymentsIds.includes(order.orderId),
        );

        creditCardOrderCodes.forEach((code, idx) => {
            const pair = {};
            pair.orderCode = code;
            pair.totalAmount = serviceOrderCreditCardPaymentTotals[idx].totalAmount;
            creditCardOrderLineItems.push(pair);
        });
        serviceOrderPaymentsInCredit = serviceOrderPaymentsInCredit.reduce((a, b) => a + b, 0);

        let serviceOrderPaymentsInCashCard = serviceOrderPayments
            .filter(
                (payment) =>
                    payment.paymentProcessor === 'cashCard' ||
                    payment.stripeClientSecret === 'cashCard',
            )
            .map((prop) => prop.totalAmount);
        const serviceOrderCashCardPaymentsIds = serviceOrderPayments
            .filter(
                (payment) =>
                    payment.paymentProcessor === 'cashCard' ||
                    payment.stripeClientSecret === 'cashCard',
            )
            .map((prop) => prop.orderId);
        const cashCardOrders = await Orders.query().whereIn('id', serviceOrderCashCardPaymentsIds);
        const cashCardOrderIds = cashCardOrders.map((order) => order.orderableId);
        const totalCashCardServiceOrders = await ServiceOrder.query().whereIn(
            'id',
            cashCardOrderIds,
        );
        const cashCardOrderCodes = totalCashCardServiceOrders
            .filter((order) => cashCardOrderIds.includes(order.id))
            .map((order) => order.orderCode);
        const serviceOrderCashCardPaymentTotals = serviceOrderPayments.filter((order) =>
            serviceOrderCashCardPaymentsIds.includes(order.orderId),
        );
        cashCardOrderCodes.forEach((code, idx) => {
            const pair = {};
            pair.orderCode = code;
            pair.totalAmount = serviceOrderCashCardPaymentTotals[idx].totalAmount;
            cashCardOrderLineItems.push(pair);
        });
        serviceOrderPaymentsInCashCard = serviceOrderPaymentsInCashCard.reduce((a, b) => a + b, 0);
        cashTotal = serviceOrderPaymentsInCash + inventoryCash;
        creditCardTotal = serviceOrderPaymentsInCredit + inventoryCredit;
        cashCardTotal = serviceOrderPaymentsInCashCard + inventoryCashCard;
        newPayload.cashCardTotal = cashCardTotal.toFixed(2);
        newPayload.creditCardTotal = creditCardTotal.toFixed(2);
        newPayload.cashTotal = cashTotal.toFixed(2);
        newPayload.cashOrderLineItems = cashOrderLineItems;
        newPayload.creditCardOrderLineItems = creditCardOrderLineItems;
        newPayload.cashCardOrderLineItems = cashCardOrderLineItems;
        return newPayload;
    } catch (err) {
        throw new Error(err.message);
    }
}

module.exports = exports = getSalesStats;
