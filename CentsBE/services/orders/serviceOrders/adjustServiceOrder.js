const { raw } = require('objection');

const OrderBase = require('../orderBase');

const ServiceOrder = require('../../../models/serviceOrders');
const InventoryItems = require('../../../models/inventoryItem');
const OrderAdjustmentLog = require('../../../models/orderAdjustmentLog');
const ServiceOrderItemModel = require('../../../models/serviceOrderItem');
const OrderActivityLog = require('../../../models/orderActivityLog');
const ServiceOrderWeightLog = require('../../../models/serviceOrderWeights');
const Payment = require('../../../models/payment');

const NewBuilder = require('../builders/serviceOrderItems/newItemBuilder');
const UpdateBuilder = require('../builders/serviceOrderItems/editItemBuilder');
const DeleteBuilder = require('../builders/serviceOrderItems/deleteItemBuilder');

const OrderAdjustmentBuilder = require('../builders/adjustmentLogs/base');

const WeightLogsBuilder = require('../builders/weightLog/base');

const fetchPromotionDetails = require('../queries/getPromotionDetails');
const currentActiveServiceOrderItems = require('../queries/currentActiveServiceItems');

const PromotionCalculatorFactory = require('../factories/orderPromotionCalculatorFactory');
const ServiceOrderCalculatorFactory = require('../factories/serviceOrderCalculatorFactory');
const CreditHistoryManager = require('./helpers/creditHistoryManager');

const getPendingPayment = require('../queries/getPendingPaymentIntent');
const updateStripePaymentIntent = require('../../../uow/ResidentialOrder/payment/updatePaymentIntent');

class AdjustServiceOrder extends OrderBase {
    constructor(id, payload) {
        super(payload);
        this.id = id;
        this.currentOrderItems = [];
        this.updatedInventory = [];
        this.updateOrder = [];
        this.calculator = {};
    }

    async perform() {
        await this.prepareData();
        this.processOrderItems();
        await this.updateOrderItems();
        await this.updateInventory();
        await this.setCalculator();
        await this.updateOrderDetails();
        if (this.isAdjustment()) {
            await this.addAdjustmentLog();
        }
        await this.addActivityLogs();
        await this.addWeightLogs();
        await this.manageCreditHistory();
        if (this.isOnline()) {
            await this.updatePaymentIntent();
        }
    }

    async updateOrderItems() {
        await ServiceOrderItemModel.query(this.transaction).upsertGraph(this.items);
    }

    async updateInventory() {
        const updatedItems = this.updatedInventory.map((item) =>
            InventoryItems.query(this.transaction)
                .patch({
                    quantity: raw(`quantity + ${item.changeInQuantity}`),
                })
                .findById(item.inventoryItemId),
        );
        await Promise.all(updatedItems);
    }

    processOrderItems() {
        this.payload.orderItems.forEach((item) => {
            if (item.id) {
                if (item.isDeleted) {
                    const currentItem = this.findOrderItem(item.id);
                    this.deleteItem(currentItem);
                    if (currentItem.category === 'PER_POUND') {
                        this.deleteCurrentModifiers();
                    }
                } else {
                    this.updateItem(item);
                    if (item.category === 'PER_POUND') {
                        this.manageModifiers(item);
                    }
                }
            } else {
                this.addNewItem(item);
                if (item.category === 'PER_POUND') {
                    this.addModifiers(item);
                }
            }
        });
    }

    async prepareData() {
        await this.setCurrentOrderItems();
        const { customerName, customerPhoneNumber, status } = this.payload;
        this.status = status;
        this.customer = {
            customerName,
            customerPhoneNumber,
        };
        this.payload.balanceDue = Number(this.payload.balanceDue);
        this.payload.creditAmount = Number(this.payload.creditAmount);
        this.payload.netOrderTotal = Number(this.payload.netOrderTotal);
        this.payload.orderTotal = Number(this.payload.orderTotal);
        this.payload.newCreditApplied = Number(this.payload.newCreditApplied);
    }

    addNewItem(item) {
        const newBuilder = new NewBuilder(item, this.id, this.customer, this.status);
        this.processBuilder(newBuilder);
    }

    updateItem(item) {
        const currentItem = this.findOrderItem(item.id);
        const updateBuilder = new UpdateBuilder(currentItem, item, this.customer, this.status);
        this.processBuilder(updateBuilder);
    }

    deleteItem(currentItem) {
        const deleteBuilder = new DeleteBuilder(currentItem);
        this.processBuilder(deleteBuilder);
    }

    processBuilder(builder) {
        const { newItem, inventory } = builder.build();
        this.items.push(newItem);
        if (inventory && inventory.inventoryItemId) {
            this.updatedInventory.push(inventory);
        }
    }

    deleteCurrentModifiers() {
        const foundModifiers = this.findModifiers();
        foundModifiers.map((i) => this.deleteItem(i));
    }

    async setCurrentOrderItems() {
        this.currentOrderItems = await currentActiveServiceOrderItems(
            this.id,
            false,
            this.transaction,
        );
    }

    segregatedModifiers(modifiers) {
        const temp = this.status;
        const newModifiers = modifiers.filter((i) => !i.id);
        const deletedModifiers = modifiers.filter((i) => i.id && i.isDeleted);
        const updatedModifiers = modifiers.filter((i) => i.id && !i.isDeleted);
        return {
            newModifiers,
            deletedModifiers,
            updatedModifiers,
            temp,
        };
    }

    manageModifiers(item) {
        const { newModifiers, deletedModifiers, updatedModifiers } = this.segregatedModifiers(
            item.modifiers,
        );
        const { weight } = item;
        newModifiers.forEach((i) => this.addNewItem({ ...i, weight }));
        deletedModifiers.forEach((i) => {
            const currentItem = this.findOrderItem(i.id);
            this.deleteItem(currentItem);
        });
        updatedModifiers.forEach((i) => {
            this.updateItem({ ...i, weight });
        });
    }

    findModifiers() {
        return this.currentOrderItems.filter((i) => i.modifierId !== null);
    }

    findOrderItem(id) {
        return this.currentOrderItems.find((i) => i.orderItemId === id);
    }

    addModifiers(item) {
        const { modifiers } = item;
        if (modifiers && modifiers.length) {
            modifiers.forEach((i) => {
                const temp = { ...i, weight: item.weight };
                this.addNewItem(temp);
            });
        }
    }

    async updateOrderDetails() {
        const orderObj = this.mapUpdateOrderDetail();
        await ServiceOrder.query(this.transaction).upsertGraph([orderObj]);
    }

    mapUpdateOrderDetail() {
        const { orderId, promotionId, orderNotes, rack, status, convenienceFee } = this.payload;
        const orderObj = {
            id: this.id,
            isAdjusted: this.isAdjustment(),
            orderTotal: this.calculator.orderTotal,
            promotionId: promotionId || null,
            netOrderTotal: this.calculator.netOrderTotal,
            creditAmount: this.calculator.creditAmount,
            order: {
                id: orderId,
                promotionDetails: this.promotionDetails.orderableType
                    ? this.promotionDetails
                    : null,
            },
            paymentStatus: this.getPaymentStatus(),
            balanceDue: this.calculator.balanceDue,
            promotionAmount: this.calculator.newPromotionAmount(),
            convenienceFee,
        };

        if (status) {
            orderObj.status = status;
        }
        if (rack) {
            orderObj.rack = rack;
        }
        if (orderNotes && orderNotes.length) {
            orderObj.notes = orderNotes;
        }
        return orderObj;
    }

    getPaymentStatus() {
        return this.calculator.balanceDue > 0 ? 'BALANCE_DUE' : 'PAID';
    }

    async addAdjustmentLog() {
        const adjustmentLogsBuilder = new OrderAdjustmentBuilder(
            { ...this.payload, id: this.id },
            this.payload.employee,
            this.calculator,
        );
        await OrderAdjustmentLog.query(this.transaction).insert(adjustmentLogsBuilder.build());
    }

    async addActivityLogs() {
        const { employee, notes } = this.payload;
        const activityLog = {
            orderId: this.id,
            employeeCode: this.payload.employeeCode || null,
            employeeName: employee.fullName || null,
            teamMemberId: employee.id || null,
            status: this.status,
            notes,
            origin: this.payload.origin,
        };
        await OrderActivityLog.query(this.transaction).insert(activityLog);
    }

    async addWeightLogs() {
        const { employee, totalWeight, status } = this.payload;
        if (totalWeight) {
            const firstWeightLog = await this.getFirstWeightLog();
            const chargeableWeight = this.findChargeableWeight();
            const weightLogBuilder = new WeightLogsBuilder(
                firstWeightLog || {},
                {
                    totalWeight,
                    status,
                    chargeableWeight,
                    serviceOrderId: this.id,
                },
                employee,
            );
            const upsertObj = weightLogBuilder.build();
            await ServiceOrderWeightLog.query(this.transaction).upsertGraph(upsertObj);
        }
    }

    findChargeableWeight() {
        const perPoundItem = this.payload.orderItems.find(
            (item) => item.category === 'PER_POUND' && !item.isDeleted,
        );
        return perPoundItem ? perPoundItem.weight : 0;
    }

    async manageCreditHistory() {
        const creditsManager = new CreditHistoryManager(
            this.payload,
            this.transaction,
            this.calculator,
        );
        await creditsManager.manage();
    }

    isPostPay() {
        return this.payload.paymentTiming !== 'PRE-PAY';
    }

    async getFirstWeightLog() {
        const weightLog = await ServiceOrderWeightLog.query(this.transaction)
            .where('serviceOrderId', this.id)
            .orderBy('id')
            .limit(1)
            .first();
        return weightLog;
    }

    async setCalculator() {
        const presentOrderItems = await currentActiveServiceOrderItems(
            this.id,
            true,
            this.transaction,
        );
        const { promotionId } = this.payload;
        let calculatedOrderTotal = 0;
        if (presentOrderItems.length) {
            calculatedOrderTotal = presentOrderItems[0].orderTotal;
        }
        let orderPromotionDetails = {};
        if (promotionId) {
            orderPromotionDetails = await fetchPromotionDetails(promotionId, this.transaction);
            const promoCalculator = new PromotionCalculatorFactory(
                presentOrderItems,
                orderPromotionDetails,
                calculatedOrderTotal,
                {
                    orderType: 'ServiceOrder',
                },
            ).calculator();
            this.promotionDetails = promoCalculator.calculate();
        }
        this.calculator = new ServiceOrderCalculatorFactory(
            this.payload,
            this.promotionDetails || {},
            calculatedOrderTotal,
        ).calculator();
    }

    isResidential() {
        return this.payload.orderType === 'RESIDENTIAL';
    }

    isOnline() {
        return this.payload.orderType === 'ONLINE';
    }

    isAdjustment() {
        return this.payload.adjusted === true;
    }

    async updatePaymentIntent() {
        const paymentIntent = await getPendingPayment(this.payload.orderId, this.transaction);
        if (!paymentIntent) {
            throw new Error('NO_PAYMENT_INTENT_AVAILABLE');
        }
        // stripe requires payment intent to be at least $0.50.
        const updatedPaymentIntent = await updateStripePaymentIntent({
            existingIntent: paymentIntent,
            amount: this.calculator.netOrderTotal < 0.5 ? 0.5 : this.calculator.netOrderTotal,
        });
        await Payment.query(this.transaction)
            .patch({
                totalAmount: Number((updatedPaymentIntent.amount / 100).toFixed(2)),
                transactionFee: Number(
                    (updatedPaymentIntent.application_fee_amount / 100).toFixed(2),
                ),
                appliedAmount: Number((updatedPaymentIntent.amount / 100).toFixed(2)),
            })
            .findById(paymentIntent.id);
    }
}

module.exports = exports = AdjustServiceOrder;
