// Packages
const { transaction } = require('objection');

// Pipelines
const updateOrderPipeline = require('../../../../pipeline/liveLink/updateOrderPipeline');

// Models
const TeamMember = require('../../../../models/teamMember');
const ServiceOrderBag = require('../../../../models/serviceOrderBags');

// Functions
const getSingleOrderLogic = require('../../../../uow/singleOrder/getSingleOrderLogicUOW');
const VoidServiceOrder = require('../../../../services/orders/serviceOrders/voidServiceOrder');
const Store = require('../../../../models/store');
const { origins, orderSmsEvents } = require('../../../../constants/constants');
const eventEmitter = require('../../../../config/eventEmitter');

/**
 * @description This function marks the service order as cancelled
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function voidOrder(req, res, next) {
    try {
        const { id } = req.params;
        const { employeeCode, notes } = req.body;

        let employeeName = null;

        if (employeeCode) {
            const teamMember = await TeamMember.query()
                .withGraphFetched('user')
                .where({
                    businessId: req.currentStore.businessId,
                    employeeCode,
                })
                .first();
            employeeName = `${teamMember.user.firstname} ${teamMember.user.lastname}`;
        }

        const metaData = {
            origin: origins.EMPLOYEE_APP,
            notes,
            businessId: req.currentStore.businessId,
            employeeCode,
            employeeName,
        };

        const voidServiceOrder = new VoidServiceOrder(id, metaData);
        await voidServiceOrder.execute();
        const orderDetails = await getSingleOrderLogic(id, req.currentStore);
        eventEmitter.emit('orderSmsNotification', orderSmsEvents.PICK_UP_ORDER_CANCELED, id);
        eventEmitter.emit('indexCustomer', orderDetails.customer.id);
        res.status(200).json({
            success: true,
            orderDetails,
        });
    } catch (error) {
        next(error);
    }
}

async function updatePromotionTipAndCredit(req, res, next) {
    try {
        const { serviceOrder, orderCalculationAttributes, currentOrderDetails, orderId } =
            req.constants;
        const store = await Store.query().findById(serviceOrder.storeId);

        const payload = {
            ...req.constants,
            ...orderCalculationAttributes,
            serviceOrder,
            orderType: serviceOrder.orderType,
            store,
            serviceOrderId: serviceOrder.id,
            orderId,
            masterOrderId: orderId,
            currentOrderDetails,
            customer: {
                id: currentOrderDetails.centsCustomerId,
                storeCustomerId: currentOrderDetails.storeCustomerId,
            },
            origin: origins.EMPLOYEE_APP,
        };

        await updateOrderPipeline(payload);
        const orderDetails = await getSingleOrderLogic(serviceOrder.id, req.currentStore);
        res.status(200).json({
            success: true,
            orderDetails,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Edit the individual ServiceOrderBag
 *
 * @param {Object} bag
 * @param {void} transaction
 */
async function editIndividualBagNotes(bag, transaction) {
    const updatedBag = await ServiceOrderBag.query(transaction).patch(bag).findById(bag.id);
    return updatedBag;
}

/**
 * Edit the individual notes for a given bag
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function editServiceOrderBagNotes(req, res, next) {
    let trx = null;

    try {
        const { id } = req.params;
        const { bags } = req.body;

        trx = await transaction.start(ServiceOrderBag.knex());

        const editedBags = await bags.map((bag) => editIndividualBagNotes(bag, trx));

        await Promise.all(editedBags);
        await trx.commit();

        const serviceOrderBags = await ServiceOrderBag.query()
            .where({
                serviceOrderId: id,
            })
            .orderBy('id', 'asc');
        serviceOrderBags.forEach((item, index) => {
            item.bagOrder = index;
        });

        return res.json({
            success: true,
            serviceOrderBags,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

module.exports = exports = {
    voidOrder,
    editServiceOrderBagNotes,
    updatePromotionTipAndCredit,
};
