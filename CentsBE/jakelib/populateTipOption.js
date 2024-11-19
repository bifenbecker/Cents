const { task, desc } = require('jake');

const { transaction } = require('objection');

const ServiceOrder = require('../models/serviceOrders');
const TipSettings = require('../models/tipSettings');
const JakeTaskLogs = require('../models/jakeTasksLog');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

desc(`Populate tip option column in service orders table for existing orders.
 Currently tip amount is calculated over netOrderTotal.`);

async function getOrdersWithTip() {
    const ordersWithTip = await ServiceOrder.query()
        .select('serviceOrders.*', 'stores.businessId')
        .join('stores', 'stores.id', 'serviceOrders.storeId')
        .where((query) => {
            query
                .whereNotNull('serviceOrders.tipAmount')
                .andWhere('serviceOrders.tipAmount', '<>', 0);
        })
        .whereNull('serviceOrders.tipOption');
    return ordersWithTip;
}

async function getTipSettings() {
    const tipSettings = await TipSettings.query();
    return tipSettings;
}

function findPercentageTipOption(tipAmount, netOrderTotal, options) {
    // find the min difference option.
    const orderTotalForTip = netOrderTotal - tipAmount;
    let min = Number.MAX_VALUE;
    let element = 0;
    for (const i of Object.keys(options)) {
        const calculatedValue = Number(((orderTotalForTip * options[i]) / 100).toFixed(2));
        const diff = tipAmount - calculatedValue;
        if (Math.abs(diff) < min) {
            min = Math.abs(diff);
            element = options[i];
        }
    }
    if (element === 0) {
        return `$${tipAmount}`;
    }
    return `${element}%`;
}

function findTipOption(order, allTipSettings) {
    const { businessId, tipAmount, netOrderTotal } = order;
    // Find tip option using businessId.
    const tipSettings = allTipSettings.find((setting) => setting.businessId === businessId);
    if (tipSettings) {
        const { tipType, tipPercentage } = tipSettings;
        if (tipType === 'PERCENTAGE') {
            return findPercentageTipOption(tipAmount, netOrderTotal, tipPercentage);
        }
        return `$${order.tipAmount}`;
    }
    return `$${order.tipAmount}`;
}

function updateOrderTipOption(order, tipOptions, trx) {
    const tipOption = findTipOption(order, tipOptions);
    return ServiceOrder.query(trx)
        .patch({
            tipOption,
        })
        .findById(order.id);
}
task('populate_tip_option', async () => {
    let trx = null;
    try {
        const ordersWithTip = await getOrdersWithTip();
        const tipSettings = await getTipSettings();
        trx = await transaction.start(ServiceOrder.knex());
        const updateArray = ordersWithTip.map((order) =>
            updateOrderTipOption(order, tipSettings, trx),
        );
        await Promise.all(updateArray);
        await JakeTaskLogs.query(trx).insert({
            taskName: 'populate_tip_option',
        });
        await trx.commit();
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        LoggerHandler('error', error);
    }
});
