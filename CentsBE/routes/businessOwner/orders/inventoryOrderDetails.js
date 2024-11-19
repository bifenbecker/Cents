const InventoryOrder = require('../../../models/inventoryOrders');

const getBusiness = require('../../../utils/getBusiness');
const getOrderCodePrefix = require('../../../utils/getOrderCodePrefix');

function getCustomer(user) {
    // prioritize business level details over cents level details.
    const details = {};
    details.id = user.id;
    details.fullName = `${user.firstName} ${user.lastName}`;
    details.phoneNumber = user.phoneNumber ? user.phoneNumber : user.centsCustomer.phoneNumber;
    details.email = user.email ? user.email : user.centsCustomer.email;
    details.languageId = user.languageId ? user.languageId : user.centsCustomer.languageId || 1;
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
    response.totalAmount = details.orderTotal;
    response.salesTaxAmount = Number((details.salesTaxAmount / 100).toFixed(2));
    response.netOrderTotal = details.netOrderTotal;
    response.orderableId = details.order.orderableId;
    response.orderableType = details.order.orderableType;
    response.orderId = details.order.id;
    response.store = details.store;
    response.tipAmount = details.tipAmount;
    response.convenienceFee = details.convenienceFee;
    response.creditAmount = details.creditAmount;
    response.orderItems = details.lineItems;
    response.orderType = response.orderableType === 'InventoryOrder' ? 'INVENTORY' : null;
    response.orderCodeWithPrefix = getOrderCodePrefix(response);
    response.promotionId = details.promotionId;
    response.promotion = details.order.promotionDetails ? details.order.promotionDetails : {};
    response.placedAt = details.createdAt;
    response.count = details.lineItemQuantity;
    response.payments = details.order.payments ? details.order.payments : {};
    if (response.status === 'COMPLETED' || response.status === 'CANCELLED') {
        response.completedAt = details.updatedAt;
    }
    response.isTaxable = !!details.lineItems.find((lineItem) => lineItem.inventoryItem.isTaxable);
    return response;
}

async function queryFunction(id, businessId) {
    const details = await InventoryOrder.query()
        .findOne({
            'inventoryOrders.id': id,
        })
        .withGraphJoined(
            `[order.[payments(payments), promotionDetails], lineItems.[inventoryItem], 
            customer(customerDetails).[centsCustomer(customerDetails)], store(storeDetails),
            employee.[user(userDetails)]]`,
        )
        .modifiers({
            storeDetails: (query) => {
                query.select('id', 'name', 'address', 'city', 'state', 'businessId');
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
                        'createdAt',
                    )
                    .orderBy('id');
            },
            customerDetails: (query) => {
                query.select('id', 'firstName', 'lastName', 'phoneNumber', 'email', 'languageId');
            },
        })
        .whereRaw(`"store"."businessId" =  ${businessId}`);

    return details ? mapDetails(details) : { error: 'order not found' };
}

async function getDetails(req, res, next) {
    try {
        const { id } = req.params;
        const business = await getBusiness(req);

        const details = await queryFunction(id, business.id);
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
