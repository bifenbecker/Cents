const phoneFormatter = require('../../utils/phoneFormatter');
const CustomerService = require('../../services/residential/Customer');
const getOrderCodePrefix = require('../../utils/getOrderCodePrefix');

const getTextByStatus = (orderStatus, phone) => {
    if (orderStatus === 'DESIGNATED_FOR_PROCESSING_AT_HUB') {
        return {
            status: 'Submitted',
            primaryMessage: 'Your order has been submitted but not yet picked up by the driver.',
            secondaryMessage:
                "*You will receive a text message with a link to review and pay for your order once it's ready for processing.",
            actions: [
                {
                    title: 'Cancel Order',
                    type: 'cancel_order',
                },
            ],
        };
    }
    if (orderStatus === 'IN_TRANSIT_TO_HUB' || orderStatus === 'DROPPED_OFF_AT_HUB') {
        return {
            status: 'Picked up',
            primaryMessage:
                'Your order has been picked up and is en route to the garment care facility.',
            secondaryMessage:
                "*You will receive a text message with a link to review and pay for your order once it's received.",
            actions: [],
        };
    }

    if (
        orderStatus === 'RECEIVED_AT_HUB_FOR_PROCESSING' ||
        orderStatus === 'HUB_PROCESSING_ORDER' ||
        orderStatus === 'HUB_PROCESSING_COMPLETE' ||
        orderStatus === 'READY_FOR_PROCESSING'
    ) {
        return {
            status: 'Processing',
            primaryMessage:
                'Your order has been received and is being processed at the garment care facility',
            secondaryMessage: `*We have sent a text message to ${phoneFormatter(
                phone,
            )} with a link to review and pay for your order.`,
            actions: [
                {
                    title: 'Resend Link',
                    type: 'resend_link',
                },
            ],
        };
    }

    return {
        status: 'Delivering to You',
        primaryMessage: 'Your order has been processed and is on its way back to your building.',
        secondaryMessage: `*We will send a text message to ${phoneFormatter(
            phone,
        )} to let you know when your order has been delivered.`,
        actions: [
            {
                title: 'Resend Link',
                type: 'resend_link',
            },
        ],
    };
};

async function getActiveOrders(req, res, next) {
    try {
        const customerService = new CustomerService(req.currentCustomer);
        let activeOrders = await customerService.activeOrders();

        activeOrders = activeOrders.map((order) => {
            const mappedOrder = {};
            mappedOrder.id = order.id;
            mappedOrder.orderCode = order.orderCode;
            mappedOrder.orderCodeWithPrefix = getOrderCodePrefix(order);
            mappedOrder.title = 'Your Laundry Order';
            mappedOrder.status = getTextByStatus(
                order.status,
                req.currentCustomer.phoneNumber,
            ).status;
            mappedOrder.primaryMessage = getTextByStatus(
                order.status,
                req.currentCustomer.phoneNumber,
            ).primaryMessage;
            mappedOrder.secondaryMessage = getTextByStatus(
                order.status,
                req.currentCustomer.phoneNumber,
            ).secondaryMessage;
            mappedOrder.actions = getTextByStatus(
                order.status,
                req.currentCustomer.phoneNumber,
            ).actions;
            mappedOrder.updatedAt = order.updatedAt;
            return mappedOrder;
        });

        res.status(200).json({ activeOrders });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getActiveOrders;
