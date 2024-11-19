const jwt = require('jsonwebtoken');
const ServiceOrder = require('../../models/serviceOrders');
const getOrderCodePrefix = require('../../utils/getOrderCodePrefix');
const { getCustomer } = require('../../uow/singleOrder/getCustomer');

function calculateItemDiscount(total, discountValue, discountType) {
    if (discountType === 'percentage-discount') {
        return Number(((total * discountValue) / 100).toFixed(2));
    }
    if (discountValue >= total) {
        return Number(total.toFixed(2));
    }
    return Number(discountValue.toFixed(2));
}

function isMatch(id, itemIds) {
    return itemIds.find((item) => item === id);
}

function calculateModifiersAmount(items, discountValue, promotionType) {
    const modifiers = items.filter((item) => item.refItem[0].serviceModifierId !== null);
    let total = 0;
    modifiers.forEach((modifier) => {
        const { lineItemTotalCost } = modifier.refItem[0].lineItemDetail;
        total += calculateItemDiscount(lineItemTotalCost, discountValue, promotionType);
    });
    return Number(total.toFixed(2));
}

function calculatePromotionAmount(promotionDetails, orderItems, orderTotal) {
    const { promotionType, discountValue, appliesToType } = promotionDetails.promoDetails;
    const applicableItems = promotionDetails.itemIds;
    let discountAmount = 0;
    const itemIds = [];
    if (appliesToType === 'entire-order') {
        discountAmount = calculateItemDiscount(orderTotal, discountValue, promotionType);
        return { discountAmount, itemIds };
    }
    orderItems.forEach((item) => {
        const { id, category, lineItemTotalCost } = item.refItem[0].lineItemDetail;
        if (isMatch(id, applicableItems)) {
            itemIds.push(id);
            if (promotionType !== 'fixed-price-discount') {
                discountAmount += calculateItemDiscount(
                    lineItemTotalCost,
                    discountValue,
                    promotionType,
                );
                if (category === 'PER_POUND') {
                    discountAmount += calculateModifiersAmount(
                        orderItems,
                        discountValue,
                        promotionType,
                    );
                }
            }
        }
    });
    if (promotionType === 'fixed-price-discount') {
        discountAmount = discountValue;
    }
    return { discountAmount, itemIds };
}

async function mapResponse(order) {
    const response = {};
    const { weightLogs } = order;
    response.orderCodeWithPrefix = getOrderCodePrefix(order);
    response.orderId = order.id;
    response.weightLogs = weightLogs;
    response.status = order.status;
    response.balanceDue = order.balanceDue;
    response.netOrderTotal = order.netOrderTotal;
    response.orderTotal = order.orderTotal;
    response.balanceDue = order.balanceDue;
    response.tipAmount = order.tipAmount;
    response.taxAmount = Number(order.taxAmountInCents / 100);
    response.creditAmount = order.creditAmount;
    response.paymentStatus = order.paymentStatus;
    response.paymentTiming = order.paymentTiming;
    response.promotion = order.promotion ? order.promotion : {};
    response.store = order.store ? order.store : {};
    response.promotionId = order.promotionId;
    response.customer = await getCustomer(order.storeCustomer);
    const orderItems = [];
    for (const item of order.orderItems) {
        const temp = {};
        if (item.refItem.length) {
            temp.orderItemId = item.id;
            const { lineItemDetail } = item.refItem[0];
            temp.count = lineItemDetail.lineItemQuantity || null;
            temp.itemTotal = lineItemDetail.lineItemTotalCost || null;
            temp.serviceCategory =
                lineItemDetail.soldItemType === 'InventoryItem' ? null : lineItemDetail.category;
            temp.price = lineItemDetail.lineItemUnitCost;
            temp.laundryType = lineItemDetail.lineItemName;
            temp.servicePriceId =
                lineItemDetail.soldItemType === 'ServicePrices' ? lineItemDetail.soldItemId : null;
            temp.inventoryItemId =
                lineItemDetail.soldItemType === 'InventoryItem' ? lineItemDetail.soldItemId : null;
            temp.serviceId =
                lineItemDetail.soldItemType === 'ServicesMaster' ? lineItemDetail.soldItemId : null;
            temp.minimumQuantity = lineItemDetail.lineItemMinQuantity;
            temp.minimumPrice = lineItemDetail.lineItemMinPrice;
            temp.hasMinPrice = temp.minimumQuantity !== null && temp.minimumPrice !== null;
            if (lineItemDetail.category === 'PER_POUND') {
                temp.weightLogs = weightLogs;
            }
        }
        orderItems.push(temp);
    }
    if (order.promotionId) {
        const { promotionDetails } = order.parentOrder;
        const { discountAmount, itemIds } = calculatePromotionAmount(
            promotionDetails,
            order.orderItems,
            order.orderTotal,
        );
        response.promotionDiscount = discountAmount;
        response.promotion = promotionDetails;
        response.promotion.itemIds = itemIds;
    } else {
        response.promotion = {};
    }
    response.orderItems = orderItems;
    return response;
}

async function getSingleOrder(orderId) {
    try {
        const order = await ServiceOrder.query()
            .where(`${ServiceOrder.tableName}.id`, orderId)
            .withGraphJoined(
                `[orderItems.[referenceItems as refItem.[
                lineItemDetail]],
                storeCustomer(userDetails).[centsCustomer(userDetails)],
                store(filterDetails),
                weightLogs(weightFilter),
                order as parentOrder.[promotionDetails(promotionSelect)]
            ]`,
            )
            .modifiers({
                weightFilter: (query) => {
                    query
                        .select(
                            'id',
                            'totalWeight',
                            'chargeableWeight',
                            'referenceItemId',
                            'step',
                            'status',
                            'teamMemberId',
                            'editReason',
                            'isEdited',
                            'updatedAt',
                        )
                        .orderBy('id');
                },
                promotionFilter: (query) => {
                    query.select(
                        'promotionType',
                        'discountValue',
                        'balanceRule',
                        'redemptionRule',
                        'name',
                    );
                },
                filterDetails: (query) => {
                    query.select(
                        'name',
                        'address',
                        'city',
                        'state',
                        'zipCode',
                        'uberStoreUuid',
                        'id',
                    );
                },
                userDetails: (query) => {
                    query.select('id', 'firstName', 'lastName', 'phoneNumber', 'email');
                },
                promotionSelect: (query) => {
                    query.select('promoDetails', 'itemIds');
                },
            })
            .first();
        const orderDetails = order ? await mapResponse(order) : [];
        return orderDetails;
    } catch (error) {
        throw new Error(error);
    }
}

async function liveStatus(req, res, next) {
    try {
        let { token } = req.query;
        token = token.toString().replace(/'|'/g, '');
        if (!token) {
            res.status(404).json({
                error: 'No token present in the request',
            });
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_TOKEN_ORDER);
        const orderId = decodedToken.id;
        const orderDetails = await getSingleOrder(orderId);
        res.status(200).json({
            success: true,
            orderDetails,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = liveStatus;
