require('../testHelper');
const Knex = require('knex');
const Objection = require('objection');
const knexCleaner = require('knex-cleaner');
const mockDate = require('mockdate');
const mongoose = require('mongoose');
const config = require('../../knexfile')[process.env.NODE_ENV];
const factory = require('../factories');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');

const knex = Knex(config);
const filesToTruncate = [
    /integration\/live-link\/createOnlineOrder.test/,
    /integration\/employeeTab\/home\/overrideOrderStatus.test/,
    /integration\/employeeTab\/home\/inventoryOrders\/voidOrder.test/,
];
let trx;

const getTransactionRequirement = function () {
    return !filesToTruncate.some((regExp) => regExp.test(this.currentTest.file));
};

const truncateDb = async () => {
    await knexCleaner.clean(knex);
    await factory.create(FN.language, {
        language: 'English',
        id: 1,
    });
    await factory.create(FN.creditReason);
};

before(async () => {
    await truncateDb();
});

beforeEach(async function () {
    const shouldUseTransaction = getTransactionRequirement.call(this);
    if (shouldUseTransaction) {
        trx = await Objection.transaction.start(knex);
        Objection.Model.knex(trx);
    }
});

afterEach(async function () {
    const shouldUseTransaction = getTransactionRequirement.call(this);
    if (shouldUseTransaction) {
        await trx.rollback();
        Objection.Model.knex(knex);
    } else {
        await truncateDb();
    }

    if (mongoose.connection.readyState === mongoose.STATES.connected) {
        await mongoose.connection.db.dropDatabase();
    }
    mockDate.reset();
});

after(async () => {
    await knexCleaner.clean(knex);
});

module.exports = { truncateDb };
