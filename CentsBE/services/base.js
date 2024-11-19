const { transaction } = require('objection');
const Model = require('../models');

class Base {
    constructor() {
        this.transaction = null;
    }

    async execute() {
        try {
            await this.startTransaction();
            await this.perform();
            await this.commitTransaction();
        } catch (error) {
            if (this.transaction) {
                await this.rollbackTransaction();
            }
            throw error;
        }
    }

    async startTransaction() {
        this.transaction = await transaction.start(Model.knex());
    }

    async commitTransaction() {
        await this.transaction.commit();
    }

    async rollbackTransaction() {
        await this.transaction.rollback();
    }

    perform() {
        throw new Error(`Not implemented perform in ${this.constructor.name}`);
    }
}

module.exports = exports = Base;
