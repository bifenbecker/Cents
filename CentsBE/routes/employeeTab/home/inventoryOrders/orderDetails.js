const InventoryOrder = require('../../../../models/inventoryOrders');
const getOrderCodePrefix = require('../../../../utils/getOrderCodePrefix');

// prioritize business level details over cents level details.
function getCustomer(user) {
    // prioritize business level details over cents level details.
    const details = {};
    details.id = user.id;
    details.fullName = `${user.firstName} ${user.lastName}`;
    details.phoneNumber = user.phoneNumber ? user.phoneNumber : user.centsCustomer.phoneNumber;
    details.email = user.email ? user.email : user.centsCustomer.email;
    details.languageId = user.languageId ? user.languageId : user.centsCustomer.languageId || 1;
    details.centsCustomerId = user.centsCustomer.id;
    details.storeCustomerId = user.storeCustomerId;
    details.stripeCustomerId = user.centsCustomer.stripeCustomerId;
    details.availableCredit = user.creditAmount || 0;
    return details;
}

function mapDetails(details) {
    const response = {};
    response.id = details.id;
    response.customer = details.storeCustomerId ? getCustomer(details.customer) : {};
    response.employee = details.employeeId
        ? {
              employeeCode: details.employee.employeeCode,
              name: `${details.employee.user.firstname} ${details.employee.user.lastname}`,
          }
        : {};
    response.status = details.status;
    response.paymentStatus = details.paymentStatus;
    response.orderCode = details.orderCode;
    response.orderTotal = details.orderTotal;
    response.salesTaxAmount = Number((details.salesTaxAmount / 100).toFixed(2));
    response.taxAmount = Number((details.salesTaxAmount / 100).toFixed(2));
    response.tipAmount = details.tipAmount;
    response.convenienceFee = details.convenienceFee;
    response.creditAmount = details.creditAmount;
    response.netOrderTotal = details.netOrderTotal;
    response.orderableId = details.order.orderableId;
    response.orderableType = details.order.orderableType;
    response.orderId = details.order.id;
    response.tipAmount = details.tipAmount;
    response.store = details.store;
    response.orderItems = details.lineItems;
    response.promotionId = details.promotionId;
    response.promotion = details.order.promotionDetails ? details.order.promotionDetails : {};
    response.placedAt = details.createdAt;
    response.count = details.lineItemQuantity;
    response.uuid = details.uuid;
    response.orderType = response.orderableType === 'InventoryOrder' ? 'INVENTORY' : null;
    response.orderCodeWithPrefix = getOrderCodePrefix(response);
    if (response.status === 'COMPLETED' || response.status === 'CANCELLED') {
        response.completedAt = details.updatedAt;
    }
    response.payments = details.order.payments ? details.order.payments : {};
    return response;
}

async function queryFunction(id, currentStore) {
    const details = await InventoryOrder.query()
        .findOne({
            'inventoryOrders.id': id,
            'inventoryOrders.storeId': currentStore.id,
        })
        .withGraphJoined(
            `[order.[payments(payments), promotionDetails(promotionSelect)], lineItems, 
            customer(customerDetails).[centsCustomer(centsCustomerDetails)], store(storeDetails),
            employee.[user(userDetails)]]`,
        )
        .modifiers({
            storeDetails: (query) => {
                query.select('id', 'name', 'address', 'city', 'state');
            },
            customerDetails: (query) => {
                query.select('id', 'firstName', 'lastName', 'phoneNumber', 'email', 'languageId');
            },
            centsCustomerDetails: (query) => {
                query.select(
                    'id',
                    'firstName',
                    'lastName',
                    'phoneNumber',
                    'email',
                    'languageId',
                    'stripeCustomerId',
                );
            },
            userDetails: (query) => {
                query.select('id', 'firstname', 'lastname', 'phone', 'email');
            },
            payments: (query) => {
                query
                    .select(
                        'id',
                        'orderId',
                        'paymentToken',
                        'status',
                        'totalAmount',
                        'stripeClientSecret',
                        'esdReceiptNumber',
                        'paymentProcessor',
                        'paymentMemo',
                        'changeDue',
                        'createdAt',
                    )
                    .orderBy('id');
            },
            promotionSelect: (query) => {
                query.select('promoDetails', 'itemIds');
            },
        });

    return details ? mapDetails(details) : { error: 'order not found' };
}

async function getDetails(req, res, next) {
    try {
        const { id } = req.params;
        const { currentStore } = req;

        const details = await queryFunction(id, currentStore);
        if (details.error) {
            res.status(404).json(details);
            return;
        }
        res.status(200).json({
            success: true,
            details,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = { getDetails, queryFunction };
